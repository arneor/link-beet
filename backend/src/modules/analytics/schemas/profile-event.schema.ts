import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ApiProperty } from "@nestjs/swagger";

export type ProfileEventDocument = ProfileEvent & Document;

@Schema({ timestamps: true, collection: "beet_link_events" })
export class ProfileEvent {
    @ApiProperty({ description: "Unique identifier" })
    _id: Types.ObjectId;

    @ApiProperty({ description: "Username of the public profile" })
    @Prop({ type: String, required: true, index: true })
    username: string;

    @ApiProperty({ description: "Business ID" })
    @Prop({ type: Types.ObjectId, ref: "Business", required: true, index: true })
    businessId: Types.ObjectId;

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
    @Prop({
        type: String,
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
        required: true,
        index: true,
    })
    eventType: string;

    @ApiProperty({ description: "ID of the interacted element (e.g., category ID, product ID)" })
    @Prop({ type: String })
    elementId?: string;

    @ApiProperty({ description: "Human-readable label for the element" })
    @Prop({ type: String })
    elementLabel?: string;

    @ApiProperty({ description: "Flexible metadata for additional context" })
    @Prop({ type: Object })
    metadata?: Record<string, unknown>;

    @ApiProperty({ description: "Anonymous session ID" })
    @Prop({ type: String, index: true })
    sessionId?: string;

    @ApiProperty({ description: "User agent string" })
    @Prop({ type: String })
    userAgent?: string;

    @ApiProperty({ description: "IP address" })
    @Prop({ type: String })
    ipAddress?: string;

    @ApiProperty({ description: "Referrer URL" })
    @Prop({ type: String })
    referrer?: string;

    @ApiProperty({ description: "Event timestamp" })
    @Prop({ default: Date.now, index: true })
    timestamp: Date;
}

export const ProfileEventSchema = SchemaFactory.createForClass(ProfileEvent);

// Compound indexes optimized for dashboard aggregation queries
ProfileEventSchema.index({ username: 1, timestamp: -1 });
ProfileEventSchema.index({ businessId: 1, eventType: 1, timestamp: -1 });
ProfileEventSchema.index({ businessId: 1, timestamp: -1, eventType: 1 });
ProfileEventSchema.index({ username: 1, eventType: 1, elementId: 1 });
ProfileEventSchema.index({ sessionId: 1, timestamp: -1 });
