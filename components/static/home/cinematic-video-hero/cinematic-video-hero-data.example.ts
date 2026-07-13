// ─────────────────────────────────────────────────────────────────────────────
// Cinematic Video Hero — Example Data
// Najibzadeh Luxury Menswear
// ─────────────────────────────────────────────────────────────────────────────

import type { CinematicVideoHeroProps, HeroSlide } from "./cinematic-video-hero.types";

const heroSlides: readonly HeroSlide[] = [
    {
        id: "formal-collection",
        number: "01",
        eyebrow: "کالکشن رسمی",
        title: "فرمی برای موقعیت‌هایی که اهمیت دارند.",
        description:
            "کت‌وشلوارهایی با ساختاری آرام، تناسبی سنجیده و حضوری بدون اغراق.",
        action: {
            label: "مشاهده کالکشن رسمی",
            href: "/collections/suits",
            ariaLabel: "مشاهده کت‌وشلوارهای رسمی نجیب‌زاده",
        },
        desktopVideo: {
            src: "/assets/videos/vid1.mp4",
            type: "video/mp4",
        },
        mobileVideo: {
            src: "/assets/videos/vid1.mp4",
            type: "video/mp4",
        },
        desktopPoster: {
            src: "/assets/images/hero.webp",
            width: 2400,
            height: 1350,
        },
        mobilePoster: {
            src: "/assets/images/hero.webp",
            width: 1080,
            height: 1440,
        },
        posterAlt: "مدل مرد با کت‌وشلوار رسمی نجیب‌زاده",
        objectPosition: "center-right",
    },
    {
        id: "bespoke",
        number: "02",
        eyebrow: "خیاطی اختصاصی",
        title: "ساخته‌شده بر اساس شخصیت شما.",
        description:
            "از انتخاب پارچه تا آخرین پرو، هر تصمیم با فرم و سبک شخصی شما هماهنگ می‌شود.",
        action: {
            label: "کشف خیاطی اختصاصی",
            href: "/bespoke",
            ariaLabel: "آشنایی با خیاطی اختصاصی نجیب‌زاده",
        },
        desktopVideo: {
            src: "/assets/videos/vid2.mp4",
            type: "video/mp4",
        },
        mobileVideo: {
            src: "/assets/videos/vid2.mp4",
            type: "video/mp4",
        },
        desktopPoster: {
            src: "/assets/images/hero.webp",
            width: 2400,
            height: 1350,
        },
        mobilePoster: {
            src: "/assets/images/hero.webp",
            width: 1080,
            height: 1440,
        },
        posterAlt: "فرایند اندازه‌گیری و خیاطی اختصاصی نجیب‌زاده",
        objectPosition: "center",
    },
] as const;

export const cinematicVideoHeroData = {
    id: "homepage-cinematic-video-hero",
    title: "وقار، پیش از کلام.",
    introduction:
        "پوششی برای مردانی که حضورشان را نه با هیاهو، بلکه با انتخابی دقیق و ماندگار بیان می‌کنند.",
    slides: heroSlides,
    initialSlideId: "formal-collection",
    autoAdvance: true,
} as const satisfies Omit<CinematicVideoHeroProps, "locale" | "className">;
