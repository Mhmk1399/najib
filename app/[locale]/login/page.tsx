import { redirect } from "next/navigation";

import { defaultLocale, isLocale } from "@/lib/i18n/config";

export default async function LoginAliasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = isLocale(rawLocale) ? rawLocale : defaultLocale;

  redirect(`/${locale}/auth?mode=login`);
}
