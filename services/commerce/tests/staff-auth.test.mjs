import assert from "node:assert/strict";
import test from "node:test";
import { createStaffAccessToken, resolveStaffPermissions } from "@najib/auth";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { StaffAuthGuard } from "../dist/auth/staff-auth.guard.js";

const secret = "a-secure-commerce-test-secret-32-bytes";

function context(authorization, required = ["catalog.write"]) {
  const handler = () => undefined;
  Reflect.defineMetadata("najib:staff-permissions", required, handler);
  const request = { headers: { authorization } };
  return {
    request,
    context: {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => handler,
      getClass: () => class TestController {},
    },
  };
}

test("catalog writes accept staff with catalog.write", () => {
  const guard = new StaffAuthGuard(new Reflector(), new ConfigService({ AUTH_ACCESS_TOKEN_SECRET: secret }));
  const permissions = resolveStaffPermissions(["catalog_manager"]);
  const token = createStaffAccessToken({ sub: "user", sid: "session", roles: ["catalog_manager"], permissions, allowedStoreIds: [] }, secret, 900);
  const testContext = context(`Bearer ${token}`);
  assert.equal(guard.canActivate(testContext.context), true);
  assert.equal(testContext.request.staff.sub, "user");
});

test("catalog writes reject missing permission", () => {
  const guard = new StaffAuthGuard(new Reflector(), new ConfigService({ AUTH_ACCESS_TOKEN_SECRET: secret }));
  const permissions = resolveStaffPermissions(["store_staff"]);
  const token = createStaffAccessToken({ sub: "user", sid: "session", roles: ["store_staff"], permissions, allowedStoreIds: [] }, secret, 900);
  assert.throws(() => guard.canActivate(context(`Bearer ${token}`).context), /does not have permission/);
});

test("catalog writes reject missing access tokens", () => {
  const guard = new StaffAuthGuard(new Reflector(), new ConfigService({ AUTH_ACCESS_TOKEN_SECRET: secret }));
  assert.throws(() => guard.canActivate(context(undefined).context), /valid staff access token/);
});
