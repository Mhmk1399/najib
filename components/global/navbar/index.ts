// ─────────────────────────────────────────────────────────────────────────────
// Atelier Gate Navbar — Public Barrel Export
//
// Import from "@/components/layout/navbar" in layouts and pages.
//
// Examples:
//   import { Navbar } from "@/components/layout/navbar";
//   import { navbarCategories, navbarLabels } from "@/components/layout/navbar";
// ─────────────────────────────────────────────────────────────────────────────

// ── Main Server Component (default public export) ─────────────────────────────
export { Navbar } from "./navbar";

// ── Navigation data (used in layout.tsx) ─────────────────────────────────────
export {
    navbarPrimaryLinks,
    navbarCategories,
    navbarLabels,
    navbarLogo,
} from "./navbar-data.example";

// ── Types (for consumers that need to type their own data) ────────────────────
export type {
    NavbarProps,
    NavbarClientProps,
    NavbarCategory,
    NavbarCategoryGroup,
    NavbarCategoryLink,
    NavbarLink,
    NavbarLogo,
    NavbarImageSource,
    NavbarUser,
    NavbarActionLabels,
    NavbarTheme,
    MegaMenuState,
    MobileMenuPanel,
    MobileMenuState,
    NormalizedNavbarCategory,
} from "./navbar.types";

// ── Icons (for use in other layout components) ────────────────────────────────
export {
    MenuIcon,
    CloseIcon,
    BagIcon,
    AccountIcon,
    SunIcon,
    MoonIcon,
    SystemIcon,
    ChevronIcon,
    ArrowIcon,
    BackIcon,
} from "./navbar-icons";

// ── GSAP loader (shared with other animated components if needed) ──────────────
export { loadNavbarGsap } from "./navbar-gsap";

// ── Sub-components (for advanced composition in special page layouts) ─────────
// These are intentionally NOT re-exported at the top level to keep
// the default import surface clean. Import them directly when needed:
//
//   import { NavbarThemeToggle } from "@/components/layout/navbar/navbar-theme-toggle";
//   import { MegaMenuClient } from "@/components/layout/navbar/mega-menu-client";
//   import { MobileWardrobeMenu } from "@/components/layout/navbar/mobile-wardrobe-menu";
//   import { DesktopNavigation } from "@/components/layout/navbar/desktop-navigation";