import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { BusinessProfile, BusinessProfileSchema } from '../business/schemas/business-profile.schema';
import { User, UserSchema } from '../auth/schemas/user.schema';
import { AnalyticsLog, AnalyticsLogSchema } from '../analytics/schemas/analytics-log.schema';
import { ComplianceLog, ComplianceLogSchema } from '../compliance/schemas/compliance-log.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: BusinessProfile.name, schema: BusinessProfileSchema },
            { name: User.name, schema: UserSchema },
            { name: AnalyticsLog.name, schema: AnalyticsLogSchema },
            { name: ComplianceLog.name, schema: ComplianceLogSchema },
        ]),
        AuthModule,
    ],
    controllers: [AdminController],
    providers: [AdminService],
    exports: [AdminService],
})
export class AdminModule { }
