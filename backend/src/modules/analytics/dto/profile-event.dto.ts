import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsEnum,
    IsArray,
    ValidateNested,
    IsObject,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

// ===== Single Event DTO =====
export class TrackProfileEventDto {
    @ApiProperty({
        description: "Event type",
        enum: [
            "page_view",
            "category_tap",
            "product_view",
            "link_click",
            "social_click",
            "share",
            "tab_switch",
            "banner_click",
            "gallery_view",
        ],
    })
    @IsEnum([
        "page_view",
        "category_tap",
        "product_view",
        "link_click",
        "social_click",
        "share",
        "tab_switch",
        "banner_click",
        "gallery_view",
    ])
    eventType: string;

    @ApiProperty({ description: "Username of the public profile" })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ description: "Element ID", required: false })
    @IsString()
    @IsOptional()
    elementId?: string;

    @ApiProperty({ description: "Human-readable element label", required: false })
    @IsString()
    @IsOptional()
    elementLabel?: string;

    @ApiProperty({
        description: "Flexible metadata",
        required: false,
        type: Object,
    })
    @IsObject()
    @IsOptional()
    metadata?: Record<string, unknown>;

    @ApiProperty({ description: "Anonymous session ID", required: false })
    @IsString()
    @IsOptional()
    sessionId?: string;

    @ApiProperty({ description: "Referrer URL", required: false })
    @IsString()
    @IsOptional()
    referrer?: string;
}

// ===== Batch Events DTO =====
export class TrackProfileEventBatchDto {
    @ApiProperty({
        description: "Array of profile events to batch-log",
        type: [TrackProfileEventDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TrackProfileEventDto)
    events: TrackProfileEventDto[];
}

// ===== Response DTOs =====
export class ProfileEventResponseDto {
    @ApiProperty({ description: "Operation success" })
    success: boolean;

    @ApiProperty({ description: "Number of events logged" })
    count?: number;
}

export class ProfileEventAggregationDto {
    @ApiProperty({ description: "Event type" })
    eventType: string;

    @ApiProperty({ description: "Total count" })
    count: number;

    @ApiProperty({ description: "Element breakdown" })
    breakdown: Array<{
        elementId: string;
        elementLabel: string;
        count: number;
        percentage: number;
    }>;
}

export class BeetLinkAnalyticsDto {
    @ApiProperty({ description: "Total page views" })
    totalPageViews: number;

    @ApiProperty({ description: "Unique sessions" })
    uniqueSessions: number;

    @ApiProperty({ description: "Event aggregations by type" })
    eventBreakdown: ProfileEventAggregationDto[];

    @ApiProperty({ description: "Daily trend data" })
    dailyTrend: Array<{
        date: string;
        pageViews: number;
        interactions: number;
    }>;

    @ApiProperty({ description: "Top categories" })
    topCategories: Array<{
        elementId: string;
        elementLabel: string;
        count: number;
        percentage: number;
    }>;

    @ApiProperty({ description: "Top products" })
    topProducts: Array<{
        elementId: string;
        elementLabel: string;
        count: number;
        percentage: number;
    }>;

    @ApiProperty({ description: "Top links" })
    topLinks: Array<{
        elementId: string;
        elementLabel: string;
        count: number;
        percentage: number;
    }>;

    @ApiProperty({ description: "Date range start" })
    startDate: Date;

    @ApiProperty({ description: "Date range end" })
    endDate: Date;
}
