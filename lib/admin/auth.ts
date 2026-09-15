import { redirect } from "next/navigation";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  authSessionSchema,
  cookieOptions,
  getAccountSession,
  type AccountProfile,
} from "@/lib/auth/session";

export { ACCESS_COOKIE, REFRESH_COOKIE, authSessionSchema, cookieOptions };

export type AdminStaff = AccountProfile;

export type AdminSession = {
  accessToken: string;
  staff: AdminStaff;
};

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await getAccountSession();
  return session
    ? { accessToken: session.accessToken, staff: session.account }
    : null;
}

export async function getStaff(): Promise<AdminStaff | null> {
  return (await getAdminSession())?.staff ?? null;
}

export async function requireStaff(): Promise<AdminStaff> {
  const staff = await getStaff();
  if (!staff) redirect("/auth?mode=login&refresh=1&next=%2Fadmin");
  if (!staff.permissions.includes("admin.access")) redirect("/customer-dashboard");
  return staff;
}

export async function requireStaffPermission(permission: string): Promise<AdminStaff> {
  const staff = await requireStaff();
  if (!staff.permissions.includes(permission)) redirect("/admin?reason=permission");
  return staff;
}

export function displayRole(roles: string[]): string {
  const labels: Record<string, string> = {
    owner: "مالک",
    administrator: "مدیر سیستم",
    catalog_manager: "مدیر کاتالوگ",
    inventory_manager: "مدیر انبار",
    order_manager: "مدیر سفارش‌ها",
    customer_support: "پشتیبانی مشتریان",
    finance: "امور مالی",
    store_staff: "همکار فروشگاه",
  };
  return labels[roles[0] || ""] || "همکار مدیریت";
}
