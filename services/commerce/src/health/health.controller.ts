import {
  Controller,
  Get,
  Inject,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { DatabaseService } from "../infrastructure/database.service.js";

@ApiTags("health")
@Controller("health")
export class HealthController {
  constructor(
    @Inject(DatabaseService) private readonly database: DatabaseService,
  ) {}

  @Get("live")
  @ApiOperation({ summary: "Check whether the Commerce process is alive" })
  live(): { status: "ok"; service: string; timestamp: string } {
    return {
      status: "ok",
      service: "commerce",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("ready")
  @ApiOperation({ summary: "Check whether Commerce can serve traffic" })
  ready(): { status: "ok"; checks: { mongodb: "up" } } {
    if (!this.database.isReady()) {
      throw new ServiceUnavailableException({
        status: "error",
        checks: { mongodb: "down" },
      });
    }
    return { status: "ok", checks: { mongodb: "up" } };
  }
}
