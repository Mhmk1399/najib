import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, type NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";
import { validateEnvironment } from "./config/environment.js";
import { JsonLogger } from "./infrastructure/json-logger.js";

const environment = validateEnvironment(process.env);
const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }), { logger: new JsonLogger("payment") });
app.setGlobalPrefix("api/v1");
app.enableShutdownHooks();
const config = new DocumentBuilder().setTitle("Najib Payment API").setVersion("1.0").build();
SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, config));
await app.listen(environment.PORT, environment.HOST);
