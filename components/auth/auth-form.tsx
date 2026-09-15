"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import {
  type FormEvent,
  type KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

export type AuthMode = "login" | "signup";

type FieldName =
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "password"
  | "confirmPassword";

type FieldErrors = Partial<Record<FieldName, string>>;

type AuthResponse = {
  ok?: boolean;
  destination?: string;
  error?: string;
  fieldErrors?: FieldErrors;
};

export function AuthForm({
  initialMode,
  attemptRefresh,
  nextPath,
}: {
  initialMode: AuthMode;
  attemptRefresh: boolean;
  nextPath?: string;
}) {
  const router = useRouter();
  const refreshAttempted = useRef(false);
  const [mode, setMode] = useState<AuthMode>(initialMode);
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
        const result = (await response.json().catch(() => ({}))) as AuthResponse;
        if (response.ok && result.ok && result.destination) {
          router.replace(result.destination);
          router.refresh();
          return;
        }
      } catch {
        // The form remains available when an old refresh session cannot be restored.
      }
      setCheckingSession(false);
    };

    void refreshSession();
  }, [attemptRefresh, router]);

  const selectMode = (nextMode: AuthMode) => {
    if (submitting || nextMode === mode) return;
    setMode(nextMode);
    setFieldErrors({});
    setGeneralError("");
    const query = new URLSearchParams({ mode: nextMode });
    if (nextPath) query.set("next", nextPath);
    router.replace(`/auth?${query.toString()}`, { scroll: false });
  };

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    let nextMode: AuthMode | null = null;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      nextMode = mode === "login" ? "signup" : "login";
    } else if (event.key === "Home") {
      nextMode = "login";
    } else if (event.key === "End") {
      nextMode = "signup";
    }

    if (!nextMode || nextMode === mode) return;
    event.preventDefault();
    selectMode(nextMode);
    requestAnimationFrame(() => {
      document.getElementById(`auth-tab-${nextMode}`)?.focus();
    });
  };

  const clearError = (field: FieldName) => {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setGeneralError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const form = new FormData(event.currentTarget);
    const values = {
      firstName: String(form.get("firstName") ?? "").trim(),
      lastName: String(form.get("lastName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      confirmPassword: String(form.get("confirmPassword") ?? ""),
    };
    const errors: FieldErrors = {};

    if (mode === "signup") {
      if (!values.firstName) errors.firstName = "نام را وارد کنید.";
      if (!values.lastName) errors.lastName = "نام خانوادگی را وارد کنید.";
      if (values.phone && values.phone.length < 7) {
        errors.phone = "شماره تماس را کامل وارد کنید.";
      }
      if (!values.confirmPassword) {
        errors.confirmPassword = "تکرار رمز عبور را وارد کنید.";
      } else if (values.confirmPassword !== values.password) {
        errors.confirmPassword = "تکرار رمز عبور یکسان نیست.";
      }
    }
    if (!values.email) errors.email = "ایمیل خود را وارد کنید.";
    else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      errors.email = "یک ایمیل معتبر وارد کنید.";
    }
    if (!values.password) errors.password = "رمز عبور را وارد کنید.";
    else if (values.password.length < 12) {
      errors.password = "رمز عبور باید دست‌کم ۱۲ کاراکتر باشد.";
    }

    setFieldErrors(errors);
    setGeneralError("");
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const payload = mode === "login"
        ? { email: values.email, password: values.password }
        : {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone || undefined,
            password: values.password,
            preferredLocale: "fa",
          };
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => ({}))) as AuthResponse;

      if (response.ok && result.ok && result.destination) {
        router.replace(result.destination);
        router.refresh();
        return;
      }

      setFieldErrors(result.fieldErrors ?? {});
      setGeneralError(
        result.error ??
          (mode === "login"
            ? "ورود انجام نشد. اطلاعات خود را بررسی کنید."
            : "ثبت‌نام انجام نشد. دوباره تلاش کنید."),
      );
    } catch {
      setGeneralError("سرویس حساب کاربری موقتاً در دسترس نیست. کمی بعد دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      dir="ltr"
      className="min-h-dvh w-full overflow-x-hidden bg-[#0b0b0b] text-[#f5f0e8] [color-scheme:dark]"
    >
      <div className="grid min-h-dvh lg:grid-cols-[minmax(440px,0.9fr)_minmax(0,1.1fr)]">
        <section
          dir="rtl"
          className="relative order-2 flex min-h-dvh items-center justify-center border-white/10 bg-[#10100f] px-5 py-12 sm:px-10 lg:order-1 lg:border-r lg:px-12 xl:px-20"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_4%,rgba(176,138,104,0.10),transparent_28%)]" />
          <div className="relative w-full max-w-[580px] motion-safe:animate-[auth-rise_.55s_ease-out_both]">
            <div className="mb-10 flex items-center justify-between lg:hidden">
              <Link href="/" className="text-[13px] font-semibold tracking-[0.18em] text-white">
                NAJIBZADEH
              </Link>
              <Link href="/" className="text-[11px] text-white/65 transition hover:text-white">
                بازگشت به فروشگاه
              </Link>
            </div>

            <header className="text-right">
              <p className="flex items-center gap-3 text-[12px] font-medium text-[#c29a76]">
                <span className="h-px w-8 bg-current" />
                حساب نجیب‌زاده
              </p>
              <h1 className="mt-4 text-[clamp(2.35rem,5.5vw,4.45rem)] font-semibold leading-[1.25] tracking-[-0.045em]">
                {mode === "login" ? "خوش آمدید." : "به جمع ما بپیوندید."}
              </h1>
              <p className="mt-3 max-w-[510px] text-[13px] leading-7 text-white/65 sm:text-[14px]">
                {mode === "login"
                  ? "با یک حساب، به فضای شخصی یا پنل مدیریت خود وارد شوید. مقصد شما پس از بررسی نقش حساب مشخص می‌شود."
                  : "حساب شخصی خود را بسازید و خریدها، نشانی‌ها و تجربه اختصاصی نجیب‌زاده را در یک‌جا دنبال کنید."}
              </p>
            </header>

            <div
              role="tablist"
              aria-label="انتخاب ورود یا ثبت‌نام"
              onKeyDown={handleTabKeyDown}
              className="mt-7 grid grid-cols-2 border border-white/12 bg-black/20 p-1"
            >
              <ModeButton mode="login" selected={mode === "login"} onClick={() => selectMode("login")}>
                ورود
              </ModeButton>
              <ModeButton mode="signup" selected={mode === "signup"} onClick={() => selectMode("signup")}>
                ثبت‌نام
              </ModeButton>
            </div>

            <div
              id="auth-mode-panel"
              role="tabpanel"
              aria-labelledby={`auth-tab-${mode}`}
            >
              {checkingSession ? (
                <div role="status" aria-live="polite" className="mt-6 flex min-h-52 flex-col items-center justify-center border border-white/10 bg-white/[0.018] text-center">
                  <LoaderCircle className="animate-spin text-[#c29a76] motion-reduce:animate-none" aria-hidden="true" />
                  <strong className="mt-4 text-[14px]">در حال بازیابی حساب شما</strong>
                  <span className="mt-2 text-[12px] text-white/60">بررسی نشست امن…</span>
                </div>
              ) : (
                <form className="mt-6 space-y-4" method="post" onSubmit={submit} noValidate>
                {generalError ? (
                  <div role="alert" className="flex items-start gap-3 border border-[#a35c54]/50 bg-[#7b342e]/15 px-4 py-3 text-[13px] leading-6 text-[#f0b7b0]">
                    <ShieldCheck className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                    <span>{generalError}</span>
                  </div>
                ) : null}

                {mode === "signup" ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="firstName" name="firstName" label="نام" autoComplete="given-name" error={fieldErrors.firstName} onChange={() => clearError("firstName")} />
                    <Field id="lastName" name="lastName" label="نام خانوادگی" autoComplete="family-name" error={fieldErrors.lastName} onChange={() => clearError("lastName")} />
                  </div>
                ) : null}

                <Field id="email" name="email" type="email" label="ایمیل" autoComplete="username" inputMode="email" dir="ltr" placeholder="name@example.com" error={fieldErrors.email} onChange={() => clearError("email")} autoFocus />

                {mode === "signup" ? (
                  <Field id="phone" name="phone" type="tel" label="شماره تماس" optional autoComplete="tel" inputMode="tel" dir="ltr" placeholder="09xxxxxxxxx" error={fieldErrors.phone} onChange={() => clearError("phone")} />
                ) : null}

                <Field id="password" name="password" type="password" label="رمز عبور" meta="حداقل ۱۲ کاراکتر" autoComplete={mode === "login" ? "current-password" : "new-password"} error={fieldErrors.password} onChange={() => clearError("password")} />

                {mode === "signup" ? (
                  <Field id="confirmPassword" name="confirmPassword" type="password" label="تکرار رمز عبور" autoComplete="new-password" error={fieldErrors.confirmPassword} onChange={() => clearError("confirmPassword")} />
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="group mt-2 flex min-h-14 w-full items-center justify-center gap-3 border border-[#b08a68] bg-[#b08a68] px-5 text-[14px] font-semibold text-[#15110e] transition duration-300 hover:border-[#d4b493] hover:bg-[#d4b493] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4b493] disabled:cursor-wait disabled:opacity-65"
                >
                  {submitting ? <LoaderCircle size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> : <LockKeyhole size={17} aria-hidden="true" />}
                  {submitting
                    ? "در حال بررسی…"
                    : mode === "login"
                      ? "ورود به حساب"
                      : "ساخت حساب شخصی"}
                </button>
                </form>
              )}

              <div className="mt-7 flex items-start gap-3 border-t border-white/9 pt-5 text-right text-[12px] leading-6 text-white/60">
                <ShieldCheck size={17} className="mt-0.5 shrink-0 text-[#b08a68]" aria-hidden="true" />
                <p>نشست شما در مرورگر و با کوکی امن نگهداری می‌شود. نقش و سطح دسترسی همیشه در سرور بررسی خواهد شد.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative order-1 hidden min-h-dvh overflow-hidden bg-[#080808] lg:block" aria-label="نجیب‌زاده، وقار در سکوت">
          <Image
            src="/assets/images/suit.webp"
            alt="پوشاک مردانه نجیب‌زاده"
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 0vw"
            className="object-cover object-center opacity-75"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,.1),rgba(8,8,8,.32)_58%,rgba(8,8,8,.9)),linear-gradient(0deg,rgba(8,8,8,.8),transparent_55%)]" />
          <div className="absolute inset-0 flex flex-col justify-between p-10 xl:p-14" dir="rtl">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-[15px] font-semibold tracking-[0.2em] text-white">NAJIBZADEH</Link>
              <span className="text-[11px] text-white/70">حساب یکپارچه</span>
            </div>
            <div className="max-w-[620px] text-right">
              <p className="text-[11px] font-medium text-[#d2aa84]">وقار در سکوت</p>
              <h2 className="mt-5 text-[clamp(2.8rem,4.5vw,5.7rem)] font-semibold leading-[1.3] tracking-[-0.045em] text-white">
                یک ورودی،<br />فضای مخصوص شما.
              </h2>
              <div className="mt-8 flex max-w-[520px] items-center gap-5 border-t border-white/20 pt-5 text-[11px] text-white/75">
                <span className="flex items-center gap-2"><Check size={14} className="text-[#d2aa84]" />حساب مشتری</span>
                <span className="flex items-center gap-2"><Check size={14} className="text-[#d2aa84]" />دسترسی مدیریت</span>
              </div>
            </div>
            <Link href="/" className="flex w-fit items-center gap-2 text-[11px] text-white/72 transition hover:text-white">
              بازگشت به فروشگاه <ArrowLeft size={14} />
            </Link>
          </div>
        </section>
      </div>
      <style jsx global>{`
        @keyframes auth-rise {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}

function ModeButton({ mode, selected, onClick, children }: { mode: AuthMode; selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      id={`auth-tab-${mode}`}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls="auth-mode-panel"
      tabIndex={selected ? 0 : -1}
      onClick={onClick}
      className={`min-h-11 px-4 text-[13px] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c29a76] ${selected ? "bg-[#eee7dd] text-[#17130f]" : "text-white/65 hover:text-white"}`}
    >
      {children}
    </button>
  );
}

function Field({ label, meta, optional, error, dir = "rtl", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; meta?: string; optional?: boolean; error?: string }) {
  const describedBy = error ? `${props.id}-error` : undefined;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label htmlFor={props.id} className="text-[12px] font-medium text-white/80">{label}</label>
        <span className="text-[11px] text-white/55">{optional ? "اختیاری" : meta}</span>
      </div>
      <input
        {...props}
        dir={dir}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`min-h-13 w-full border bg-white/[0.025] px-4 text-[14px] text-white outline-none transition placeholder:text-white/35 focus:border-[#b08a68] focus:bg-white/[0.04] ${error ? "border-[#b76159]" : "border-white/13"}`}
      />
      {error ? <p id={describedBy} role="alert" className="mt-1.5 text-[12px] text-[#eca9a2]">{error}</p> : null}
    </div>
  );
}
