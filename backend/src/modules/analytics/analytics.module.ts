import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AnalyticsController } from "./analytics.controller";
import { AnalyticsService } from "./analytics.service";
import { ProfileEventController } from "./profile-event.controller";
import { ProfileEventService } from "./profile-event.service";
import {
  AnalyticsLog,
  AnalyticsLogSchema,
} from "./schemas/analytics-log.schema";
import {
  ProfileEvent,
  ProfileEventSchema,
} from "./schemas/profile-event.schema";
import { Business, BusinessSchema } from "../business/schemas/business.schema";
import {
  WifiProfile,
  WifiProfileSchema,
} from "../business/schemas/wifi-profile.schema";
import {
  ComplianceLog,
  ComplianceLogSchema,
} from "../compliance/schemas/compliance-log.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AnalyticsLog.name, schema: AnalyticsLogSchema },
      { name: ProfileEvent.name, schema: ProfileEventSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: WifiProfile.name, schema: WifiProfileSchema },
      { name: ComplianceLog.name, schema: ComplianceLogSchema },
    ]),
  ],
  controllers: [AnalyticsController, ProfileEventController],
  providers: [AnalyticsService, ProfileEventService],
  exports: [AnalyticsService, ProfileEventService],
})
export class AnalyticsModule { }
