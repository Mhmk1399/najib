import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, StaffSession, verifyPassword } from "../dist/index.js";

test("staff passwords use salted scrypt hashes", async () => {
  const first = await hashPassword("A-secure-password-123!");
  const second = await hashPassword("A-secure-password-123!");
  assert.notEqual(first, second);
  assert.equal(await verifyPassword("A-secure-password-123!", first), true);
  assert.equal(await verifyPassword("wrong-password", first), false);
});

test("staff sessions have a TTL index", () => {
  const ttl = StaffSession.schema.indexes().find(([fields, options]) => fields.expiresAt === 1 && options.expireAfterSeconds === 0);
  assert.ok(ttl);
});
