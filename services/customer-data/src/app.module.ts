import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller.js";
import { validateEnvironment } from "./config/environment.js";
import { HealthController } from "./health/health.controller.js";
import { DatabaseService } from "./infrastructure/database.service.js";
import { ActivityModule } from "./activity/activity.module.js";
@Module({ imports: [ConfigModule.forRoot({ isGlobal: true, envFilePath: [".env", "../../.env"], validate: validateEnvironment }), ActivityModule], controllers: [AppController, HealthController], providers: [DatabaseService] })
export class AppModule {}
