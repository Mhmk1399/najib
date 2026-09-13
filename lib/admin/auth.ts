import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getStaffProfile } from "@/services/auth/service";

export const ACCESS_COOKIE = "najib_admin_access";
export const REFRESH_COOKIE = "najib_admin_refresh";

const staffProfileSchema = z.object({
  id: z.string(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
  allowedStoreIds: z.array(z.string()),
});

export type AdminStaff = z.infer<typeof staffProfileSchema>;

export type AdminSession = {
  accessToken: string;
  staff: AdminStaff;
};

export const authSessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(32),
  accessTokenExpiresInSeconds: z.number().int().positive(),
  refreshTokenExpiresAt: z.iso.datetime(),
  staff: staffProfileSchema,
});

export function cookieOptions(maxAge: number) {
  return { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/", maxAge };
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const accessToken = (await cookies()).get(ACCESS_COOKIE)?.value;
  if (!accessToken) return null;
  try {
    const staff = staffProfileSchema.parse(await getStaffProfile(accessToken));
    return { accessToken, staff };
  } catch {
    return null;
  }
}

export async function getStaff(): Promise<AdminStaff | null> {
  return (await getAdminSession())?.staff ?? null;
}

export async function requireStaff(): Promise<AdminStaff> {
  const staff = await getStaff();
  if (!staff || !staff.permissions.includes("admin.access")) redirect("/admin/login?reason=session");
  return staff;
}

export async function requireStaffPermission(permission: string): Promise<AdminStaff> {
  const staff = await requireStaff();
  if (!staff.permissions.includes(permission)) redirect("/admin?reason=permission");
  return staff;
}

export function displayRole(roles: string[]): string {
  const labels: Record<string, string> = {
    owner: "Owner",
    administrator: "Administrator",
    catalog_manager: "Catalog manager",
    inventory_manager: "Inventory manager",
    order_manager: "Order manager",
    customer_support: "Customer support",
    finance: "Finance",
    store_staff: "Store staff",
  };
  return labels[roles[0] || ""] || "Staff";
}
