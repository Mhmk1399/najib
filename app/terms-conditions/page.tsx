import { TermsAndConditionsPage } from "@/components/static/Terms/TermsAndConditionsPage";

import {
  defaultLocale,
  type Locale,
} from "@/lib/i18n/config";

import { termsCopy } from "@/lib/i18n/terms-copy";

export default function TermsPage() {
  const locale: Locale = defaultLocale;
  const copy = termsCopy[locale];

  return (
    <TermsAndConditionsPage
      locale={locale}
      copy={copy}
      heroImage="/assets/images/banner.webp"
      heroImagePosition="center"
      currentYear={new Date().getFullYear()}
    />
  );
}