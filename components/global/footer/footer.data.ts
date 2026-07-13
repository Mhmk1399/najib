import type { FooterProps } from "./footer.types";

export const footerData = {
    id: "site-footer",
    brandLabel: "نجیب‌زاده",
    homeHref: "/",
    logo: {
        src: "/assets/images/logo.png",
        width: 180,
        height: 48,
        alt: "لوگوی نجیب‌زاده",
    },
    description:
        "نجیب‌زاده برای مردانی‌ست که وقار را در جزئیات می‌بینند؛ پوششی سنجیده، آرام و ماندگار برای موقعیت‌هایی که حضور باید بی‌نیاز از اغراق باشد.",
    sections: [
        {
            id: "footer-access",
            title: "دسترسی",
            links: [
                { label: "خانه", href: "/" },
                { label: "کالکشن‌ها", href: "/collections" },
                { label: "دوخت سفارشی", href: "/bespoke" },
                { label: "درباره ما", href: "/about" },
            ],
        },
        {
            id: "footer-service",
            title: "خدمات مشتریان",
            links: [
                { label: "پیگیری سفارش", href: "/orders/tracking" },
                { label: "شیوه ارسال", href: "/shipping" },
                { label: "شرایط بازگشت", href: "/returns" },
                { label: "تماس با ما", href: "/contact" },
            ],
        },
        {
            id: "footer-guide",
            title: "راهنما",
            links: [
                { label: "راهنمای اندازه", href: "/size-guide" },
                { label: "مراقبت از پوشاک", href: "/care-guide" },
                { label: "حریم خصوصی", href: "/privacy" },
                { label: "قوانین و مقررات", href: "/terms" },
            ],
        },
    ],
    trustItems: [
        {
            id: "enamad",
            image: {
                src: "/assets/images/enemad.png",
                width: 80,
                height: 80,
                alt: "نماد اعتماد الکترونیکی",
            },
        },
        {
            id: "meli-neshan",
            image: {
                src: "/assets/images/meliNeshan.png",
                width: 80,
                height: 80,
                alt: "نشان ملی",
            },
        },
    ],
    wordmark: "Najibzadeh",
    tagline: "Dignity in Silence",
    copyrightLabel: "نجیب‌زاده",
} as const satisfies Omit<FooterProps, "locale" | "className">;