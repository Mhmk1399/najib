"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  type FormEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import type { AuthCopy } from "@/lib/i18n/auth-copy";

import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";

import { localizedHref } from "@/lib/i18n/routes";

/* ==========================================================================
   TYPES
============================================================================ */

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

  /**
   * Prefer returning codes from the API instead of translated messages.
   * Examples:
   * INVALID_CREDENTIALS
   * EMAIL_ALREADY_EXISTS
   * RATE_LIMITED
   */
  code?: string;

  /**
   * Optional field-level codes.
   */
  fieldErrorCodes?: Partial<Record<FieldName, string>>;
};

type AuthFormProps = {
  initialMode: AuthMode;

  attemptRefresh: boolean;

  nextPath?: string;

  locale: Locale;

  copy: AuthCopy;

  visualImage: string;
};

/* ==========================================================================
   ERROR HELPERS
============================================================================ */

function getApiErrorMessage(
  code: string | undefined,
  mode: AuthMode,
  copy: AuthCopy,
) {
  switch (code) {
    case "INVALID_CREDENTIALS":
      return copy.apiErrors.invalidCredentials;

    case "EMAIL_ALREADY_EXISTS":
      return copy.apiErrors.emailAlreadyExists;

    case "ACCOUNT_DISABLED":
      return copy.apiErrors.accountDisabled;

    case "ACCOUNT_LOCKED":
      return copy.apiErrors.accountLocked;

    case "RATE_LIMITED":
      return copy.apiErrors.rateLimited;

    case "SESSION_EXPIRED":
      return copy.apiErrors.sessionExpired;

    default:
      return mode === "login"
        ? copy.modes.login.failure
        : copy.modes.signup.failure;
  }
}

function getFieldErrorMessage(
  field: FieldName,
  code: string | undefined,
  copy: AuthCopy,
) {
  switch (code) {
    case "REQUIRED":
      switch (field) {
        case "firstName":
          return copy.validation.firstNameRequired;

        case "lastName":
          return copy.validation.lastNameRequired;

        case "email":
          return copy.validation.emailRequired;

        case "password":
          return copy.validation.passwordRequired;

        case "confirmPassword":
          return copy.validation.confirmPasswordRequired;

        case "phone":
          return copy.validation.phoneInvalid;
      }

    case "INVALID_EMAIL":
      return copy.validation.emailInvalid;

    case "INVALID_PHONE":
      return copy.validation.phoneInvalid;

    case "PASSWORD_TOO_SHORT":
      return copy.validation.passwordMinLength;

    case "PASSWORDS_MISMATCH":
      return copy.validation.passwordsMismatch;

    case "EMAIL_ALREADY_EXISTS":
      return copy.apiErrors.emailAlreadyExists;

    default:
      return undefined;
  }
}

function translateFieldErrors(
  fieldErrorCodes: Partial<Record<FieldName, string>> | undefined,
  copy: AuthCopy,
) {
  if (!fieldErrorCodes) {
    return {};
  }

  const translated: FieldErrors = {};

  const entries = Object.entries(fieldErrorCodes) as Array<[FieldName, string]>;

  for (const [field, code] of entries) {
    const message = getFieldErrorMessage(field, code, copy);

    if (message) {
      translated[field] = message;
    }
  }

  return translated;
}

/* ==========================================================================
   AUTH FORM
============================================================================ */

export function AuthForm({
  initialMode,
  attemptRefresh,
  nextPath,
  locale,
  copy,
  visualImage,
}: AuthFormProps) {
  const router = useRouter();

  const direction = getLocaleDirection(locale);

  const htmlLang = getHtmlLang(locale);

  const isRtl = direction === "rtl";

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const refreshAttempted = useRef(false);

  const [mode, setMode] = useState<AuthMode>(initialMode);

  const [submitting, setSubmitting] = useState(false);

  const [checkingSession, setCheckingSession] = useState(attemptRefresh);

  const [generalError, setGeneralError] = useState("");

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  /* ==========================================================================
     REFRESH SESSION
  ========================================================================== */

  useEffect(() => {
    if (!attemptRefresh || refreshAttempted.current) {
      return;
    }

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

        if (response.ok && result.ok && result.destination) {
          router.replace(result.destination);

          router.refresh();

          return;
        }
      } catch {
        // The localized form stays available
        // if the previous session cannot be restored.
      }

      setCheckingSession(false);
    };

    void refreshSession();
  }, [attemptRefresh, router]);

  /* ==========================================================================
     MODE
  ========================================================================== */

  function selectMode(nextMode: AuthMode) {
    if (submitting || nextMode === mode) {
      return;
    }

    setMode(nextMode);

    setFieldErrors({});

    setGeneralError("");

    const query = new URLSearchParams({
      mode: nextMode,
    });

    if (nextPath) {
      query.set("next", nextPath);
    }

    router.replace(`${localizedHref("/auth", locale)}?${query.toString()}`, {
      scroll: false,
    });
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    let nextMode: AuthMode | null = null;

    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      nextMode = mode === "login" ? "signup" : "login";
    } else if (event.key === "Home") {
      nextMode = "login";
    } else if (event.key === "End") {
      nextMode = "signup";
    }

    if (!nextMode || nextMode === mode) {
      return;
    }

    event.preventDefault();

    selectMode(nextMode);

    requestAnimationFrame(() => {
      document.getElementById(`auth-tab-${nextMode}`)?.focus();
    });
  }

  function clearError(field: FieldName) {
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setGeneralError("");
  }

  /* ==========================================================================
     SUBMIT
  ========================================================================== */

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting) {
      return;
    }

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
      if (!values.firstName) {
        errors.firstName = copy.validation.firstNameRequired;
      }

      if (!values.lastName) {
        errors.lastName = copy.validation.lastNameRequired;
      }

      if (values.phone && values.phone.length < 7) {
        errors.phone = copy.validation.phoneInvalid;
      }

      if (!values.confirmPassword) {
        errors.confirmPassword = copy.validation.confirmPasswordRequired;
      } else if (values.confirmPassword !== values.password) {
        errors.confirmPassword = copy.validation.passwordsMismatch;
      }
    }

    if (!values.email) {
      errors.email = copy.validation.emailRequired;
    } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
      errors.email = copy.validation.emailInvalid;
    }

    if (!values.password) {
      errors.password = copy.validation.passwordRequired;
    } else if (values.password.length < 12) {
      errors.password = copy.validation.passwordMinLength;
    }

    setFieldErrors(errors);

    setGeneralError("");

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitting(true);

    try {
      const endpoint =
        mode === "login" ? "/api/auth/login" : "/api/auth/signup";

      const payload =
        mode === "login"
          ? {
              email: values.email,

              password: values.password,
            }
          : {
              firstName: values.firstName,

              lastName: values.lastName,

              email: values.email,

              phone: values.phone || undefined,

              password: values.password,

              preferredLocale: locale,
            };

      const response = await fetch(endpoint, {
        method: "POST",

        credentials: "same-origin",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => ({}))) as AuthResponse;

      if (response.ok && result.ok && result.destination) {
        router.replace(result.destination);

        router.refresh();

        return;
      }

      const translatedFields = translateFieldErrors(
        result.fieldErrorCodes,
        copy,
      );

      setFieldErrors(translatedFields);

      setGeneralError(getApiErrorMessage(result.code, mode, copy));
    } catch {
      setGeneralError(copy.submit.serviceUnavailable);
    } finally {
      setSubmitting(false);
    }
  }

  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <main
      dir={direction}
      lang={htmlLang}
      className="
        min-h-dvh
        w-full
        overflow-x-hidden
        bg-[#0b0b0b]
        text-[#f5f0e8]
        [color-scheme:dark]
      "
    >
      <div
        className="
          grid
          min-h-dvh

          lg:grid-cols-[minmax(440px,0.9fr)_minmax(0,1.1fr)]
        "
      >
        {/* ==============================================================
            FORM PANEL
        =============================================================== */}

        <section
          className={`
            relative
            order-2

            flex
            min-h-dvh

            items-center
            justify-center

            border-white/10

            bg-[#10100f]

            px-5
            py-12

            sm:px-10

            lg:order-1
            lg:px-12

            xl:px-20

            ${isRtl ? "lg:border-l" : "lg:border-r"}
          `}
        >
          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0

              bg-[radial-gradient(circle_at_12%_4%,rgba(176,138,104,0.10),transparent_28%)]
            "
          />

          <div
            className="
              relative
              w-full
              max-w-[580px]

              motion-safe:animate-[auth-rise_.55s_ease-out_both]
            "
          >
            {/* MOBILE BRAND BAR */}

            <div
              className="
                mb-10

                flex
                items-center
                justify-between

                lg:hidden
              "
            >
              <Link
                href={localizedHref("/", locale)}
                className="
                  text-[13px]
                  font-semibold
                  tracking-[0.18em]
                  text-white
                "
              >
                {copy.brand.name}
              </Link>

              <Link
                href={localizedHref("/", locale)}
                className="
                  text-[11px]
                  text-white/65

                  transition
                  hover:text-white
                "
              >
                {copy.brand.backToShop}
              </Link>
            </div>

            {/* HEADER */}

            <header className="text-start">
              <p
                className="
                  flex
                  items-center
                  gap-3

                  text-[12px]
                  font-medium

                  text-[#c29a76]
                "
              >
                <span
                  aria-hidden="true"
                  className="
                    h-px
                    w-8
                    bg-current
                  "
                />

                {copy.brand.accountEyebrow}
              </p>

              <h1
                className="
                  mt-4

                  text-[clamp(2.35rem,5.5vw,4.45rem)]
                  font-semibold

                  leading-[1.25]
                  tracking-[-0.045em]
                "
              >
                {mode === "login"
                  ? copy.modes.login.title
                  : copy.modes.signup.title}
              </h1>

              <p
                className="
                  mt-3
                  max-w-[510px]

                  text-[13px]
                  leading-7

                  text-white/65

                  sm:text-[14px]
                "
              >
                {mode === "login"
                  ? copy.modes.login.description
                  : copy.modes.signup.description}
              </p>
            </header>

            {/* MODE TABS */}

            <div
              role="tablist"
              aria-label={copy.modes.ariaLabel}
              onKeyDown={handleTabKeyDown}
              className="
                mt-7

                grid
                grid-cols-2

                border
                border-white/12

                bg-black/20

                p-1
              "
            >
              <ModeButton
                mode="login"
                selected={mode === "login"}
                onClick={() => selectMode("login")}
              >
                {copy.modes.login.tab}
              </ModeButton>

              <ModeButton
                mode="signup"
                selected={mode === "signup"}
                onClick={() => selectMode("signup")}
              >
                {copy.modes.signup.tab}
              </ModeButton>
            </div>

            {/* MODE PANEL */}

            <div
              id="auth-mode-panel"
              role="tabpanel"
              aria-labelledby={`auth-tab-${mode}`}
            >
              {checkingSession ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="
                    mt-6

                    flex
                    min-h-52

                    flex-col

                    items-center
                    justify-center

                    border
                    border-white/10

                    bg-white/[0.018]

                    text-center
                  "
                >
                  <LoaderCircle
                    aria-hidden="true"
                    className="
                      animate-spin
                      text-[#c29a76]

                      motion-reduce:animate-none
                    "
                  />

                  <strong
                    className="
                      mt-4
                      text-[14px]
                    "
                  >
                    {copy.session.restoring}
                  </strong>

                  <span
                    className="
                      mt-2

                      text-[12px]
                      text-white/60
                    "
                  >
                    {copy.session.checking}
                  </span>
                </div>
              ) : (
                <form
                  className="
                    mt-6
                    space-y-4
                  "
                  method="post"
                  onSubmit={submit}
                  noValidate
                >
                  {/* GENERAL ERROR */}

                  {generalError ? (
                    <div
                      role="alert"
                      className="
                        flex
                        items-start
                        gap-3

                        border
                        border-[#a35c54]/50

                        bg-[#7b342e]/15

                        px-4
                        py-3

                        text-[13px]
                        leading-6

                        text-[#f0b7b0]
                      "
                    >
                      <ShieldCheck
                        aria-hidden="true"
                        className="
                          mt-0.5
                          shrink-0
                        "
                        size={17}
                      />

                      <span>{generalError}</span>
                    </div>
                  ) : null}

                  {/* SIGNUP NAMES */}

                  {mode === "signup" ? (
                    <div
                      className="
                        grid
                        gap-4

                        sm:grid-cols-2
                      "
                    >
                      <Field
                        id="firstName"
                        name="firstName"
                        label={copy.fields.firstName}
                        autoComplete="given-name"
                        direction={direction}
                        error={fieldErrors.firstName}
                        onChange={() => clearError("firstName")}
                      />

                      <Field
                        id="lastName"
                        name="lastName"
                        label={copy.fields.lastName}
                        autoComplete="family-name"
                        direction={direction}
                        error={fieldErrors.lastName}
                        onChange={() => clearError("lastName")}
                      />
                    </div>
                  ) : null}

                  {/* EMAIL */}

                  <Field
                    id="email"
                    name="email"
                    type="email"
                    label={copy.fields.email}
                    autoComplete="username"
                    inputMode="email"
                    direction="ltr"
                    placeholder={copy.fields.emailPlaceholder}
                    error={fieldErrors.email}
                    onChange={() => clearError("email")}
                    autoFocus
                  />

                  {/* PHONE */}

                  {mode === "signup" ? (
                    <Field
                      id="phone"
                      name="phone"
                      type="tel"
                      label={copy.fields.phone}
                      optional
                      optionalLabel={copy.fields.optional}
                      autoComplete="tel"
                      inputMode="tel"
                      direction="ltr"
                      placeholder={copy.fields.phonePlaceholder}
                      error={fieldErrors.phone}
                      onChange={() => clearError("phone")}
                    />
                  ) : null}

                  {/* PASSWORD */}

                  <Field
                    id="password"
                    name="password"
                    type="password"
                    label={copy.fields.password}
                    meta={copy.fields.passwordMeta}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    direction="ltr"
                    error={fieldErrors.password}
                    onChange={() => clearError("password")}
                  />

                  {/* CONFIRM PASSWORD */}

                  {mode === "signup" ? (
                    <Field
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      label={copy.fields.confirmPassword}
                      autoComplete="new-password"
                      direction="ltr"
                      error={fieldErrors.confirmPassword}
                      onChange={() => clearError("confirmPassword")}
                    />
                  ) : null}

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="
                      group
                      mt-2

                      flex
                      min-h-14
                      w-full

                      items-center
                      justify-center
                      gap-3

                      border
                      border-[#b08a68]

                      bg-[#b08a68]

                      px-5

                      text-[14px]
                      font-semibold

                      text-[#15110e]

                      transition
                      duration-300

                      hover:border-[#d4b493]
                      hover:bg-[#d4b493]

                      focus-visible:outline-2
                      focus-visible:outline-offset-4
                      focus-visible:outline-[#d4b493]

                      disabled:cursor-wait
                      disabled:opacity-65
                    "
                  >
                    {submitting ? (
                      <LoaderCircle
                        aria-hidden="true"
                        size={18}
                        className="
                          animate-spin

                          motion-reduce:animate-none
                        "
                      />
                    ) : (
                      <LockKeyhole aria-hidden="true" size={17} />
                    )}

                    {submitting
                      ? copy.submit.checking
                      : mode === "login"
                        ? copy.modes.login.submit
                        : copy.modes.signup.submit}
                  </button>
                </form>
              )}

              {/* SECURITY NOTICE */}

              <div
                className="
                  mt-7

                  flex
                  items-start
                  gap-3

                  border-t
                  border-white/9

                  pt-5

                  text-start
                  text-[12px]

                  leading-6

                  text-white/60
                "
              >
                <ShieldCheck
                  aria-hidden="true"
                  size={17}
                  className="
                    mt-0.5
                    shrink-0
                    text-[#b08a68]
                  "
                />

                <p>{copy.session.secureNotice}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ==============================================================
            VISUAL PANEL
        =============================================================== */}

        <section
          className="
            relative
            order-1

            hidden
            min-h-dvh

            overflow-hidden

            bg-[#080808]

            lg:block
          "
          aria-label={copy.visual.ariaLabel}
        >
          <Image
            src={visualImage}
            alt={copy.visual.imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 0vw"
            className="
              object-cover
              object-center
              opacity-75
            "
          />

          <div
            aria-hidden="true"
            className="
              absolute
              inset-0

              bg-[linear-gradient(90deg,rgba(8,8,8,.1),rgba(8,8,8,.32)_58%,rgba(8,8,8,.9)),linear-gradient(0deg,rgba(8,8,8,.8),transparent_55%)]
            "
          />

          <div
            className="
              absolute
              inset-0

              flex
              flex-col
              justify-between

              p-10

              xl:p-14
            "
          >
            {/* TOP */}

            <div
              className="
                flex
                items-center
                justify-between
              "
            >
              <Link
                href={localizedHref("/", locale)}
                className="
                  text-[15px]
                  font-semibold

                  tracking-[0.2em]

                  text-white
                "
              >
                {copy.brand.name}
              </Link>

              <span
                className="
                  text-[11px]
                  text-white/70
                "
              >
                {copy.visual.accountLabel}
              </span>
            </div>

            {/* EDITORIAL COPY */}

            <div
              className="
                max-w-[620px]
                text-start
              "
            >
              <p
                className="
                  text-[11px]
                  font-medium

                  text-[#d2aa84]
                "
              >
                {copy.visual.eyebrow}
              </p>

              <h2
                className="
                  mt-5

                  text-[clamp(2.8rem,4.5vw,5.7rem)]
                  font-semibold

                  leading-[1.3]
                  tracking-[-0.045em]

                  text-white
                "
              >
                {copy.visual.titleLine1}

                <br />

                {copy.visual.titleLine2}
              </h2>

              <div
                className="
                  mt-8

                  flex
                  max-w-[520px]

                  flex-wrap

                  items-center
                  gap-5

                  border-t
                  border-white/20

                  pt-5

                  text-[11px]
                  text-white/75
                "
              >
                <span
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Check
                    aria-hidden="true"
                    size={14}
                    className="text-[#d2aa84]"
                  />

                  {copy.visual.customerAccount}
                </span>

                <span
                  className="
                    flex
                    items-center
                    gap-2
                  "
                >
                  <Check
                    aria-hidden="true"
                    size={14}
                    className="text-[#d2aa84]"
                  />

                  {copy.visual.adminAccess}
                </span>
              </div>
            </div>

            {/* RETURN */}

            <Link
              href={localizedHref("/", locale)}
              className="
                flex
                w-fit

                items-center
                gap-2

                text-[11px]
                text-white/72

                transition

                hover:text-white
              "
            >
              <BackIcon aria-hidden="true" size={14} />

              {copy.brand.backToShop}
            </Link>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @keyframes auth-rise {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}

/* ==========================================================================
   MODE BUTTON
============================================================================ */

function ModeButton({
  mode,
  selected,
  onClick,
  children,
}: {
  mode: AuthMode;

  selected: boolean;

  onClick: () => void;

  children: ReactNode;
}) {
  return (
    <button
      id={`auth-tab-${mode}`}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-controls="auth-mode-panel"
      tabIndex={selected ? 0 : -1}
      onClick={onClick}
      className={`
        min-h-11

        px-4

        text-[13px]
        font-semibold

        transition

        focus-visible:outline-2
        focus-visible:outline-offset-2
        focus-visible:outline-[#c29a76]

        ${
          selected
            ? "bg-[#c29a76] text-[#15110e]"
            : "text-white/65 hover:text-white"
        }
      `}
    >
      {children}
    </button>
  );
}

/* ==========================================================================
   FIELD
============================================================================ */

function Field({
  label,
  meta,
  optional = false,
  optionalLabel,
  error,
  direction,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;

  meta?: string;

  optional?: boolean;

  optionalLabel?: string;

  error?: string;

  direction: "ltr" | "rtl";
}) {
  const describedBy = error && props.id ? `${props.id}-error` : undefined;

  return (
    <div>
      <div
        className="
          mb-2

          flex
          items-center
          justify-between
          gap-3
        "
      >
        <label
          htmlFor={props.id}
          className="
            text-[12px]
            font-medium

            text-white/80
          "
        >
          {label}
        </label>

        {optional || meta ? (
          <span
            className="
              text-[11px]
              text-white/55
            "
          >
            {optional ? optionalLabel : meta}
          </span>
        ) : null}
      </div>

      <input
        {...props}
        dir={direction}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        className={`
          min-h-13
          w-full

          border

          bg-white/[0.025]

          px-4

          text-[14px]
          text-white

          outline-none

          transition

          placeholder:text-white/35

          focus:border-[#b08a68]
          focus:bg-white/[0.04]

          ${error ? "border-[#b76159]" : "border-white/13"}
        `}
      />

      {error ? (
        <p
          id={describedBy}
          role="alert"
          className="
            mt-1.5

            text-[12px]
            text-[#eca9a2]
          "
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
