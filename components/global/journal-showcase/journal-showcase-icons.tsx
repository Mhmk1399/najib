/**
 * journal-showcase-icons.tsx
 *
 * Lightweight custom SVG arrow icon for the journal section.
 * No third-party icon dependency.
 * Uses currentColor — inherits text color from parent element.
 */

import React from "react";

interface ArrowIconProps {
  className?: string;
  size?: number;
  direction?: "ltr" | "rtl";
}

/**
 * Directional arrow for CTA links and article hover indicators.
 * aria-hidden="true" — accessible name lives on the wrapping link.
 */
export function ArrowIcon({
  className = "",
  size = 18,
  direction = "ltr",
}: ArrowIconProps): React.JSX.Element {
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
      {direction === "rtl" ? (
        // RTL: ← (natural forward direction for Persian)
        <>
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </>
      ) : (
        // LTR: →
        <>
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </>
      )}
    </svg>
  );
}
