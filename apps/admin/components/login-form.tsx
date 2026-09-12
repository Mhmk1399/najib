"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Moon, ShieldCheck, Sun } from "lucide-react";
import { type FormEvent, useEffect, useRef, useState, useSyncExternalStore } from "react";

type FieldErrors = { email?: string; password?: string };

type LoginErrorResponse = {
  ok?: boolean;
  error?: string;
  fieldErrors?: FieldErrors;
};

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function getDarkTheme() {
  return document.documentElement.dataset.theme === "dark";
}

export function LoginForm({ attemptRefresh }: { attemptRefresh: boolean }) {
  const router = useRouter();
  const refreshAttempted = useRef(false);
  const [showPassword, setShowPassword] = useState(false);
  const darkTheme = useSyncExternalStore(subscribeToTheme, getDarkTheme, () => false);
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
        const result = (await response.json().catch(() => ({}))) as LoginErrorResponse;
        if (response.ok && result.ok === true) {
          router.replace("/");
          router.refresh();
          return;
        }
      } catch {
        // The normal sign-in form is the safe fallback when refresh is unavailable.
      }
      setCheckingSession(false);
    };

    void refreshSession();
  }, [attemptRefresh, router]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const localErrors: FieldErrors = {};

    if (!email) localErrors.email = "ایمیل کاری خود را وارد کنید.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) localErrors.email = "یک ایمیل معتبر وارد کنید.";
    if (!password) localErrors.password = "رمز عبور را وارد کنید.";

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
      const result = (await response.json().catch(() => ({}))) as LoginErrorResponse;

      if (response.ok && result.ok === true) {
        router.replace("/");
        router.refresh();
        return;
      }

      setFieldErrors(result.fieldErrors ?? {});
      setGeneralError(result.error || "ورود انجام نشد. اطلاعات خود را بررسی و دوباره تلاش کنید.");
    } catch {
      setGeneralError("سرویس ورود موقتاً در دسترس نیست. کمی بعد دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTheme = () => {
    const next = darkTheme ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("najib-admin-theme", next);
  };

  return (
    <main className="login-page">
      <section className="login-identity" aria-label="عملیات آتلیه نجیب‌زاده">
        <div className="login-brand">
          <Image src="/brand/logo.png" alt="Najibzadeh" width={58} height={58} priority />
          <div><strong>NAJIBZADEH</strong><span>عملیات آتلیه</span></div>
        </div>
        <div className="login-statement">
          <span className="login-index">فضای خصوصی &nbsp; / &nbsp; ۰۱</span>
          <h1>پشت صحنه‌ی آرام هر عملیات دقیق.</h1>
          <p>فضایی امن برای افرادی که کالکشن را می‌سازند، سفارش‌ها را آماده می‌کنند و از تجربه‌ی مشتری مراقبت می‌کنند.</p>
        </div>
        <footer><span>ورود همکاران</span><i aria-hidden="true" /><span>تهران</span></footer>
      </section>

      <section className="login-workspace">
        <button className="login-theme" type="button" onClick={toggleTheme} aria-label={darkTheme ? "پوسته روشن" : "پوسته تیره"}>
          <Moon className="theme-dark-icon" size={17} /><Sun className="theme-light-icon" size={17} />
        </button>
        <div className="login-form-wrap">
          <header className="login-heading">
            <p>عملیات آتلیه</p>
            <h2>ورود همکاران</h2>
            <span>برای ورود به داشبورد از حساب کاری خود استفاده کنید.</span>
          </header>

          {checkingSession ? (
            <div className="session-check" role="status" aria-live="polite">
              <LoaderCircle size={24} aria-hidden="true" />
              <strong>بازیابی نشست شما</strong>
              <span>در حال بررسی دسترسی امن…</span>
            </div>
          ) : (
            <form className="login-form" onSubmit={submit} noValidate>
              {generalError && <div className="login-error" role="alert"><ShieldCheck size={17} aria-hidden="true" /><span>{generalError}</span></div>}

              <div className="field-group">
                <label htmlFor="staff-email">ایمیل</label>
                <input
                  id="staff-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  autoFocus
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "staff-email-error" : undefined}
                  onChange={() => fieldErrors.email && setFieldErrors((errors) => ({ ...errors, email: undefined }))}
                  placeholder="name@company.com"
                  dir="ltr"
                />
                {fieldErrors.email && <span className="field-error" id="staff-email-error">{fieldErrors.email}</span>}
              </div>

              <div className="field-group">
                <div className="field-label-row"><label htmlFor="staff-password">رمز عبور</label><span>ورود امن</span></div>
                <div className="password-field">
                  <input
                    id="staff-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby={fieldErrors.password ? "staff-password-error" : undefined}
                    onChange={() => fieldErrors.password && setFieldErrors((errors) => ({ ...errors, password: undefined }))}
                    placeholder="رمز عبور خود را وارد کنید"
                  />
                  <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && <span className="field-error" id="staff-password-error">{fieldErrors.password}</span>}
              </div>

              <button className="login-submit" type="submit" disabled={submitting}>
                {submitting ? <LoaderCircle className="spin" size={17} aria-hidden="true" /> : <LockKeyhole size={17} aria-hidden="true" />}
                <span>{submitting ? "در حال بررسی…" : "ورود به داشبورد"}</span>
              </button>
            </form>
          )}

          <aside className="login-security">
            <ShieldCheck size={17} aria-hidden="true" />
            <p><strong>فضای محافظت‌شده همکاران</strong><span>اگر به حساب خود دسترسی ندارید، با مدیر فروشگاه یا مدیر سیستم تماس بگیرید.</span></p>
          </aside>
        </div>
        <p className="login-legal">ویژه افراد مجاز <i aria-hidden="true">·</i> فعالیت‌ها ممکن است برای امنیت ثبت شوند</p>
      </section>
    </main>
  );
}
