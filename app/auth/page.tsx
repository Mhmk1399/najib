import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm, type AuthMode } from "@/components/auth/auth-form";
import { accountDestination, getAccountSession } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "ورود و ثبت‌نام | نجیب‌زاده",
  description: "ورود یا ساخت حساب کاربری نجیب‌زاده",
  robots: { index: false, follow: false, nocache: true },
};

type AuthPageProps = {
  searchParams: Promise<{
    mode?: string | string[];
    refresh?: string | string[];
    next?: string | string[];
  }>;
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const [params, session] = await Promise.all([
    searchParams,
    getAccountSession(),
  ]);

  if (session) redirect(accountDestination(session.account));

  const mode: AuthMode = params.mode === "signup" ? "signup" : "login";
  const next = typeof params.next === "string" && params.next.startsWith("/") && !params.next.startsWith("//")
    ? params.next
    : undefined;

  return (
    <AuthForm
      initialMode={mode}
      attemptRefresh={params.refresh === "1"}
      nextPath={next}
    />
  );
}
