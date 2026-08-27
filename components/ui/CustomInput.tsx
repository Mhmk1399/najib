"use client";

import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

import { lightTokens } from "@/theme/theme-colors";

/* ==========================================================================
   TYPES
============================================================================ */

export type CustomInputType =
  | "text"
  | "password"
  | "email"
  | "number"
  | "tel"
  | "url"
  | "search";

export type CustomInputSize = "sm" | "md" | "lg";

export type CustomInputTone = "light" | "dark";

export type CustomInputStatus =
  | "default"
  | "success"
  | "error"
  | "warning"
  | "info";

export type CustomInputValueMode =
  | "any"
  | "letters"
  | "numbers"
  | "alphanumeric"
  | "decimal";

export type CustomInputValidateOn = "change" | "blur";

export type CustomInputValidationRules = {
  required?: boolean;

  minLength?: number;

  maxLength?: number;

  min?: number;

  max?: number;

  pattern?: RegExp;

  patternMessage?: string;

  validate?: (value: string) => string | null;
};

export type CustomInputValidationResult = {
  valid: boolean;

  error: string | null;
};

export type CustomInputHandle = {
  focus: () => void;

  blur: () => void;

  clear: () => void;

  validate: () => CustomInputValidationResult;

  element: HTMLInputElement | null;
};

export type CustomInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size" | "type" | "value" | "defaultValue" | "onChange" | "prefix"
> & {
  /* ------------------------------------------------------------------------
     CORE
  ------------------------------------------------------------------------- */

  value?: string | number;

  defaultValue?: string | number;

  onChange?: (value: string, valid: boolean) => void;

  type?: CustomInputType;

  valueMode?: CustomInputValueMode;

  /* ------------------------------------------------------------------------
     CONTENT
  ------------------------------------------------------------------------- */

  label?: string;

  placeholder?: string;

  helperText?: string;

  error?: string;

  success?: string;

  info?: string;

  warning?: string;

  /* ------------------------------------------------------------------------
     DECORATION
  ------------------------------------------------------------------------- */

  leadingIcon?: ReactNode;

  prefixText?: string;

  suffixText?: string;

  clearable?: boolean;

  /* ------------------------------------------------------------------------
     STATE
  ------------------------------------------------------------------------- */

  loading?: boolean;

  required?: boolean;

  disabled?: boolean;

  readOnly?: boolean;

  /* ------------------------------------------------------------------------
     VALIDATION
  ------------------------------------------------------------------------- */

  rules?: CustomInputValidationRules;

  validateOn?: CustomInputValidateOn;

  onValidationChange?: (result: CustomInputValidationResult) => void;

  /* ------------------------------------------------------------------------
     UX
  ------------------------------------------------------------------------- */

  showCounter?: boolean;

  selectOnFocus?: boolean;

  /* ------------------------------------------------------------------------
     STYLE
  ------------------------------------------------------------------------- */

  inputSize?: CustomInputSize;

  tone?: CustomInputTone;

  fullWidth?: boolean;

  className?: string;

  inputClassName?: string;
};

/* ==========================================================================
   CLASSES
============================================================================ */

const SIZE_CLASSES: Record<CustomInputSize, string> = {
  sm: `
    min-h-11
    px-3
  `,

  md: `
    min-h-12
    px-4
  `,

  lg: `
    min-h-14
    px-5
  `,
};

/* ==========================================================================
   HELPERS
============================================================================ */

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/* ==========================================================================
   SANITIZE VALUE
============================================================================ */

function sanitizeValue(value: string, mode: CustomInputValueMode) {
  switch (mode) {
    case "letters":
      /*
       * English + Persian letters + spaces
       */
      return value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, "");

    case "numbers":
      return value.replace(/[^0-9]/g, "");

    case "alphanumeric":
      return value.replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, "");

    case "decimal": {
      let next = value.replace(/[^0-9.]/g, "");

      const parts = next.split(".");

      if (parts.length > 2) {
        next = `${parts.shift()}.${parts.join("")}`;
      }

      return next;
    }

    default:
      return value;
  }
}

/* ==========================================================================
   VALIDATION
============================================================================ */

function validateValue(
  value: string,
  type: CustomInputType,
  rules?: CustomInputValidationRules,
): CustomInputValidationResult {
  const trimmed = value.trim();

  /* ------------------------------------------------------------------------
     REQUIRED
  ------------------------------------------------------------------------- */

  if (rules?.required && !trimmed) {
    return {
      valid: false,
      error: "This field is required.",
    };
  }

  /*
   * اگر خالی باشد و required نباشد
   * validation دیگری لازم نیست.
   */
  if (!trimmed) {
    return {
      valid: true,
      error: null,
    };
  }

  /* ------------------------------------------------------------------------
     EMAIL
  ------------------------------------------------------------------------- */

  if (type === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) {
      return {
        valid: false,
        error: "Please enter a valid email address.",
      };
    }
  }

  /* ------------------------------------------------------------------------
     URL
  ------------------------------------------------------------------------- */

  if (type === "url") {
    try {
      new URL(trimmed);
    } catch {
      return {
        valid: false,
        error: "Please enter a valid URL.",
      };
    }
  }

  /* ------------------------------------------------------------------------
     MIN LENGTH
  ------------------------------------------------------------------------- */

  if (rules?.minLength !== undefined && value.length < rules.minLength) {
    return {
      valid: false,

      error: `Minimum ${rules.minLength} characters required.`,
    };
  }

  /* ------------------------------------------------------------------------
     MAX LENGTH
  ------------------------------------------------------------------------- */

  if (rules?.maxLength !== undefined && value.length > rules.maxLength) {
    return {
      valid: false,

      error: `Maximum ${rules.maxLength} characters allowed.`,
    };
  }

  /* ------------------------------------------------------------------------
     NUMBER MIN / MAX
  ------------------------------------------------------------------------- */

  if (type === "number" || /^[0-9.]+$/.test(value)) {
    const number = Number(value);

    if (rules?.min !== undefined && number < rules.min) {
      return {
        valid: false,

        error: `Minimum value is ${rules.min}.`,
      };
    }

    if (rules?.max !== undefined && number > rules.max) {
      return {
        valid: false,

        error: `Maximum value is ${rules.max}.`,
      };
    }
  }

  /* ------------------------------------------------------------------------
     PATTERN
  ------------------------------------------------------------------------- */

  if (rules?.pattern && !rules.pattern.test(value)) {
    return {
      valid: false,

      error: rules.patternMessage ?? "The entered value is invalid.",
    };
  }

  /* ------------------------------------------------------------------------
     CUSTOM
  ------------------------------------------------------------------------- */

  if (rules?.validate) {
    const customError = rules.validate(value);

    if (customError) {
      return {
        valid: false,

        error: customError,
      };
    }
  }

  return {
    valid: true,
    error: null,
  };
}

/* ==========================================================================
   COMPONENT
============================================================================ */

export const CustomInput = forwardRef<CustomInputHandle, CustomInputProps>(
  function CustomInput(
    {
      id,

      name,

      value,

      defaultValue,

      onChange,

      type = "text",

      valueMode = "any",

      label,

      placeholder,

      helperText,

      error,

      success,

      info,

      warning,

      leadingIcon,

      prefixText,

      suffixText,

      clearable = false,

      loading = false,

      required = false,

      disabled = false,

      readOnly = false,

      rules,

      validateOn = "blur",

      onValidationChange,

      showCounter = false,

      selectOnFocus = false,

      inputSize = "md",

      tone = "light",

      fullWidth = true,

      className = "",

      inputClassName = "",

      autoComplete,

      inputMode,

      maxLength,

      min,

      max,

      step,

      onBlur,

      onFocus,

      ...inputProps
    },

    forwardedRef,
  ) {
    const generatedId = useId();

    const inputId = id ?? `input-${generatedId}`;

    const internalRef = useRef<HTMLInputElement>(null);

    const controlled = value !== undefined;

    const [internalValue, setInternalValue] = useState(
      defaultValue !== undefined ? String(defaultValue) : "",
    );

    const currentValue = controlled ? String(value ?? "") : internalValue;

    const [passwordVisible, setPasswordVisible] = useState(false);

    const [touched, setTouched] = useState(false);

    const [internalError, setInternalError] = useState<string | null>(null);

    /* ----------------------------------------------------------------------
       RULES MERGE
    ----------------------------------------------------------------------- */

    const mergedRules = useMemo<CustomInputValidationRules>(
      () => ({
        ...rules,

        required: rules?.required ?? required,

        maxLength: rules?.maxLength ?? maxLength,

        min: rules?.min ?? (typeof min === "number" ? min : undefined),

        max: rules?.max ?? (typeof max === "number" ? max : undefined),
      }),
      [rules, required, maxLength, min, max],
    );

    /* ----------------------------------------------------------------------
       CURRENT VALIDATION
    ----------------------------------------------------------------------- */

    const validation = validateValue(currentValue, type, mergedRules);

    /* ----------------------------------------------------------------------
       STATUS
    ----------------------------------------------------------------------- */

    const actualError = error ?? (touched ? internalError : null);

    const status: CustomInputStatus = actualError
      ? "error"
      : success
        ? "success"
        : warning
          ? "warning"
          : info
            ? "info"
            : "default";

    const statusText = actualError ?? success ?? warning ?? info ?? helperText;

    /* ----------------------------------------------------------------------
       THEME
    ----------------------------------------------------------------------- */

    const themeVars =
      tone === "light"
        ? ({
            "--input-bg": "#FFFFFF",

            "--input-text": "#0B0B0B",

            "--input-muted": lightTokens.textMuted,

            "--input-border": "#DCDCDC",

            "--input-focus": "#0B0B0B",

            "--input-disabled": "#F5F5F5",

            "--input-error": "#B9382F",

            "--input-success": "#257447",

            "--input-warning": "#A17218",

            "--input-info": "#2D6F9F",
          } as React.CSSProperties)
        : ({
            "--input-bg": "#0B0B0B",

            "--input-text": "#FFFFFF",

            "--input-muted": "#969696",

            "--input-border": "#333333",

            "--input-focus": "#FFFFFF",

            "--input-disabled": "#141414",

            "--input-error": "#E76860",

            "--input-success": "#72B889",

            "--input-warning": "#D9A94B",

            "--input-info": "#79AED2",
          } as React.CSSProperties);

    /* ----------------------------------------------------------------------
       RESOLVED TYPE
    ----------------------------------------------------------------------- */

    const resolvedType =
      type === "password" ? (passwordVisible ? "text" : "password") : type;

    /* ----------------------------------------------------------------------
       INPUT MODE

       موبایل کیبورد مناسب باز می‌کند.
    ----------------------------------------------------------------------- */

    const resolvedInputMode =
      inputMode ??
      (() => {
        if (valueMode === "numbers") {
          return "numeric";
        }

        if (valueMode === "decimal") {
          return "decimal";
        }

        if (type === "email") {
          return "email";
        }

        if (type === "tel") {
          return "tel";
        }

        if (type === "url") {
          return "url";
        }

        if (type === "search") {
          return "search";
        }

        return "text";
      })();

    /* ----------------------------------------------------------------------
       VALIDATE
    ----------------------------------------------------------------------- */

    function runValidation(inputValue = currentValue) {
      const result = validateValue(inputValue, type, mergedRules);

      setInternalError(result.error);

      onValidationChange?.(result);

      return result;
    }

    /* ----------------------------------------------------------------------
       HANDLE VALUE
    ----------------------------------------------------------------------- */

    function handleChange(rawValue: string) {
      let nextValue = sanitizeValue(rawValue, valueMode);

      /*
       * maxLength را علاوه بر native
       * خودمان هم enforce می‌کنیم.
       */
      const maximumLength = mergedRules.maxLength;

      if (maximumLength !== undefined) {
        nextValue = nextValue.slice(0, maximumLength);
      }

      if (!controlled) {
        setInternalValue(nextValue);
      }

      let result = validateValue(nextValue, type, mergedRules);

      if (validateOn === "change") {
        setTouched(true);

        setInternalError(result.error);

        onValidationChange?.(result);
      }

      onChange?.(nextValue, result.valid);
    }

    /* ----------------------------------------------------------------------
       CLEAR
    ----------------------------------------------------------------------- */

    function clear() {
      if (disabled || readOnly) {
        return;
      }

      if (!controlled) {
        setInternalValue("");
      }

      setInternalError(null);

      setTouched(false);

      onChange?.("", !mergedRules.required);

      requestAnimationFrame(() => {
        internalRef.current?.focus();
      });
    }

    /* ----------------------------------------------------------------------
       REF
    ----------------------------------------------------------------------- */

    useImperativeHandle(forwardedRef, () => ({
      focus() {
        internalRef.current?.focus();
      },

      blur() {
        internalRef.current?.blur();
      },

      clear,

      validate() {
        setTouched(true);

        return runValidation();
      },

      element: internalRef.current,
    }));

    /* ----------------------------------------------------------------------
       STATUS BORDER
    ----------------------------------------------------------------------- */

    const borderClass =
      status === "error"
        ? `
          border-[var(--input-error)]
        `
        : status === "success"
          ? `
            border-[var(--input-success)]
          `
          : status === "warning"
            ? `
              border-[var(--input-warning)]
            `
            : status === "info"
              ? `
                border-[var(--input-info)]
              `
              : `
                border-[var(--input-border)]

                focus-within:border-[var(--input-focus)]
              `;

    /* ======================================================================
       RENDER
    ======================================================================= */

    return (
      <div
        style={themeVars}
        className={cx(
          fullWidth ? "w-full" : "w-fit",

          className,
        )}
      >
        {/* ===============================================================
            LABEL
        ================================================================ */}

        {label && (
          <label
            htmlFor={inputId}
            className="
              mb-2

              flex

              items-center
              gap-1.5

              text-[8px]
              font-semibold

              uppercase
              tracking-[0.15em]

              text-[var(--input-text)]
            "
          >
            {label}

            {required && (
              <span
                className="
                  text-[var(--input-error)]
                "
              >
                *
              </span>
            )}
          </label>
        )}

        {/* ===============================================================
            INPUT WRAPPER
        ================================================================ */}

        <div
          className={cx(
            `
              relative

              flex

              items-center

              gap-3

              border

              bg-[var(--input-bg)]

              transition-[border-color,background-color,opacity]
              duration-200
            `,

            SIZE_CLASSES[inputSize],

            borderClass,

            disabled &&
              `
                cursor-not-allowed

                bg-[var(--input-disabled)]

                opacity-55
              `,
          )}
        >
          {/* =============================================================
              LEADING ICON
          ============================================================== */}

          {leadingIcon && (
            <span
              className="
                grid
                size-5

                shrink-0
                place-items-center

                text-[var(--input-muted)]
              "
            >
              {leadingIcon}
            </span>
          )}

          {/* =============================================================
              PREFIX
          ============================================================== */}

          {prefixText && (
            <span
              className="
                shrink-0

                text-[16px]

                text-[var(--input-muted)]
              "
            >
              {prefixText}
            </span>
          )}

          {/* =============================================================
              INPUT

              text-[16px] عمداً اینجاست.
              iOS با font-size کمتر از 16px
              هنگام focus صفحه را zoom می‌کند.
          ============================================================== */}

          <input
            {...inputProps}
            ref={internalRef}
            id={inputId}
            name={name}
            type={resolvedType}
            value={currentValue}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            autoComplete={autoComplete}
            inputMode={resolvedInputMode}
            maxLength={mergedRules.maxLength}
            min={min}
            max={max}
            step={step}
            aria-invalid={status === "error"}
            onChange={(event) => handleChange(event.target.value)}
            onFocus={(event) => {
              if (selectOnFocus) {
                event.currentTarget.select();
              }

              onFocus?.(event);
            }}
            onBlur={(event) => {
              setTouched(true);

              if (validateOn === "blur") {
                runValidation(event.currentTarget.value);
              }

              onBlur?.(event);
            }}
            className={cx(
              `
                min-w-0

                flex-1

                border-0

                bg-transparent

                p-0

                text-[16px]

                leading-none

                text-[var(--input-text)]

                outline-none

                placeholder:text-[var(--input-muted)]
                placeholder:opacity-55

                disabled:cursor-not-allowed

                /*
                 * Number spinner removal
                 */
                [appearance:textfield]

                [&::-webkit-inner-spin-button]:appearance-none
                [&::-webkit-outer-spin-button]:appearance-none
              `,

              inputClassName,
            )}
          />

          {/* =============================================================
              LOADING
          ============================================================== */}

          {loading && (
            <span
              className="
                shrink-0

                text-[var(--input-muted)]
              "
            >
              <LoadingIcon />
            </span>
          )}

          {/* =============================================================
              CLEAR
          ============================================================== */}

          {clearable && currentValue && !disabled && !readOnly && !loading && (
            <button
              type="button"
              aria-label="Clear input"
              onClick={clear}
              className="
                  grid
                  size-8

                  shrink-0
                  place-items-center

                  text-[var(--input-muted)]

                  transition-colors

                  hover:text-[var(--input-text)]

                  focus-visible:outline-none
                  focus-visible:ring-1
                  focus-visible:ring-[var(--input-focus)]
                "
            >
              <CloseIcon />
            </button>
          )}

          {/* =============================================================
              PASSWORD EYE
          ============================================================== */}

          {type === "password" && !loading && (
            <button
              type="button"
              aria-label={passwordVisible ? "Hide password" : "Show password"}
              aria-pressed={passwordVisible}
              onClick={() => setPasswordVisible((current) => !current)}
              className="
                  grid
                  size-8

                  shrink-0
                  place-items-center

                  text-[var(--input-muted)]

                  transition-colors

                  hover:text-[var(--input-text)]

                  focus-visible:outline-none
                  focus-visible:ring-1
                  focus-visible:ring-[var(--input-focus)]
                "
            >
              {passwordVisible ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}

          {/* =============================================================
              SUFFIX
          ============================================================== */}

          {suffixText && (
            <span
              className="
                shrink-0

                text-[16px]

                text-[var(--input-muted)]
              "
            >
              {suffixText}
            </span>
          )}
        </div>

        {/* ===============================================================
            BOTTOM INFO
        ================================================================ */}

        {(statusText || showCounter) && (
          <div
            className="
              mt-2

              flex

              items-start
              justify-between

              gap-4
            "
          >
            {/* STATUS */}

            <div
              className="
                min-w-0
                flex-1
              "
            >
              {statusText && (
                <p
                  className={cx(
                    `
                      flex
                      items-center

                      gap-1.5

                      text-[8px]

                      leading-[1.5]
                    `,

                    status === "error"
                      ? `
                        text-[var(--input-error)]
                      `
                      : status === "success"
                        ? `
                          text-[var(--input-success)]
                        `
                        : status === "warning"
                          ? `
                            text-[var(--input-warning)]
                          `
                          : status === "info"
                            ? `
                              text-[var(--input-info)]
                            `
                            : `
                              text-[var(--input-muted)]
                            `,
                  )}
                >
                  {status !== "default" && <StatusIcon status={status} />}

                  {statusText}
                </p>
              )}
            </div>

            {/* COUNTER */}

            {showCounter && mergedRules.maxLength && (
              <span
                className={cx(
                  `
                      shrink-0

                      text-[7px]
                      font-medium

                      tabular-nums
                    `,

                  currentValue.length >= mergedRules.maxLength
                    ? `
                        text-[var(--input-error)]
                      `
                    : `
                        text-[var(--input-muted)]
                      `,
                )}
              >
                {currentValue.length}/{mergedRules.maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);

CustomInput.displayName = "CustomInput";

/* ==========================================================================
   STATUS ICON
============================================================================ */

function StatusIcon({ status }: { status: CustomInputStatus }) {
  if (status === "success") {
    return (
      <svg
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        className="size-3"
      >
        <path d="M2 7L5.2 10L12 3" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }

  if (status === "error") {
    return (
      <svg
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        className="size-3"
      >
        <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }

  if (status === "warning") {
    return (
      <svg
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
        className="size-3"
      >
        <path d="M7 1.5L13 12H1L7 1.5Z" stroke="currentColor" strokeWidth="1" />

        <path d="M7 5V8" stroke="currentColor" strokeWidth="1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" className="size-3">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1" />

      <path d="M7 6V10M7 4H7.01" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/* ==========================================================================
   EYE
============================================================================ */

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="size-[18px]"
    >
      <path
        d="M2 10C4.1 6.6 6.8 5 10 5C13.2 5 15.9 6.6 18 10C15.9 13.4 13.2 15 10 15C6.8 15 4.1 13.4 2 10Z"
        stroke="currentColor"
        strokeWidth="1"
      />

      <circle cx="10" cy="10" r="2.4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="size-[18px]"
    >
      <path
        d="M2 10C4.1 6.6 6.8 5 10 5C13.2 5 15.9 6.6 18 10C16.8 11.9 15.4 13.2 13.8 14"
        stroke="currentColor"
        strokeWidth="1"
      />

      <path d="M3 3L17 17" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/* ==========================================================================
   CLOSE
============================================================================ */

function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3">
      <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/* ==========================================================================
   LOADING
============================================================================ */

function LoadingIcon() {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className="
        size-4

        animate-spin

        motion-reduce:animate-none
      "
    >
      <path d="M9 2A7 7 0 1 1 4 4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
