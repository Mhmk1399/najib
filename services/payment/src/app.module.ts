import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller.js";
import { validateEnvironment } from "./config/environment.js";
import { HealthController } from "./health/health.controller.js";
import { DatabaseService } from "./infrastructure/database.service.js";
import { PaymentsModule } from "./payments/payments.module.js";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env", "../../.env"], validate: validateEnvironment }), PaymentsModule],
  controllers: [AppController, HealthController],
  providers: [DatabaseService],
})
export class AppModule {}
