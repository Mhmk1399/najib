import type {
    CategoryPageData,
} from "@/types/category-page";

/*
 * Temporary data source.
 *
 * Replace the helper functions at the bottom with your database queries when
 * category landing pages are connected to the backend.
 */
export const fakeCategoryPages: Record<
    string,
    CategoryPageData
> = {
    clothing: {
        id: "category-clothing",

        slug: "clothing",

        name: "Clothing",

        breadcrumbLabel:
            "Clothing",

        /* =========================================================
           HERO
        ========================================================== */

        hero: {
            eyebrow:
                "Najibzadeh Clothing",

            title:
                "Modern Clothing.\nConsidered by design.",

            description:
                "A refined wardrobe shaped through proportion, material and quiet confidence. Discover clothing designed for modern life and lasting presence.",

            image:
                "/assets/images/banner.webp",

            imageAlt:
                "Najibzadeh clothing collection",

            mobileImagePosition:
                "62% center",

            desktopImagePosition:
                "center",

            action: {
                label:
                    "Explore Clothing",

                href:
                    "/shop?category=clothing",
            },
        },

        /* =========================================================
           INTRO
        ========================================================== */

        intro: {
            eyebrow:
                "The Collection",

            title:
                "A wardrobe of lasting character.",

            description:
                "At Najibzadeh, clothing is approached with restraint and intention. Each piece is considered through silhouette, texture and function — creating a wardrobe that feels relevant today while remaining meaningful beyond the season.",
        },

        /* =========================================================
           SUBCATEGORIES
        ========================================================== */

        subcategories: [
            {
                id: "jackets",

                title:
                    "Jackets",

                href:
                    "/clothing/jackets",

                image:
                    "/assets/images/banner.webp",

                imagePosition:
                    "center 28%",
            },

            {
                id: "knitwear",

                title:
                    "Knitwear",

                href:
                    "/clothing/knitwear",

                image:
                    "/assets/images/banner.webp",

                imagePosition:
                    "center",
            },

            {
                id: "shirts",

                title:
                    "Shirts",

                href:
                    "/clothing/shirts",

                image:
                    "/assets/images/banner.webp",

                imagePosition:
                    "center",
            },

            {
                id: "trousers",

                title:
                    "Trousers",

                href:
                    "/clothing/trousers",

                image:
                    "/assets/images/banner.webp",

                imagePosition:
                    "center",
            },

            {
                id: "outerwear",

                title:
                    "Outerwear",

                href:
                    "/clothing/outerwear",

                image:
                    "/assets/images/banner.webp",

                imagePosition:
                    "center",
            },

            {
                id: "polos",

                title:
                    "Polos & Essentials",

                href:
                    "/clothing/polos",

                image:
                    "/assets/images/banner.webp",

                imagePosition:
                    "center",
            },
        ],

        /* =========================================================
           FEATURE
        ========================================================== */

        feature: {
            eyebrow:
                "The Najibzadeh Standard",

            title:
                "Material, proportion",

            italicTitle:
                "and quiet distinction.",

            description:
                "Exceptional materials meet precise construction to create clothing that feels effortless in the present and remains relevant for years to come.",

            image:
                "/assets/images/banner.webp",

            imageAlt:
                "Najibzadeh tailoring and materials",

            mobileImagePosition:
                "62% center",

            desktopImagePosition:
                "center",
        },

        /* =========================================================
           FINAL CTA
        ========================================================== */

        finalCTA: {
            eyebrow:
                "Private Service",

            title:
                "Discover your personal wardrobe.",

            description:
                "Explore clothing selected around your style, proportions and the way you live.",

            image:
                "/assets/images/banner.webp",

            imageAlt:
                "Najibzadeh private clothing experience",

            imagePosition:
                "center",

            action: {
                label:
                    "Start Your Journey",

                href:
                    "/appointments",
            },
        },
    },
};

export async function getCategoryLandingPageBySlug(categorySlug: string) {
    /*
     * TODO: Replace with database query.
     *
     * Example:
     * return db.categoryPage.findUnique({
     *   where: { slug: categorySlug },
     *   include: { subcategories: true },
     * });
     */
    return fakeCategoryPages[categorySlug] ?? null;
}

export async function getCategoryLandingStaticParams() {
    /*
     * TODO: Replace with category slug query when the database is connected.
     */
    return Object.values(fakeCategoryPages).map((category) => ({
        categorySlug: category.slug,
    }));
}
