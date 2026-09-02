import { z } from "zod";

export const staffRoleSchema = z.enum([
  "owner",
  "administrator",
  "catalog_manager",
  "inventory_manager",
  "order_manager",
  "customer_support",
  "finance",
  "store_staff",
]);

export const staffPermissionSchema = z.enum([
  "admin.access",
  "catalog.read",
  "catalog.write",
  "inventory.read",
  "inventory.write",
  "orders.read",
  "orders.write",
  "customers.read",
  "customers.write",
  "payments.read",
  "payments.refund",
  "collections.read",
  "collections.write",
  "insights.read",
  "settings.manage",
  "staff.manage",
]);

export const staffLoginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(12).max(128),
});

export const staffRefreshSchema = z.object({
  refreshToken: z.string().min(32).max(256),
});

export const staffProfileSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  roles: z.array(staffRoleSchema).min(1),
  permissions: z.array(staffPermissionSchema),
  allowedStoreIds: z.array(z.string()),
});

export const staffSessionResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(32),
  accessTokenExpiresInSeconds: z.number().int().positive(),
  refreshTokenExpiresAt: z.iso.datetime(),
  staff: staffProfileSchema,
});

export type StaffRole = z.infer<typeof staffRoleSchema>;
export type StaffPermission = z.infer<typeof staffPermissionSchema>;
export type StaffLogin = z.infer<typeof staffLoginSchema>;
export type StaffRefresh = z.infer<typeof staffRefreshSchema>;
export type StaffProfile = z.infer<typeof staffProfileSchema>;
export type StaffSessionResponse = z.infer<typeof staffSessionResponseSchema>;
