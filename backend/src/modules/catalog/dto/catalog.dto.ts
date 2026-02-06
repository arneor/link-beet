// Catalog DTOs
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, MaxLength, Min, IsUUID } from 'class-validator';

// ==================== Category DTOs ====================

export class CreateCategoryDto {
    @ApiProperty({ description: 'Category name', maxLength: 100 })
    @IsString()
    @MaxLength(100)
    name: string;

    @ApiPropertyOptional({ description: 'Category icon name or emoji' })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    icon?: string;
}

export class UpdateCategoryDto {
    @ApiPropertyOptional({ description: 'Category name' })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({ description: 'Category icon' })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    icon?: string;

    @ApiPropertyOptional({ description: 'Category visibility' })
    @IsBoolean()
    @IsOptional()
    isVisible?: boolean;
}

// ==================== Item DTOs ====================

export class CreateCatalogItemDto {
    @ApiProperty({ description: 'Category ID' })
    @IsUUID()
    categoryId: string;

    @ApiProperty({ description: 'Item name', maxLength: 200 })
    @IsString()
    @MaxLength(200)
    name: string;

    @ApiPropertyOptional({ description: 'Item description', maxLength: 2000 })
    @IsString()
    @IsOptional()
    @MaxLength(2000)
    description?: string;

    @ApiPropertyOptional({ description: 'Price in smallest currency unit' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    price?: number;

    @ApiPropertyOptional({ description: 'Sale price in smallest currency unit' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    salePrice?: number;

    @ApiPropertyOptional({ description: 'Currency code (default: INR)' })
    @IsString()
    @IsOptional()
    currency?: string;

    @ApiPropertyOptional({ description: 'Item availability' })
    @IsBoolean()
    @IsOptional()
    isAvailable?: boolean;

    @ApiPropertyOptional({ description: 'Featured item flag' })
    @IsBoolean()
    @IsOptional()
    isFeatured?: boolean;
}

export class UpdateCatalogItemDto {
    @ApiPropertyOptional({ description: 'Item name' })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    name?: string;

    @ApiPropertyOptional({ description: 'Item description' })
    @IsString()
    @IsOptional()
    @MaxLength(2000)
    description?: string;

    @ApiPropertyOptional({ description: 'Price' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    price?: number;

    @ApiPropertyOptional({ description: 'Sale price' })
    @IsNumber()
    @IsOptional()
    @Min(0)
    salePrice?: number;

    @ApiPropertyOptional({ description: 'Currency code' })
    @IsString()
    @IsOptional()
    currency?: string;

    @ApiPropertyOptional({ description: 'Item availability' })
    @IsBoolean()
    @IsOptional()
    isAvailable?: boolean;

    @ApiPropertyOptional({ description: 'Featured flag' })
    @IsBoolean()
    @IsOptional()
    isFeatured?: boolean;
}
