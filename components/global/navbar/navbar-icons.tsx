// ─────────────────────────────────────────────────────────────────────────────
// Atelier Gate Navbar — Custom SVG Icons
// No icon library dependency. All icons use currentColor.
// Consistent 24×24 viewport, stroke-width ~1.5
// ─────────────────────────────────────────────────────────────────────────────

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  title?: string;
};

function createIcon(
  paths: React.ReactNode,
  defaultTitle?: string,
): React.FC<IconProps> {
  return function Icon({
    size = 24,
    className,
    title,
    "aria-hidden": ariaHidden,
    ...rest
  }: IconProps) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden={ariaHidden ?? (title ? undefined : true)}
        role={title ? "img" : undefined}
        className={className}
        {...rest}
      >
        {title && <title>{title}</title>}
        {defaultTitle && !title && <title>{defaultTitle}</title>}
        {paths}
      </svg>
    );
  };
}

// ── Menu (Hamburger) ──────────────────────────────────────────────────────────
export const MenuIcon = createIcon(
  <>
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="14" y2="17" />
  </>,
);

// ── Close (X) ─────────────────────────────────────────────────────────────────
export const CloseIcon = createIcon(
  <>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </>,
);

// ── Shopping Bag ──────────────────────────────────────────────────────────────
export const BagIcon = createIcon(
  <>
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </>,
);

// ── Account (Person) ──────────────────────────────────────────────────────────
export const AccountIcon = createIcon(
  <>
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>,
);

// ── Sun (Light Mode) ──────────────────────────────────────────────────────────
export const SunIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </>,
);

// ── Moon (Dark Mode) ──────────────────────────────────────────────────────────
export const MoonIcon = createIcon(
  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />,
);

// ── System (Monitor) ─────────────────────────────────────────────────────────
export const SystemIcon = createIcon(
  <>
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </>,
);

// ── Chevron (Down) ───────────────────────────────────────────────────────────
export const ChevronIcon = createIcon(<polyline points="6 9 12 15 18 9" />);

// ── Arrow (Directional CTA) ───────────────────────────────────────────────────
// RTL-aware: points left (toward start) in RTL contexts
// The consuming component applies rtl:rotate-180 when needed
export const ArrowIcon = createIcon(
  <>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </>,
);

// ── Back (Return navigation) ──────────────────────────────────────────────────
// Points right — correct for RTL "back" (going back toward end direction)
export const BackIcon = createIcon(
  <>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </>,
);
