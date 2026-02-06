// Links Service - CRUD operations for social and custom links
import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import Redis from 'ioredis';
import { PrismaService } from '../../common/prisma/prisma.service';
import { REDIS_CLIENT } from '../../common/redis/redis.module';
import { SocialPlatform } from '@prisma/client';

export interface CreateSocialLinkDto {
    platform: SocialPlatform;
    url: string;
    username?: string;
}

export interface CreateCustomLinkDto {
    title: string;
    url: string;
    icon?: string;
    color?: string;
}

export interface UpdateLinkOrderDto {
    linkId: string;
    order: number;
}

@Injectable()
export class LinksService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
    ) { }

    // ==================== Social Links ====================

    /**
     * Add a social link
     */
    async addSocialLink(userId: string, data: CreateSocialLinkDto) {
        const profile = await this.getProfileOrThrow(userId);

        // Get current max order
        const maxOrder = await this.prisma.socialLink.aggregate({
            where: { profileId: profile.id },
            _max: { order: true },
        });

        const link = await this.prisma.socialLink.create({
            data: {
                profileId: profile.id,
                platform: data.platform,
                url: data.url,
                username: data.username,
                order: (maxOrder._max.order || 0) + 1,
            },
        });

        await this.invalidateCache(userId);
        return link;
    }

    /**
     * Update a social link
     */
    async updateSocialLink(
        userId: string,
        linkId: string,
        data: Partial<CreateSocialLinkDto & { isVisible: boolean }>,
    ) {
        const link = await this.verifyLinkOwnership(userId, linkId, 'social');

        const updated = await this.prisma.socialLink.update({
            where: { id: linkId },
            data,
        });

        await this.invalidateCache(userId);
        return updated;
    }

    /**
     * Delete a social link
     */
    async deleteSocialLink(userId: string, linkId: string) {
        await this.verifyLinkOwnership(userId, linkId, 'social');
        await this.prisma.socialLink.delete({ where: { id: linkId } });
        await this.invalidateCache(userId);
    }

    /**
     * Reorder social links
     */
    async reorderSocialLinks(userId: string, orders: UpdateLinkOrderDto[]) {
        const profile = await this.getProfileOrThrow(userId);

        await this.prisma.$transaction(
            orders.map(({ linkId, order }) =>
                this.prisma.socialLink.updateMany({
                    where: { id: linkId, profileId: profile.id },
                    data: { order },
                }),
            ),
        );

        await this.invalidateCache(userId);
    }

    // ==================== Custom Links ====================

    /**
     * Add a custom link
     */
    async addCustomLink(userId: string, data: CreateCustomLinkDto) {
        const profile = await this.getProfileOrThrow(userId);

        const maxOrder = await this.prisma.customLink.aggregate({
            where: { profileId: profile.id },
            _max: { order: true },
        });

        const link = await this.prisma.customLink.create({
            data: {
                profileId: profile.id,
                title: data.title,
                url: data.url,
                icon: data.icon,
                color: data.color,
                order: (maxOrder._max.order || 0) + 1,
            },
        });

        await this.invalidateCache(userId);
        return link;
    }

    /**
     * Update a custom link
     */
    async updateCustomLink(
        userId: string,
        linkId: string,
        data: Partial<CreateCustomLinkDto & { isVisible: boolean }>,
    ) {
        await this.verifyLinkOwnership(userId, linkId, 'custom');

        const updated = await this.prisma.customLink.update({
            where: { id: linkId },
            data,
        });

        await this.invalidateCache(userId);
        return updated;
    }

    /**
     * Delete a custom link
     */
    async deleteCustomLink(userId: string, linkId: string) {
        await this.verifyLinkOwnership(userId, linkId, 'custom');
        await this.prisma.customLink.delete({ where: { id: linkId } });
        await this.invalidateCache(userId);
    }

    /**
     * Reorder custom links
     */
    async reorderCustomLinks(userId: string, orders: UpdateLinkOrderDto[]) {
        const profile = await this.getProfileOrThrow(userId);

        await this.prisma.$transaction(
            orders.map(({ linkId, order }) =>
                this.prisma.customLink.updateMany({
                    where: { id: linkId, profileId: profile.id },
                    data: { order },
                }),
            ),
        );

        await this.invalidateCache(userId);
    }

    // ==================== Click Tracking ====================

    /**
     * Increment link click count
     */
    async trackClick(linkId: string, type: 'social' | 'custom') {
        if (type === 'social') {
            await this.prisma.socialLink.update({
                where: { id: linkId },
                data: { clicks: { increment: 1 } },
            });
        } else {
            await this.prisma.customLink.update({
                where: { id: linkId },
                data: { clicks: { increment: 1 } },
            });
        }

        // Also increment profile total clicks
        const link = type === 'social'
            ? await this.prisma.socialLink.findUnique({ where: { id: linkId } })
            : await this.prisma.customLink.findUnique({ where: { id: linkId } });

        if (link) {
            await this.prisma.profile.update({
                where: { id: link.profileId },
                data: { totalClicks: { increment: 1 } },
            });
        }
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

    private async verifyLinkOwnership(userId: string, linkId: string, type: 'social' | 'custom') {
        const profile = await this.getProfileOrThrow(userId);

        const link = type === 'social'
            ? await this.prisma.socialLink.findUnique({ where: { id: linkId } })
            : await this.prisma.customLink.findUnique({ where: { id: linkId } });

        if (!link || link.profileId !== profile.id) {
            throw new ForbiddenException('Link not found or access denied');
        }

        return link;
    }

    private async invalidateCache(userId: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (user) {
            try {
                await this.redis.del(`profile:${user.username}`);
            } catch {
                // Redis unavailable
            }
        }
    }
}
