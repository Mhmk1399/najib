import type { Metadata } from "next";

import { CustomerDashboard } from "@/components/account/customer-dashboard";

import { requireCustomerAccount } from "@/lib/auth/session";

import {
  customerDashboardCopy,
} from "@/lib/i18n/customer-dashboard-copy";

import {
  defaultLocale,
  locales,
  type Locale,
} from "@/lib/i18n/config";

type CustomerDashboardPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function resolveLocale(value: string): Locale {
  return locales.includes(value as Locale)
    ? (value as Locale)
    : defaultLocale;
}

export async function generateMetadata({
  params,
}: CustomerDashboardPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  const locale = resolveLocale(localeParam);

  const copy = customerDashboardCopy[locale];

  return {
    title: copy.metadata.title,
    description: copy.metadata.description,
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
  };
}

export default async function CustomerDashboardPage({
  params,
}: CustomerDashboardPageProps) {
  const { locale: localeParam } = await params;

  const locale = resolveLocale(localeParam);

  const copy = customerDashboardCopy[locale];

  const account = await requireCustomerAccount();

  return (
    <CustomerDashboard
      locale={locale}
      copy={copy}
      initialAccount={{
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
      }}
    />
  );
}
