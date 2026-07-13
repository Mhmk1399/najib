// ─────────────────────────────────────────────────────────────────────────────
// Atelier Gate Navbar — Strict Type Definitions
// Najibzadeh Luxury Menswear
// ─────────────────────────────────────────────────────────────────────────────

export type NavbarImageSource = {
    src: string;
    width: number;
    height: number;
    alt: string;
};

export type NavbarLogo = {
    full: NavbarImageSource;
    compact: NavbarImageSource;
    inverseFull?: NavbarImageSource;
    inverseCompact?: NavbarImageSource;
};

export type NavbarLink = {
    id: string;
    label: string;
    href: string;
    ariaLabel?: string;
    external?: boolean;
};

export type NavbarCategoryLink = {
    id: string;
    label: string;
    href: string;
};

export type NavbarCategoryGroup = {
    id: string;
    title: string;
    links: readonly NavbarCategoryLink[];
};

export type NavbarCategory = {
    id: string;
    label: string;
    href: string;
    image: NavbarImageSource;
    eyebrow?: string;
    description?: string;
    groups: readonly NavbarCategoryGroup[];
    featuredAction?: NavbarLink;
};

export type NavbarUser = {
    name: string;
    dashboardHref: string;
    avatarUrl?: string;
};

export type NavbarActionLabels = {
    menu: string;
    close: string;
    cart: string;
    account: string;
    login: string;
    dashboard: string;
    theme: string;
    back: string;
    categories: string;
};

export type NavbarProps = {
    logo: NavbarLogo;
    primaryLinks: readonly NavbarLink[];
    categories?: readonly NavbarCategory[];
    user?: NavbarUser | null;
    cartCount?: number;
    labels: NavbarActionLabels;
    locale?: "fa" | "en";
    overlayAtTop?: boolean;
    heroTone?: "light" | "dark";
    compactAfter?: number;
    showCategoryRail?: boolean;
    className?: string;
};

// Serializable subset forwarded from server to client
export type NavbarClientProps = {
    logo: NavbarLogo;
    primaryLinks: readonly NavbarLink[];
    categories: readonly NavbarCategory[];
    user: NavbarUser | null;
    cartCount: number;
    labels: NavbarActionLabels;
    locale: "fa" | "en";
    overlayAtTop: boolean;
    heroTone: "light" | "dark";
    compactAfter: number;
    showCategoryRail: boolean;
    className?: string;
};

export type MegaMenuState =
    | { open: false; activeCategoryId: null }
    | { open: true; activeCategoryId: string };

export type MobileMenuPanel = "root" | "categories" | "category-detail";

export type MobileMenuState = {
    open: boolean;
    panel: MobileMenuPanel;
    activeCategoryId: string | null;
};

export type NavbarTheme = "light" | "dark" | "system";

// Normalized category validated before crossing server→client boundary
export type NormalizedNavbarCategory = NavbarCategory;