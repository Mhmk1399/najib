import { Suspense } from "react";

import { ShopPage } from "@/components/static/Shop/ShopPage";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { shopCopy } from "@/lib/i18n/shop-copy";

type PageProps = {
  params: Promise<{
    locale: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { locale: localeParam } = await params;
  const locale = isLocale(localeParam) ? localeParam : defaultLocale;

  return (
    <Suspense fallback={null}>
      <ShopPage locale={locale} copy={shopCopy[locale]} />
    </Suspense>
  );
}
