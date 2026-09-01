"use client";

import Link from "next/link";

import {
  type ButtonHTMLAttributes,
  type CSSProperties,
  type MouseEventHandler,
  type ReactNode,
} from "react";

import {
  brandColors,
  darkTokens,
  lightTokens,
  themeClasses,
} from "@/theme/theme-colors";

/* ==========================================================================
   TYPES
============================================================================ */

export type ButtonVariant = "black" | "cream" | "copper" | "outline";

export type ButtonSize = "sm" | "md" | "lg" | "xl";

export type ButtonIconPosition = "left" | "right";

export type ButtonAlign = "left" | "center" | "between";

type CommonButtonProps = {
  children?: ReactNode;

  /**
   * Visual style.
   *
   * black   → black background
   * cream   → cream background
   * copper  → copper background
   * outline → transparent with border
   */
  variant?: ButtonVariant;

  /**
   * Controls height, font and horizontal padding.
   */
  size?: ButtonSize;

  /**
   * Optional icon.
   *
   * Example:
   * icon={<ArrowRight />}
   */
  icon?: ReactNode;

  iconPosition?: ButtonIconPosition;

  /**
   * Icon only button.
   *
   * Make sure aria-label is provided.
   */
  iconOnly?: boolean;

  /**
   * Makes button fill parent width.
   */
  fullWidth?: boolean;

  /**
   * Shows spinner and prevents interaction.
   */
  loading?: boolean;

  disabled?: boolean;

  /**
   * Optional active/selected state.
   */
  active?: boolean;

  /**
   * Default: true
   */
  uppercase?: boolean;

  align?: ButtonAlign;

  className?: string;

  "aria-label"?: string;
};

/* ==========================================================================
   LINK / BUTTON PROPS
============================================================================ */

type ButtonAsButtonProps = CommonButtonProps & {
  href?: undefined;

  type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];

  onClick?: MouseEventHandler<HTMLButtonElement>;

  name?: string;

  value?: string;

  form?: string;
};

type ButtonAsLinkProps = CommonButtonProps & {
  href: string;

  target?: "_blank" | "_self";

  rel?: string;

  prefetch?: boolean;

  onClick?: MouseEventHandler<HTMLAnchorElement>;
};

export type ButtonProps = ButtonAsButtonProps | ButtonAsLinkProps;

/* ==========================================================================
   STATIC TAILWIND MAPS

   Important:
   Tailwind classes are fully static.
============================================================================ */

const variantClasses: Record<ButtonVariant, string> = {
  black: `
    border-[var(--button-black)]
    bg-[var(--button-black)]
    text-[var(--button-cream)]

    hover:border-[var(--button-copper)]
    hover:bg-[var(--button-copper)]
    hover:text-[var(--button-cream)]
  `,

  cream: `
    border-[var(--button-cream)]
    bg-[var(--button-cream)]
    text-[var(--button-black)]

    hover:border-[var(--button-black)]
    hover:bg-[var(--button-black)]
    hover:text-[var(--button-cream)]
  `,

  copper: `
    border-[var(--button-copper)]
    bg-[var(--button-copper)]
    text-[var(--button-cream)]

    hover:border-[var(--button-black)]
    hover:bg-[var(--button-black)]
    hover:text-[var(--button-cream)]
  `,

  outline: `
    border-[rgb(var(--button-black-rgb)/0.35)]
    bg-transparent
    text-[var(--button-black)]

    hover:border-[var(--button-black)]
    hover:bg-[var(--button-black)]
    hover:text-[var(--button-cream)]
  `,
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: `
    min-h-9
    px-3.5

    text-[7px]

    gap-2
  `,

  md: `
    min-h-11
    px-4.5

    text-[8px]

    gap-2.5
  `,

  lg: `
    min-h-12
    px-5

    text-[9px]

    gap-3
  `,

  xl: `
    min-h-14
    px-6

    text-[10px]

    gap-3.5
  `,
};

const iconOnlySizeClasses: Record<ButtonSize, string> = {
  sm: "size-9 p-0",

  md: "size-11 p-0",

  lg: "size-12 p-0",

  xl: "size-14 p-0",
};

const alignClasses: Record<ButtonAlign, string> = {
  left: "justify-start",

  center: "justify-center",

  between: "justify-between",
};

/* ==========================================================================
   COMPONENT
============================================================================ */

export function Button({
  children,

  variant = "black",

  size = "md",

  icon,

  iconPosition = "right",

  iconOnly = false,

  fullWidth = false,

  loading = false,

  disabled = false,

  active = false,

  uppercase = true,

  align = iconOnly ? "center" : "between",

  className = "",

  "aria-label": ariaLabel,

  ...props
}: ButtonProps) {
  const themeVars = {
    "--button-black": brandColors.black.hex,

    "--button-black-rgb": brandColors.black.rgb,

    "--button-cream": brandColors.cream.hex,

    "--button-cream-rgb": brandColors.cream.rgb,

    "--button-copper": brandColors.copper.hex,

    "--button-white": brandColors.white.hex,

    "--button-muted": lightTokens.textMuted,

    "--button-dark": darkTokens.canvas,
  } as CSSProperties;

  const isDisabled = disabled || loading;

  const classes = `
    group
    relative

    inline-flex
    shrink-0
    select-none

    items-center

    overflow-hidden

    border

    rounded-none

    font-semibold

    tracking-[0.12em]

    outline-none

    transition-[background-color,border-color,color,opacity]
    duration-200
    ease-out

    ${uppercase ? "uppercase" : ""}

    ${fullWidth ? "w-full" : "w-auto"}

    ${iconOnly ? iconOnlySizeClasses[size] : sizeClasses[size]}

    ${alignClasses[align]}

    ${variantClasses[variant]}

    ${active ? "ring-1 ring-inset ring-[var(--button-copper)]" : ""}

    ${
      isDisabled
        ? `
          pointer-events-none
          cursor-not-allowed
          opacity-40
        `
        : `
          cursor-pointer
        `
    }

    ${themeClasses.focusRing}

    ${className}
  `;

  const content = (
    <>
      {/* ===============================================================
          LEFT ICON
      ================================================================ */}

      {!loading && icon && (iconPosition === "left" || iconOnly) && (
        <ButtonIcon>{icon}</ButtonIcon>
      )}

      {/* ===============================================================
          LOADER
      ================================================================ */}

      {loading && (
        <span
          className="
            size-3.5
            shrink-0

            animate-spin

            border
            border-current/30
            border-t-current
          "
          aria-hidden="true"
        />
      )}

      {/* ===============================================================
          LABEL
      ================================================================ */}

      {!iconOnly && (
        <span
          className="
            min-w-0

            leading-none
          "
        >
          {children}
        </span>
      )}

      {/* ===============================================================
          RIGHT ICON
      ================================================================ */}

      {!loading && icon && iconPosition === "right" && !iconOnly && (
        <ButtonIcon>{icon}</ButtonIcon>
      )}
    </>
  );

  /* ==========================================================================
     LINK
  ========================================================================== */

  if ("href" in props && props.href) {
    const { href, target, rel, prefetch, onClick } = props;

    const safeRel = target === "_blank" ? (rel ?? "noopener noreferrer") : rel;

    return (
      <Link
        href={href}
        target={target}
        rel={safeRel}
        prefetch={prefetch}
        onClick={isDisabled ? (event) => event.preventDefault() : onClick}
        aria-label={ariaLabel}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        tabIndex={isDisabled ? -1 : undefined}
        style={themeVars}
        className={classes}
      >
        {content}
      </Link>
    );
  }

  /* ==========================================================================
     BUTTON
  ========================================================================== */

  const {
    type = "button",
    onClick,
    name,
    value,
    form,
  } = props as ButtonAsButtonProps;

  return (
    <button
      type={type}
      name={name}
      value={value}
      form={form}
      disabled={isDisabled}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      style={themeVars}
      className={classes}
    >
      {content}
    </button>
  );
}

/* ==========================================================================
   ICON WRAPPER
============================================================================ */

function ButtonIcon({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="
        grid
        size-4

        shrink-0
        place-items-center

        [&>svg]:size-full
        [&>svg]:stroke-[1.25]
      "
    >
      {children}
    </span>
  );
}

/* ==========================================================================
   OPTIONAL DEFAULT ICONS
============================================================================ */

export function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 8H13M9.5 4.5L13 8L9.5 11.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.5 8H3M6.5 4.5L3 8L6.5 11.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3V13M3 8H13" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeLinecap="round"
      />
    </svg>
  );
}
