import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

// Ad Sub-document Schema
@Schema({ _id: false })
export class Ad {
    @ApiProperty({ description: 'Unique ad identifier' })
    @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
    id: Types.ObjectId;

    @ApiProperty({ description: 'Media URL (image/video)' })
    @Prop({ required: true })
    mediaUrl: string;

    @ApiProperty({ description: 'Media type', enum: ['image', 'video'] })
    @Prop({ type: String, enum: ['image', 'video'], required: true })
    mediaType: string;

    @ApiProperty({ description: 'Call-to-action URL (Google Review Link)' })
    @Prop()
    ctaUrl?: string;

    @ApiProperty({ description: 'Ad title' })
    @Prop({ required: true })
    title: string;

    @ApiProperty({ description: 'Ad description' })
    @Prop()
    description?: string;

    @ApiProperty({ description: 'Display duration in seconds' })
    @Prop({ default: 5 })
    duration: number;

    @ApiProperty({ description: 'Ad status', enum: ['active', 'paused', 'archived'] })
    @Prop({ type: String, enum: ['active', 'paused', 'archived'], default: 'active' })
    status: string;

    @ApiProperty({ description: 'Total views' })
    @Prop({ default: 0 })
    views: number;

    @ApiProperty({ description: 'Total clicks' })
    @Prop({ default: 0 })
    clicks: number;

    @ApiProperty({ description: 'Total likes' })
    @Prop({ default: 0 })
    likesCount: number;

    @ApiProperty({ description: 'Total shares' })
    @Prop({ default: 0 })
    sharesCount: number;

    @ApiProperty({ description: 'Total gallery expands/taps' })
    @Prop({ default: 0 })
    expandsCount: number;

    @ApiProperty({ description: 'Created timestamp' })
    @Prop({ default: Date.now })
    createdAt: Date;

    @ApiProperty({ description: 'Ad placement type', enum: ['BANNER', 'GALLERY'] })
    @Prop({ type: String, enum: ['BANNER', 'GALLERY'], required: true, default: 'GALLERY' })
    placement: string;

    @ApiProperty({ description: 'Ad source', enum: ['INTERNAL', 'THIRD_PARTY'] })
    @Prop({ type: String, enum: ['INTERNAL', 'THIRD_PARTY'], default: 'INTERNAL' })
    source: string;

    @ApiProperty({ description: 'S3 Key for file management' })
    @Prop()
    s3Key?: string;
}

export const AdSchema = SchemaFactory.createForClass(Ad);

export type BusinessProfileDocument = BusinessProfile & Document;

@Schema({ timestamps: true, collection: 'business_profiles' })
export class BusinessProfile {
    @ApiProperty({ description: 'Unique identifier' })
    _id: Types.ObjectId;

    @ApiProperty({ description: 'Business name' })
    @Prop({ required: true })
    businessName: string;

    @ApiProperty({ description: 'Owner user ID', type: String })
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    ownerId: Types.ObjectId;

    @ApiProperty({ description: 'Business location/address' })
    @Prop()
    location?: string;

    @ApiProperty({ description: 'Business category' })
    @Prop()
    category?: string;

    @ApiProperty({ description: 'Business description' })
    @Prop()
    description?: string;

    @ApiProperty({ description: 'Contact email' })
    @Prop()
    contactEmail?: string;

    @ApiProperty({ description: 'Contact phone' })
    @Prop()
    contactPhone?: string;

    @ApiProperty({ description: 'Logo URL' })
    @Prop()
    logoUrl?: string;

    @ApiProperty({ description: 'S3 Key for logo' })
    @Prop()
    logoS3Key?: string;

    @ApiProperty({ description: 'Primary brand color' })
    @Prop({ default: '#000000' })
    primaryColor: string;

    @ApiProperty({ description: 'WiFi SSID' })
    @Prop()
    wifiSsid?: string;

    @ApiProperty({ description: 'Google Review URL for CTA' })
    @Prop()
    googleReviewUrl?: string;

    @ApiProperty({ description: 'Operating hours as JSON' })
    @Prop({ type: Object })
    operatingHours?: Record<string, string>;

    @ApiProperty({ description: 'Profile type', enum: ['private', 'public'] })
    @Prop({ type: String, enum: ['private', 'public'], default: 'private' })
    profileType: string;

    @ApiProperty({ description: 'Nested ads array', type: [Ad] })
    @Prop({ type: [AdSchema], default: [] })
    ads: Ad[];

    @ApiProperty({ description: 'Whether onboarding is completed' })
    @Prop({ default: false })
    onboardingCompleted: boolean;

    @ApiProperty({ description: 'Whether business is active' })
    @Prop({ default: true })
    isActive: boolean;

    @ApiProperty({ description: 'Business approval status', enum: ['pending_approval', 'active', 'suspended', 'rejected'] })
    @Prop({ type: String, enum: ['pending_approval', 'active', 'suspended', 'rejected'], default: 'pending_approval' })
    status: string;

    @ApiProperty({ description: 'Admin ID who activated the business' })
    @Prop({ type: Types.ObjectId, ref: 'Admin' })
    activatedBy?: Types.ObjectId;

    @ApiProperty({ description: 'Timestamp when business was activated' })
    @Prop()
    activatedAt?: Date;

    @ApiProperty({ description: 'Reason for rejection (if rejected)' })
    @Prop()
    rejectionReason?: string;

    @ApiProperty({ description: 'Reason for suspension (if suspended)' })
    @Prop()
    suspensionReason?: string;

    @ApiProperty({ description: 'History of status changes' })
    @Prop({
        type: [{
            status: String,
            changedBy: Types.ObjectId,
            changedAt: Date,
            reason: String
        }], default: []
    })
    statusHistory: Array<{
        status: string;
        changedBy?: Types.ObjectId;
        changedAt: Date;
        reason?: string;
    }>;

    @ApiProperty({ description: 'Created timestamp' })
    createdAt?: Date;

    @ApiProperty({ description: 'Updated timestamp' })
    updatedAt?: Date;
}

export const BusinessProfileSchema = SchemaFactory.createForClass(BusinessProfile);

// Indexes for optimized queries (ownerId index already defined in @Prop)
BusinessProfileSchema.index({ businessName: 'text' });
BusinessProfileSchema.index({ category: 1 });
BusinessProfileSchema.index({ isActive: 1 });
BusinessProfileSchema.index({ status: 1 });


