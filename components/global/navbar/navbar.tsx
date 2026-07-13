// ─────────────────────────────────────────────────────────────────────────────
// Atelier Gate Navbar — Server Component (Root)
//
// This file MUST remain a Server Component.
//
// Responsibilities:
// - Receive navigation data as props or fetch server-side
// - Normalize category data before passing to client
// - Forward only serializable props to NavbarClient
// - Render useful HTML during SSR immediately
//
// MUST NOT contain:
// - "use client"
// - useEffect / useState
// - usePathname / useTheme
// - GSAP imports
// - localStorage access
// - Authentication checks
// - if (!isMounted) return null
// ─────────────────────────────────────────────────────────────────────────────

import type {
  NavbarProps,
  NavbarClientProps,
  NavbarCategory,
  NormalizedNavbarCategory,
} from "./navbar.types";
import { NavbarClient } from "./navbar-client";

// ── Normalization ─────────────────────────────────────────────────────────────
// Ensures category data is safe and serializable before crossing
// the server → client boundary.

function normalizeCategory(raw: NavbarCategory): NormalizedNavbarCategory {
  return {
    id: String(raw.id),
    label: String(raw.label),
    href: String(raw.href),
    eyebrow: raw.eyebrow ? String(raw.eyebrow) : undefined,
    description: raw.description ? String(raw.description) : undefined,
    image: {
      src: String(raw.image.src),
      width: Number(raw.image.width),
      height: Number(raw.image.height),
      alt: String(raw.image.alt),
    },
    groups: (raw.groups ?? []).map((group) => ({
      id: String(group.id),
      title: String(group.title),
      links: (group.links ?? []).map((link) => ({
        id: String(link.id),
        label: String(link.label),
        href: String(link.href),
      })),
    })),
    featuredAction: raw.featuredAction
      ? {
          id: String(raw.featuredAction.id),
          label: String(raw.featuredAction.label),
          href: String(raw.featuredAction.href),
          ariaLabel: raw.featuredAction.ariaLabel
            ? String(raw.featuredAction.ariaLabel)
            : undefined,
          external: Boolean(raw.featuredAction.external),
        }
      : undefined,
  };
}

// ── Default values ────────────────────────────────────────────────────────────

const DEFAULT_LOCALE = "fa" as const;
const DEFAULT_OVERLAY_AT_TOP = true;
const DEFAULT_HERO_TONE = "light" as const;
const DEFAULT_COMPACT_AFTER = 96;
const DEFAULT_SHOW_CATEGORY_RAIL = true;

// ── Server Component ──────────────────────────────────────────────────────────

export async function Navbar({
  logo,
  primaryLinks,
  categories,
  user = null,
  cartCount,
  labels,
  locale = DEFAULT_LOCALE,
  overlayAtTop = DEFAULT_OVERLAY_AT_TOP,
  heroTone = DEFAULT_HERO_TONE,
  compactAfter = DEFAULT_COMPACT_AFTER,
  showCategoryRail = DEFAULT_SHOW_CATEGORY_RAIL,
  className,
}: NavbarProps) {
  // Normalize all category data on the server
  // Empty array when categories are not provided
  const normalizedCategories: readonly NormalizedNavbarCategory[] = (
    categories ?? []
  ).map(normalizeCategory);

  // Clamp cart count — treat undefined as zero
  const safeCartCount = Math.max(0, cartCount ?? 0);

  // Build the serializable props object passed to the Client Component
  const clientProps: NavbarClientProps = {
    logo,
    primaryLinks,
    categories: normalizedCategories,
    user: user ?? null,
    cartCount: safeCartCount,
    labels,
    locale,
    overlayAtTop,
    heroTone,
    compactAfter,
    showCategoryRail: showCategoryRail && normalizedCategories.length > 0,
    className,
  };

  return <NavbarClient {...clientProps} />;
}