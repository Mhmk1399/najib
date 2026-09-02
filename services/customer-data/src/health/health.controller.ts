import { Controller, Get, Inject, ServiceUnavailableException } from "@nestjs/common";
import { DatabaseService } from "../infrastructure/database.service.js";
@Controller("health")
export class HealthController {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}
  @Get("live") live() { return { status: "ok", service: "customer-data", timestamp: new Date().toISOString() }; }
  @Get("ready") ready() { if (!this.database.isReady()) throw new ServiceUnavailableException({ status: "error", checks: { mongodb: "down" } }); return { status: "ok", checks: { mongodb: "up" } }; }
}
