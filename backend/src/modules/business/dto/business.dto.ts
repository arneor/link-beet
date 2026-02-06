import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsBoolean, IsUrl, IsEmail, MaxLength, IsNotEmpty } from 'class-validator';

// Enums matching Prisma
export enum BusinessType {
    RESTAURANT_CAFE = 'RESTAURANT_CAFE',
    RETAIL_STORE = 'RETAIL_STORE',
    SALON_SPA = 'SALON_SPA',
    GYM_FITNESS = 'GYM_FITNESS',
    HOTEL_HOSTEL = 'HOTEL_HOSTEL',
    OTHER = 'OTHER',
}

export enum BusinessStatus {
    PENDING_APPROVAL = 'PENDING_APPROVAL',
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
    REJECTED = 'REJECTED',
}

export class CreateBusinessDto {
    @ApiProperty({ description: 'Business Name', maxLength: 100 })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    businessName: string;

    @ApiProperty({ enum: BusinessType, enumName: 'BusinessType', description: 'Type of business', example: BusinessType.RESTAURANT_CAFE })
    @IsEnum(BusinessType)
    businessType: BusinessType;

    @ApiPropertyOptional({ description: 'Location/City' })
    @IsString()
    @IsOptional()
    location?: string;

    @ApiPropertyOptional({ description: 'Full address' })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({ description: 'Contact phone number' })
    @IsString()
    @IsOptional()
    phone?: string;
}

export class UpdateBusinessDto {
    @ApiPropertyOptional({ description: 'Business Name' })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    businessName?: string;

    @ApiPropertyOptional({ enum: BusinessType })
    @IsEnum(BusinessType)
    @IsOptional()
    businessType?: BusinessType;

    @ApiPropertyOptional({ description: 'Location/City' })
    @IsString()
    @IsOptional()
    location?: string;

    @ApiPropertyOptional({ description: 'Full address' })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({ description: 'Contact phone number' })
    @IsString()
    @IsOptional()
    phone?: string;
}

export class ApproveBusinessDto {
    @ApiProperty({ enum: BusinessStatus, enumName: 'BusinessStatus', description: 'New status', example: BusinessStatus.ACTIVE })
    @IsEnum(BusinessStatus)
    status: BusinessStatus;

    @ApiPropertyOptional({ description: 'Reason for rejection (if rejected)' })
    @IsString()
    @IsOptional()
    rejectionReason?: string;
}
