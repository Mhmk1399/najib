import assert from "node:assert/strict";
import test from "node:test";
import { staffLoginSchema, staffPermissionSchema, staffRoleSchema, staffSessionResponseSchema } from "../dist/index.js";

test("staff roles and permissions use the shared allowlists", () => {
  assert.equal(staffRoleSchema.parse("owner"), "owner");
  assert.equal(staffPermissionSchema.parse("catalog.write"), "catalog.write");
  assert.throws(() => staffRoleSchema.parse("superuser"));
  assert.throws(() => staffPermissionSchema.parse("everything"));
});

test("staff login requires a strong minimum password length", () => {
  assert.equal(staffLoginSchema.parse({ email: "OWNER@EXAMPLE.COM", password: "Long-password-123!" }).email, "owner@example.com");
  assert.equal(staffLoginSchema.safeParse({ email: "owner@example.com", password: "short" }).success, false);
});

test("staff session responses never include a password", () => {
  const response = staffSessionResponseSchema.parse({
    accessToken: "access",
    refreshToken: "r".repeat(48),
    accessTokenExpiresInSeconds: 900,
    refreshTokenExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    staff: { id: "user-1", email: "owner@example.com", firstName: "Store", lastName: "Owner", roles: ["owner"], permissions: ["admin.access"], allowedStoreIds: [] },
  });
  assert.equal("password" in response.staff, false);
});
