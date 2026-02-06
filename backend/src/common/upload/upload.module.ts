// Upload Module
import { Module } from '@nestjs/common';
import { S3UploadService } from './s3-upload.service';
import { ImageModule } from '../image/image.module';

@Module({
    imports: [ImageModule],
    providers: [S3UploadService],
    exports: [S3UploadService],
})
export class UploadModule { }
