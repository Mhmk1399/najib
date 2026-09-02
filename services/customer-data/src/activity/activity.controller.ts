import { Body, Controller, Headers, Inject, Post, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ActivityService } from "./activity.service.js";
@Controller("activities")
export class ActivityController {
  constructor(@Inject(ActivityService) private readonly activities: ActivityService, @Inject(ConfigService) private readonly config: ConfigService) {}
  @Post()
  record(@Body() body: unknown, @Headers("x-internal-service-token") token?: string) {
    if (token !== this.config.getOrThrow("INTERNAL_SERVICE_TOKEN")) throw new UnauthorizedException();
    return this.activities.record(this.activities.parse(body));
  }
}
