/**
 * faq-icons.tsx
 *
 * Lightweight custom SVG icons for the FAQ section.
 * No third-party icon dependency.
 * All icons use currentColor.
 */

import React from "react";

interface IconProps {
  className?: string;
  size?: number;
}

function Icon({
  children,
  className = "",
  size = 20,
}: IconProps & { children: React.ReactNode }): React.JSX.Element {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Plus — shown when a FAQ item is closed */
export function PlusIcon({ className, size }: IconProps): React.JSX.Element {
  return (
    <Icon className={className} size={size}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </Icon>
  );
}

/** Minus — shown when a FAQ item is open */
export function MinusIcon({ className, size }: IconProps): React.JSX.Element {
  return (
    <Icon className={className} size={size}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </Icon>
  );
}

/** Directional arrow for the section CTA */
export function ArrowIcon({
  className,
  size,
  direction = "ltr",
}: IconProps & { direction?: "ltr" | "rtl" }): React.JSX.Element {
  return (
    <Icon className={className} size={size}>
      {direction === "rtl" ? (
        <>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </>
      ) : (
        <>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </>
      )}
    </Icon>
  );
}
