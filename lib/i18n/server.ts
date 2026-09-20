import { headers } from "next/headers";

import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

const localeHeader = "x-najib-locale";

export async function getRequestLocale(): Promise<Locale> {
  const requestHeaders = await headers();
  const candidateLocale = requestHeaders.get(localeHeader) ?? undefined;

  return isLocale(candidateLocale) ? candidateLocale : defaultLocale;
}
