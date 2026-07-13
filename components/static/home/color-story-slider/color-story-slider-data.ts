import type { ColorStorySliderProps } from "./color-story-slider.types";

export const colorStorySliderData = {
    id: "homepage-color-story-slider",
    eyebrow: "روایت تصویری نجیب‌زاده",
    title: "هر تصویر، روایتی از حضور.",
    description:
        "سه نگاه به فرم، تناسب و جزئیاتی که پوشش مردانه را به بخشی از شخصیت تبدیل می‌کنند.",
    slides: [
        {
            id: "architectural-presence",
            number: "01",
            title: "حضور در معماری",
            description:
                "فرم‌های رسمی در فضایی آرام؛ جایی که ساختار پوشش و معماری، زبان مشترکی پیدا می‌کنند.",
            image: {
                src: "/assets/images/hero4.webp",
                width: 1600,
                height: 1200,
                alt: "مدل مرد با کت‌وشلوار نجیب‌زاده در فضای معماری مدرن",
            },
            dominantColor: "#75685C",
            contentTone: "light",
            objectPosition: "center",
            href: "/collections/suits",
            linkLabel: "مشاهده کت‌وشلوارها",
        },
        {
            id: "quiet-tailoring",
            number: "02",
            title: "جزئیات در سکوت",
            description:
                "تناسب، بافت و انتخاب‌های کوچک، نتیجه‌ای می‌سازند که بدون اغراق متمایز باقی می‌ماند.",
            image: {
                src: "/assets/images/hero3.webp",
                width: 1600,
                height: 1200,
                alt: "نمای نزدیک از جزئیات کت و خیاطی نجیب‌زاده",
            },
            dominantColor: "#4D5553",
            contentTone: "light",
            objectPosition: "center",
            href: "/bespoke",
            linkLabel: "آشنایی با خیاطی اختصاصی",
        },
        {
            id: "evening-character",
            number: "03",
            title: "شخصیت شب",
            description:
                "انتخابی برای موقعیت‌هایی که حضور باید دقیق، آرام و به‌یادماندنی باقی بماند.",
            image: {
                src: "/assets/images/hero5.webp",
                width: 1600,
                height: 1200,
                alt: "مدل مرد با پوشش رسمی نجیب‌زاده در فضای شب",
            },
            dominantColor: "#343943",
            contentTone: "light",
            objectPosition: "center",
            href: "/collections/jackets",
            linkLabel: "مشاهده کت و بلیزر",
        },
    ],
    initialSlideId: "architectural-presence",
    enablePointerDrag: true,
} as const satisfies Omit<ColorStorySliderProps, "locale" | "className">;