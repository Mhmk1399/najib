import "server-only";

import { getAccountSession } from "@/lib/auth/session";
import { forbidden, unauthorized } from "@/lib/server/errors";

export async function requireCustomerApiAccount() {
  const session = await getAccountSession();
  if (!session) unauthorized("برای دسترسی به حساب، وارد شوید.");
  if (
    session.account.permissions.includes("admin.access") ||
    !session.account.roles.includes("customer")
  ) {
    forbidden("این بخش فقط برای حساب مشتری در دسترس است.");
  }
  return session.account;
}
