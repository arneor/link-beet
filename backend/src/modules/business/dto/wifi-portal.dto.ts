import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, IsUrl, MaxLength } from 'class-validator';

export enum WifiRedirectType {
    PROFILE = 'PROFILE',
    CUSTOM = 'CUSTOM',
    INTERNET = 'INTERNET',
}

export class UpdateWifiPortalDto {
    @ApiPropertyOptional({ description: 'Splash page title' })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    splashTitle?: string;

    @ApiPropertyOptional({ description: 'Splash page description' })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    splashDescription?: string;

    @ApiPropertyOptional({ description: 'WiFi SSID' })
    @IsString()
    @IsOptional()
    wifiSsid?: string;

    @ApiPropertyOptional({ enum: WifiRedirectType, description: 'Redirect behavior after connection' })
    @IsEnum(WifiRedirectType)
    @IsOptional()
    redirectType?: WifiRedirectType;

    @ApiPropertyOptional({ description: 'Custom redirect URL (if redirectType is CUSTOM)' })
    @IsUrl()
    @IsOptional()
    customRedirectUrl?: string;

    @ApiPropertyOptional({ description: 'Show button to view profile/menu' })
    @IsBoolean()
    @IsOptional()
    showProfileButton?: boolean;

    @ApiPropertyOptional({ description: 'Primary brand color' })
    @IsString()
    @IsOptional()
    primaryColor?: string;

    @ApiPropertyOptional({ description: 'CTA Button Text' })
    @IsString()
    @IsOptional()
    ctaButtonText?: string;

    @ApiPropertyOptional({ description: 'Enable/Disable the portal' })
    @IsBoolean()
    @IsOptional()
    isEnabled?: boolean;

    @ApiPropertyOptional({ description: 'Require email for connection' })
    @IsBoolean()
    @IsOptional()
    requireEmail?: boolean;
}

export class ConnectWifiDto {
    @ApiPropertyOptional({ description: 'User email (if required)' })
    @IsString()
    @IsOptional()
    email?: string;

    @ApiPropertyOptional({ description: 'Auth method' })
    @IsString()
    @IsOptional()
    authMethod?: string;
}
