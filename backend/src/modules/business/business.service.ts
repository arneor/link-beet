import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    Logger
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BusinessProfile, BusinessProfileDocument, Ad } from './schemas/business-profile.schema';
import { AnalyticsLog, AnalyticsLogDocument } from '../analytics/schemas/analytics-log.schema';
import { ComplianceLog, ComplianceLogDocument } from '../compliance/schemas/compliance-log.schema';
import { CreateBusinessDto, UpdateBusinessDto, DashboardStatsDto } from './dto/business.dto';

@Injectable()
export class BusinessService {
    private readonly logger = new Logger(BusinessService.name);

    constructor(
        @InjectModel(BusinessProfile.name) private businessModel: Model<BusinessProfileDocument>,
        @InjectModel(AnalyticsLog.name) private analyticsModel: Model<AnalyticsLogDocument>,
        @InjectModel(ComplianceLog.name) private complianceModel: Model<ComplianceLogDocument>,
    ) { }

    /**
     * Create a new business profile
     */
    async create(ownerId: string, dto: CreateBusinessDto): Promise<BusinessProfileDocument> {
        const business = new this.businessModel({
            ...dto,
            ownerId: new Types.ObjectId(ownerId),
        });

        await business.save();
        this.logger.log(`Created business: ${business.businessName} for owner: ${ownerId}`);
        return business;
    }

    /**
     * Get business by ID
     */
    async findById(id: string): Promise<BusinessProfileDocument> {
        const business = await this.businessModel.findById(id);

        if (!business) {
            throw new NotFoundException('Business not found');
        }

        return business;
    }

    /**
     * Get business by owner ID
     */
    async findByOwnerId(ownerId: string): Promise<BusinessProfileDocument | null> {
        return this.businessModel.findOne({ ownerId: new Types.ObjectId(ownerId) });
    }

    /**
     * Update business profile
     */
    async update(
        id: string,
        ownerId: string,
        dto: UpdateBusinessDto
    ): Promise<BusinessProfileDocument> {
        const business = await this.businessModel.findById(id);

        if (!business) {
            throw new NotFoundException('Business not found');
        }

        // Check ownership
        if (business.ownerId.toString() !== ownerId) {
            throw new ForbiddenException('You do not have permission to update this business');
        }

        Object.assign(business, dto);
        await business.save();

        this.logger.log(`Updated business: ${business.businessName}`);
        return business;
    }

    /**
     * Get all businesses (for admin)
     */
    async findAll(): Promise<BusinessProfileDocument[]> {
        return this.businessModel.find({ isActive: true }).sort({ createdAt: -1 });
    }

    /**
     * Get dashboard statistics for a business
     */
    async getDashboardStats(businessId: string, ownerId: string): Promise<DashboardStatsDto> {
        const business = await this.businessModel.findById(businessId);

        if (!business) {
            throw new NotFoundException('Business not found');
        }

        // Check ownership for non-admin
        if (business.ownerId.toString() !== ownerId) {
            throw new ForbiddenException('You do not have permission to view this dashboard');
        }

        const businessObjectId = new Types.ObjectId(businessId);

        // Get analytics data
        const [viewsResult, clicksResult, connectionsResult] = await Promise.all([
            this.analyticsModel.countDocuments({
                businessId: businessObjectId,
                interactionType: 'view'
            }),
            this.analyticsModel.countDocuments({
                businessId: businessObjectId,
                interactionType: 'click'
            }),
            this.complianceModel.countDocuments({
                businessId: businessObjectId
            }),
        ]);

        // Calculate ad stats from nested ads array
        const totalAdViews = business.ads.reduce((sum: number, ad: Ad) => sum + (ad.views || 0), 0);
        const totalAdClicks = business.ads.reduce((sum: number, ad: Ad) => sum + (ad.clicks || 0), 0);

        // Get connections history (last 7 days)
        const connectionsHistory = await this.getConnectionsHistory(businessObjectId);

        // Calculate CTR
        const ctr = totalAdViews > 0 ? (totalAdClicks / totalAdViews) * 100 : 0;

        return {
            totalConnections: connectionsResult,
            activeUsers: 0, // Real-time active users logic not yet implemented
            totalAdsServed: totalAdViews,
            totalViews: viewsResult || totalAdViews,
            totalClicks: clicksResult || totalAdClicks,
            ctr: Math.round(ctr * 100) / 100,
            revenue: 0, // Revenue feature not available
            connectionsHistory,
        };
    }

    /**
     * Get connections history for charts
     */
    private async getConnectionsHistory(
        businessId: Types.ObjectId
    ): Promise<Array<{ date: string; count: number }>> {
        const days = 7;
        const history: Array<{ date: string; count: number }> = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const startDate = new Date(now);
            startDate.setDate(now.getDate() - i);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(startDate);
            endDate.setHours(23, 59, 59, 999);

            const count = await this.complianceModel.countDocuments({
                businessId,
                loginTime: { $gte: startDate, $lte: endDate },
            });

            history.push({
                date: startDate.toISOString().split('T')[0],
                count: count, // Removed mock data fallback
            });
        }

        return history;
    }

    /**
     * Get splash page data (public endpoint)
     */
    async getSplashData(businessId: string) {
        const business = await this.businessModel.findById(businessId);

        if (!business) {
            throw new NotFoundException('Business not found');
        }

        // Filter active ads only
        const activeAds = business.ads.filter((ad: Ad) => ad.status === 'active');

        return {
            business: {
                id: business._id,
                name: business.businessName,
                logoUrl: business.logoUrl,
                primaryColor: business.primaryColor,
                googleReviewUrl: business.googleReviewUrl,
            },
            ads: activeAds.map((ad: Ad) => ({
                id: ad.id,
                title: ad.title,
                mediaUrl: ad.mediaUrl,
                mediaType: ad.mediaType,
                ctaUrl: ad.ctaUrl || business.googleReviewUrl,
                duration: ad.duration,
            })),
        };
    }
}
