// ─────────────────────────────────────────────────────────────────────────────
// Atelier Gate Navbar — Example Navigation Data
// Najibzadeh Luxury Menswear
// ─────────────────────────────────────────────────────────────────────────────

import type {
    NavbarActionLabels,
    NavbarCategory,
    NavbarLink,
    NavbarLogo,
} from "./navbar.types";

// ── Primary Navigation Links ─────────────────────────────────────────────────

export const navbarPrimaryLinks: readonly NavbarLink[] = [
    {
        id: "home",
        label: "خانه",
        href: "/",
        ariaLabel: "صفحه اصلی نجیب‌زاده",
    },
    {
        id: "about",
        label: "درباره نجیب‌زاده",
        href: "/about",
        ariaLabel: "درباره برند نجیب‌زاده",
    },
    {
        id: "bespoke",
        label: "خیاطی اختصاصی",
        href: "/bespoke",
        ariaLabel: "سرویس خیاطی اختصاصی",
    },
    {
        id: "journal",
        label: "مجله نجیب‌زاده",
        href: "/journal",
        ariaLabel: "مجله و مقالات نجیب‌زاده",
    },
    {
        id: "contact",
        label: "تماس",
        href: "/contact",
        ariaLabel: "تماس با نجیب‌زاده",
    },
] as const;

// ── Product Categories ────────────────────────────────────────────────────────

export const navbarCategories: readonly NavbarCategory[] = [
    {
        id: "suits",
        label: "کت‌وشلوار",
        href: "/collections/suits",
        eyebrow: "مجموعه رسمی",
        description: "فرم‌های رسمی برای موقعیت‌هایی که اهمیت دارند.",
        image: {
            src: "/assets/images/hero.webp",
            width: 1600,
            height: 1200,
            alt: "مجموعه کت‌وشلوار رسمی نجیب‌زاده",
        },
        groups: [
            {
                id: "suits-by-style",
                title: "بر اساس مدل",
                links: [
                    {
                        id: "suits-formal",
                        label: "کت‌وشلوار رسمی",
                        href: "/collections/suits/formal",
                    },
                    {
                        id: "suits-wedding",
                        label: "کت‌وشلوار دامادی",
                        href: "/collections/suits/wedding",
                    },
                    {
                        id: "suits-three-piece",
                        label: "کت‌وشلوار سه‌تکه",
                        href: "/collections/suits/three-piece",
                    },
                ],
            },
            {
                id: "suits-guides",
                title: "راهنمای انتخاب",
                links: [
                    {
                        id: "suits-size-guide",
                        label: "راهنمای انتخاب سایز",
                        href: "/size-guide",
                    },
                    {
                        id: "suits-fabric-guide",
                        label: "راهنمای انتخاب پارچه",
                        href: "/journal/suit-fabric-guide",
                    },
                    {
                        id: "suits-care",
                        label: "مراقبت از کت‌وشلوار",
                        href: "/garment-care",
                    },
                ],
            },
        ],
        featuredAction: {
            id: "suits-view-all",
            label: "مشاهده همه کت‌وشلوارها",
            href: "/collections/suits",
        },
    },

    {
        id: "jackets",
        label: "کت و بلیزر",
        href: "/collections/jackets",
        eyebrow: "پوشش روز و شب",
        description: "کت‌هایی برای ساخت یک استایل متوازن و ماندگار.",
        image: {
            src: "/assets/images/hero3.webp",
            width: 1600,
            height: 1200,
            alt: "کت و بلیزر مردانه نجیب‌زاده",
        },
        groups: [
            {
                id: "jackets-by-style",
                title: "بر اساس مدل",
                links: [
                    {
                        id: "jackets-formal",
                        label: "کت رسمی",
                        href: "/collections/jackets/formal",
                    },
                    {
                        id: "jackets-single",
                        label: "کت تک",
                        href: "/collections/jackets/single",
                    },
                    {
                        id: "jackets-blazer",
                        label: "بلیزر",
                        href: "/collections/jackets/blazer",
                    },
                ],
            },
            {
                id: "jackets-guides",
                title: "راهنمای انتخاب",
                links: [
                    {
                        id: "jackets-styling-guide",
                        label: "راهنمای ست‌کردن کت",
                        href: "/journal/jacket-styling",
                    },
                    {
                        id: "jackets-fit-guide",
                        label: "انتخاب فرم مناسب",
                        href: "/journal/jacket-fit-guide",
                    },
                ],
            },
        ],
        featuredAction: {
            id: "jackets-view-all",
            label: "مشاهده همه کت‌ها",
            href: "/collections/jackets",
        },
    },

    {
        id: "shirts",
        label: "پیراهن",
        href: "/collections/shirts",
        eyebrow: "جزئیات نخستین لایه",
        description: "پیراهن‌هایی با فرم آرام و ساختار دقیق.",
        image: {
            src: "/assets/images/hero4.webp",
            width: 1600,
            height: 1200,
            alt: "پیراهن رسمی مردانه نجیب‌زاده",
        },
        groups: [
            {
                id: "shirts-by-style",
                title: "بر اساس مدل",
                links: [
                    {
                        id: "shirts-formal",
                        label: "پیراهن رسمی",
                        href: "/collections/shirts/formal",
                    },
                    {
                        id: "shirts-casual",
                        label: "پیراهن غیررسمی",
                        href: "/collections/shirts/casual",
                    },
                    {
                        id: "shirts-bespoke",
                        label: "پیراهن اختصاصی",
                        href: "/collections/shirts/bespoke",
                    },
                ],
            },
            {
                id: "shirts-guides",
                title: "راهنمای انتخاب",
                links: [
                    {
                        id: "shirts-collar-guide",
                        label: "راهنمای انتخاب یقه",
                        href: "/journal/shirt-collar-guide",
                    },
                    {
                        id: "shirts-size-guide",
                        label: "راهنمای سایز",
                        href: "/size-guide/shirts",
                    },
                ],
            },
        ],
        featuredAction: {
            id: "shirts-view-all",
            label: "مشاهده همه پیراهن‌ها",
            href: "/collections/shirts",
        },
    },

    {
        id: "accessories",
        label: "اکسسوری",
        href: "/collections/accessories",
        eyebrow: "امضای نهایی پوشش",
        description: "جزئیاتی برای کامل‌کردن یک حضور سنجیده.",
        image: {
            src: "/assets/images/hero5.webp",
            width: 1600,
            height: 1200,
            alt: "اکسسوری رسمی مردانه نجیب‌زاده",
        },
        groups: [
            {
                id: "accessories-ties",
                title: "کراوات و پاپیون",
                links: [
                    {
                        id: "accessories-neckties",
                        label: "کراوات",
                        href: "/collections/accessories/neckties",
                    },
                    {
                        id: "accessories-bowties",
                        label: "پاپیون",
                        href: "/collections/accessories/bowties",
                    },
                    {
                        id: "accessories-pocket-squares",
                        label: "دستمال جیب",
                        href: "/collections/accessories/pocket-squares",
                    },
                ],
            },
            {
                id: "accessories-finishing",
                title: "جزئیات تکمیلی",
                links: [
                    {
                        id: "accessories-cufflinks",
                        label: "دکمه سردست",
                        href: "/collections/accessories/cufflinks",
                    },
                    {
                        id: "accessories-belts",
                        label: "کمربند",
                        href: "/collections/accessories/belts",
                    },
                    {
                        id: "accessories-shoes",
                        label: "کفش رسمی",
                        href: "/collections/accessories/shoes",
                    },
                ],
            },
        ],
        featuredAction: {
            id: "accessories-view-all",
            label: "مشاهده همه اکسسوری‌ها",
            href: "/collections/accessories",
        },
    },

    {
        id: "bespoke",
        label: "خیاطی اختصاصی",
        href: "/bespoke",
        eyebrow: "ساخته‌شده برای شما",
        description:
            "از انتخاب پارچه تا آخرین پرو، هر جزئیات بر اساس شخصیت شما شکل می‌گیرد.",
        image: {
            src: "/assets/images/hero.webp",
            width: 1600,
            height: 1200,
            alt: "فرایند خیاطی اختصاصی نجیب‌زاده",
        },
        groups: [
            {
                id: "bespoke-process",
                title: "فرایند خیاطی",
                links: [
                    {
                        id: "bespoke-consultation",
                        label: "مشاوره اولیه",
                        href: "/bespoke/consultation",
                    },
                    {
                        id: "bespoke-fabric",
                        label: "انتخاب پارچه",
                        href: "/bespoke/fabric-selection",
                    },
                    {
                        id: "bespoke-fitting",
                        label: "جلسه پرو",
                        href: "/bespoke/fitting",
                    },
                ],
            },
            {
                id: "bespoke-info",
                title: "اطلاعات",
                links: [
                    {
                        id: "bespoke-timeline",
                        label: "زمان‌بندی سفارش",
                        href: "/bespoke/timeline",
                    },
                    {
                        id: "bespoke-pricing",
                        label: "راهنمای قیمت",
                        href: "/bespoke/pricing",
                    },
                    {
                        id: "bespoke-faq",
                        label: "سوالات متداول",
                        href: "/bespoke/faq",
                    },
                ],
            },
        ],
        featuredAction: {
            id: "bespoke-start",
            label: "شروع فرایند خیاطی",
            href: "/bespoke/consultation",
        },
    },
] as const;

// ── Action Labels ─────────────────────────────────────────────────────────────

export const navbarLabels: NavbarActionLabels = {
    menu: "بازکردن منو",
    close: "بستن منو",
    cart: "سبد خرید",
    account: "حساب کاربری",
    login: "ورود / ثبت‌نام",
    dashboard: "داشبورد",
    theme: "تغییر پوسته",
    back: "بازگشت",
    categories: "دسته‌بندی محصولات",
} as const;

// ── Logo Definition ───────────────────────────────────────────────────────────

export const navbarLogo: NavbarLogo = {
    full: {
        src: "/assets/images/logo.png",
        width: 360,
        height: 100,
        alt: "نجیب‌زاده",
    },
    compact: {
        src: "/assets/images/logo.png",
        width: 100,
        height: 100,
        alt: "نشان نجیب‌زاده",
    },
    // inverseFull and inverseCompact omitted until official assets are supplied
} as const;