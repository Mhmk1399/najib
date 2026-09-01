import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module.js";
import { validateEnvironment } from "./config/environment.js";
import { JsonLogger } from "./infrastructure/json-logger.js";

async function bootstrap(): Promise<void> {
  const environment = validateEnvironment(process.env);
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: { level: environment.LOG_LEVEL } }),
    { logger: new JsonLogger("commerce") },
  );

  app.setGlobalPrefix("api/v1");
  app.enableShutdownHooks();

  const openApiConfig = new DocumentBuilder()
    .setTitle("Najib Commerce API")
    .setDescription("Catalog, cart, checkout, and order orchestration API")
    .setVersion("1.0")
    .build();
  SwaggerModule.setup(
    "docs",
    app,
    SwaggerModule.createDocument(app, openApiConfig),
  );

  await app.listen(environment.PORT, environment.HOST);
}

void bootstrap();
