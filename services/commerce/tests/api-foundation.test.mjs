import test from "node:test";
import assert from "node:assert/strict";
import { validateEnvironment } from "../dist/config/environment.js";
import { HealthController } from "../dist/health/health.controller.js";

test("Commerce configuration requires a MongoDB URI", () => {
  assert.throws(
    () => validateEnvironment({ NODE_ENV: "test" }),
    /Invalid Commerce configuration/,
  );
});

test("Commerce configuration provides safe service defaults", () => {
  const environment = validateEnvironment({
    NODE_ENV: "test",
    MONGODB_URI: "mongodb://localhost:27017/najib_commerce",
  });

  assert.equal(environment.PORT, 4001);
  assert.equal(environment.HOST, "0.0.0.0");
});

test("Commerce readiness fails when MongoDB is unavailable", () => {
  const health = new HealthController({ isReady: () => false });
  assert.throws(() => health.ready(), /Service Unavailable/);
});
