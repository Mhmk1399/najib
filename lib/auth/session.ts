import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getAccountProfile } from "@/services/auth/service";

export const ACCESS_COOKIE = "najib_access";
export const REFRESH_COOKIE = "najib_refresh";
export const LEGACY_ACCESS_COOKIE = "najib_admin_access";
export const LEGACY_REFRESH_COOKIE = "najib_admin_refresh";

export const accountProfileSchema = z.object({
  id: z.string(),
  email: z.email(),
  firstName: z.string(),
  lastName: z.string(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
  allowedStoreIds: z.array(z.string()),
});

export const authSessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(32),
  accessTokenExpiresInSeconds: z.number().int().positive(),
  refreshTokenExpiresAt: z.iso.datetime(),
  staff: accountProfileSchema,
});

export type AccountProfile = z.infer<typeof accountProfileSchema>;

export type AccountSession = {
  accessToken: string;
  account: AccountProfile;
};

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}

export function accountDestination(account: Pick<AccountProfile, "permissions">) {
  return account.permissions.includes("admin.access")
    ? "/admin"
    : "/customer-dashboard";
}

export async function getAccountSession(): Promise<AccountSession | null> {
  const cookieStore = await cookies();
  const accessToken =
    cookieStore.get(ACCESS_COOKIE)?.value ??
    cookieStore.get(LEGACY_ACCESS_COOKIE)?.value;

  if (!accessToken) return null;

  try {
    const account = accountProfileSchema.parse(
      await getAccountProfile(accessToken),
    );
    return { accessToken, account };
  } catch {
    return null;
  }
}

export async function requireCustomerAccount(): Promise<AccountProfile> {
  const session = await getAccountSession();
  if (!session) {
    redirect("/auth?mode=login&refresh=1&next=%2Fcustomer-dashboard");
  }
  if (session.account.permissions.includes("admin.access")) redirect("/admin");
  return session.account;
}
