import type { Locale } from "@/lib/i18n/config";

export type PwaInstallCopy = {
    card: {
        ariaLabel: string;
        brandMark: string;
        eyebrow: string;
        title: string;
        description: string;
    };

    actions: {
        install: string;
        installing: string;

        dismissAriaLabel: string;
        dismissTitle: string;
    };

    iosHelp: {
        badge: string;
        title: string;
        description: string;

        stepTitle: string;
        stepDescription: string;

        note: string;

        closeAriaLabel: string;
        closeTitle: string;
    };
};

export const pwaInstallCopy: Record<
    Locale,
    PwaInstallCopy
> = {
    fa: {
        card: {
            ariaLabel:
                "نصب اپلیکیشن نجیب‌زاده",

            brandMark: "N",

            eyebrow:
                "تجربه نجیب‌زاده",

            title:
                "نجیب‌زاده، همیشه در دسترس.",

            description:
                "دسترسی سریع‌تر و تجربه‌ای یکپارچه، مستقیماً از صفحه اصلی دستگاه شما.",
        },

        actions: {
            install:
                "نصب اپ",

            installing:
                "در حال نصب…",

            dismissAriaLabel:
                "بستن پیشنهاد نصب اپلیکیشن",

            dismissTitle:
                "بستن",
        },

        iosHelp: {
            badge:
                "نصب روی iPhone و iPad",

            title:
                "نجیب‌زاده را به صفحه اصلی اضافه کنید.",

            description:
                "در iOS نصب اپ از طریق منوی اشتراک‌گذاری مرورگر انجام می‌شود.",

            stepTitle:
                "از منوی اشتراک‌گذاری",

            stepDescription:
                "گزینه «افزودن به صفحه اصلی» را انتخاب کنید.",

            note:
                "پس از افزودن، نجیب‌زاده مانند یک اپ مستقل از صفحه اصلی دستگاه شما اجرا می‌شود.",

            closeAriaLabel:
                "بستن راهنمای نصب",

            closeTitle:
                "بستن",
        },
    },

    en: {
        card: {
            ariaLabel:
                "Install the Najibzadeh app",

            brandMark: "N",

            eyebrow:
                "The Najibzadeh Experience",

            title:
                "Najibzadeh, always within reach.",

            description:
                "Faster access and a seamless experience directly from your home screen.",
        },

        actions: {
            install:
                "Install App",

            installing:
                "Installing…",

            dismissAriaLabel:
                "Dismiss app installation prompt",

            dismissTitle:
                "Close",
        },

        iosHelp: {
            badge:
                "Install on iPhone & iPad",

            title:
                "Add Najibzadeh to your Home Screen.",

            description:
                "On iOS, the app is installed through your browser's Share menu.",

            stepTitle:
                "Open the Share menu",

            stepDescription:
                "Then select “Add to Home Screen”.",

            note:
                "Once added, Najibzadeh opens from your Home Screen like a standalone app.",

            closeAriaLabel:
                "Close installation guide",

            closeTitle:
                "Close",
        },
    },

    ar: {
        card: {
            ariaLabel:
                "تثبيت تطبيق نجيب زاده",

            brandMark: "N",

            eyebrow:
                "تجربة نجيب زاده",

            title:
                "نجيب زاده، دائماً في متناولك.",

            description:
                "وصول أسرع وتجربة متكاملة مباشرة من الشاشة الرئيسية لجهازك.",
        },

        actions: {
            install:
                "تثبيت التطبيق",

            installing:
                "جارٍ التثبيت…",

            dismissAriaLabel:
                "إغلاق اقتراح تثبيت التطبيق",

            dismissTitle:
                "إغلاق",
        },

        iosHelp: {
            badge:
                "التثبيت على iPhone وiPad",

            title:
                "أضف نجيب زاده إلى الشاشة الرئيسية.",

            description:
                "في iOS يتم تثبيت التطبيق من خلال قائمة المشاركة في المتصفح.",

            stepTitle:
                "افتح قائمة المشاركة",

            stepDescription:
                "ثم اختر «إضافة إلى الشاشة الرئيسية».",

            note:
                "بعد الإضافة، يمكنك فتح نجيب زاده من الشاشة الرئيسية كتطبيق مستقل.",

            closeAriaLabel:
                "إغلاق دليل التثبيت",

            closeTitle:
                "إغلاق",
        },
    },
};