import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsBoolean, IsOptional, MinLength, MaxLength, Matches, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserCategory } from '@prisma/client';

// =================================================================================================
// AUTHENTICATION DTOs
// =================================================================================================

export class AuthSignupInitDto {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    @MinLength(6)
    password: string;
}

export class AuthSignupVerifyDto {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    @MinLength(6)
    otp: string;
}

export class AuthLoginDto {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsString()
    password: string;
}

export class SendOtpDto {
    @ApiProperty({ description: 'Email address', example: 'user@example.com' })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ description: 'Is this a signup request?', default: false })
    @IsBoolean()
    @IsOptional()
    isSignup?: boolean = false;
}

// =================================================================================================
// USERNAME & ONBOARDING DTOs
// =================================================================================================

export class CheckUsernameDto {
    @ApiProperty({ description: 'Username to check', example: 'starbucks-mumbai' })
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    @Matches(/^[a-z0-9][a-z0-9-_]*[a-z0-9]$/, {
        message: 'Username can only contain lowercase letters, numbers, hyphens, and underscores',
    })
    username: string;
}

export class ClaimUsernameDto {
    @ApiProperty({ description: 'Username to claim', example: 'starbucks-mumbai' })
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    @Matches(/^[a-z0-9][a-z0-9-_]*[a-z0-9]$/, {
        message: 'Username can only contain lowercase letters, numbers, hyphens, and underscores',
    })
    username: string;
}

export class UpdateCategoryDto {
    @ApiProperty({
        description: 'User category',
        enum: UserCategory,
        example: 'BUSINESS',
    })
    @Transform(({ value }) => value?.toUpperCase())
    @IsEnum(UserCategory)
    category: UserCategory;
}

export class CompleteOnboardingDto {
    @ApiPropertyOptional({ description: 'Display name', example: 'John Doe' })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    displayName?: string;

    @ApiPropertyOptional({ description: 'Bio/description', example: 'Coffee lover & entrepreneur' })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    bio?: string;

    @ApiPropertyOptional({ description: 'Business name (for BUSINESS category)', example: 'Starbucks' })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    businessName?: string;

    @ApiPropertyOptional({
        description: 'Business type',
        example: 'RESTAURANT_CAFE',
        enum: ['RESTAURANT_CAFE', 'RETAIL_STORE', 'SALON_SPA', 'GYM_FITNESS', 'HOTEL_HOSTEL', 'OTHER'],
    })
    @IsString()
    @IsOptional()
    businessType?: string;

    @ApiPropertyOptional({ description: 'Creator category/type', example: 'Influencer' })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    creatorType?: string;

    @ApiPropertyOptional({ description: 'Location', example: 'Mumbai, India' })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    location?: string;
}

// =================================================================================================
// RESPONSE DTOs
// =================================================================================================

export class AuthTokensResponseDto {
    @ApiProperty()
    accessToken: string;

    @ApiPropertyOptional()
    refreshToken?: string;

    @ApiProperty()
    expiresIn: number;
}

export class AuthUserResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    username: string;

    @ApiPropertyOptional()
    displayName: string | null;

    @ApiPropertyOptional()
    profilePicture: string | null;

    @ApiProperty({ enum: UserCategory })
    category: UserCategory;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    emailVerified: boolean;

    @ApiProperty()
    onboardingStep: number;

    @ApiProperty()
    hasProfile: boolean;

    @ApiPropertyOptional()
    hasBusiness?: boolean;

    @ApiPropertyOptional()
    businessId?: string;

    @ApiPropertyOptional()
    businessName?: string;

    @ApiPropertyOptional()
    creatorType?: string | null;

    @ApiProperty()
    role: string;
}

export class UsernameCheckResponseDto {
    @ApiProperty()
    isValid: boolean;

    @ApiProperty()
    isAvailable: boolean;

    @ApiProperty({ type: [String] })
    errors: string[];

    @ApiPropertyOptional({ type: [String] })
    suggestions?: string[];
}
