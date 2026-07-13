// ─────────────────────────────────────────────────────────────────────────────
// Category Editorial Grid — Example Data
// Najibzadeh Luxury Menswear
// ─────────────────────────────────────────────────────────────────────────────

import type {
    CategoryEditorialGridProps,
    CategoryGridItem,
} from "./category-editorial-grid.types";

const gridCategories: readonly CategoryGridItem[] = [
    {
        id: "suits",
        title: "کت‌وشلوار",
        englishTitle: "Suits",
        description: "فرم‌های رسمی با ساختاری متوازن و حضوری بدون اغراق.",
        href: "/collections/suits",
        position: "featured",
        image: {
            src: "/assets/images/hero.webp",
            width: 1600,
            height: 2000,
            alt: "مدل مرد با کت‌وشلوار رسمی نجیب‌زاده",
        },
        objectPosition: "top",
    },
    {
        id: "jackets",
        title: "کت و بلیزر",
        englishTitle: "Jackets",
        description: "پوششی میان رسمیت و آزادی برای موقعیت‌های مختلف.",
        href: "/collections/jackets",
        position: "top-wide",
        image: {
            src: "/assets/images/hero3.webp",
            width: 1600,
            height: 1200,
            alt: "مدل مرد با کت و بلیزر نجیب‌زاده",
        },
        objectPosition: "center",
    },
    {
        id: "shirts",
        title: "پیراهن",
        englishTitle: "Shirts",
        description: "نخستین لایه یک پوشش دقیق و سنجیده.",
        href: "/collections/shirts",
        position: "top-small",
        image: {
            src: "/assets/images/hero4.webp",
            width: 1200,
            height: 1400,
            alt: "پیراهن رسمی مردانه نجیب‌زاده",
        },
        objectPosition: "center",
    },
    {
        id: "accessories",
        title: "اکسسوری",
        englishTitle: "Accessories",
        description: "جزئیاتی محدود که امضای نهایی پوشش را شکل می‌دهند.",
        href: "/collections/accessories",
        position: "bottom-small",
        image: {
            src: "/assets/images/hero5.webp",
            width: 1200,
            height: 1400,
            alt: "اکسسوری رسمی مردانه نجیب‌زاده",
        },
        objectPosition: "center",
    },
    {
        id: "bespoke",
        title: "خیاطی اختصاصی",
        englishTitle: "Bespoke",
        description: "تجربه‌ای شکل‌گرفته بر اساس فرم و شخصیت شما.",
        href: "/bespoke",
        position: "bottom-wide",
        image: {
            src: "/assets/images/hero.webp",
            width: 1600,
            height: 1200,
            alt: "فرایند خیاطی اختصاصی نجیب‌زاده",
        },
        objectPosition: "center",
    },
] as const;

export const categoryEditorialGridData = {
    id: "homepage-category-editorial-grid",
    eyebrow: "کالکشن‌های نجیب‌زاده",
    title: "پوششی برای هر فصل از حضور شما.",
    description:
        "از ساختار رسمی کت‌وشلوار تا ظرافت آخرین جزئیات، هر کالکشن برای ساخت حضوری سنجیده و ماندگار شکل گرفته است.",
    categories: gridCategories,
} as const satisfies Omit<CategoryEditorialGridProps, "locale" | "className">;