import type { Metadata } from "next";

import { PolicyPage } from "@/components/static/Legal/PolicyPage";

import { privacyCopy } from "@/lib/i18n/privacy-copy";

import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";

/* ==========================================================================
   TYPES
============================================================================ */

type PrivacyPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

/* ==========================================================================
   LOCALE
============================================================================ */

function resolveLocale(value: string): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale;
}

/* ==========================================================================
   METADATA
============================================================================ */

export async function generateMetadata({
  params,
}: PrivacyPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  const locale = resolveLocale(localeParam);

  const copy = privacyCopy[locale];

  return {
    title: copy.metadata.title,

    description: copy.metadata.description,
  };
}

/* ==========================================================================
   PAGE
============================================================================ */

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale: localeParam } = await params;

  const locale = resolveLocale(localeParam);

  const copy = privacyCopy[locale];

  return <PolicyPage locale={locale} copy={copy} />;
}
