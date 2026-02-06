import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { S3UploadService } from '../../common/upload/s3-upload.service';
import { CreateBusinessDto, UpdateBusinessDto, BusinessStatus } from './dto/business.dto';

@Injectable()
export class BusinessService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly uploadService: S3UploadService,
    ) { }

    /**
     * Get business by User ID (for authenticated user)
     */
    async getMyBusiness(userId: string) {
        const business = await this.prisma.business.findUnique({
            where: { userId },
            include: { wifiPortal: true },
        });

        if (!business) {
            return null;
        }

        return business;
    }

    /**
     * Create a new business profile
     */
    async createBusiness(userId: string, data: CreateBusinessDto) {
        // Check if user already has a business
        const existing = await this.prisma.business.findUnique({ where: { userId } });
        if (existing) {
            throw new BadRequestException('User already has a business profile');
        }

        const business = await this.prisma.business.create({
            data: {
                userId,
                businessName: data.businessName,
                businessType: data.businessType,
                location: data.location,
                address: data.address,
                phone: data.phone,
                status: BusinessStatus.PENDING_APPROVAL, // Default status
            },
        });

        // Initialize empty WiFi portal for the business
        await this.prisma.wifiPortal.create({
            data: {
                businessId: business.id,
                isEnabled: false,
                redirectType: 'PROFILE',
            },
        });

        return business;
    }

    /**
     * Update business profile
     */
    async updateBusiness(userId: string, data: UpdateBusinessDto) {
        const business = await this.getBusinessOrThrow(userId);

        return this.prisma.business.update({
            where: { id: business.id },
            data: {
                businessName: data.businessName,
                businessType: data.businessType,
                location: data.location,
                address: data.address,
                phone: data.phone,
            },
        });
    }

    /**
     * Upload business logo
     */
    async uploadLogo(userId: string, buffer: Buffer, filename: string) {
        const business = await this.getBusinessOrThrow(userId);

        const result = await this.uploadService.uploadLogo(buffer, filename, business.id);

        // Update WifiPortal with the new logo as well if it's the primary branding
        await this.prisma.wifiPortal.update({
            where: { businessId: business.id },
            data: { splashLogoUrl: result.url },
        });

        return { url: result.url };
    }

    /**
     * Helper: Get business or throw
     */
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
