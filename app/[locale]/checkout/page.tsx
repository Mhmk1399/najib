import { notFound } from "next/navigation";

import { CheckoutPage } from "@/components/static/Checkout/CheckoutPage";
import { isLocale } from "@/lib/i18n/config";

type Props = { params: Promise<{ locale: string }> };

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <CheckoutPage locale={locale} />;
}
