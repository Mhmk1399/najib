import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { connectToDatabase } from "@/lib/server/db";
import { badRequest, conflict, unauthorized } from "@/lib/server/errors";
import {
  customerSignupSchema,
  staffLoginSchema,
  staffPermissionSchema,
  staffRefreshSchema,
  staffRoleSchema,
  type StaffPermission,
  type StaffProfile,
  type StaffRole,
  type StaffSessionResponse,
} from "@/lib/server/auth-types";
import { createStaffAccessToken, resolveStaffPermissions, verifyStaffAccessToken } from "@/lib/server/staff-token";
import { StaffAudit } from "@/models/auth/staff-audit";
import { StaffSession } from "@/models/auth/staff-session";
import { User } from "@/models/auth/user";
import { hashPassword, verifyPassword } from "@/services/auth/password";

export type RequestMetadata = { ipAddress?: string; userAgent?: string };

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1_000;
const DUMMY_PASSWORD_HASH_PROMISE = import("@/services/auth/password").then(({ hashPassword }) => hashPassword("not-a-real-account-password"));

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("base64url");
}

function normalizeMetadata(metadata: RequestMetadata): RequestMetadata {
  return {
    ipAddress: metadata.ipAddress?.slice(0, 128),
    userAgent: metadata.userAgent?.slice(0, 512),
  };
}

function accessTtl() {
  return Number(process.env.AUTH_ACCESS_TOKEN_TTL_SECONDS || 15 * 60);
}

function refreshTtl() {
  return Number(process.env.AUTH_REFRESH_TOKEN_TTL_SECONDS || 14 * 24 * 60 * 60);
}

export async function loginAccount(value: unknown, requestMetadata: RequestMetadata): Promise<StaffSessionResponse> {
  const input = staffLoginSchema.safeParse(value);
  if (!input.success) badRequest("Invalid staff login payload.", input.error.issues);
  await connectToDatabase();

  const metadata = normalizeMetadata(requestMetadata);
  const user = await User.findOne({ email: input.data.email }).select("+passwordHash +failedLoginAttempts +lockedUntil");
  const passwordMatches = await verifyPassword(input.data.password, user?.passwordHash || await DUMMY_PASSWORD_HASH_PROMISE);
  const roles = staffRoles(user?.roles ?? []);
  const isAllowed = Boolean(user && passwordMatches && user.status === "active" && roles.length > 0 && (!user.lockedUntil || user.lockedUntil <= new Date()));

  if (!isAllowed || !user) {
    if (user && (!user.lockedUntil || user.lockedUntil <= new Date())) {
      const failures = (user.failedLoginAttempts ?? 0) + 1;
      user.failedLoginAttempts = failures;
      if (failures >= MAX_FAILED_ATTEMPTS) user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
      await user.save();
    }
    await audit({ email: input.data.email, action: "login", outcome: "failure", reason: "invalid_credentials", ...metadata });
    unauthorized("Invalid email or password.");
  }

  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;
  user.lastLoginAt = new Date();
  await user.save();

  const response = await createSession(user, roles, metadata);
  await audit({ userId: user._id, email: user.email, action: "login", outcome: "success", sessionId: response.sessionId, ...metadata });
  return response.body;
}

export async function signupCustomer(value: unknown, requestMetadata: RequestMetadata): Promise<StaffSessionResponse> {
  const input = customerSignupSchema.safeParse(value);
  if (!input.success) badRequest("Invalid sign-up payload.", input.error.issues);
  await connectToDatabase();

  const existing = await User.exists({ email: input.data.email });
  if (existing) conflict("An account with this email already exists.");

  const metadata = normalizeMetadata(requestMetadata);
  const user = await User.create({
    email: input.data.email,
    passwordHash: await hashPassword(input.data.password),
    firstName: input.data.firstName,
    lastName: input.data.lastName,
    phone: input.data.phone,
    preferredLocale: input.data.preferredLocale,
    preferredCityId: input.data.preferredCityId,
    roles: ["customer"],
    status: "active",
  });

  const response = await createSession(user, ["customer"], metadata);
  await audit({ userId: user._id, email: user.email, action: "signup", outcome: "success", sessionId: response.sessionId, ...metadata });
  return response.body;
}

export async function refreshAccountSession(value: unknown, requestMetadata: RequestMetadata): Promise<StaffSessionResponse> {
  const input = staffRefreshSchema.safeParse(value);
  if (!input.success) badRequest("Invalid refresh-token payload.", input.error.issues);
  await connectToDatabase();

  const metadata = normalizeMetadata(requestMetadata);
  const presentedHash = tokenHash(input.data.refreshToken);
  const refreshToken = randomBytes(48).toString("base64url");
  const session = await StaffSession.findOneAndUpdate(
    { tokenHash: presentedHash, revokedAt: { $exists: false }, expiresAt: { $gt: new Date() } },
    {
      $set: { tokenHash: tokenHash(refreshToken), lastUsedAt: new Date(), ipAddress: metadata.ipAddress, userAgent: metadata.userAgent },
      $push: { usedTokenHashes: { $each: [presentedHash], $slice: -5 } },
    },
    { new: true },
  ).select("+tokenHash");

  if (!session) {
    await StaffSession.findOneAndUpdate(
      { usedTokenHashes: presentedHash, revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date(), lastUsedAt: new Date() } },
    );
    unauthorized("Invalid or expired session.");
  }

  const user = await User.findById(session.userId);
  const roles = staffRoles(user?.roles ?? []);
  if (!user || user.status !== "active" || roles.length === 0) {
    session.revokedAt = new Date();
    await session.save();
    unauthorized("Invalid or expired session.");
  }

  const body = sessionBody(user, roles, session.id, refreshToken, session.expiresAt);
  await audit({ userId: user._id, email: user.email, action: "refresh", outcome: "success", sessionId: session._id, ...metadata });
  return body;
}

export async function getAccountProfile(accessToken: string): Promise<StaffProfile> {
  await connectToDatabase();
  const claims = verifyStaffAccessToken(accessToken);
  const session = await StaffSession.findOne({ _id: claims.sid, userId: claims.sub, revokedAt: { $exists: false }, expiresAt: { $gt: new Date() } }).lean();
  if (!session) unauthorized("Invalid or expired session.");
  const user = await User.findOne({ _id: claims.sub, status: "active" });
  const roles = staffRoles(user?.roles ?? []);
  if (!user || roles.length === 0) unauthorized("Invalid or expired session.");
  return profileFor(user, roles);
}

export async function logoutAccount(value: unknown, requestMetadata: RequestMetadata): Promise<{ success: true }> {
  const input = staffRefreshSchema.safeParse(value);
  if (!input.success) return { success: true };
  await connectToDatabase();

  const session = await StaffSession.findOneAndUpdate(
    { tokenHash: tokenHash(input.data.refreshToken), revokedAt: { $exists: false } },
    { $set: { revokedAt: new Date(), lastUsedAt: new Date() } },
    { new: true },
  );
  if (session) await audit({ userId: session.userId, action: "logout", outcome: "success", sessionId: session._id, ...normalizeMetadata(requestMetadata) });
  return { success: true };
}

async function createSession(user: InstanceType<typeof User>, roles: StaffRole[], metadata: RequestMetadata) {
  const refreshToken = randomBytes(48).toString("base64url");
  const expiresAt = new Date(Date.now() + refreshTtl() * 1_000);
  const session = await StaffSession.create({ userId: user._id, tokenHash: tokenHash(refreshToken), expiresAt, lastUsedAt: new Date(), ...metadata });
  return { sessionId: session._id, body: sessionBody(user, roles, session.id, refreshToken, expiresAt) };
}

function sessionBody(user: InstanceType<typeof User>, roles: StaffRole[], sessionId: string, refreshToken: string, expiresAt: Date): StaffSessionResponse {
  const permissions = resolveStaffPermissions(roles, staffPermissions(user.permissions));
  return {
    accessToken: createStaffAccessToken({ sub: user.id, sid: sessionId, roles, permissions, allowedStoreIds: user.allowedStoreIds ?? [] }, accessTtl()),
    refreshToken,
    accessTokenExpiresInSeconds: accessTtl(),
    refreshTokenExpiresAt: expiresAt.toISOString(),
    staff: profileFor(user, roles, permissions),
  };
}

function profileFor(user: { _id: unknown; email: string; firstName: string; lastName: string; permissions?: string[]; allowedStoreIds?: string[] }, roles: StaffRole[], resolved?: StaffPermission[]): StaffProfile {
  return { id: String(user._id), email: user.email, firstName: user.firstName, lastName: user.lastName, roles, permissions: resolved ?? resolveStaffPermissions(roles, staffPermissions(user.permissions ?? [])), allowedStoreIds: user.allowedStoreIds ?? [] };
}

function staffRoles(values: readonly string[]): StaffRole[] {
  const legacyRoleMap: Record<string, StaffRole> = { accountant: "finance", merchandiser: "catalog_manager" };
  return [...new Set(values.flatMap((value) => {
    const parsed = staffRoleSchema.safeParse(legacyRoleMap[value] ?? value);
    return parsed.success ? [parsed.data] : [];
  }))];
}

function staffPermissions(values: readonly string[] = []): StaffPermission[] {
  return values.flatMap((value) => {
    const parsed = staffPermissionSchema.safeParse(value);
    return parsed.success ? [parsed.data] : [];
  });
}

async function audit(record: Record<string, unknown>): Promise<void> {
  try {
    await StaffAudit.create(record);
  } catch {
    // Authentication must not fail because audit storage is temporarily unavailable.
  }
}
