import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// Common Module
import { CommonModule } from './common/common.module';

// Infrastructure Modules (NEW)
import { PrismaModule } from './common/prisma/prisma.module';
import { SupabaseModule } from './common/supabase/supabase.module';
import { RedisModule } from './common/redis/redis.module';
import { ImageModule } from './common/image/image.module';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { BusinessModule } from './modules/business/business.module';
// import { AdsModule } from './modules/ads/ads.module';
// import { AnalyticsModule } from './modules/analytics/analytics.module';
// import { AdminModule } from './modules/admin/admin.module';
// import { ComplianceModule } from './modules/compliance/compliance.module';
import { HealthModule } from './modules/health/health.module';

import { MediaModule } from './modules/media/media.module';

// New Feature Modules (V2)
import { ProfileModule } from './modules/profiles/profile.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { WifiPortalModule } from './modules/wifi-portal/wifi-portal.module';

@Module({
    imports: [
        // Configuration
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env', '.env.local', '.env.development'],
        }),

        // PostgreSQL via Prisma (Primary Database - Supabase)
        PrismaModule,

        // Supabase Client (Auth, Realtime)
        SupabaseModule,

        // Upstash Redis (Caching, OTP, Rate Limiting)
        RedisModule,

        // Image Processing (Sharp)
        ImageModule,

        // MongoDB Connection - DISABLED TEMPORARILY
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                uri: configService.get<string>('MONGODB_URI') || 'mongodb://localhost:27017/markmorph_dev',
            }),
            inject: [ConfigService],
        }),

        // Rate Limiting (Throttler)
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                throttlers: [
                    {
                        ttl: configService.get<number>('THROTTLE_TTL') || 60000,
                        limit: configService.get<number>('THROTTLE_LIMIT') || 100,
                    },
                ],
            }),
            inject: [ConfigService],
        }),

        // Common Module (Global - Email Service, etc.)
        CommonModule,

        // Feature Modules (Legacy)
        AuthModule,
        BusinessModule,
        // AdsModule,
        // AnalyticsModule, // Disabled dependency on Mongoose
        // AdminModule,
        // ComplianceModule,
        HealthModule,
        MediaModule,

        // Feature Modules (V2 - New Platform Features)
        ProfileModule,
        CatalogModule,
        WifiPortalModule,
    ],
    providers: [
        // Global Throttler Guard
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule { }


