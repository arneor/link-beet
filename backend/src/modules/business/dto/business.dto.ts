import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsEmail,
    IsBoolean,
    IsEnum,
    IsObject,
    ValidateNested,
    IsUrl,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AdDto {
    @ApiProperty({ description: 'Ad title' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ description: 'Media URL' })
    @IsString()
    @IsNotEmpty()
    mediaUrl: string;

    @ApiProperty({ description: 'Media type', enum: ['image', 'video'] })
    @IsString()
    @IsEnum(['image', 'video'])
    mediaType: string;

    @ApiProperty({ description: 'Ad placement', enum: ['BANNER', 'GALLERY'] })
    @IsString()
    @IsOptional()
    placement?: string;

    @ApiProperty({ description: 'Ad source' })
    @IsString()
    @IsOptional()
    source?: string;

    @ApiProperty({ description: 'S3 Key' })
    @IsString()
    @IsOptional()
    s3Key?: string;

    @ApiProperty({ description: 'Call to action URL' })
    @IsString()
    @IsOptional()
    ctaUrl?: string;
}

export class CreateBusinessDto {
    @ApiProperty({ description: 'Business name', example: "Joe's Coffee House" })
    @IsString()
    @IsNotEmpty()
    businessName: string;

    @ApiProperty({ description: 'Public username for custom link', example: 'joescafe' })
    @IsString()
    @IsOptional()
    username?: string;

    @ApiProperty({ description: 'Business location/address', example: '123 Main St, Mumbai' })
    @IsString()
    @IsOptional()
    location?: string;

    @ApiProperty({ description: 'Business category', example: 'Restaurant' })
    @IsString()
    @IsOptional()
    category?: string;

    @ApiProperty({ description: 'Business description', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'Contact email', example: 'joe@coffee.com' })
    @IsEmail()
    @IsOptional()
    contactEmail?: string;

    @ApiProperty({ description: 'Contact phone', example: '+919876543210' })
    @IsString()
    @IsOptional()
    contactPhone?: string;

    @ApiProperty({ description: 'Logo URL', required: false })
    @IsString()
    @IsOptional()
    logoUrl?: string;

    @ApiProperty({ description: 'Primary brand color', example: '#4f46e5' })
    @IsString()
    @IsOptional()
    primaryColor?: string;

    @ApiProperty({ description: 'WiFi SSID', example: 'Joes_Free_WiFi' })
    @IsString()
    @IsOptional()
    wifiSsid?: string;

    @ApiProperty({ description: 'Google Review URL for CTA redirects' })
    @IsString()
    @IsOptional()
    googleReviewUrl?: string;

    @ApiProperty({ description: 'Welcome banner title on splash screen', example: 'Welcome! Connect for Free WiFi' })
    @IsString()
    @IsOptional()
    welcomeTitle?: string;

    @ApiProperty({ description: 'CTA Button text on splash screen', example: 'View Offers' })
    @IsString()
    @IsOptional()
    ctaButtonText?: string;

    @ApiProperty({ description: 'CTA Button URL on splash screen', example: 'https://example.com/menu' })
    @IsString()
    @IsOptional()
    ctaButtonUrl?: string;

    @ApiProperty({ description: 'Whether to show welcome banner on splash screen', default: true })
    @IsBoolean()
    @IsOptional()
    showWelcomeBanner?: boolean;

    @ApiProperty({ description: 'Operating hours', required: false })
    @IsObject()
    @IsOptional()
    operatingHours?: Record<string, string>;

    @ApiProperty({ description: 'Profile type', enum: ['private', 'public'], default: 'private' })
    @IsEnum(['private', 'public'])
    @IsOptional()
    profileType?: string;
}

export class UpdateBusinessDto extends PartialType(CreateBusinessDto) {
    @ApiProperty({ description: 'Whether business is active' })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ description: 'Whether onboarding is completed' })
    @IsBoolean()
    @IsOptional()
    onboardingCompleted?: boolean;

    @ApiProperty({ description: 'Ads/Banners list', type: [AdDto] })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => AdDto)
    ads?: AdDto[];
}


export class BusinessResponseDto {
    @ApiProperty({ description: 'Business ID' })
    id: string;

    @ApiProperty({ description: 'Business name' })
    businessName: string;

    @ApiProperty({ description: 'Public username' })
    username?: string;

    @ApiProperty({ description: 'Owner user ID' })
    ownerId: string;

    @ApiProperty({ description: 'Location' })
    location?: string;

    @ApiProperty({ description: 'Category' })
    category?: string;

    @ApiProperty({ description: 'Logo URL' })
    logoUrl?: string;

    @ApiProperty({ description: 'Primary color' })
    primaryColor: string;

    @ApiProperty({ description: 'WiFi SSID' })
    wifiSsid?: string;

    @ApiProperty({ description: 'Google Review URL' })
    googleReviewUrl?: string;

    @ApiProperty({ description: 'Profile type' })
    profileType: string;

    @ApiProperty({ description: 'Active status' })
    isActive: boolean;

    @ApiProperty({ description: 'Onboarding completed' })
    onboardingCompleted: boolean;

    @ApiProperty({ description: 'Number of ads' })
    adsCount: number;

    @ApiProperty({ description: 'Created timestamp' })
    createdAt: Date;
}

export class DashboardStatsDto {
    @ApiProperty({ description: 'Total WiFi connections' })
    totalConnections: number;

    @ApiProperty({ description: 'Currently active users' })
    activeUsers: number;

    @ApiProperty({ description: 'Total ads served' })
    totalAdsServed: number;

    @ApiProperty({ description: 'Total ad views' })
    totalViews: number;

    @ApiProperty({ description: 'Total ad clicks' })
    totalClicks: number;

    @ApiProperty({ description: 'Click-through rate' })
    ctr: number;

    @ApiProperty({ description: 'Estimated revenue' })
    revenue: number;

    @ApiProperty({ description: 'Connection history for charts' })
    connectionsHistory: Array<{ date: string; count: number }>;
}
