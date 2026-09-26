import { notFound } from "next/navigation";

import { CartPage } from "@/components/static/Cart/CartPage";
import { isLocale } from "@/lib/i18n/config";
import { cartCopy } from "@/lib/i18n/cart-copy";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <CartPage locale={locale} copy={cartCopy[locale]} />;
}
