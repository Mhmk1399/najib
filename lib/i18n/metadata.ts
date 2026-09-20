import type { Metadata } from "next";

import {
  defaultLocale,
  localeHtmlLang,
  localeOpenGraph,
  locales,
  type Locale,
} from "@/lib/i18n/config";
import { localizedPath, splitLocalePathname } from "@/lib/i18n/routes";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://najibzadeh.com",
);

export function localeAlternates(pathname: string, canonicalLocale: Locale) {
  const { pathnameWithoutLocale } = splitLocalePathname(pathname);

  return {
    canonical: localizedPath(pathnameWithoutLocale, canonicalLocale),
    languages: {
      ...Object.fromEntries(
        locales.map((locale) => [
          localeHtmlLang[locale],
          localizedPath(pathnameWithoutLocale, locale),
        ]),
      ),
      "x-default": localizedPath(pathnameWithoutLocale, defaultLocale),
    },
  } satisfies NonNullable<Metadata["alternates"]>;
}

export function localizedOpenGraph(locale: Locale) {
  return {
    locale: localeOpenGraph[locale],
    alternateLocale: locales
      .filter((item) => item !== locale)
      .map((item) => localeOpenGraph[item]),
    siteName: "Najibzadeh",
    type: "website",
  } satisfies NonNullable<Metadata["openGraph"]>;
}
