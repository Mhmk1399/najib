import { Module } from "@nestjs/common";
import { CatalogController } from "./catalog.controller.js";
import { CatalogService } from "./catalog.service.js";
import { StaffAuthGuard } from "../auth/staff-auth.guard.js";

@Module({
  controllers: [CatalogController],
  providers: [CatalogService, StaffAuthGuard],
  exports: [CatalogService],
})
export class CatalogModule {}
