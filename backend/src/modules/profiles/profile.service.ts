// Profile Service - CRUD operations for link-tree profiles
import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../../common/prisma/prisma.service';
import { REDIS_CLIENT } from '../../common/redis/redis.module';
import { S3UploadService } from '../../common/upload/s3-upload.service';
import { ProfileTheme, ButtonStyle } from '@/common/prisma/types';

export interface ProfileData {
    id: string;
    userId: string;
    username: string;
    displayName: string | null;
    profilePicture: string | null;
    bio: string | null;
    location: string | null;
    theme: ProfileTheme;
    backgroundColor: string | null;
    backgroundImage: string | null;
    accentColor: string | null;
    buttonStyle: ButtonStyle;
    isPublished: boolean;
    showLocation: boolean;
    totalViews: number;
    totalClicks: number;
    socialLinks: SocialLinkData[];
    customLinks: CustomLinkData[];
    catalogCategories: CatalogCategoryData[];
}

export interface SocialLinkData {
    id: string;
    platform: string;
    url: string;
    username: string | null;
    isVisible: boolean;
    order: number;
    clicks: number;
}

export interface CustomLinkData {
    id: string;
    title: string;
    url: string;
    icon: string | null;
    color: string | null;
    isVisible: boolean;
    order: number;
    clicks: number;
}

export interface CatalogCategoryData {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    order: number;
    isVisible: boolean;
    itemCount: number;
}

@Injectable()
export class ProfileService {
    private readonly CACHE_TTL = 300; // 5 minutes

    constructor(
        private readonly prisma: PrismaService,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        private readonly uploadService: S3UploadService,
    ) { }

    // ==================== Profile CRUD ====================

    /**
     * Get profile by username (public view)
     */
    async getPublicProfile(username: string): Promise<ProfileData | null> {
        const cacheKey = `profile:${username}`;

        // Try cache first
        try {
            const cached = await this.redis.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }
        } catch {
            // Redis unavailable
        }

        const user = await this.prisma.user.findUnique({
            where: { username: username.toLowerCase() },
            select: {
                id: true,
                username: true,
                displayName: true,
                profilePicture: true,
                profile: {
                    include: {
                        socialLinks: {
                            where: { isVisible: true },
                            orderBy: { order: 'asc' },
                        },
                        customLinks: {
                            where: { isVisible: true },
                            orderBy: { order: 'asc' },
                        },
                        catalogCategories: {
                            where: { isVisible: true },
                            orderBy: { order: 'asc' },
                            include: {
                                _count: { select: { items: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!user || !user.profile || !user.profile.isPublished) {
            return null;
        }

        const profile = user.profile;
        const data: ProfileData = {
            id: profile.id,
            userId: user.id,
            username: user.username,
            displayName: user.displayName,
            profilePicture: user.profilePicture,
            bio: profile.bio,
            location: profile.showLocation ? profile.location : null,
            theme: profile.theme,
            backgroundColor: profile.backgroundColor,
            backgroundImage: profile.backgroundImage,
            accentColor: profile.accentColor,
            buttonStyle: profile.buttonStyle,
            isPublished: profile.isPublished,
            showLocation: profile.showLocation,
            totalViews: profile.totalViews,
            totalClicks: profile.totalClicks,
            socialLinks: profile.socialLinks.map(this.mapSocialLink),
            customLinks: profile.customLinks.map(this.mapCustomLink),
            catalogCategories: profile.catalogCategories.map(this.mapCatalogCategory),
        };

        // Cache the result
        try {
            await this.redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(data));
        } catch {
            // Redis unavailable
        }

        return data;
    }

    /**
     * Get profile for authenticated user (with full data)
     */
    async getMyProfile(userId: string): Promise<ProfileData | null> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                displayName: true,
                profilePicture: true,
                profile: {
                    include: {
                        socialLinks: { orderBy: { order: 'asc' } },
                        customLinks: { orderBy: { order: 'asc' } },
                        catalogCategories: {
                            orderBy: { order: 'asc' },
                            include: {
                                _count: { select: { items: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Create profile if it doesn't exist
        if (!user.profile) {
            await this.prisma.profile.create({
                data: { userId },
            });
            return this.getMyProfile(userId);
        }

        const profile = user.profile;
        return {
            id: profile.id,
            userId: user.id,
            username: user.username,
            displayName: user.displayName,
            profilePicture: user.profilePicture,
            bio: profile.bio,
            location: profile.location,
            theme: profile.theme,
            backgroundColor: profile.backgroundColor,
            backgroundImage: profile.backgroundImage,
            accentColor: profile.accentColor,
            buttonStyle: profile.buttonStyle,
            isPublished: profile.isPublished,
            showLocation: profile.showLocation,
            totalViews: profile.totalViews,
            totalClicks: profile.totalClicks,
            socialLinks: profile.socialLinks.map(this.mapSocialLink),
            customLinks: profile.customLinks.map(this.mapCustomLink),
            catalogCategories: profile.catalogCategories.map(this.mapCatalogCategory),
        };
    }

    /**
     * Update profile appearance and settings
     */
    async updateProfile(
        userId: string,
        data: {
            bio?: string;
            location?: string;
            theme?: ProfileTheme;
            backgroundColor?: string;
            accentColor?: string;
            buttonStyle?: ButtonStyle;
            isPublished?: boolean;
            showLocation?: boolean;
        },
    ): Promise<ProfileData> {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });

        if (!profile) {
            throw new NotFoundException('Profile not found');
        }

        await this.prisma.profile.update({
            where: { userId },
            data,
        });

        // Invalidate cache
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user) {
            await this.invalidateCache(user.username);
        }

        return this.getMyProfile(userId) as Promise<ProfileData>;
    }

    /**
     * Update profile picture
     */
    async updateProfilePicture(
        userId: string,
        buffer: Buffer,
        filename: string,
    ): Promise<string> {
        const result = await this.uploadService.uploadProfilePicture(buffer, filename, userId);

        await this.prisma.user.update({
            where: { id: userId },
            data: { profilePicture: result.url },
        });

        // Invalidate cache
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user) {
            await this.invalidateCache(user.username);
        }

        return result.url;
    }

    /**
     * Update background image
     */
    async updateBackgroundImage(
        userId: string,
        buffer: Buffer,
        filename: string,
    ): Promise<string> {
        const result = await this.uploadService.uploadBackgroundImage(buffer, filename, userId);

        await this.prisma.profile.update({
            where: { userId },
            data: { backgroundImage: result.url },
        });

        // Invalidate cache
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user) {
            await this.invalidateCache(user.username);
        }

        return result.url;
    }

    // ==================== Analytics ====================

    /**
     * Increment profile view count
     */
    async incrementViews(username: string): Promise<void> {
        const user = await this.prisma.user.findUnique({
            where: { username: username.toLowerCase() },
            select: { profile: { select: { id: true } } },
        });

        if (user?.profile) {
            await this.prisma.profile.update({
                where: { id: user.profile.id },
                data: { totalViews: { increment: 1 } },
            });
        }
    }

    // ==================== Private Helpers ====================

    private async invalidateCache(username: string): Promise<void> {
        try {
            await this.redis.del(`profile:${username}`);
        } catch {
            // Redis unavailable
        }
    }

    private mapSocialLink(link: any): SocialLinkData {
        return {
            id: link.id,
            platform: link.platform,
            url: link.url,
            username: link.username,
            isVisible: link.isVisible,
            order: link.order,
            clicks: link.clicks,
        };
    }

    private mapCustomLink(link: any): CustomLinkData {
        return {
            id: link.id,
            title: link.title,
            url: link.url,
            icon: link.icon,
            color: link.color,
            isVisible: link.isVisible,
            order: link.order,
            clicks: link.clicks,
        };
    }

    private mapCatalogCategory(cat: any): CatalogCategoryData {
        return {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            icon: cat.icon,
            order: cat.order,
            isVisible: cat.isVisible,
            itemCount: cat._count?.items || 0,
        };
    }
}
