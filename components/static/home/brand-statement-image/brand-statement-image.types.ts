export type BrandStatementImageSource = {
    readonly src: string;
    readonly width: number;
    readonly height: number;
    readonly alt: string;
};

export type BrandStatementContentTone = "light" | "dark";

export type BrandStatementObjectPosition =
    | "center"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "center-left"
    | "center-right";

export type BrandStatementOverlayStrength = "none" | "soft" | "medium";

export type BrandStatementImageProps = {
    readonly id?: string;
    readonly statement: string;
    readonly tagline?: string;
    readonly image: BrandStatementImageSource;
    readonly contentTone?: BrandStatementContentTone;
    readonly objectPosition?: BrandStatementObjectPosition;
    readonly overlayStrength?: BrandStatementOverlayStrength;
    readonly enableScrollReveal?: boolean;
    readonly className?: string;
};