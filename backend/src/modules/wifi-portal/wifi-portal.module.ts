import { Module } from '@nestjs/common';
import { WifiPortalController } from './wifi-portal.controller';
import { SplashController } from './splash.controller';
import { WifiPortalService } from './wifi-portal.service';
import { UploadModule } from '../../common/upload/upload.module';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [UploadModule, AuthModule],
    controllers: [WifiPortalController, SplashController],
    providers: [WifiPortalService],
    exports: [WifiPortalService],
})
export class WifiPortalModule { }
