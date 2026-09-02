import "reflect-metadata";
import test from "node:test";
import assert from "node:assert/strict";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { Test } from "@nestjs/testing";

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://localhost:27017/najib_inventory_test";

const { AppModule } = await import("../dist/app.module.js");
const { DatabaseService } = await import(
  "../dist/infrastructure/database.service.js"
);

test("Inventory exposes service and health endpoints", async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(DatabaseService)
    .useValue({ isReady: () => true })
    .compile();
  const app = moduleRef.createNestApplication(new FastifyAdapter({ logger: false }));
  app.setGlobalPrefix("api/v1");
  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  const serviceResponse = await app.inject({ method: "GET", url: "/api/v1" });
  const readinessResponse = await app.inject({
    method: "GET",
    url: "/api/v1/health/ready",
  });
  const invalidAvailabilityResponse = await app.inject({
    method: "POST",
    url: "/api/v1/availability/check",
    payload: {},
  });

  assert.equal(serviceResponse.statusCode, 200);
  assert.equal(serviceResponse.json().name, "inventory");
  assert.equal(readinessResponse.statusCode, 200);
  assert.equal(readinessResponse.json().checks.mongodb, "up");
  assert.equal(invalidAvailabilityResponse.statusCode, 400);

  await app.close();
});
