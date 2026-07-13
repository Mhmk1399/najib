import type { BrandStatementImageProps } from "./brand-statement-image.types";

export const brandStatementImageData = {
    id: "homepage-brand-statement-image",
    statement: "وقار، نیازی به فریاد ندارد.",
    tagline: "Dignity in Silence",
    image: {
        src: "/assets/images/hero4.webp",
        width: 2400,
        height: 1500,
        alt: "مدل مرد با پوشش رسمی نجیب‌زاده در فضای معماری آرام",
    },
    contentTone: "light",
    objectPosition: "center",
    overlayStrength: "soft",
    enableScrollReveal: true,
} as const satisfies Omit<BrandStatementImageProps, "className">;