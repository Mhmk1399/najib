// ─────────────────────────────────────────────────────────────────────────────
// Product Focus Slider — Example Data
// Najibzadeh Luxury Menswear
// ─────────────────────────────────────────────────────────────────────────────

import type {
    ProductFocusSliderProps,
    ProductSliderItem,
} from "./product-focus-slider.types";

const sliderProducts: readonly ProductSliderItem[] = [
    {
        id: "midnight-two-piece",
        title: "کت‌وشلوار رسمی نیمه‌شب",
        englishTitle: "Midnight Two-Piece Suit",
        href: "/products/midnight-two-piece-suit",
        priceText: "۱۸٬۹۰۰٬۰۰۰ تومان",
        image: {
            src: "/assets/images/hero.webp",
            width: 1200,
            height: 1600,
            alt: "کت‌وشلوار رسمی مشکی نجیب‌زاده",
        },
        objectPosition: "top",
    },
    {
        id: "charcoal-tailored-suit",
        title: "کت‌وشلوار زغالی",
        englishTitle: "Charcoal Tailored Suit",
        href: "/products/charcoal-tailored-suit",
        priceText: "۱۷٬۵۰۰٬۰۰۰ تومان",
        image: {
            src: "/assets/images/hero3.webp",
            width: 1200,
            height: 1600,
            alt: "کت‌وشلوار زغالی مردانه نجیب‌زاده",
        },
        objectPosition: "top",
    },
    {
        id: "ivory-formal-jacket",
        title: "کت رسمی عاجی",
        englishTitle: "Ivory Formal Jacket",
        href: "/products/ivory-formal-jacket",
        priceText: "۱۲٬۸۰۰٬۰۰۰ تومان",
        image: {
            src: "/assets/images/hero4.webp",
            width: 1200,
            height: 1600,
            alt: "کت رسمی عاجی مردانه نجیب‌زاده",
        },
        objectPosition: "center",
    },
    {
        id: "navy-double-breasted",
        title: "کت‌وشلوار سرمه‌ای شش‌دکمه",
        englishTitle: "Navy Double-Breasted Suit",
        href: "/products/navy-double-breasted-suit",
        priceText: "۱۹٬۶۰۰٬۰۰۰ تومان",
        image: {
            src: "/assets/images/hero5.webp",
            width: 1200,
            height: 1600,
            alt: "کت‌وشلوار سرمه‌ای شش‌دکمه نجیب‌زاده",
        },
        objectPosition: "top",
    },
    {
        id: "classic-white-shirt",
        title: "پیراهن سفید کلاسیک",
        englishTitle: "Classic White Shirt",
        href: "/products/classic-white-shirt",
        priceText: "۴٬۹۰۰٬۰۰۰ تومان",
        image: {
            src: "/assets/images/hero.webp",
            width: 1200,
            height: 1600,
            alt: "پیراهن سفید رسمی مردانه نجیب‌زاده",
        },
        objectPosition: "center",
    },
    {
        id: "black-evening-jacket",
        title: "کت شب مشکی",
        englishTitle: "Black Evening Jacket",
        href: "/products/black-evening-jacket",
        priceText: "۱۴٬۷۰۰٬۰۰۰ تومان",
        image: {
            src: "/assets/images/hero4.webp",
            width: 1200,
            height: 1600,
            alt: "کت شب مشکی مردانه نجیب‌زاده",
        },
        objectPosition: "top",
    },
] as const;

export const productFocusSliderData = {
    id: "homepage-product-focus-slider",
    eyebrow: "محصولات منتخب",
    title: "انتخاب‌هایی برای حضوری ماندگار.",
    description:
        "مجموعه‌ای از پوشش‌های منتخب نجیب‌زاده؛ با تمرکز بر فرم، تناسب و جزئیاتی که شخصیت شما را کامل می‌کنند.",
    products: sliderProducts,
    initialProductId: "midnight-two-piece",
    enableSwipe: true,
} as const satisfies Omit<ProductFocusSliderProps, "locale" | "className">;