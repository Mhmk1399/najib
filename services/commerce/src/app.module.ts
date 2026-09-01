import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller.js";
import { CatalogModule } from "./catalog/catalog.module.js";
import { validateEnvironment } from "./config/environment.js";
import { HealthController } from "./health/health.controller.js";
import { DatabaseService } from "./infrastructure/database.service.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../../.env"],
      validate: validateEnvironment,
    }),
    CatalogModule,
  ],
  controllers: [AppController, HealthController],
  providers: [DatabaseService],
})
export class AppModule {}
