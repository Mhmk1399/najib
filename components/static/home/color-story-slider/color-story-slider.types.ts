export type ColorStoryLocale = "fa" | "en";

export type ColorStoryContentTone = "light" | "dark";

export type ColorStoryObjectPosition =
    | "center"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "center-left"
    | "center-right";

export type ColorStoryImage = {
    readonly src: string;
    readonly width: number;
    readonly height: number;
    readonly alt: string;
};

export type ColorStorySlide = {
    readonly id: string;
    readonly number: string;
    readonly title: string;
    readonly description: string;
    readonly image: ColorStoryImage;
    /**
     * Generate this value once during media upload or build-time image processing.
     * Do not extract it in the browser.
     * Should be slightly desaturated and medium-to-dark in luminance.
     */
    readonly dominantColor: `#${string}`;
    readonly contentTone: ColorStoryContentTone;
    readonly href?: string;
    readonly linkLabel?: string;
    readonly objectPosition?: ColorStoryObjectPosition;
};

export type ColorStorySliderProps = {
    readonly id?: string;
    readonly eyebrow?: string;
    readonly title: string;
    readonly description?: string;
    readonly slides: readonly ColorStorySlide[];
    readonly initialSlideId?: string;
    readonly enablePointerDrag?: boolean;
    readonly locale?: ColorStoryLocale;
    readonly className?: string;
};