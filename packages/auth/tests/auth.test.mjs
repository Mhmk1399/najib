import assert from "node:assert/strict";
import test from "node:test";
import { createStaffAccessToken, hasEveryPermission, InvalidAccessTokenError, resolveStaffPermissions, verifyStaffAccessToken } from "../dist/index.js";

const secret = "a-secure-test-secret-with-at-least-32-bytes";

test("creates and verifies scoped staff access tokens", () => {
  const permissions = resolveStaffPermissions(["catalog_manager"]);
  const token = createStaffAccessToken({ sub: "user-1", sid: "session-1", roles: ["catalog_manager"], permissions, allowedStoreIds: ["store-1"] }, secret, 900, 1_000);
  const claims = verifyStaffAccessToken(token, secret, 1_100);
  assert.equal(claims.sub, "user-1");
  assert.equal(hasEveryPermission(claims, ["admin.access", "catalog.write"]), true);
  assert.equal(hasEveryPermission(claims, ["payments.refund"]), false);
});

test("rejects tampered and expired tokens", () => {
  const token = createStaffAccessToken({ sub: "user-1", sid: "session-1", roles: ["store_staff"], permissions: ["admin.access"], allowedStoreIds: [] }, secret, 10, 1_000);
  assert.throws(() => verifyStaffAccessToken(`${token.slice(0, -1)}x`, secret, 1_001), InvalidAccessTokenError);
  assert.throws(() => verifyStaffAccessToken(token, secret, 1_011), InvalidAccessTokenError);
});
