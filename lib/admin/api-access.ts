import "server-only";

import type { StaffPermission } from "@/lib/server/auth-types";
import { getAdminSession } from "@/lib/admin/auth";
import { forbidden, unauthorized } from "@/lib/server/errors";

export async function requireAdminApiPermission(permission?: StaffPermission) {
  const session = await getAdminSession();
  if (!session || !session.staff.permissions.includes("admin.access")) {
    unauthorized("نشست مدیریت معتبر نیست یا منقضی شده است.");
  }
  if (permission && !session.staff.permissions.includes(permission)) {
    forbidden("سطح دسترسی لازم برای این عملیات فعال نیست.");
  }
  return session.staff;
}
