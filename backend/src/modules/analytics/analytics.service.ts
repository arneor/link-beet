import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AnalyticsLog, AnalyticsLogDocument } from './schemas/analytics-log.schema';
import { BusinessProfile, BusinessProfileDocument } from '../business/schemas/business-profile.schema';
import { ComplianceLog, ComplianceLogDocument } from '../compliance/schemas/compliance-log.schema';
import { TrackInteractionDto, ConnectWifiDto, AnalyticsSummaryDto } from './dto/analytics.dto';

@Injectable()
export class AnalyticsService {
    private readonly logger = new Logger(AnalyticsService.name);

    constructor(
        @InjectModel(AnalyticsLog.name) private analyticsModel: Model<AnalyticsLogDocument>,
        @InjectModel(BusinessProfile.name) private businessModel: Model<BusinessProfileDocument>,
        @InjectModel(ComplianceLog.name) private complianceModel: Model<ComplianceLogDocument>,
    ) { }

    /**
     * Track ad interaction (VIEW or CLICK)
     * Uses async tap pattern - non-blocking for user experience
     */
    async trackInteraction(
        dto: TrackInteractionDto,
        ipAddress?: string,
        userAgent?: string,
    ): Promise<{ success: boolean; redirectUrl?: string }> {
        const { adId, businessId, interactionType } = dto;

        // Start async logging (non-blocking)
        this.logInteractionAsync(dto, ipAddress, userAgent);

        // If it's a click, also update ad stats and get redirect URL
        if (interactionType === 'click') {
            const redirectUrl = await this.getRedirectUrl(businessId, adId);
            return { success: true, redirectUrl };
        }

        return { success: true };
    }

    /**
     * Async tap pattern - log interaction without blocking response
     */
    private async logInteractionAsync(
        dto: TrackInteractionDto,
        ipAddress?: string,
        userAgent?: string,
    ): Promise<void> {
        // Using setImmediate to not block the event loop
        setImmediate(async () => {
            try {
                // Create analytics log
                const log = new this.analyticsModel({
                    adId: new Types.ObjectId(dto.adId),
                    businessId: new Types.ObjectId(dto.businessId),
                    userId: dto.userId ? new Types.ObjectId(dto.userId) : undefined,
                    interactionType: dto.interactionType,
                    macAddress: dto.macAddress,
                    deviceType: dto.deviceType,
                    ipAddress,
                    userAgent,
                    sessionId: dto.sessionId,
                    timestamp: new Date(),
                });

                await log.save();

                // Update ad counters
                if (dto.interactionType === 'view') {
                    await this.incrementAdViews(dto.businessId, dto.adId);
                } else if (dto.interactionType === 'click') {
                    await this.incrementAdClicks(dto.businessId, dto.adId);
                }

                this.logger.debug(`Tracked ${dto.interactionType} for ad ${dto.adId}`);
            } catch (error) {
                this.logger.error(`Failed to log interaction: ${error.message}`);
                // Don't throw - this is async and shouldn't affect the user
            }
        });
    }

    /**
     * Get redirect URL for ad click
     */
    private async getRedirectUrl(businessId: string, adId: string): Promise<string> {
        try {
            const business = await this.businessModel.findById(businessId);

            if (!business) {
                return 'https://google.com';
            }

            // Find the specific ad
            const ad = business.ads.find(a => a.id.toString() === adId);

            if (ad?.ctaUrl) {
                return ad.ctaUrl;
            }

            // Fallback to business Google Review URL
            return business.googleReviewUrl || 'https://google.com';
        } catch (error) {
            this.logger.error(`Failed to get redirect URL: ${error.message}`);
            return 'https://google.com';
        }
    }

    /**
     * Handle WiFi connect action - log compliance and return redirect
     */
    async handleWifiConnect(
        dto: ConnectWifiDto,
        ipAddress?: string,
        userAgent?: string,
    ): Promise<{ success: boolean; redirectUrl: string }> {
        const { businessId, macAddress, deviceType, email } = dto;

        // Log compliance data (PM-WANI requirement)
        this.logComplianceAsync(businessId, macAddress, ipAddress, deviceType, userAgent);

        // Get business for redirect URL
        const business = await this.businessModel.findById(businessId);
        const redirectUrl = business?.googleReviewUrl || 'https://google.com';

        return {
            success: true,
            redirectUrl,
        };
    }

    /**
     * Async compliance logging
     */
    private async logComplianceAsync(
        businessId: string,
        macAddress?: string,
        ipAddress?: string,
        deviceType?: string,
        userAgent?: string,
    ): Promise<void> {
        setImmediate(async () => {
            try {
                const log = new this.complianceModel({
                    businessId: new Types.ObjectId(businessId),
                    macAddress: macAddress || 'unknown',
                    assignedIP: ipAddress,
                    deviceType,
                    userAgent,
                    loginTime: new Date(),
                });

                await log.save();
                this.logger.debug(`Logged compliance for business ${businessId}`);
            } catch (error) {
                this.logger.error(`Failed to log compliance: ${error.message}`);
            }
        });
    }

    /**
     * Increment ad views (atomic update)
     */
    private async incrementAdViews(businessId: string, adId: string): Promise<void> {
        await this.businessModel.updateOne(
            { _id: businessId, 'ads.id': new Types.ObjectId(adId) },
            { $inc: { 'ads.$.views': 1 } }
        );
    }

    /**
     * Increment ad clicks (atomic update)
     */
    private async incrementAdClicks(businessId: string, adId: string): Promise<void> {
        await this.businessModel.updateOne(
            { _id: businessId, 'ads.id': new Types.ObjectId(adId) },
            { $inc: { 'ads.$.clicks': 1 } }
        );
    }

    /**
     * Get analytics summary for a business
     */
    async getAnalyticsSummary(
        businessId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<AnalyticsSummaryDto> {
        const businessObjectId = new Types.ObjectId(businessId);

        const [viewsResult, clicksResult, uniqueUsersResult] = await Promise.all([
            // Total views
            this.analyticsModel.countDocuments({
                businessId: businessObjectId,
                interactionType: 'view',
                timestamp: { $gte: startDate, $lte: endDate },
            }),
            // Total clicks
            this.analyticsModel.countDocuments({
                businessId: businessObjectId,
                interactionType: 'click',
                timestamp: { $gte: startDate, $lte: endDate },
            }),
            // Unique users/sessions
            this.analyticsModel.distinct('sessionId', {
                businessId: businessObjectId,
                timestamp: { $gte: startDate, $lte: endDate },
            }),
        ]);

        const totalViews = viewsResult || 0;
        const totalClicks = clicksResult || 0;
        const ctr = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

        return {
            totalViews,
            totalClicks,
            ctr: Math.round(ctr * 100) / 100,
            uniqueUsers: uniqueUsersResult?.length || 0,
            startDate,
            endDate,
        };
    }

    /**
     * Get daily analytics for charts
     */
    async getDailyAnalytics(
        businessId: string,
        days: number = 7,
    ): Promise<Array<{ date: string; views: number; clicks: number }>> {
        const businessObjectId = new Types.ObjectId(businessId);
        const now = new Date();
        const results: Array<{ date: string; views: number; clicks: number }> = [];

        for (let i = days - 1; i >= 0; i--) {
            const startDate = new Date(now);
            startDate.setDate(now.getDate() - i);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(startDate);
            endDate.setHours(23, 59, 59, 999);

            const [views, clicks] = await Promise.all([
                this.analyticsModel.countDocuments({
                    businessId: businessObjectId,
                    interactionType: 'view',
                    timestamp: { $gte: startDate, $lte: endDate },
                }),
                this.analyticsModel.countDocuments({
                    businessId: businessObjectId,
                    interactionType: 'click',
                    timestamp: { $gte: startDate, $lte: endDate },
                }),
            ]);

            results.push({
                date: startDate.toISOString().split('T')[0],
                views: views || 0,
                clicks: clicks || 0,
            });
        }

        return results;
    }
}
