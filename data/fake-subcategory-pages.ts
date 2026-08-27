import { fakeCategoryPages } from "@/data/fake-category-pages";

import type {
    CategoryProduct,
    CategorySubcategory,
    SubcategoryPageData,
} from "@/types/category-page";

export const fakeSubcategoryPages: Record<string, SubcategoryPageData> = {
    "clothing/jackets": {
        id: "subcategory-clothing-jackets",

        slug: "jackets",

        categorySlug: "clothing",

        categoryName: "Clothing",

        name: "Jackets",

        breadcrumbLabel: "Jackets",

        hero: {
            eyebrow: "Najibzadeh Jackets",

            title: "Jackets cut\nwith quiet authority.",

            description:
                "A focused edit of structured jackets, soft tailoring and refined layers designed around proportion, material and daily presence.",

            image: "/assets/images/banner.webp",

            imageAlt: "Najibzadeh jacket collection",

            mobileImagePosition: "62% center",

            desktopImagePosition: "center 28%",

            action: {
                label: "Shop Jackets",

                href: "/shop?category=jackets",
            },
        },

        intro: {
            eyebrow: "The Edit",

            title: "Structure without noise.",

            description:
                "The Najibzadeh jacket edit is built for the moment between formality and ease. Each piece is shaped through shoulder line, cloth weight and subtle finish, creating a silhouette that feels precise without appearing forced.",
        },

        products: [
            {
                id: "signature-cashmere-jacket",

                title: "Signature Cut Cashmere Jacket",

                subtitle: "Burgundy cashmere blend",

                href: "/products/signature-cashmere-jacket",

                image: "/assets/images/banner.webp",

                imageAlt: "Signature Cut Cashmere Jacket",

                imagePosition: "center 26%",

                priceLabel: "$4,250",

                badge: "New",

                colors: ["#4A161D", "#0B0B0B"],
            },

            {
                id: "soft-shoulder-blazer",

                title: "Soft Shoulder Blazer",

                subtitle: "Charcoal wool",

                href: "/products/soft-shoulder-blazer",

                image: "/assets/images/banner.webp",

                imageAlt: "Soft Shoulder Blazer",

                imagePosition: "center",

                priceLabel: "$3,180",

                colors: ["#353535", "#182432"],
            },

            {
                id: "evening-dinner-jacket",

                title: "Evening Dinner Jacket",

                subtitle: "Black barathea",

                href: "/products/evening-dinner-jacket",

                image: "/assets/images/banner.webp",

                imageAlt: "Evening Dinner Jacket",

                imagePosition: "center",

                priceLabel: "$4,600",

                badge: "Formal",

                colors: ["#0B0B0B"],
            },

            {
                id: "linen-summer-jacket",

                title: "Linen Summer Jacket",

                subtitle: "Warm ivory",

                href: "/products/linen-summer-jacket",

                image: "/assets/images/banner.webp",

                imageAlt: "Linen Summer Jacket",

                imagePosition: "center",

                priceLabel: "$2,480",

                colors: ["#EFEDE7", "#9E8D77"],
            },
        ],

        feature: {
            eyebrow: "The Construction",

            title: "A composed shoulder,",

            italicTitle: "a softer life.",

            description:
                "Canvas, lining and cloth are balanced to hold the line while allowing the jacket to move with the body.",

            image: "/assets/images/banner.webp",

            imageAlt: "Najibzadeh jacket construction",

            mobileImagePosition: "62% center",

            desktopImagePosition: "center",
        },

        finalCTA: {
            eyebrow: "Private Service",

            title: "Find the jacket that holds your line.",

            description:
                "Book a private appointment for fit guidance, material selection and wardrobe pairing.",

            image: "/assets/images/banner.webp",

            imageAlt: "Najibzadeh private jacket service",

            imagePosition: "center",

            action: {
                label: "Book an Appointment",

                href: "/appointments",
            },
        },
    },

    "clothing/knitwear": {
        id: "subcategory-clothing-knitwear",

        slug: "knitwear",

        categorySlug: "clothing",

        categoryName: "Clothing",

        name: "Knitwear",

        breadcrumbLabel: "Knitwear",

        hero: {
            eyebrow: "Najibzadeh Knitwear",

            title: "Knitwear with\nmeasured softness.",

            description:
                "Cashmere, wool and textured layers designed for warmth, tactility and a quiet sense of ease.",

            image: "/assets/images/banner.webp",

            imageAlt: "Najibzadeh knitwear collection",

            mobileImagePosition: "60% center",

            desktopImagePosition: "center",

            action: {
                label: "Shop Knitwear",

                href: "/shop?category=knitwear",
            },
        },

        intro: {
            eyebrow: "The Texture",

            title: "Softness with structure.",

            description:
                "Knitwear is treated as architecture in a quieter register: fine gauge, considered weight and shapes that sit cleanly under tailoring or stand alone.",
        },

        products: [
            {
                id: "cashmere-crewneck",

                title: "Cashmere Textured Crewneck",

                subtitle: "Charcoal",

                href: "/products/cashmere-textured-crewneck",

                image: "/assets/images/banner.webp",

                imageAlt: "Cashmere Textured Crewneck",

                priceLabel: "$890",

                badge: "Cashmere",

                colors: ["#606060", "#0B0B0B", "#EFEDE7"],
            },

            {
                id: "ribbed-merino-polo",

                title: "Ribbed Merino Polo",

                subtitle: "Deep navy",

                href: "/products/ribbed-merino-polo",

                image: "/assets/images/banner.webp",

                imageAlt: "Ribbed Merino Polo",

                priceLabel: "$640",

                colors: ["#182432", "#50432B"],
            },
        ],

        feature: {
            eyebrow: "The Handle",

            title: "Weight, texture",

            italicTitle: "and restraint.",

            description:
                "Each knit is selected for how it feels in hand and how it settles into the rest of the wardrobe.",

            image: "/assets/images/banner.webp",

            imageAlt: "Najibzadeh knitwear texture",
        },

        finalCTA: {
            eyebrow: "Wardrobe Service",

            title: "Layer the season with intention.",

            description:
                "Explore knitwear selected around your climate, wardrobe and daily rhythm.",

            image: "/assets/images/banner.webp",

            imageAlt: "Najibzadeh knitwear appointment",

            action: {
                label: "Speak to a Stylist",

                href: "/contact-us",
            },
        },
    },
};

export async function getSubcategoryLandingPageBySlug(
    categorySlug: string,
    subcategorySlug: string,
) {
    /*
     * TODO: Replace with database query.
     *
     * Example:
     * return db.subcategoryPage.findUnique({
     *   where: { categorySlug_subcategorySlug: { categorySlug, subcategorySlug } },
     *   include: { products: true },
     * });
     */
    return (
        fakeSubcategoryPages[`${categorySlug}/${subcategorySlug}`] ??
        buildFallbackSubcategoryPage(categorySlug, subcategorySlug)
    );
}

export async function getSubcategoryLandingStaticParams() {
    /*
     * TODO: Replace with subcategory slug query when the database is connected.
     */
    const params = [
        ...Object.values(fakeSubcategoryPages).map((subcategory) => ({
            categorySlug: subcategory.categorySlug,
            subcategorySlug: subcategory.slug,
        })),

        ...Object.values(fakeCategoryPages).flatMap((category) =>
            category.subcategories.map((subcategory) => ({
                categorySlug: category.slug,
                subcategorySlug: subcategory.id,
            })),
        ),
    ];

    return Array.from(
        new Map(
            params.map((item) => [
                `${item.categorySlug}/${item.subcategorySlug}`,
                item,
            ]),
        ).values(),
    );
}

function buildFallbackSubcategoryPage(
    categorySlug: string,
    subcategorySlug: string,
) {
    const category = fakeCategoryPages[categorySlug];

    if (!category) {
        return null;
    }

    const subcategory =
        category.subcategories.find((item) => item.id === subcategorySlug) ??
        null;

    if (!subcategory) {
        return null;
    }

    return {
        id: `subcategory-${category.slug}-${subcategory.id}`,

        slug: subcategory.id,

        categorySlug: category.slug,

        categoryName: category.name,

        name: subcategory.title,

        breadcrumbLabel: subcategory.title,

        hero: {
            eyebrow: `Najibzadeh ${subcategory.title}`,

            title: `${subcategory.title}\nby Najibzadeh.`,

            description:
                "A focused product edit shaped around material, proportion and the quiet character of the Najibzadeh wardrobe.",

            image: subcategory.image,

            imageAlt: subcategory.imageAlt ?? subcategory.title,

            mobileImagePosition: subcategory.imagePosition ?? "center",

            desktopImagePosition: subcategory.imagePosition ?? "center",

            action: {
                label: `Shop ${subcategory.title}`,

                href: `/shop?category=${subcategory.id}`,
            },
        },

        intro: {
            eyebrow: "The Selection",

            title: "Designed to sit naturally in the wardrobe.",

            description:
                "This temporary page is ready for database content. Replace the fake query with your backend data and the layout will keep the same editorial rhythm.",
        },

        products: buildFallbackProducts(subcategory),

        feature: {
            eyebrow: "The Detail",

            title: "Material, finish",

            italicTitle: "and proportion.",

            description:
                "Each product card is ready for real inventory images, pricing and availability from the database.",

            image: subcategory.image,

            imageAlt: subcategory.imageAlt ?? subcategory.title,

            mobileImagePosition: subcategory.imagePosition ?? "center",

            desktopImagePosition: subcategory.imagePosition ?? "center",
        },

        finalCTA: {
            eyebrow: "Private Service",

            title: `Explore ${subcategory.title.toLowerCase()} with guidance.`,

            description:
                "Use this page as the final data shape for product-led subcategory storytelling.",

            image: category.finalCTA.image,

            imageAlt: category.finalCTA.imageAlt,

            imagePosition: category.finalCTA.imagePosition,

            action: {
                label: "Speak to a Stylist",

                href: "/contact-us",
            },
        },
    } satisfies SubcategoryPageData;
}

function buildFallbackProducts(
    subcategory: CategorySubcategory,
): CategoryProduct[] {
    return [
        {
            id: `${subcategory.id}-signature-piece`,

            title: `Signature ${subcategory.title}`,

            subtitle: "Najibzadeh edit",

            href: `/products/${subcategory.id}-signature-piece`,

            image: subcategory.image,

            imageAlt: subcategory.imageAlt ?? subcategory.title,

            imagePosition: subcategory.imagePosition,

            priceLabel: "$1,280",

            badge: "Edit",

            colors: ["#0B0B0B", "#606060"],
        },

        {
            id: `${subcategory.id}-seasonal-piece`,

            title: `Seasonal ${subcategory.title}`,

            subtitle: "Limited selection",

            href: `/products/${subcategory.id}-seasonal-piece`,

            image: subcategory.image,

            imageAlt: subcategory.imageAlt ?? subcategory.title,

            imagePosition: subcategory.imagePosition,

            priceLabel: "$980",

            colors: ["#50432B", "#EFEDE7"],
        },
    ];
}
