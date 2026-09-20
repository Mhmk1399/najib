import { redirect } from "next/navigation";

import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { accountDestination, getAccountSession } from "@/lib/auth/session";

export default async function ProfileAliasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [{ locale: rawLocale }, session] = await Promise.all([
    params,
    getAccountSession(),
  ]);
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  if (!session) redirect(`/${locale}/auth?mode=login&refresh=1`);

  const destination = accountDestination(session.account);
  redirect(destination.startsWith("/") ? `/${locale}${destination}` : destination);
}
