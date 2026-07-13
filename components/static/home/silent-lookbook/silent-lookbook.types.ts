export type LookbookLocale = "fa" | "en";

export type LookbookObjectPosition =
    | "center"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "center-left"
    | "center-right";

export type LookbookItemSize =
    | "wide"
    | "portrait"
    | "large-portrait"
    | "landscape"
    | "narrow"
    | "final-wide";

export type LookbookImage = {
    readonly src: string;
    readonly width: number;
    readonly height: number;
    readonly alt: string;
};

export type LookbookItem = {
    readonly id: string;
    readonly number: string;
    readonly title: string;
    readonly href?: string;
    readonly image: LookbookImage;
    readonly size: LookbookItemSize;
    readonly objectPosition?: LookbookObjectPosition;
};

export type SilentLookbookAction = {
    readonly label: string;
    readonly href: string;
    readonly ariaLabel?: string;
};

export type SilentLookbookProps = {
    readonly id?: string;
    readonly eyebrow?: string;
    readonly title: string;
    readonly description?: string;
    readonly items: readonly LookbookItem[];
    readonly finalAction?: SilentLookbookAction;
    readonly locale?: LookbookLocale;
    readonly enablePointerDrag?: boolean;
    readonly className?: string;
};