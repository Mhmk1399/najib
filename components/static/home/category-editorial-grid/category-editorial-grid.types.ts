// ─────────────────────────────────────────────────────────────────────────────
// Category Editorial Grid — Type Definitions
// Najibzadeh Luxury Menswear
// ─────────────────────────────────────────────────────────────────────────────

export type CategoryGridImage = {
    src: string;
    width: number;
    height: number;
    alt: string;
};

export type CategoryGridPosition =
    | "featured"
    | "top-wide"
    | "top-small"
    | "bottom-small"
    | "bottom-wide";

export type CategoryGridObjectPosition =
    | "center"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "center-left"
    | "center-right";

export type CategoryGridItem = {
    id: string;
    title: string;
    englishTitle?: string;
    description?: string;
    href: string;
    image: CategoryGridImage;
    position: CategoryGridPosition;
    objectPosition?: CategoryGridObjectPosition;
};

export type CategoryEditorialGridProps = {
    id?: string;
    eyebrow?: string;
    title: string;
    description?: string;
    categories: readonly CategoryGridItem[];
    locale?: "fa" | "en";
    className?: string;
};