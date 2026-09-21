import type { Metadata } from "next";

import { redirect } from "next/navigation";

import { AuthForm, type AuthMode } from "@/components/auth/auth-form";

import { accountDestination, getAccountSession } from "@/lib/auth/session";

import { authCopy } from "@/lib/i18n/auth-copy";

import { defaultLocale, locales, type Locale } from "@/lib/i18n/config";

type AuthPageProps = {
  params: Promise<{
    locale: string;
  }>;

  searchParams: Promise<{
    mode?: string | string[];

    refresh?: string | string[];

    next?: string | string[];
  }>;
};

function resolveLocale(value: string): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale;
}

export async function generateMetadata({
  params,
}: Pick<AuthPageProps, "params">): Promise<Metadata> {
  const routeParams = await params;

  const locale = resolveLocale(routeParams.locale);

  const copy = authCopy[locale];

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

export default async function AuthPage({
  params,
  searchParams,
}: AuthPageProps) {
  const [routeParams, queryParams, session] = await Promise.all([
    params,
    searchParams,
    getAccountSession(),
  ]);

  const locale = resolveLocale(routeParams.locale);

  const copy = authCopy[locale];

  if (session) {
    redirect(accountDestination(session.account));
  }

  const rawMode = Array.isArray(queryParams.mode)
    ? queryParams.mode[0]
    : queryParams.mode;

  const mode: AuthMode = rawMode === "signup" ? "signup" : "login";

  const rawRefresh = Array.isArray(queryParams.refresh)
    ? queryParams.refresh[0]
    : queryParams.refresh;

  const rawNext = Array.isArray(queryParams.next)
    ? queryParams.next[0]
    : queryParams.next;

  const next =
    typeof rawNext === "string" &&
    rawNext.startsWith("/") &&
    !rawNext.startsWith("//")
      ? rawNext
      : undefined;

  return (
    <AuthForm
      locale={locale}
      copy={copy}
      initialMode={mode}
      attemptRefresh={rawRefresh === "1"}
      nextPath={next}
      visualImage="/assets/images/suit.webp"
    />
  );
}
