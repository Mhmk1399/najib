import { createHash, randomBytes } from "node:crypto";
import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createStaffAccessToken, readBearerToken, resolveStaffPermissions, verifyStaffAccessToken } from "@najib/auth";
import {
  staffLoginSchema,
  staffPermissionSchema,
  staffRefreshSchema,
  staffRoleSchema,
  type StaffLogin,
  type StaffPermission,
  type StaffProfile,
  type StaffRefresh,
  type StaffRole,
  type StaffSessionResponse,
} from "@najib/contracts";
import { StaffAudit } from "../models/staff-audit.js";
import { StaffSession } from "../models/staff-session.js";
import { User } from "../models/user.js";
import { hashPassword, verifyPassword } from "./password.js";

export interface RequestMetadata { ipAddress?: string; userAgent?: string }

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1_000;
const dummyPasswordHash = hashPassword("not-a-real-staff-password");

function tokenHash(token: string): string {
  return createHash("sha256").update(token).digest("base64url");
}

function normalizeMetadata(metadata: RequestMetadata): RequestMetadata {
  return {
    ipAddress: metadata.ipAddress?.slice(0, 128),
    userAgent: metadata.userAgent?.slice(0, 512),
  };
}

@Injectable()
export class AuthService {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  parseLogin(value: unknown): StaffLogin {
    const result = staffLoginSchema.safeParse(value);
    if (!result.success) throw new BadRequestException("Invalid staff login payload");
    return result.data;
  }
  parseRefresh(value: unknown): StaffRefresh {
    const result = staffRefreshSchema.safeParse(value);
    if (!result.success) throw new BadRequestException("Invalid refresh-token payload");
    return result.data;
  }

  async login(input: StaffLogin, requestMetadata: RequestMetadata): Promise<StaffSessionResponse> {
    const metadata = normalizeMetadata(requestMetadata);
    const user = await User.findOne({ email: input.email }).select("+passwordHash +failedLoginAttempts +lockedUntil");
    const passwordMatches = await verifyPassword(input.password, user?.passwordHash || await dummyPasswordHash);
    const roles = this.staffRoles(user?.roles ?? []);
    const isAllowed = Boolean(user && passwordMatches && user.status === "active" && roles.length > 0 && (!user.lockedUntil || user.lockedUntil <= new Date()));

    if (!isAllowed || !user) {
      if (user && (!user.lockedUntil || user.lockedUntil <= new Date())) {
        const failures = (user.failedLoginAttempts ?? 0) + 1;
        user.failedLoginAttempts = failures;
        if (failures >= MAX_FAILED_ATTEMPTS) user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
        await user.save();
      }
      await this.audit({ email: input.email, action: "login", outcome: "failure", reason: "invalid_credentials", ...metadata });
      throw new UnauthorizedException("Invalid email or password");
    }

    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.lastLoginAt = new Date();
    await user.save();
    const response = await this.createSession(user, roles, metadata);
    await this.audit({ userId: user._id, email: user.email, action: "login", outcome: "success", sessionId: response.sessionId, ...metadata });
    return response.body;
  }

  async refresh(input: StaffRefresh, requestMetadata: RequestMetadata): Promise<StaffSessionResponse> {
    const metadata = normalizeMetadata(requestMetadata);
    const presentedHash = tokenHash(input.refreshToken);
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
      throw new UnauthorizedException("Invalid or expired session");
    }
    const user = await User.findById(session.userId);
    const roles = this.staffRoles(user?.roles ?? []);
    if (!user || user.status !== "active" || roles.length === 0) {
      session.revokedAt = new Date();
      await session.save();
      throw new UnauthorizedException("Invalid or expired session");
    }

    const body = this.sessionBody(user, roles, session.id, refreshToken, session.expiresAt);
    await this.audit({ userId: user._id, email: user.email, action: "refresh", outcome: "success", sessionId: session._id, ...metadata });
    return body;
  }

  async profile(authorization: string | undefined): Promise<StaffProfile> {
    const claims = verifyStaffAccessToken(readBearerToken(authorization), this.config.getOrThrow<string>("AUTH_ACCESS_TOKEN_SECRET"));
    const session = await StaffSession.findOne({ _id: claims.sid, userId: claims.sub, revokedAt: { $exists: false }, expiresAt: { $gt: new Date() } }).lean();
    if (!session) throw new UnauthorizedException("Invalid or expired session");
    const user = await User.findOne({ _id: claims.sub, status: "active" });
    const roles = this.staffRoles(user?.roles ?? []);
    if (!user || roles.length === 0) throw new UnauthorizedException("Invalid or expired session");
    return this.profileFor(user, roles);
  }

  async logout(input: StaffRefresh, requestMetadata: RequestMetadata): Promise<{ success: true }> {
    const metadata = normalizeMetadata(requestMetadata);
    const session = await StaffSession.findOneAndUpdate(
      { tokenHash: tokenHash(input.refreshToken), revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date(), lastUsedAt: new Date() } },
      { new: true },
    );
    if (session) await this.audit({ userId: session.userId, action: "logout", outcome: "success", sessionId: session._id, ...metadata });
    return { success: true };
  }

  async logoutAll(authorization: string | undefined, requestMetadata: RequestMetadata): Promise<{ success: true }> {
    const claims = verifyStaffAccessToken(readBearerToken(authorization), this.config.getOrThrow<string>("AUTH_ACCESS_TOKEN_SECRET"));
    await StaffSession.updateMany({ userId: claims.sub, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });
    await this.audit({ userId: claims.sub, action: "logout_all", outcome: "success", ...normalizeMetadata(requestMetadata) });
    return { success: true };
  }

  private async createSession(user: InstanceType<typeof User>, roles: StaffRole[], metadata: RequestMetadata) {
    const refreshToken = randomBytes(48).toString("base64url");
    const refreshTtl = this.config.getOrThrow<number>("AUTH_REFRESH_TOKEN_TTL_SECONDS");
    const expiresAt = new Date(Date.now() + refreshTtl * 1_000);
    const session = await StaffSession.create({ userId: user._id, tokenHash: tokenHash(refreshToken), expiresAt, lastUsedAt: new Date(), ...metadata });
    return { sessionId: session._id, body: this.sessionBody(user, roles, session.id, refreshToken, expiresAt) };
  }

  private sessionBody(user: InstanceType<typeof User>, roles: StaffRole[], sessionId: string, refreshToken: string, expiresAt: Date): StaffSessionResponse {
    const accessTtl = this.config.getOrThrow<number>("AUTH_ACCESS_TOKEN_TTL_SECONDS");
    const permissions = resolveStaffPermissions(roles, this.staffPermissions(user.permissions));
    return {
      accessToken: createStaffAccessToken({ sub: user.id, sid: sessionId, roles, permissions, allowedStoreIds: user.allowedStoreIds ?? [] }, this.config.getOrThrow<string>("AUTH_ACCESS_TOKEN_SECRET"), accessTtl),
      refreshToken,
      accessTokenExpiresInSeconds: accessTtl,
      refreshTokenExpiresAt: expiresAt.toISOString(),
      staff: this.profileFor(user, roles, permissions),
    };
  }

  private profileFor(user: { _id: unknown; email: string; firstName: string; lastName: string; permissions?: string[]; allowedStoreIds?: string[] }, roles: StaffRole[], resolved?: StaffPermission[]): StaffProfile {
    return { id: String(user._id), email: user.email, firstName: user.firstName, lastName: user.lastName, roles, permissions: resolved ?? resolveStaffPermissions(roles, this.staffPermissions(user.permissions ?? [])), allowedStoreIds: user.allowedStoreIds ?? [] };
  }

  private staffRoles(values: readonly string[]): StaffRole[] {
    const legacyRoleMap: Record<string, StaffRole> = { accountant: "finance", merchandiser: "catalog_manager" };
    return [...new Set(values.flatMap((value) => {
      const parsed = staffRoleSchema.safeParse(legacyRoleMap[value] ?? value);
      return parsed.success ? [parsed.data] : [];
    }))];
  }

  private staffPermissions(values: readonly string[]): StaffPermission[] {
    return values.flatMap((value) => { const parsed = staffPermissionSchema.safeParse(value); return parsed.success ? [parsed.data] : []; });
  }

  private async audit(record: Record<string, unknown>): Promise<void> {
    try { await StaffAudit.create(record); } catch { /* Authentication must not fail because audit storage is temporarily unavailable. */ }
  }
}
