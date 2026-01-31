import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsLog, AnalyticsLogSchema } from './schemas/analytics-log.schema';
import { BusinessProfile, BusinessProfileSchema } from '../business/schemas/business-profile.schema';
import { ComplianceLog, ComplianceLogSchema } from '../compliance/schemas/compliance-log.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: AnalyticsLog.name, schema: AnalyticsLogSchema },
            { name: BusinessProfile.name, schema: BusinessProfileSchema },
            { name: ComplianceLog.name, schema: ComplianceLogSchema },
        ]),
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
    exports: [AnalyticsService],
})
export class AnalyticsModule { }
