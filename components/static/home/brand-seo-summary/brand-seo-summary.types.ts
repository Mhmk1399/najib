// ─────────────────────────────────────────────────────────────────────────────
// Brand SEO Summary — Type Definitions
// Najibzadeh Luxury Menswear
// ─────────────────────────────────────────────────────────────────────────────

export type BrandSeoLink = {
    label: string;
    href: string;
};

export type BrandSeoContentGroup = {
    id: string;
    title: string;
    paragraphs: readonly string[];
    links?: readonly BrandSeoLink[];
};

export type BrandSeoSummaryProps = {
    id?: string;
    eyebrow?: string;
    title: string;
    introduction: string;
    summaryLabel?: string;
    closeLabel?: string;
    groups: readonly BrandSeoContentGroup[];
    finalAction?: BrandSeoLink;
    locale?: "fa" | "en";
    defaultOpen?: boolean;
    className?: string;
};