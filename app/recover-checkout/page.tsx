import type { Metadata } from "next";

import { CheckoutRecoveryPage } from "@/components/static/CheckoutRecovery/CheckoutRecoveryPage";
import { defaultLocale, isLocale } from "@/lib/i18n/config";

type Props = {
  params: Promise<{ locale?: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
};

const metadataCopy = {
  fa: { title: "بازیابی خرید | نجیب‌زاده", description: "بررسی امن موجودی و بازگرداندن خرید رهاشده به سبد" },
  en: { title: "Recover checkout | Najibzadeh", description: "Securely review availability and restore an abandoned checkout" },
  ar: { title: "استعادة الشراء | نجيب زاده", description: "تحقق آمن من المخزون واستعادة عملية شراء متروكة" },
} as const;

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const route = await params;
  const locale = isLocale(route.locale) ? route.locale : defaultLocale;
  return { ...metadataCopy[locale], robots: { index: false, follow: false, nocache: true } };
}

export default async function RecoverCheckoutPage({ params, searchParams }: Props) {
  const [route, query] = await Promise.all([params, searchParams]);
  const locale = isLocale(route.locale) ? route.locale : defaultLocale;
  const token = Array.isArray(query.token) ? query.token[0] : query.token;
  return <CheckoutRecoveryPage locale={locale} token={token ?? ""}/>;
}
