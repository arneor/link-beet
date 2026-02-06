import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { S3UploadService } from '../../common/upload/s3-upload.service';
import { UpdateWifiPortalDto, ConnectWifiDto } from '../business/dto/wifi-portal.dto';

@Injectable()
export class WifiPortalService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly uploadService: S3UploadService,
    ) { }

    /**
     * Get portal config for authenticated business owner
     */
    async getPortalConfig(userId: string) {
        const business = await this.getBusinessOrThrow(userId);
        return this.prisma.wifiPortal.findUnique({ where: { businessId: business.id } });
    }

    /**
     * Update portal settings
     */
    async updatePortalConfig(userId: string, data: UpdateWifiPortalDto) {
        const business = await this.getBusinessOrThrow(userId);

        return this.prisma.wifiPortal.update({
            where: { businessId: business.id },
            data,
        });
    }

    /**
     * Upload splash background image
     */
    async uploadSplashImage(userId: string, buffer: Buffer, filename: string) {
        const business = await this.getBusinessOrThrow(userId);

        const result = await this.uploadService.uploadSplashImage(buffer, filename, business.id);

        await this.prisma.wifiPortal.update({
            where: { businessId: business.id },
            data: { splashBackgroundUrl: result.url },
        });

        return { url: result.url };
    }

    /**
     * Get Public Portal Data (by businessId or username via query)
     * No authentication required (Captive Portal)
     */
    async getPublicPortal(businessId: string) {
        // Fetch portal with business details
        const portal = await this.prisma.wifiPortal.findUnique({
            where: { businessId },
            include: {
                business: {
                    select: {
                        businessName: true,
                        location: true,
                        businessType: true,
                    }
                }
            }
        });

        if (!portal || !portal.isEnabled) {
            throw new NotFoundException('Portal not found or inactive');
        }

        return portal;
    }

    /**
     * Lookup business ID by username (helper for public portal)
     */
    async getBusinessIdByUsername(username: string): Promise<string> {
        const user = await this.prisma.user.findUnique({
            where: { username },
            include: { business: true },
        });

        if (!user || !user.business) {
            throw new NotFoundException('Business not found');
        }

        return user.business.id;
    }

    /**
     * Log Guest Connection
     */
    async connectGuest(businessId: string, data: ConnectWifiDto) {
        // Verify business exists
        const portal = await this.prisma.wifiPortal.findUnique({
            where: { businessId },
        });

        if (!portal) {
            throw new NotFoundException('Portal not found');
        }

        // Increment stats
        // Note: For unique visitors, we need a smarter logic (MAC address or cookie), 
        // simplified here to just increment total connections.
        await this.prisma.wifiPortal.update({
            where: { id: portal.id },
            data: {
                totalConnections: { increment: 1 },
                // uniqueVisitors: ... (requires session tracking)
            },
        });

        return { success: true, redirectUrl: this.resolveRedirect(portal) };
    }

    private resolveRedirect(portal: any) {
        if (portal.redirectType === 'CUSTOM' && portal.customRedirectUrl) {
            return portal.customRedirectUrl;
        }
        // If PROFILE, frontend should redirect to /username
        // We return the type so frontend handles it
        return { type: portal.redirectType };
    }

    private async getBusinessOrThrow(userId: string) {
        const business = await this.prisma.business.findUnique({
            where: { userId },
        });

        if (!business) {
            throw new NotFoundException('Business profile not found');
        }

        return business;
    }
}
