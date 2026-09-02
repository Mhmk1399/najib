import test from "node:test";
import assert from "node:assert/strict";
import { validateEnvironment } from "../dist/config/environment.js";
import { HealthController } from "../dist/health/health.controller.js";

test("Inventory configuration requires a MongoDB URI", () => {
  assert.throws(
    () => validateEnvironment({ NODE_ENV: "test" }),
    /Invalid Inventory configuration/,
  );
});

test("Inventory configuration provides safe service defaults", () => {
  const environment = validateEnvironment({
    NODE_ENV: "test",
    MONGODB_URI: "mongodb://localhost:27017/najib_inventory",
  });

  assert.equal(environment.PORT, 4002);
  assert.equal(environment.HOST, "0.0.0.0");
});

test("Inventory readiness fails when MongoDB is unavailable", () => {
  const health = new HealthController({ isReady: () => false });
  assert.throws(() => health.ready(), /Service Unavailable/);
});
