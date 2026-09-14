"use client";

import { useRouter } from "next/navigation";
import { LoaderCircle, LockKeyhole, ShieldCheck } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { CustomInput } from "@/components/ui/CustomInput";

type FieldErrors = {
  email?: string;
  password?: string;
};

type AuthResponse = {
  ok?: boolean;
  destination?: string;
  error?: string;
  fieldErrors?: FieldErrors;
};

export function LoginForm({ attemptRefresh }: { attemptRefresh: boolean }) {
  const router = useRouter();
  const refreshAttempted = useRef(false);

  const [submitting, setSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(attemptRefresh);
  const [generalError, setGeneralError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!attemptRefresh || refreshAttempted.current) return;

    refreshAttempted.current = true;

    const refreshSession = async () => {
      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "same-origin",
        });

        const result = (await response
          .json()
          .catch(() => ({}))) as AuthResponse;

        if (response.ok && result.ok === true) {
          router.replace(result.destination || "/");
          router.refresh();
          return;
        }
      } catch {
        // The normal account form is the safe fallback when refresh is unavailable.
      }

      setCheckingSession(false);
    };

    void refreshSession();
  }, [attemptRefresh, router]);

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((errors) => ({ ...errors, [field]: undefined }));
    setGeneralError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitting) return;

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const localErrors: FieldErrors = {};

    if (!email) localErrors.email = "ایمیل خود را وارد کنید.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) {
      localErrors.email = "یک ایمیل معتبر وارد کنید.";
    }

    if (!password) localErrors.password = "رمز عبور را وارد کنید.";
    else if (password.length < 12) {
      localErrors.password = "رمز عبور باید دست‌کم ۱۲ کاراکتر باشد.";
    }

    setFieldErrors(localErrors);
    setGeneralError("");

    if (Object.keys(localErrors).length) return;

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

      const result = (await response.json().catch(() => ({}))) as AuthResponse;

      if (response.ok && result.ok === true) {
        router.replace(result.destination || "/");
        router.refresh();
        return;
      }

      setFieldErrors(result.fieldErrors ?? {});
      setGeneralError(
        result.error || "ورود انجام نشد. اطلاعات خود را بررسی و دوباره تلاش کنید.",
      );
    } catch {
      setGeneralError(
        "سرویس حساب کاربری موقتاً در دسترس نیست. کمی بعد دوباره تلاش کنید.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      dir="ltr"
      className="min-h-dvh w-full overflow-x-hidden bg-[#08090B] text-[#F4F1EB] antialiased [color-scheme:dark]"
    >
      <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(520px,0.92fr)]">
        {/* ==================================================================
            FORM WORKSPACE
        =================================================================== */}
        <section
          dir="rtl"
          className="relative flex min-h-dvh items-center justify-center border-r border-white/[0.08] bg-[#0B0D10] px-4 py-12 sm:px-7 sm:py-16 lg:px-10 lg:py-20 xl:px-14"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_10%,rgba(255,255,255,0.035),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.012),transparent_34%)]"
          />

          <div className="relative z-10 w-full max-w-[610px]">
            {/* Mobile brand */}
            <div className="mb-10 flex items-center justify-between gap-4 lg:hidden">
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center border border-white/14 bg-white/[0.025] text-[15px] font-semibold tracking-[0.08em] text-white">
                  N
                </span>

                <div className="text-right">
                  <strong className="block text-[13px] font-semibold tracking-[0.16em] text-white">
                    NAJIBZADEH
                  </strong>
                  <span className="mt-1 block text-[9px] text-white/38">
                    حساب کاربری
                  </span>
                </div>
              </div>

              <span className="text-[9px] text-white/24">ورود امن</span>
            </div>

            <header className="text-right">
              <div className="flex items-center justify-start gap-3 text-[11px] font-medium text-[#B08A68]">
                <span className="h-px w-7 bg-current/70" aria-hidden="true" />
                <span>ورود امن کارکنان</span>
              </div>

              <h1 className="mt-4 text-[clamp(2.2rem,6vw,4.7rem)] font-semibold leading-[1.35] tracking-[-0.045em] text-white">
                خوش آمدید.
              </h1>

              <p className="mt-4 max-w-[570px] text-[12px] leading-7 text-white/48 sm:text-[13px]">
                با حساب کارکنان وارد فضای مدیریت شوید. این بخش برای حساب مشتریان در دسترس نیست.
              </p>
            </header>

            <div className="mt-7">
              {checkingSession ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="flex min-h-[190px] flex-col items-center justify-center border border-white/10 bg-white/[0.018] px-6 text-center"
                >
                  <LoaderCircle
                    size={25}
                    aria-hidden="true"
                    className="animate-spin text-white/70 motion-reduce:animate-none"
                  />
                  <strong className="mt-4 text-[14px] font-semibold text-white">
                    بازیابی نشست شما
                  </strong>
                  <span className="mt-2 text-[11px] text-white/38">
                    در حال بررسی دسترسی امن…
                  </span>
                </div>
              ) : (
                <form className="space-y-5" method="post" onSubmit={submit} noValidate>
                  {generalError ? (
                    <div
                      role="alert"
                      className="flex items-start gap-3 border border-[#8A4A45]/45 bg-[#6F332F]/12 px-4 py-3.5 text-right text-[12px] leading-6 text-[#E4AAA4]"
                    >
                      <ShieldCheck
                        size={18}
                        aria-hidden="true"
                        className="mt-0.5 shrink-0"
                      />
                      <span>{generalError}</span>
                    </div>
                  ) : null}

                  <AuthFieldLabel label="ایمیل" htmlFor="account-email">
                    <CustomInput
                      id="account-email"
                      name="email"
                      type="text"
                      inputMode="email"
                      autoComplete="username"
                      autoFocus
                      dir="ltr"
                      placeholder="name@example.com"
                      inputSize="lg"
                      tone="dark"
                      error={fieldErrors.email}
                      onChange={() => clearFieldError("email")}
                      inputClassName="!text-left !tracking-normal"
                    />
                  </AuthFieldLabel>

                  <AuthFieldLabel
                    label="رمز عبور"
                    htmlFor="account-password"
                    meta="ورود امن"
                  >
                    <CustomInput
                      id="account-password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      placeholder="رمز عبور خود را وارد کنید"
                      inputSize="lg"
                      tone="dark"
                      error={fieldErrors.password}
                      onChange={() => clearFieldError("password")}
                      inputClassName="!text-right !tracking-normal"
                    />
                  </AuthFieldLabel>

                  <Button
                    type="submit"
                    variant="copper"
                    size="xl"
                    fullWidth
                    uppercase={false}
                    loading={submitting}
                    disabled={submitting}
                    icon={<LockKeyhole size={17} aria-hidden="true" />}
                    iconPosition="right"
                    className="!min-h-14 !justify-center !gap-3 !text-[12px] !tracking-normal sm:!text-[13px]"
                  >
                    {submitting ? "در حال بررسی…" : "ورود به پنل مدیریت"}
                  </Button>
                </form>
              )}
            </div>

            <aside className="mt-7 flex items-start gap-3 border-t border-white/8 pt-5 text-right">
              <ShieldCheck
                size={18}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-white/32"
              />
              <p className="min-w-0">
                <strong className="block text-[11px] font-semibold text-white/72">
                  ورود فقط برای کارکنان مجاز است
                </strong>
                <span className="mt-1.5 block text-[10px] leading-6 text-white/32">
                  برای ساخت یا تغییر حساب کارکنان با مالک سامانه تماس بگیرید.
                </span>
              </p>
            </aside>

            <p className="mt-9 text-center text-[9px] text-white/22">
              فعالیت‌ها ممکن است برای امنیت حساب ثبت شوند
            </p>
          </div>
        </section>

        {/* ==================================================================
            BRAND / IDENTITY PANEL
        =================================================================== */}
        <section
          dir="rtl"
          aria-label="حساب نجیب‌زاده"
          className="relative hidden min-h-dvh overflow-hidden bg-[#0A0909] lg:flex lg:flex-col lg:justify-between"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_18%,rgba(255,255,255,0.055),transparent_24%),linear-gradient(145deg,rgba(255,255,255,0.022),transparent_42%),linear-gradient(180deg,transparent_46%,rgba(0,0,0,0.42)_100%)]"
          />

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-[24%] w-px bg-white/[0.045]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-[62%] w-px bg-white/[0.035]"
          />

          <div className="relative z-10 flex items-center justify-between px-8 pt-8 xl:px-12 xl:pt-10 2xl:px-16">
            <span className="text-[10px] font-medium text-white/28">
              ۰۱ / ورود کارکنان
            </span>
          </div>

          <div className="relative z-10 mx-auto w-full text-right max-w-[760px] px-8 py-20 xl:px-12 2xl:px-16">
            <span className="inline-flex items-center gap-3 text-[11px] font-medium text-[#B08A68]">
              <span className="h-px w-8 bg-current" />
              دسترسی حساب
            </span>

            <h2 className="mt-8 max-w-[660px] text-[clamp(2.7rem,4.1vw,5rem)] font-semibold leading-[1.42] tracking-[-0.045em] text-white">
              دسترسی مطمئن، تجربه‌ای یکپارچه.
            </h2>

            <p className="mt-7 max-w-[610px] text-[13px] leading-8 text-white/46 xl:text-[14px]">
              دسترسی هر همکار بر اساس نقش و مجوزهای او کنترل می‌شود و نشست‌های
              مدیریتی به‌صورت امن نگهداری می‌شوند.
            </p>

            <div className="mt-10 grid max-w-[620px] grid-cols-3 border-y border-white/9 py-6">
              <IdentityPoint title="ورود سریع" text="دسترسی مستقیم به حساب" />
              <IdentityPoint
                title="نشست امن"
                text="بازیابی خودکار دسترسی"
                divided
              />
              <IdentityPoint title="امن" text="کنترل مجوزهای دسترسی" divided />
            </div>
          </div>

          <footer className="relative z-10 flex items-center gap-4 border-t border-white/7 px-8 py-7 text-[9px] text-white/26 xl:px-12 2xl:px-16">
            <span>حساب نجیب‌زاده</span>
            <span className="h-px flex-1 bg-current opacity-30" />
            <span>ورود امن</span>
          </footer>
        </section>
      </div>
    </main>
  );
}

function AuthFieldLabel({
  label,
  htmlFor,
  meta,
  children,
}: {
  label: string;
  htmlFor: string;
  meta?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <label
          htmlFor={htmlFor}
          className="text-[12px] font-medium text-white/75"
        >
          {label}
        </label>
        {meta ? (
          <span className="text-[10px] text-white/36">{meta}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function IdentityPoint({
  title,
  text,
  divided = false,
}: {
  title: string;
  text: string;
  divided?: boolean;
}) {
  return (
    <div
      className={`px-5 text-right ${divided ? "border-r border-white/9" : ""}`}
    >
      <strong className="block text-[14px] font-semibold text-white">
        {title}
      </strong>
      <span className="mt-2 block text-[10px] leading-6 text-white/32">
        {text}
      </span>
    </div>
  );
}
