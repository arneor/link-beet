// Catalog Service - CRUD operations for product/service catalogs
import { Injectable, NotFoundException, ForbiddenException, Inject, BadRequestException } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../../common/prisma/prisma.service';
import { REDIS_CLIENT } from '../../common/redis/redis.module';
import { S3UploadService, ImageUploadResult } from '../../common/upload/s3-upload.service';

export interface CatalogItemData {
    id: string;
    categoryId: string;
    name: string;
    description: string | null;
    price: number | null;
    discountPrice: number | null;
    currency: string;
    images: string[];
    imageBlur: string | null;
    isAvailable: boolean;
    isFeatured: boolean;
    order: number;
    views: number;
    category?: {
        id: string;
        name: string;
        slug: string;
    };
}

export interface CreateCategoryDto {
    name: string;
    icon?: string;
}

export interface CreateCatalogItemDto {
    categoryId: string;
    name: string;
    description?: string;
    price?: number;
    discountPrice?: number;
    currency?: string;
    isAvailable?: boolean;
    isFeatured?: boolean;
}

@Injectable()
export class CatalogService {
    private readonly CACHE_TTL = 300;

    constructor(
        private readonly prisma: PrismaService,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        private readonly uploadService: S3UploadService,
    ) { }

    // ==================== Categories ====================

    /**
     * Get all categories for a profile
     */
    async getCategories(profileId: string) {
        return this.prisma.catalogCategory.findMany({
            where: { profileId },
            orderBy: { order: 'asc' },
            include: {
                _count: { select: { items: true } },
            },
        });
    }

    /**
     * Get my categories (by userId)
     */
    async getMyCategories(userId: string) {
        const profile = await this.getProfileOrThrow(userId);
        return this.getCategories(profile.id);
    }

    /**
     * Create a category
     */
    async createCategory(userId: string, data: CreateCategoryDto) {
        const profile = await this.getProfileOrThrow(userId);

        const maxOrder = await this.prisma.catalogCategory.aggregate({
            where: { profileId: profile.id },
            _max: { order: true },
        });

        const slug = this.generateSlug(data.name);

        // Check for duplicate slug
        const existing = await this.prisma.catalogCategory.findFirst({
            where: { profileId: profile.id, slug },
        });

        if (existing) {
            throw new BadRequestException('Category with similar name already exists');
        }

        const category = await this.prisma.catalogCategory.create({
            data: {
                profileId: profile.id,
                name: data.name,
                slug,
                icon: data.icon,
                order: (maxOrder._max.order || 0) + 1,
            },
        });

        await this.invalidateCache(userId);
        return category;
    }

    /**
     * Update a category
     */
    async updateCategory(
        userId: string,
        categoryId: string,
        data: Partial<CreateCategoryDto & { isVisible: boolean }>,
    ) {
        await this.verifyCategoryOwnership(userId, categoryId);

        const updateData: any = { ...data };
        if (data.name) {
            updateData.slug = this.generateSlug(data.name);
        }

        const updated = await this.prisma.catalogCategory.update({
            where: { id: categoryId },
            data: updateData,
        });

        await this.invalidateCache(userId);
        return updated;
    }

    /**
     * Delete a category (and all its items)
     */
    async deleteCategory(userId: string, categoryId: string) {
        await this.verifyCategoryOwnership(userId, categoryId);

        // Delete associated items first
        await this.prisma.catalogItem.deleteMany({ where: { categoryId } });
        await this.prisma.catalogCategory.delete({ where: { id: categoryId } });

        await this.invalidateCache(userId);
    }

    // ==================== Catalog Items ====================

    /**
     * Get public items for a category
     */
    async getPublicItems(categoryId: string): Promise<CatalogItemData[]> {
        const cacheKey = `catalog:${categoryId}`;

        try {
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch {
            // Redis unavailable
        }

        const items = await this.prisma.catalogItem.findMany({
            where: { categoryId, isAvailable: true },
            orderBy: [{ isFeatured: 'desc' }, { order: 'asc' }],
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
        });

        const data = items.map(this.mapCatalogItem);

        try {
            await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(data));
        } catch {
            // Redis unavailable
        }

        return data;
    }

    /**
     * Get my items (by userId)
     */
    async getMyItems(userId: string, categoryId?: string): Promise<CatalogItemData[]> {
        const profile = await this.getProfileOrThrow(userId);

        const where: any = { category: { profileId: profile.id } };
        if (categoryId) {
            where.categoryId = categoryId;
        }

        const items = await this.prisma.catalogItem.findMany({
            where,
            orderBy: [{ categoryId: 'asc' }, { order: 'asc' }],
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
        });

        return items.map(this.mapCatalogItem);
    }

    /**
     * Get single item
     */
    async getItem(itemId: string): Promise<CatalogItemData | null> {
        const item = await this.prisma.catalogItem.findUnique({
            where: { id: itemId },
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
        });

        return item ? this.mapCatalogItem(item) : null;
    }

    /**
     * Create a catalog item
     */
    async createItem(userId: string, data: CreateCatalogItemDto): Promise<CatalogItemData> {
        // Verify category ownership
        await this.verifyCategoryOwnership(userId, data.categoryId);

        const maxOrder = await this.prisma.catalogItem.aggregate({
            where: { categoryId: data.categoryId },
            _max: { order: true },
        });

        const item = await this.prisma.catalogItem.create({
            data: {
                categoryId: data.categoryId,
                name: data.name,
                description: data.description,
                price: data.price,
                discountPrice: data.discountPrice,
                currency: data.currency || 'INR',
                isAvailable: data.isAvailable ?? true,
                isFeatured: data.isFeatured ?? false,
                order: (maxOrder._max.order || 0) + 1,
            },
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
        });

        await this.invalidateCache(userId);
        await this.invalidateCategoryCache(data.categoryId);

        return this.mapCatalogItem(item);
    }

    /**
     * Update a catalog item
     */
    async updateItem(
        userId: string,
        itemId: string,
        data: Partial<CreateCatalogItemDto>,
    ): Promise<CatalogItemData> {
        const item = await this.verifyItemOwnership(userId, itemId);

        const updateData: any = { ...data };

        const updated = await this.prisma.catalogItem.update({
            where: { id: itemId },
            data: updateData,
            include: {
                category: { select: { id: true, name: true, slug: true } },
            },
        });

        await this.invalidateCache(userId);
        await this.invalidateCategoryCache(item.categoryId);

        return this.mapCatalogItem(updated);
    }

    /**
     * Upload item image
     */
    async uploadItemImage(
        userId: string,
        itemId: string,
        buffer: Buffer,
        filename: string,
    ): Promise<{ main: { url: string }; thumbnail: { url: string } }> {
        const item = await this.verifyItemOwnership(userId, itemId);

        const result = await this.uploadService.uploadCatalogImage(
            buffer,
            filename,
            item.category.profileId,
            item.categoryId,
        );

        // Add to images array
        const images = [...(item.images || []), result.main.url];

        await this.prisma.catalogItem.update({
            where: { id: itemId },
            data: { images },
        });

        await this.invalidateCache(userId);
        await this.invalidateCategoryCache(item.categoryId);

        return result;
    }

    /**
     * Delete item image
     */
    async deleteItemImage(userId: string, itemId: string, imageUrl: string): Promise<void> {
        const item = await this.verifyItemOwnership(userId, itemId);

        const images = (item.images || []).filter((img: string) => img !== imageUrl);

        await this.prisma.catalogItem.update({
            where: { id: itemId },
            data: { images },
        });

        await this.invalidateCache(userId);
        await this.invalidateCategoryCache(item.categoryId);
    }

    /**
     * Delete a catalog item
     */
    async deleteItem(userId: string, itemId: string): Promise<void> {
        const item = await this.verifyItemOwnership(userId, itemId);

        await this.prisma.catalogItem.delete({ where: { id: itemId } });

        await this.invalidateCache(userId);
        await this.invalidateCategoryCache(item.categoryId);
    }

    /**
     * Track item view
     */
    async trackItemView(itemId: string): Promise<void> {
        await this.prisma.catalogItem.update({
            where: { id: itemId },
            data: { views: { increment: 1 } },
        });
    }

    // ==================== Private Helpers ====================

    private async getProfileOrThrow(userId: string) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new NotFoundException('Profile not found');
        }

        return profile;
    }

    private async verifyCategoryOwnership(userId: string, categoryId: string) {
        const profile = await this.getProfileOrThrow(userId);

        const category = await this.prisma.catalogCategory.findUnique({
            where: { id: categoryId },
        });

        if (!category || category.profileId !== profile.id) {
            throw new ForbiddenException('Category not found or access denied');
        }

        return category;
    }

    private async verifyItemOwnership(userId: string, itemId: string) {
        const profile = await this.getProfileOrThrow(userId);

        const item = await this.prisma.catalogItem.findUnique({
            where: { id: itemId },
            include: { category: true },
        });

        if (!item || item.category.profileId !== profile.id) {
            throw new ForbiddenException('Item not found or access denied');
        }

        return item;
    }

    private async invalidateCache(userId: string): Promise<void> {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user) {
            try {
                await this.redis.del(`profile:${user.username}`);
            } catch {
                // Redis unavailable
            }
        }
    }

    private async invalidateCategoryCache(categoryId: string): Promise<void> {
        try {
            await this.redis.del(`catalog:${categoryId}`);
        } catch {
            // Redis unavailable
        }
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 50);
    }

    private mapCatalogItem(item: any): CatalogItemData {
        return {
            id: item.id,
            categoryId: item.categoryId,
            name: item.name,
            description: item.description,
            price: item.price?.toNumber ? item.price.toNumber() : item.price,
            discountPrice: item.discountPrice?.toNumber ? item.discountPrice.toNumber() : item.discountPrice,
            currency: item.currency,
            images: item.images || [],
            imageBlur: null,
            isAvailable: item.isAvailable,
            isFeatured: item.isFeatured,
            order: item.order,
            views: item.views,
            category: item.category,
        };
    }
}
