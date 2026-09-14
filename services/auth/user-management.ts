import "server-only";
import mongoose from "mongoose";
import { z } from "zod";
import {
  staffPermissionSchema,
  staffRoleSchema,
  type StaffPermission,
  type StaffRole,
} from "@/lib/server/auth-types";
import { connectToDatabase } from "@/lib/server/db";
import { badRequest, conflict, forbidden, notFound } from "@/lib/server/errors";
import { StaffAudit } from "@/models/auth/staff-audit";
import { User } from "@/models/auth/user";
import { hashPassword } from "@/services/auth/password";

const userStatusSchema = z.enum(["invited", "active", "suspended", "deleted"]);

const userCreateSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(12).max(128),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(32).optional().default(""),
  avatarUrl: z.string().trim().max(2048).optional().default(""),
  roles: z.array(staffRoleSchema).min(1).default(["customer"]),
  permissions: z.array(staffPermissionSchema).default([]),
  allowedStoreIds: z.array(z.string().trim().min(1).max(100)).default([]),
  status: userStatusSchema.default("active"),
  preferredLocale: z.enum(["fa", "en", "ar"]).default("fa"),
});

const userUpdateSchema = userCreateSchema
  .omit({ password: true })
  .partial()
  .extend({
    password: z.string().min(12).max(128).optional().or(z.literal("")),
  });

const userListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(15),
  search: z.string().trim().max(160).optional().default(""),
  status: userStatusSchema.optional(),
  role: staffRoleSchema.optional(),
  sortKey: z
    .enum(["createdAt", "email", "firstName", "lastName", "status"])
    .optional()
    .default("createdAt"),
  sortDirection: z.enum(["asc", "desc"]).optional().default("desc"),
});

type UserUpdateInput = z.infer<typeof userUpdateSchema>;
type UserListQuery = z.infer<typeof userListQuerySchema>;

export type AdminUserRecord = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl: string;
  roles: StaffRole[];
  permissions: StaffPermission[];
  allowedStoreIds: string[];
  status: "invited" | "active" | "suspended" | "deleted";
  preferredLocale: "fa" | "en" | "ar";
  lastLoginAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseId(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) badRequest("Invalid user id.");
  return id;
}

function serializeUser(user: Record<string, unknown>): AdminUserRecord {
  return {
    id: String(user._id),
    email: String(user.email ?? ""),
    firstName: String(user.firstName ?? ""),
    lastName: String(user.lastName ?? ""),
    phone: String(user.phone ?? ""),
    avatarUrl: String(user.avatarUrl ?? ""),
    roles: Array.isArray(user.roles) ? (user.roles as StaffRole[]) : [],
    permissions: Array.isArray(user.permissions)
      ? (user.permissions as StaffPermission[])
      : [],
    allowedStoreIds: Array.isArray(user.allowedStoreIds)
      ? (user.allowedStoreIds as string[])
      : [],
    status: (user.status as AdminUserRecord["status"]) ?? "active",
    preferredLocale:
      (user.preferredLocale as AdminUserRecord["preferredLocale"]) ?? "fa",
    lastLoginAt:
      user.lastLoginAt instanceof Date ? user.lastLoginAt.toISOString() : null,
    createdAt:
      user.createdAt instanceof Date ? user.createdAt.toISOString() : null,
    updatedAt:
      user.updatedAt instanceof Date ? user.updatedAt.toISOString() : null,
  };
}

function duplicateEmail(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

async function audit(record: Record<string, unknown>) {
  try {
    await StaffAudit.create(record);
  } catch {
    // User management must not fail because audit storage is unavailable.
  }
}

function buildFilter(query: UserListQuery) {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  else filter.status = { $ne: "deleted" };
  if (query.role) filter.roles = query.role;
  if (query.search) {
    const regex = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [
      { email: regex },
      { firstName: regex },
      { lastName: regex },
      { phone: regex },
    ];
  }
  return filter;
}

export const userManagementService = {
  parseListQuery(value: Record<string, string>) {
    return userListQuerySchema.parse(value);
  },

  async list(query: UserListQuery) {
    await connectToDatabase();
    const filter = buildFilter(query);
    const skip = (query.page - 1) * query.limit;
    const direction = query.sortDirection === "asc" ? 1 : -1;
    const [items, total] = await Promise.all([
      User.find(filter)
        .sort({ [query.sortKey]: direction, _id: direction })
        .skip(skip)
        .limit(query.limit)
        .lean(),
      User.countDocuments(filter),
    ]);
    return {
      items: items.map((item) => serializeUser(item)),
      total,
      page: query.page,
      pageSize: query.limit,
      pageCount: Math.max(1, Math.ceil(total / query.limit)),
    };
  },

  async findById(id: string) {
    await connectToDatabase();
    const user = await User.findById(parseId(id)).lean();
    if (!user) notFound("User was not found.");
    return serializeUser(user as Record<string, unknown>);
  },

  async create(value: unknown, actorId: string) {
    const input = userCreateSchema.safeParse(value);
    if (!input.success) badRequest("Invalid user payload.", input.error.issues);
    await connectToDatabase();

    const existing = await User.exists({ email: input.data.email });
    if (existing) conflict("A user with this email already exists.");

    try {
      const user = await User.create({
        ...input.data,
        passwordHash: await hashPassword(input.data.password),
      });
      await audit({
        userId: actorId,
        targetUserId: user._id,
        email: user.email,
        action: "user.create",
        outcome: "success",
      });
      return serializeUser(user.toObject());
    } catch (error) {
      if (duplicateEmail(error)) conflict("A user with this email already exists.");
      throw error;
    }
  },

  async update(id: string, value: unknown, actorId: string) {
    const input = userUpdateSchema.safeParse(value);
    if (!input.success) badRequest("Invalid user update payload.", input.error.issues);
    await connectToDatabase();

    const user = await User.findById(parseId(id)).select("+passwordHash");
    if (!user) notFound("User was not found.");

    const updates = input.data as UserUpdateInput;
    const isSelf = String(user._id) === actorId;
    if (
      isSelf &&
      (updates.status !== undefined ||
        updates.roles !== undefined ||
        updates.permissions !== undefined)
    ) {
      forbidden("You cannot change your own status, roles, or permissions.");
    }

    const { password, ...rest } = updates;
    Object.assign(user, rest);
    if (password) {
      user.passwordHash = await hashPassword(password);
      user.passwordChangedAt = new Date();
    }

    try {
      await user.save();
      await audit({
        userId: actorId,
        targetUserId: user._id,
        email: user.email,
        action: "user.update",
        outcome: "success",
      });
      return serializeUser(user.toObject());
    } catch (error) {
      if (duplicateEmail(error)) conflict("A user with this email already exists.");
      throw error;
    }
  },

  async delete(id: string, actorId: string) {
    await connectToDatabase();
    const user = await User.findById(parseId(id));
    if (!user) notFound("User was not found.");
    if (String(user._id) === actorId) {
      forbidden("You cannot delete your own user account.");
    }

    user.status = "deleted";
    await user.save();
    await audit({
      userId: actorId,
      targetUserId: user._id,
      email: user.email,
      action: "user.delete",
      outcome: "success",
    });
    return { ok: true };
  },
};
