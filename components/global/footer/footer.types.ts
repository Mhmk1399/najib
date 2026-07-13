export type FooterLocale = "fa" | "en";

export type FooterImage = {
    readonly src: string;
    readonly width: number;
    readonly height: number;
    readonly alt: string;
};

export type FooterLink = {
    readonly label: string;
    readonly href: string;
    readonly ariaLabel?: string;
    readonly external?: boolean;
};

export type FooterSection = {
    readonly id: string;
    readonly title: string;
    readonly links: readonly FooterLink[];
};

export type FooterTrustItem = {
    readonly id: string;
    readonly image: FooterImage;
    readonly href?: string;
    readonly ariaLabel?: string;
    readonly external?: boolean;
};

export type FooterProps = {
    readonly id?: string;
    readonly brandLabel: string;
    readonly homeHref?: string;
    readonly logo?: FooterImage;
    readonly description: string;
    readonly sections: readonly FooterSection[];
    readonly trustItems?: readonly FooterTrustItem[];
    readonly socialLinks?: readonly FooterLink[];
    readonly wordmark: string;
    readonly tagline?: string;
    readonly copyrightLabel: string;
    readonly locale?: FooterLocale;
    readonly className?: string;
};