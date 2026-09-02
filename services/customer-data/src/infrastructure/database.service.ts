import { Inject, Injectable, OnApplicationShutdown, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import mongoose from "mongoose";
@Injectable()
export class DatabaseService implements OnModuleInit, OnApplicationShutdown {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}
  async onModuleInit() { await mongoose.connect(this.config.getOrThrow("MONGODB_URI"), { dbName: this.config.getOrThrow("MONGODB_DB_NAME"), serverSelectionTimeoutMS: this.config.getOrThrow("MONGODB_SERVER_SELECTION_TIMEOUT_MS") }); }
  isReady() { return mongoose.connection.readyState === 1; }
  async onApplicationShutdown() { if (mongoose.connection.readyState !== 0) await mongoose.disconnect(); }
}
