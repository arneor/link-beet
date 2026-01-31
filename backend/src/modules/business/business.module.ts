import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { BusinessProfile, BusinessProfileSchema } from './schemas/business-profile.schema';
import { AnalyticsLog, AnalyticsLogSchema } from '../analytics/schemas/analytics-log.schema';
import { ComplianceLog, ComplianceLogSchema } from '../compliance/schemas/compliance-log.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: BusinessProfile.name, schema: BusinessProfileSchema },
            { name: AnalyticsLog.name, schema: AnalyticsLogSchema },
            { name: ComplianceLog.name, schema: ComplianceLogSchema },
        ]),
        AuthModule,
    ],
    controllers: [BusinessController],
    providers: [BusinessService],
    exports: [BusinessService],
})
export class BusinessModule { }
