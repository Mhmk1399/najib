import { createHmac, timingSafeEqual } from "node:crypto";
import type { StaffPermission, StaffRole } from "@/lib/server/auth-types";
import { unauthorized } from "@/lib/server/errors";

export const ACCESS_TOKEN_ISSUER = "najib-next";
export const ACCESS_TOKEN_AUDIENCE = "najib-admin";

export const ROLE_PERMISSIONS: Readonly<Record<StaffRole, readonly StaffPermission[]>> = {
  customer: [],
  owner: ["admin.access", "catalog.read", "catalog.write", "inventory.read", "inventory.write", "orders.read", "orders.write", "customers.read", "customers.write", "payments.read", "payments.refund", "collections.read", "collections.write", "insights.read", "settings.manage", "staff.manage"],
  administrator: ["admin.access", "catalog.read", "catalog.write", "inventory.read", "inventory.write", "orders.read", "orders.write", "customers.read", "customers.write", "payments.read", "payments.refund", "collections.read", "collections.write", "insights.read", "settings.manage", "staff.manage"],
  catalog_manager: ["admin.access", "catalog.read", "catalog.write", "collections.read", "collections.write", "inventory.read", "insights.read"],
  inventory_manager: ["admin.access", "catalog.read", "inventory.read", "inventory.write", "orders.read", "insights.read"],
  order_manager: ["admin.access", "orders.read", "orders.write", "customers.read", "inventory.read", "payments.read"],
  customer_support: ["admin.access", "orders.read", "customers.read", "customers.write", "payments.read"],
  finance: ["admin.access", "orders.read", "payments.read", "payments.refund", "insights.read"],
  store_staff: ["admin.access", "catalog.read", "inventory.read", "orders.read", "customers.read"],
};

export type StaffAccessClaims = {
  sub: string;
  sid: string;
  roles: StaffRole[];
  permissions: StaffPermission[];
  allowedStoreIds: string[];
  iss: typeof ACCESS_TOKEN_ISSUER;
  aud: typeof ACCESS_TOKEN_AUDIENCE;
  typ: "staff_access";
  iat: number;
  exp: number;
};

function encode(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

function sign(input: string, secret: string): string {
  return createHmac("sha256", secret).update(input).digest("base64url");
}

export function accessTokenSecret() {
  const configuredValue = process.env.AUTH_ACCESS_TOKEN_SECRET?.trim();
  if (!configuredValue && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_ACCESS_TOKEN_SECRET must be configured in production.");
  }
  const value = configuredValue || "najib-local-development-secret-change-me-32";
  if (Buffer.byteLength(value) < 32) throw new Error("AUTH_ACCESS_TOKEN_SECRET must contain at least 32 bytes.");
  return value;
}

export function resolveStaffPermissions(roles: readonly StaffRole[], additions: readonly StaffPermission[] = []): StaffPermission[] {
  return [...new Set([...roles.flatMap((role) => ROLE_PERMISSIONS[role]), ...additions])];
}

export function createStaffAccessToken(
  input: Omit<StaffAccessClaims, "iss" | "aud" | "typ" | "iat" | "exp">,
  ttlSeconds: number,
  nowSeconds = Math.floor(Date.now() / 1000),
): string {
  const header = encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = encode(JSON.stringify({ ...input, iss: ACCESS_TOKEN_ISSUER, aud: ACCESS_TOKEN_AUDIENCE, typ: "staff_access", iat: nowSeconds, exp: nowSeconds + ttlSeconds } satisfies StaffAccessClaims));
  const unsigned = `${header}.${payload}`;
  return `${unsigned}.${sign(unsigned, accessTokenSecret())}`;
}

export function verifyStaffAccessToken(token: string, nowSeconds = Math.floor(Date.now() / 1000)): StaffAccessClaims {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) unauthorized("Invalid or expired staff access token.");
    const [header, payload, signature] = parts as [string, string, string];
    const parsedHeader = JSON.parse(Buffer.from(header, "base64url").toString("utf8")) as { alg?: unknown; typ?: unknown };
    if (parsedHeader.alg !== "HS256" || parsedHeader.typ !== "JWT") unauthorized("Invalid or expired staff access token.");
    const expected = Buffer.from(sign(`${header}.${payload}`, accessTokenSecret()), "base64url");
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) unauthorized("Invalid or expired staff access token.");
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<StaffAccessClaims>;
    if (claims.iss !== ACCESS_TOKEN_ISSUER || claims.aud !== ACCESS_TOKEN_AUDIENCE || claims.typ !== "staff_access" || typeof claims.sub !== "string" || typeof claims.sid !== "string" || !Array.isArray(claims.roles) || !Array.isArray(claims.permissions) || !Array.isArray(claims.allowedStoreIds) || typeof claims.iat !== "number" || typeof claims.exp !== "number" || claims.exp <= nowSeconds || claims.iat > nowSeconds + 30) {
      unauthorized("Invalid or expired staff access token.");
    }
    return claims as StaffAccessClaims;
  } catch (error) {
    if (error instanceof Error && error.name === "ApiError") throw error;
    unauthorized("Invalid or expired staff access token.");
  }
}
