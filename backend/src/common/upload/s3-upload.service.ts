// S3 Upload Service - Handles file uploads to AWS S3 with CloudFront CDN
import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ImageProcessingService, ProcessedImage, BlurPlaceholder } from '../image/image-processing.service';

export interface UploadResult {
    key: string;
    url: string;       // CloudFront CDN URL
    originalUrl: string; // Direct S3 URL
    size: number;
    contentType: string;
}

export interface ImageUploadResult {
    variants: {
        thumbnail: UploadResult;
        small: UploadResult;
        medium: UploadResult;
        large: UploadResult;
        original: UploadResult;
    };
    blurPlaceholder: BlurPlaceholder;
}

export interface CatalogImageUploadResult {
    main: UploadResult;
    thumbnail: UploadResult;
    blurPlaceholder: BlurPlaceholder;
}

@Injectable()
export class S3UploadService {
    private readonly s3Client: S3Client;
    private readonly bucket: string;
    private readonly cdnDomain: string;
    private readonly region: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly imageProcessingService: ImageProcessingService,
    ) {
        this.region = this.configService.get<string>('AWS_REGION') || 'ap-south-1';
        this.bucket = this.configService.get<string>('AWS_S3_BUCKET') || 'markmorph-media';
        this.cdnDomain = this.configService.get<string>('CLOUDFRONT_DOMAIN') || '';

        this.s3Client = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
                secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
            },
        });
    }

    /**
     * Upload a profile picture with optimized variants
     */
    async uploadProfilePicture(
        buffer: Buffer,
        originalName: string,
        userId: string,
    ): Promise<UploadResult> {
        const processed = await this.imageProcessingService.processProfilePicture(buffer, originalName);
        const key = `profiles/${userId}/${processed.filename}`;

        return this.uploadToS3(processed.buffer, key, processed.contentType);
    }

    /**
     * Upload a background image
     */
    async uploadBackgroundImage(
        buffer: Buffer,
        originalName: string,
        userId: string,
    ): Promise<UploadResult> {
        const processed = await this.imageProcessingService.processBackgroundImage(buffer, originalName);
        const key = `backgrounds/${userId}/${processed.filename}`;

        return this.uploadToS3(processed.buffer, key, processed.contentType);
    }

    /**
     * Upload catalog item images with all variants
     */
    async uploadCatalogImage(
        buffer: Buffer,
        originalName: string,
        profileId: string,
        categoryId: string,
    ): Promise<CatalogImageUploadResult> {
        const { main, thumbnail, blur } = await this.imageProcessingService.processCatalogImage(
            buffer,
            originalName,
        );

        const basePath = `catalog/${profileId}/${categoryId}`;

        const [mainResult, thumbnailResult] = await Promise.all([
            this.uploadToS3(main.buffer, `${basePath}/${main.filename}`, main.contentType),
            this.uploadToS3(thumbnail.buffer, `${basePath}/${thumbnail.filename}`, thumbnail.contentType),
        ]);

        return {
            main: mainResult,
            thumbnail: thumbnailResult,
            blurPlaceholder: blur,
        };
    }

    /**
     * Upload WiFi portal splash image
     */
    async uploadSplashImage(
        buffer: Buffer,
        originalName: string,
        businessId: string,
    ): Promise<UploadResult> {
        const processed = await this.imageProcessingService.processBackgroundImage(buffer, originalName);
        const key = `splash/${businessId}/${processed.filename}`;

        return this.uploadToS3(processed.buffer, key, processed.contentType);
    }

    /**
     * Upload business logo
     */
    async uploadLogo(
        buffer: Buffer,
        originalName: string,
        businessId: string,
    ): Promise<UploadResult> {
        const processed = await this.imageProcessingService.processProfilePicture(buffer, originalName);
        const key = `logos/${businessId}/${processed.filename}`;

        return this.uploadToS3(processed.buffer, key, processed.contentType);
    }

    /**
     * Delete a file from S3
     */
    async deleteFile(key: string): Promise<void> {
        try {
            await this.s3Client.send(
                new DeleteObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                }),
            );
        } catch (error) {
            console.error('Failed to delete S3 file:', key, error);
            // Don't throw - deletion failures shouldn't block operations
        }
    }

    /**
     * Generate a pre-signed URL for direct download
     */
    async getSignedDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        return getSignedUrl(this.s3Client, command, { expiresIn });
    }

    /**
     * Core upload method
     */
    private async uploadToS3(
        buffer: Buffer,
        key: string,
        contentType: string,
    ): Promise<UploadResult> {
        try {
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                    Body: buffer,
                    ContentType: contentType,
                    CacheControl: 'public, max-age=31536000, immutable', // 1 year cache
                }),
            );

            const originalUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
            const url = this.cdnDomain
                ? `${this.cdnDomain}/${key}`
                : originalUrl;

            return {
                key,
                url,
                originalUrl,
                size: buffer.length,
                contentType,
            };
        } catch (error) {
            console.error('S3 upload failed:', error);
            throw new BadRequestException('Failed to upload file');
        }
    }

    /**
     * Extract S3 key from a full URL
     */
    getKeyFromUrl(url: string): string | null {
        try {
            const urlObj = new URL(url);
            // Handle both S3 and CloudFront URLs
            if (urlObj.hostname.includes('.s3.')) {
                return urlObj.pathname.slice(1); // Remove leading /
            }
            if (this.cdnDomain && url.startsWith(this.cdnDomain)) {
                return url.replace(`${this.cdnDomain}/`, '');
            }
            return null;
        } catch {
            return null;
        }
    }
}
