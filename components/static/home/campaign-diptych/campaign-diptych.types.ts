export type CampaignDiptychLocale = "fa" | "en";

export type CampaignDiptychObjectPosition =
    | "center"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "center-left"
    | "center-right"
    | "center-top";

export type CampaignDiptychImage = {
    readonly src: string;
    readonly width: number;
    readonly height: number;
    readonly alt: string;
};

export type CampaignDiptychAction = {
    readonly label: string;
    readonly href: string;
    readonly ariaLabel?: string;
};

export type CampaignDiptychPanel = {
    readonly id: string;
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly image: CampaignDiptychImage;
    readonly action: CampaignDiptychAction;
    readonly layout: "lead" | "support";
    readonly objectPosition?: CampaignDiptychObjectPosition;
};

export type CampaignDiptychPanels = readonly [
    CampaignDiptychPanel,
    CampaignDiptychPanel,
];

export type CampaignDiptychProps = {
    readonly id?: string;
    readonly eyebrow?: string;
    readonly title: string;
    readonly description?: string;
    readonly panels: CampaignDiptychPanels;
    readonly locale?: CampaignDiptychLocale;
    readonly className?: string;
};