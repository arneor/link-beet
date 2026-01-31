import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessProfile, BusinessProfileDocument } from '../business/schemas/business-profile.schema';
import { User, UserDocument } from '../auth/schemas/user.schema';
import { AnalyticsLog, AnalyticsLogDocument } from '../analytics/schemas/analytics-log.schema';
import { ComplianceLog, ComplianceLogDocument } from '../compliance/schemas/compliance-log.schema';
import { AdminStatsDto, BusinessListItemDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);

    constructor(
        @InjectModel(BusinessProfile.name) private businessModel: Model<BusinessProfileDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(AnalyticsLog.name) private analyticsModel: Model<AnalyticsLogDocument>,
        @InjectModel(ComplianceLog.name) private complianceModel: Model<ComplianceLogDocument>,
    ) { }

    /**
     * Get platform-wide statistics
     */
    async getStats(): Promise<AdminStatsDto> {
        const [
            totalBusinesses,
            totalConnections,
            totalEmailsCollected,
        ] = await Promise.all([
            this.businessModel.countDocuments({ isActive: true }),
            this.complianceModel.countDocuments(),
            this.userModel.countDocuments({ email: { $exists: true, $ne: null } }),
        ]);

        // Count total active ads across all businesses
        const businessesWithAds = await this.businessModel.find({ isActive: true }, { ads: 1 });
        const totalActiveCampaigns = businessesWithAds.reduce((sum, biz) => {
            return sum + (biz.ads?.filter(ad => ad.status === 'active')?.length || 0);
        }, 0);

        // Calculate growth rate
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentBusinesses = await this.businessModel.countDocuments({
            createdAt: { $gte: oneMonthAgo },
        });
        const growthRate = totalBusinesses > 0
            ? (recentBusinesses / totalBusinesses) * 100
            : 0;

        return {
            totalBusinesses,
            totalConnections,
            totalActiveCampaigns,
            totalEmailsCollected,
            growthRate: Math.round(growthRate * 100) / 100,
        };
    }

    /**
     * Get all businesses with connection counts
     */
    async getAllBusinesses(): Promise<BusinessListItemDto[]> {
        const businesses = await this.businessModel
            .find()
            .sort({ createdAt: -1 })
            .populate('ownerId', 'phone email name')
            .lean();

        const result: BusinessListItemDto[] = [];

        for (const biz of businesses) {
            // Get connection count for this business
            const connectionCount = await this.complianceModel.countDocuments({
                businessId: biz._id,
            });

            const owner = biz.ownerId as any;

            result.push({
                id: biz._id.toString(),
                businessName: biz.businessName,
                ownerPhone: owner?.phone,
                location: biz.location,
                category: biz.category,
                adsCount: biz.ads?.length || 0,
                connectionCount,
                isActive: biz.isActive,
                createdAt: biz.createdAt as any,
            });
        }

        return result;
    }

    /**
     * Get total connection count for platform
     */
    async getTotalConnectionCount(): Promise<number> {
        return this.complianceModel.countDocuments();
    }
}
