// ─────────────────────────────────────────────────────────────────────────────
// Tailored Aperture — Custom SVG Icons
// No icon library. All icons use currentColor.
// ─────────────────────────────────────────────────────────────────────────────

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  title?: string;
};

function createIcon(paths: React.ReactNode): React.FC<IconProps> {
  return function Icon({
    size = 24,
    className,
    "aria-hidden": ariaHidden,
    title,
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
        {paths}
      </svg>
    );
  };
}

// ── Previous (RTL: points toward the end = right) ────────────────────────────
// In RTL layout, "previous" is visually on the left,
// so the arrow points right (toward the visual start of reading)
export const PreviousIcon = createIcon(<polyline points="15 18 9 12 15 6" />);

// ── Next (RTL: points toward the start = left) ───────────────────────────────
export const NextIcon = createIcon(<polyline points="9 18 15 12 9 6" />);

// ── Pause ────────────────────────────────────────────────────────────────────
export const PauseIcon = createIcon(
  <>
    <line x1="10" y1="6" x2="10" y2="18" />
    <line x1="14" y1="6" x2="14" y2="18" />
  </>,
);

// ── Play ─────────────────────────────────────────────────────────────────────
export const PlayIcon = createIcon(<polygon points="5 3 19 12 5 21 5 3" />);

// ── Arrow (CTA — RTL aware) ───────────────────────────────────────────────────
// Used in CTAs. In RTL, component uses rtl:rotate-180
export const ArrowIcon = createIcon(
  <>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </>,
);

// ── Down (Next section cue) ───────────────────────────────────────────────────
export const DownIcon = createIcon(
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </>,
);
