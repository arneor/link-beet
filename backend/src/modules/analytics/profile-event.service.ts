import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
    ProfileEvent,
    ProfileEventDocument,
} from "./schemas/profile-event.schema";
import {
    Business,
    BusinessDocument,
} from "../business/schemas/business.schema";
import {
    TrackProfileEventDto,
    BeetLinkAnalyticsDto,
    ProfileEventAggregationDto,
} from "./dto/profile-event.dto";

@Injectable()
export class ProfileEventService {
    private readonly logger = new Logger(ProfileEventService.name);

    constructor(
        @InjectModel(ProfileEvent.name)
        private profileEventModel: Model<ProfileEventDocument>,
        @InjectModel(Business.name) private businessModel: Model<BusinessDocument>,
    ) { }

    /**
     * Log a batch of profile events (non-blocking)
     * Uses insertMany for optimal write performance
     */
    async logEvents(
        events: TrackProfileEventDto[],
        ipAddress?: string,
        userAgent?: string,
    ): Promise<{ success: boolean; count: number }> {
        if (!events || events.length === 0) {
            return { success: true, count: 0 };
        }

        // Resolve businessId from username (cached in a single query for the batch)
        const usernames = [...new Set(events.map((e) => e.username))];
        const businesses = await this.businessModel
            .find({ username: { $in: usernames } })
            .select("_id username")
            .lean();

        const usernameToBusinessId = new Map<string, Types.ObjectId>();
        for (const biz of businesses) {
            if (biz.username) {
                usernameToBusinessId.set(
                    biz.username,
                    biz._id as Types.ObjectId,
                );
            }
        }

        const docs = events
            .filter((event) => usernameToBusinessId.has(event.username))
            .map((event) => ({
                username: event.username,
                businessId: usernameToBusinessId.get(event.username)!,
                eventType: event.eventType,
                elementId: event.elementId,
                elementLabel: event.elementLabel,
                metadata: event.metadata,
                sessionId: event.sessionId,
                referrer: event.referrer,
                ipAddress,
                userAgent,
                timestamp: new Date(),
            }));

        if (docs.length === 0) {
            return { success: true, count: 0 };
        }

        // Use setImmediate to not block the event loop
        setImmediate(async () => {
            try {
                await this.profileEventModel.insertMany(docs, { ordered: false });
                this.logger.debug(`Logged ${docs.length} profile events`);
            } catch (error) {
                this.logger.error(`Failed to log profile events: ${error.message}`);
            }
        });

        return { success: true, count: docs.length };
    }

    /**
     * Get comprehensive Beet Link analytics for the dashboard
     * Uses MongoDB aggregation pipeline for optimized queries
     */
    async getBeetLinkAnalytics(
        businessId: string,
        startDate: Date,
        endDate: Date,
    ): Promise<BeetLinkAnalyticsDto> {
        const businessObjectId = new Types.ObjectId(businessId);
        const matchStage = {
            businessId: businessObjectId,
            timestamp: { $gte: startDate, $lte: endDate },
        };

        const [
            totalPageViews,
            uniqueSessions,
            eventBreakdown,
            dailyTrend,
            topCategories,
            topProducts,
            topLinks,
        ] = await Promise.all([
            // Total page views
            this.profileEventModel.countDocuments({
                ...matchStage,
                eventType: "page_view",
            }),

            // Unique sessions
            this.profileEventModel
                .distinct("sessionId", matchStage)
                .then((sessions) => sessions.filter(Boolean).length),

            // Event breakdown by type with element details
            this.getEventBreakdown(matchStage),

            // Daily trend
            this.getDailyTrend(matchStage, startDate, endDate),

            // Top categories
            this.getTopElements(matchStage, "category_tap", 10),

            // Top products
            this.getTopElements(matchStage, "product_view", 10),

            // Top links (link_click + social_click)
            this.getTopLinks(matchStage, 10),
        ]);

        return {
            totalPageViews,
            uniqueSessions,
            eventBreakdown,
            dailyTrend,
            topCategories,
            topProducts,
            topLinks,
            startDate,
            endDate,
        };
    }

    /**
     * Aggregate events by type with element breakdown
     */
    private async getEventBreakdown(
        matchStage: Record<string, unknown>,
    ): Promise<ProfileEventAggregationDto[]> {
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: { eventType: "$eventType", elementId: "$elementId", elementLabel: "$elementLabel" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 as const } },
        ];

        const results = await this.profileEventModel.aggregate(pipeline);

        // Group by eventType
        const grouped = new Map<string, { total: number; elements: Array<{ elementId: string; elementLabel: string; count: number }> }>();

        for (const row of results) {
            const eventType = row._id.eventType;
            if (!grouped.has(eventType)) {
                grouped.set(eventType, { total: 0, elements: [] });
            }
            const group = grouped.get(eventType)!;
            group.total += row.count;
            if (row._id.elementId) {
                group.elements.push({
                    elementId: row._id.elementId,
                    elementLabel: row._id.elementLabel || row._id.elementId,
                    count: row.count,
                });
            }
        }

        return Array.from(grouped.entries()).map(([eventType, data]) => ({
            eventType,
            count: data.total,
            breakdown: data.elements.map((el) => ({
                ...el,
                percentage: data.total > 0 ? Math.round((el.count / data.total) * 100) : 0,
            })),
        }));
    }

    /**
     * Daily trend for page views and interactions
     */
    private async getDailyTrend(
        matchStage: Record<string, unknown>,
        startDate: Date,
        endDate: Date,
    ): Promise<Array<{ date: string; pageViews: number; interactions: number }>> {
        const pipeline = [
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
                        isPageView: { $eq: ["$eventType", "page_view"] },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { "_id.date": 1 as const } },
        ];

        const results = await this.profileEventModel.aggregate(pipeline);

        // Build a day-by-day map
        const dayMap = new Map<string, { pageViews: number; interactions: number }>();

        // Initialize all days in range
        const current = new Date(startDate);
        while (current <= endDate) {
            const dayStr = current.toISOString().split("T")[0];
            dayMap.set(dayStr, { pageViews: 0, interactions: 0 });
            current.setDate(current.getDate() + 1);
        }

        for (const row of results) {
            const day = row._id.date;
            if (!dayMap.has(day)) {
                dayMap.set(day, { pageViews: 0, interactions: 0 });
            }
            const entry = dayMap.get(day)!;
            if (row._id.isPageView) {
                entry.pageViews = row.count;
            } else {
                entry.interactions += row.count;
            }
        }

        return Array.from(dayMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, data]) => ({
                date,
                pageViews: data.pageViews,
                interactions: data.interactions,
            }));
    }

    /**
     * Top elements by event type (categories, products, etc.)
     */
    private async getTopElements(
        matchStage: Record<string, unknown>,
        eventType: string,
        limit: number,
    ): Promise<
        Array<{
            elementId: string;
            elementLabel: string;
            count: number;
            percentage: number;
        }>
    > {
        const pipeline = [
            { $match: { ...matchStage, eventType } },
            {
                $group: {
                    _id: { elementId: "$elementId", elementLabel: "$elementLabel" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 as const } },
            { $limit: limit },
        ];

        const results = await this.profileEventModel.aggregate(pipeline);
        const total = results.reduce((sum, r) => sum + r.count, 0);

        return results.map((row) => ({
            elementId: row._id.elementId || "unknown",
            elementLabel: row._id.elementLabel || row._id.elementId || "Unknown",
            count: row.count,
            percentage: total > 0 ? Math.round((row.count / total) * 100) : 0,
        }));
    }

    /**
     * Top links (combined link_click + social_click)
     */
    private async getTopLinks(
        matchStage: Record<string, unknown>,
        limit: number,
    ): Promise<
        Array<{
            elementId: string;
            elementLabel: string;
            count: number;
            percentage: number;
        }>
    > {
        const pipeline = [
            {
                $match: {
                    ...matchStage,
                    eventType: { $in: ["link_click", "social_click"] },
                },
            },
            {
                $group: {
                    _id: { elementId: "$elementId", elementLabel: "$elementLabel" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 as const } },
            { $limit: limit },
        ];

        const results = await this.profileEventModel.aggregate(pipeline);
        const total = results.reduce((sum, r) => sum + r.count, 0);

        return results.map((row) => ({
            elementId: row._id.elementId || "unknown",
            elementLabel: row._id.elementLabel || row._id.elementId || "Unknown",
            count: row.count,
            percentage: total > 0 ? Math.round((row.count / total) * 100) : 0,
        }));
    }
}
