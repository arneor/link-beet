// Profile Module
import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { LinksService } from './links.service';
import { UploadModule } from '../../common/upload/upload.module';

@Module({
    imports: [UploadModule],
    controllers: [ProfileController],
    providers: [ProfileService, LinksService],
    exports: [ProfileService, LinksService],
})
export class ProfileModule { }
