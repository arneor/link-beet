import { Controller, Post, Get, Body, Param, Query, Req } from "@nestjs/common";
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { Request } from "express";
import { ProfileEventService } from "./profile-event.service";
import {
    TrackProfileEventBatchDto,
    ProfileEventResponseDto,
    BeetLinkAnalyticsDto,
} from "./dto/profile-event.dto";

@ApiTags("Beet Link Events")
@Controller("beet-link-events")
export class ProfileEventController {
    constructor(private readonly profileEventService: ProfileEventService) { }

    @Post("track")
    @SkipThrottle() // High-volume tracking endpoint - no rate limiting
    @ApiOperation({
        summary: "Batch-track profile events",
        description:
            "Accepts a batch of user interaction events from the public profile. Non-blocking for optimal UX.",
    })
    @ApiResponse({
        status: 200,
        description: "Events tracked",
        type: ProfileEventResponseDto,
    })
    async trackEvents(
        @Body() dto: TrackProfileEventBatchDto,
        @Req() req: Request,
    ): Promise<ProfileEventResponseDto> {
        const ipAddress = req.ip || req.headers["x-forwarded-for"]?.toString();
        const userAgent = req.headers["user-agent"];

        return this.profileEventService.logEvents(
            dto.events,
            ipAddress,
            userAgent,
        );
    }

    @Get("analytics/:businessId")
    @SkipThrottle()
    @ApiOperation({
        summary: "Get Beet Link analytics for a business",
        description:
            "Returns aggregated profile event data for the dashboard Beet Link tab",
    })
    @ApiParam({ name: "businessId", description: "Business ID" })
    @ApiQuery({
        name: "startDate",
        description: "Start date (ISO)",
        required: false,
    })
    @ApiQuery({
        name: "endDate",
        description: "End date (ISO)",
        required: false,
    })
    @ApiResponse({
        status: 200,
        description: "Beet Link analytics",
        type: BeetLinkAnalyticsDto,
    })
    async getBeetLinkAnalytics(
        @Param("businessId") businessId: string,
        @Query("startDate") startDate?: string,
        @Query("endDate") endDate?: string,
    ): Promise<BeetLinkAnalyticsDto> {
        const start = startDate
            ? new Date(startDate)
            : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Default: last 7 days
        const end = endDate ? new Date(endDate) : new Date();

        return this.profileEventService.getBeetLinkAnalytics(
            businessId,
            start,
            end,
        );
    }
}
