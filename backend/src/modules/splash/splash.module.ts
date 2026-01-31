import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { SplashController } from './splash.controller';
import { SplashService } from './splash.service';
import { WifiUser, WifiUserSchema } from './schemas/wifi-user.schema';
import { BusinessProfile, BusinessProfileSchema } from '../business/schemas/business-profile.schema';
import { BusinessModule } from '../business/business.module';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: WifiUser.name, schema: WifiUserSchema },
            { name: BusinessProfile.name, schema: BusinessProfileSchema },
        ]),
        ConfigModule,
        forwardRef(() => BusinessModule),
        AnalyticsModule,
    ],
    controllers: [SplashController],
    providers: [SplashService],
    exports: [SplashService],
})
export class SplashModule { }
