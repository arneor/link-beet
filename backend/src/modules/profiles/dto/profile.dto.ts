// Profile DTOs
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUrl, IsEnum, IsArray, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ProfileTheme, ButtonStyle, SocialPlatform } from '@/common/prisma/types';

// ==================== Profile DTOs ====================

export class UpdateProfileDto {
    @ApiPropertyOptional({ description: 'Bio/description', maxLength: 500 })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    bio?: string;

    @ApiPropertyOptional({ description: 'Location', maxLength: 200 })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    location?: string;

    @ApiPropertyOptional({ enum: ProfileTheme, enumName: 'ProfileTheme', example: ProfileTheme.DARK })
    @IsEnum(ProfileTheme)
    @IsOptional()
    theme?: ProfileTheme;

    @ApiPropertyOptional({ description: 'Background color hex code', example: '#1A1A1A' })
    @IsString()
    @IsOptional()
    backgroundColor?: string;

    @ApiPropertyOptional({ description: 'Accent color hex code', example: '#D4F935' })
    @IsString()
    @IsOptional()
    accentColor?: string;

    @ApiPropertyOptional({ enum: ButtonStyle, enumName: 'ButtonStyle', example: ButtonStyle.ROUNDED })
    @IsEnum(ButtonStyle)
    @IsOptional()
    buttonStyle?: ButtonStyle;

    @ApiPropertyOptional({ description: 'Publish profile publicly' })
    @IsBoolean()
    @IsOptional()
    isPublished?: boolean;

    @ApiPropertyOptional({ description: 'Show location on public profile' })
    @IsBoolean()
    @IsOptional()
    showLocation?: boolean;
}

// ==================== Social Link DTOs ====================

export class CreateSocialLinkDto {
    @ApiProperty({ enum: SocialPlatform, description: 'Social platform' })
    @IsEnum(SocialPlatform)
    platform: SocialPlatform;

    @ApiProperty({ description: 'Link URL' })
    @IsUrl()
    url: string;

    @ApiPropertyOptional({ description: 'Platform username/handle' })
    @IsString()
    @IsOptional()
    username?: string;
}

export class UpdateSocialLinkDto {
    @ApiPropertyOptional({ enum: SocialPlatform })
    @IsEnum(SocialPlatform)
    @IsOptional()
    platform?: SocialPlatform;

    @ApiPropertyOptional({ description: 'Link URL' })
    @IsUrl()
    @IsOptional()
    url?: string;

    @ApiPropertyOptional({ description: 'Platform username' })
    @IsString()
    @IsOptional()
    username?: string;

    @ApiPropertyOptional({ description: 'Link visibility' })
    @IsBoolean()
    @IsOptional()
    isVisible?: boolean;
}

// ==================== Custom Link DTOs ====================

export class CreateCustomLinkDto {
    @ApiProperty({ description: 'Link title', maxLength: 100 })
    @IsString()
    @MaxLength(100)
    title: string;

    @ApiProperty({ description: 'Link URL' })
    @IsUrl()
    url: string;

    @ApiPropertyOptional({ description: 'Icon name or URL' })
    @IsString()
    @IsOptional()
    icon?: string;

    @ApiPropertyOptional({ description: 'Button color hex code' })
    @IsString()
    @IsOptional()
    color?: string;
}

export class UpdateCustomLinkDto {
    @ApiPropertyOptional({ description: 'Link title' })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    title?: string;

    @ApiPropertyOptional({ description: 'Link URL' })
    @IsUrl()
    @IsOptional()
    url?: string;

    @ApiPropertyOptional({ description: 'Icon name or URL' })
    @IsString()
    @IsOptional()
    icon?: string;

    @ApiPropertyOptional({ description: 'Button color' })
    @IsString()
    @IsOptional()
    color?: string;

    @ApiPropertyOptional({ description: 'Link visibility' })
    @IsBoolean()
    @IsOptional()
    isVisible?: boolean;
}

// ==================== Reorder DTOs ====================

export class LinkOrderDto {
    @ApiProperty({ description: 'Link ID' })
    @IsString()
    linkId: string;

    @ApiProperty({ description: 'New order position' })
    order: number;
}

export class ReorderLinksDto {
    @ApiProperty({ type: [LinkOrderDto], description: 'Array of link orders' })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => LinkOrderDto)
    orders: LinkOrderDto[];
}
