// ─────────────────────────────────────────────────────────────────────────────
// Cinematic Video Hero — Type Definitions
// Najibzadeh Luxury Menswear
// ─────────────────────────────────────────────────────────────────────────────

export type HeroVideoSource = {
    src: string;
    type?: "video/mp4" | "video/webm";
};

export type HeroPosterSource = {
    src: string;
    width: number;
    height: number;
};

export type HeroObjectPosition =
    | "center"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "center-left"
    | "center-right";

export type HeroSlide = {
    id: string;
    number: string;
    eyebrow: string;
    title: string;
    description?: string;
    action: {
        label: string;
        href: string;
        ariaLabel?: string;
    };
    desktopVideo: HeroVideoSource;
    mobileVideo: HeroVideoSource;
    desktopPoster: HeroPosterSource;
    mobilePoster: HeroPosterSource;
    posterAlt: string;
    objectPosition?: HeroObjectPosition;
};

export type CinematicVideoHeroProps = {
    id?: string;
    title: string;
    introduction: string;
    slides: readonly HeroSlide[];
    initialSlideId?: string;
    autoAdvance?: boolean;
    locale?: "fa" | "en";
    className?: string;
};

// Serializable props forwarded from Server to Client
export type CinematicVideoHeroClientProps = {
    id: string;
    title: string;
    introduction: string;
    slides: readonly HeroSlide[];
    initialIndex: number;
    autoAdvance: boolean;
    locale: "fa" | "en";
    className?: string;
};