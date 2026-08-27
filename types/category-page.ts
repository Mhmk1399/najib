export type CategorySubcategory = {
    id: string;

    title: string;

    href: string;

    image: string;

    imageAlt?: string;

    imagePosition?: string;
};

export type CategoryProduct = {
    id: string;

    title: string;

    subtitle?: string;

    href: string;

    image: string;

    imageAlt?: string;

    imagePosition?: string;

    priceLabel?: string;

    badge?: string;

    colors?: string[];
};

export type CategoryHero = {
    eyebrow?: string;

    title: string;

    description: string;

    image: string;

    imageAlt?: string;

    mobileImagePosition?: string;

    desktopImagePosition?: string;

    action: {
        label: string;

        href: string;
    };
};

export type CategoryIntro = {
    eyebrow?: string;

    title?: string;

    description: string;
};

export type CategoryFeatureSection = {
    eyebrow?: string;

    title: string;

    italicTitle?: string;

    description: string;

    image: string;

    imageAlt?: string;

    mobileImagePosition?: string;

    desktopImagePosition?: string;
};

export type CategoryFinalCTA = {
    eyebrow?: string;

    title: string;

    description: string;

    image: string;

    imageAlt?: string;

    imagePosition?: string;

    action: {
        label: string;

        href: string;
    };
};

export type CategoryPageData = {
    id: string;

    slug: string;

    name: string;

    breadcrumbLabel?: string;

    hero: CategoryHero;

    intro: CategoryIntro;

    subcategories: CategorySubcategory[];

    feature: CategoryFeatureSection;

    finalCTA: CategoryFinalCTA;
};

export type SubcategoryPageData = {
    id: string;

    slug: string;

    categorySlug: string;

    categoryName: string;

    name: string;

    breadcrumbLabel?: string;

    hero: CategoryHero;

    intro: CategoryIntro;

    products: CategoryProduct[];

    feature: CategoryFeatureSection;

    finalCTA: CategoryFinalCTA;
};
