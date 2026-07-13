// ─────────────────────────────────────────────────────────────────────────────
// Product Focus Slider — Type Definitions
// Najibzadeh Luxury Menswear
// ─────────────────────────────────────────────────────────────────────────────

export type ProductSliderImage = {
    src: string;
    width: number;
    height: number;
    alt: string;
};

export type ProductSliderObjectPosition =
    | "center"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "center-left"
    | "center-right";

export type ProductSliderItem = {
    id: string;
    title: string;
    englishTitle?: string;
    href: string;
    priceText: string;
    image: ProductSliderImage;
    objectPosition?: ProductSliderObjectPosition;
};

export type ProductFocusSliderProps = {
    id?: string;
    eyebrow?: string;
    title: string;
    description?: string;
    products: readonly ProductSliderItem[];
    initialProductId?: string;
    locale?: "fa" | "en";
    enableSwipe?: boolean;
    className?: string;
};

// Serializable props forwarded from Server to Client
export type ProductFocusSliderClientProps = {
    id: string;
    products: readonly ProductSliderItem[];
    initialIndex: number;
    locale: "fa" | "en";
    enableSwipe: boolean;
};

// Visual slot identifiers
export type SlotId =
    | "far-previous"
    | "previous"
    | "active"
    | "next"
    | "far-next"
    | "hidden";