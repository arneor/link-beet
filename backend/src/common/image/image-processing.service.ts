// Image Processing Service with Sharp
// Handles image optimization, WebP conversion, and responsive image generation

import { Injectable, BadRequestException } from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';
import * as crypto from 'crypto';

export interface ProcessedImage {
    buffer: Buffer;
    filename: string;
    contentType: string;
    width: number;
    height: number;
    size: number;
}

export interface ImageVariants {
    thumbnail: ProcessedImage; // 150x150
    small: ProcessedImage;     // 300x300
    medium: ProcessedImage;    // 600x600
    large: ProcessedImage;     // 1200x1200
    original: ProcessedImage;  // Original aspect ratio, max 2000px
}

// Generate blur placeholder for lazy loading
export interface BlurPlaceholder {
    dataUrl: string;
    width: number;
    height: number;
}

@Injectable()
export class ImageProcessingService {
    private readonly allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
    ];

    private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

    /**
     * Process uploaded image and generate all variants
     */
    async processImage(
        buffer: Buffer,
        originalName: string,
        mimeType: string,
    ): Promise<ImageVariants> {
        // Validate
        if (!this.allowedMimeTypes.includes(mimeType)) {
            throw new BadRequestException(
                `Invalid file type. Allowed: ${this.allowedMimeTypes.join(', ')}`,
            );
        }

        if (buffer.length > this.maxFileSize) {
            throw new BadRequestException('File size exceeds 10MB limit');
        }

        const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 8);
        const baseName = path.parse(originalName).name;
        const sanitizedName = baseName.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 50);

        // Generate all variants in parallel
        const [thumbnail, small, medium, large, original] = await Promise.all([
            this.resizeAndConvert(buffer, 150, 150, `${sanitizedName}-${hash}-thumb`),
            this.resizeAndConvert(buffer, 300, 300, `${sanitizedName}-${hash}-sm`),
            this.resizeAndConvert(buffer, 600, 600, `${sanitizedName}-${hash}-md`),
            this.resizeAndConvert(buffer, 1200, 1200, `${sanitizedName}-${hash}-lg`),
            this.resizeAndConvert(buffer, 2000, 2000, `${sanitizedName}-${hash}-orig`, false),
        ]);

        return { thumbnail, small, medium, large, original };
    }

    /**
     * Resize image and convert to WebP
     */
    private async resizeAndConvert(
        buffer: Buffer,
        maxWidth: number,
        maxHeight: number,
        filename: string,
        cover: boolean = true,
    ): Promise<ProcessedImage> {
        const image = sharp(buffer);
        const metadata = await image.metadata();

        let pipeline = image.resize({
            width: maxWidth,
            height: maxHeight,
            fit: cover ? 'cover' : 'inside',
            withoutEnlargement: true,
        });

        // Convert to WebP with quality optimization
        pipeline = pipeline.webp({
            quality: 85,
            effort: 4, // Balance between speed and compression
        });

        const processedBuffer = await pipeline.toBuffer();
        const processedMetadata = await sharp(processedBuffer).metadata();

        return {
            buffer: processedBuffer,
            filename: `${filename}.webp`,
            contentType: 'image/webp',
            width: processedMetadata.width || maxWidth,
            height: processedMetadata.height || maxHeight,
            size: processedBuffer.length,
        };
    }

    /**
     * Generate blur placeholder for lazy loading (LQIP)
     */
    async generateBlurPlaceholder(buffer: Buffer): Promise<BlurPlaceholder> {
        const placeholder = await sharp(buffer)
            .resize(20, 20, { fit: 'inside' })
            .blur(5)
            .webp({ quality: 20 })
            .toBuffer();

        const base64 = placeholder.toString('base64');
        const metadata = await sharp(placeholder).metadata();

        return {
            dataUrl: `data:image/webp;base64,${base64}`,
            width: metadata.width || 20,
            height: metadata.height || 20,
        };
    }

    /**
     * Process profile picture (circular crop)
     */
    async processProfilePicture(buffer: Buffer, originalName: string): Promise<ProcessedImage> {
        const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 8);

        const size = 400;
        const processedBuffer = await sharp(buffer)
            .resize(size, size, { fit: 'cover' })
            .webp({ quality: 90 })
            .toBuffer();

        return {
            buffer: processedBuffer,
            filename: `profile-${hash}.webp`,
            contentType: 'image/webp',
            width: size,
            height: size,
            size: processedBuffer.length,
        };
    }

    /**
     * Process background image (optimized for large display)
     */
    async processBackgroundImage(buffer: Buffer, originalName: string): Promise<ProcessedImage> {
        const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 8);

        const processedBuffer = await sharp(buffer)
            .resize(1920, 1080, { fit: 'cover', withoutEnlargement: true })
            .webp({ quality: 80 })
            .toBuffer();

        const metadata = await sharp(processedBuffer).metadata();

        return {
            buffer: processedBuffer,
            filename: `bg-${hash}.webp`,
            contentType: 'image/webp',
            width: metadata.width || 1920,
            height: metadata.height || 1080,
            size: processedBuffer.length,
        };
    }

    /**
     * Process catalog item image
     */
    async processCatalogImage(
        buffer: Buffer,
        originalName: string,
    ): Promise<{ main: ProcessedImage; thumbnail: ProcessedImage; blur: BlurPlaceholder }> {
        const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 8);
        const baseName = path.parse(originalName).name.replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 30);

        const [main, thumbnail, blur] = await Promise.all([
            // Main image: 800x800
            (async () => {
                const buf = await sharp(buffer)
                    .resize(800, 800, { fit: 'cover' })
                    .webp({ quality: 85 })
                    .toBuffer();
                return {
                    buffer: buf,
                    filename: `catalog-${baseName}-${hash}.webp`,
                    contentType: 'image/webp',
                    width: 800,
                    height: 800,
                    size: buf.length,
                };
            })(),
            // Thumbnail: 200x200
            (async () => {
                const buf = await sharp(buffer)
                    .resize(200, 200, { fit: 'cover' })
                    .webp({ quality: 80 })
                    .toBuffer();
                return {
                    buffer: buf,
                    filename: `catalog-${baseName}-${hash}-thumb.webp`,
                    contentType: 'image/webp',
                    width: 200,
                    height: 200,
                    size: buf.length,
                };
            })(),
            this.generateBlurPlaceholder(buffer),
        ]);

        return { main, thumbnail, blur };
    }
}
