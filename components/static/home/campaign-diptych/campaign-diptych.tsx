import Image from "next/image";
import Link from "next/link";

import {
  HOME_BODY_TEXT_CLASS,
  HOME_EYEBROW_ACCENT_CLASS,
  HOME_EYEBROW_LINE_CLASS,
  HOME_EYEBROW_ROW_CLASS,
  HOME_HEADER_GRID_CLASS,
  HOME_HEADER_TITLE_COLUMN_CLASS,
  HOME_PAGE_SURFACE_CLASS,
  HOME_SECTION_CONTAINER_CLASS,
  HOME_SECTION_PADDING_X_CLASS,
  HOME_SECTION_SPACING_CLASS,
  HOME_SECTION_TITLE_CLASS,
} from "../home-section-classes";
import type {
  CampaignDiptychLocale,
  CampaignDiptychObjectPosition,
  CampaignDiptychPanel,
  CampaignDiptychProps,
} from "./campaign-diptych.types";

const OBJECT_POSITION_CLASSES: Record<CampaignDiptychObjectPosition, string> = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
  "center-left": "object-[35%_50%]",
  "center-right": "object-[65%_50%]",
  "center-top": "object-top",
};

const PANEL_LAYOUT_CLASSES: Record<CampaignDiptychPanel["layout"], string> = {
  lead: "lg:col-span-7",
  support: "lg:col-span-5 lg:mt-16 xl:mt-24",
};

const PANEL_ASPECT_CLASSES: Record<CampaignDiptychPanel["layout"], string> = {
  lead: "aspect-[4/5] lg:aspect-[5/6]",
  support: "aspect-[4/5]",
};

const PANEL_SIZES: Record<CampaignDiptychPanel["layout"], string> = {
  lead: "(max-width: 1023px) 100vw, 58vw",
  support: "(max-width: 1023px) 100vw, 40vw",
};

const SINGLE_PANEL_ITEM_CLASS = "lg:col-span-8 lg:col-start-3";
const SINGLE_PANEL_SIZES = "(max-width: 1023px) 100vw, 66vw";

const ARROW_MOTION_CLASSES: Record<CampaignDiptychLocale, string> = {
  fa: "transition-transform duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none group-hover:-translate-x-1 group-focus-visible:-translate-x-1",
  en: "transition-transform duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none group-hover:translate-x-1 group-focus-visible:translate-x-1",
};

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function warnInDevelopment(message: string): void {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[CampaignDiptych] ${message}`);
  }
}

function getPanels(
  panels:
    | CampaignDiptychProps["panels"]
    | readonly (CampaignDiptychPanel | null | undefined)[]
    | undefined,
): readonly CampaignDiptychPanel[] {
  if (!Array.isArray(panels)) {
    return [];
  }

  return panels.filter(
    (panel): panel is CampaignDiptychPanel =>
      panel !== null && panel !== undefined,
  );
}

function validatePanels(
  sectionId: string,
  panels: readonly CampaignDiptychPanel[],
): void {
  if (process.env.NODE_ENV === "production") {
    return;
  }

  if (panels.length !== 2) {
    warnInDevelopment(
      `Section "${sectionId}" expects exactly 2 panels, received ${panels.length}.`,
    );
  }

  if (panels.length > 2) {
    warnInDevelopment(
      `Section "${sectionId}" received more than 2 panels. Only the first 2 will be rendered.`,
    );
  }

  const seenIds = new Set<string>();
  const seenHrefs = new Set<string>();

  for (const panel of panels) {
    const panelId = panel.id.trim();
    const title = panel.title.trim();
    const href = panel.action.href.trim();
    const alt = panel.image.alt.trim();
    const { width, height } = panel.image;

    if (!panelId) {
      warnInDevelopment(
        `Section "${sectionId}" contains a panel with an empty id.`,
      );
    } else if (seenIds.has(panelId)) {
      warnInDevelopment(
        `Section "${sectionId}" contains duplicate panel id "${panelId}".`,
      );
    } else {
      seenIds.add(panelId);
    }

    if (!title) {
      warnInDevelopment(
        `Section "${sectionId}" contains a panel with an empty title.`,
      );
    }

    if (!href) {
      warnInDevelopment(
        `Section "${sectionId}" contains a panel with an empty href.`,
      );
    } else if (seenHrefs.has(href)) {
      warnInDevelopment(
        `Section "${sectionId}" contains duplicate href "${href}".`,
      );
    } else {
      seenHrefs.add(href);
    }

    if (!alt) {
      warnInDevelopment(
        `Section "${sectionId}" contains a panel with empty image alt text.`,
      );
    }

    if (
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0
    ) {
      warnInDevelopment(
        `Section "${sectionId}" contains invalid image dimensions for panel "${panelId || "unknown"}".`,
      );
    }
  }
}

type ArrowIconProps = {
  readonly direction: "left" | "right";
  readonly className?: string;
};

function ArrowIcon({ direction, className }: ArrowIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={cn("size-[18px] shrink-0", className)}
    >
      {direction === "left" ? (
        <path
          d="M19 12H5m0 0 6-6m-6 6 6 6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M5 12h14m0 0-6-6m6 6-6 6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export function CampaignDiptych(props: CampaignDiptychProps) {
  const sectionId =
    typeof props.id === "string" && props.id.trim().length > 0
      ? props.id.trim()
      : "campaign-diptych";

  const locale: CampaignDiptychLocale = props.locale === "en" ? "en" : "fa";
  const direction = locale === "fa" ? "rtl" : "ltr";
  const textAlignmentClass = locale === "fa" ? "text-right" : "text-left";
  const headingId = `${sectionId}-title`;

  const sectionEyebrow = props.eyebrow?.trim();
  const sectionTitle = props.title.trim();
  const sectionDescription = props.description?.trim();

  const allPanels = getPanels(props.panels);
  validatePanels(sectionId, allPanels);

  if (allPanels.length === 0) {
    return null;
  }

  const panels = allPanels.slice(0, 2);
  const isSinglePanel = panels.length === 1;
  const arrowDirection = locale === "fa" ? "left" : "right";

  return (
    <section
      id={sectionId}
      dir={direction}
      aria-labelledby={headingId}
      className={cn(
        HOME_PAGE_SURFACE_CLASS,
        HOME_SECTION_SPACING_CLASS,
        props.className,
      )}
    >
      <div
        className={`${HOME_SECTION_CONTAINER_CLASS} ${HOME_SECTION_PADDING_X_CLASS}`}
      >
        <header className={cn(HOME_HEADER_GRID_CLASS, textAlignmentClass)}>
          <div className={HOME_HEADER_TITLE_COLUMN_CLASS}>
            {sectionEyebrow ? (
              <div className={HOME_EYEBROW_ROW_CLASS}>
                <span className={HOME_EYEBROW_ACCENT_CLASS}>
                  {sectionEyebrow}
                </span>
                <span aria-hidden="true" className={HOME_EYEBROW_LINE_CLASS} />
              </div>
            ) : null}

            <h2 id={headingId} className={`${HOME_SECTION_TITLE_CLASS} mt-3`}>
              {sectionTitle}
            </h2>
          </div>

          {sectionDescription ? (
            <p
              className={`${HOME_BODY_TEXT_CLASS} max-w-xl lg:col-span-4 lg:col-start-9`}
            >
              {sectionDescription}
            </p>
          ) : null}
        </header>

        <ul className="mt-12 grid list-none gap-12 p-0 sm:mt-14 sm:gap-14 lg:mt-16 lg:grid-cols-12 lg:gap-10 xl:mt-20 xl:gap-12">
          {panels.map((panel) => {
            const actionAriaLabel = panel.action.ariaLabel?.trim();
            const objectPositionClass =
              OBJECT_POSITION_CLASSES[panel.objectPosition ?? "center"];
            const sizes = isSinglePanel
              ? SINGLE_PANEL_SIZES
              : PANEL_SIZES[panel.layout];

            return (
              <li
                key={panel.id}
                className={
                  isSinglePanel
                    ? SINGLE_PANEL_ITEM_CLASS
                    : PANEL_LAYOUT_CLASSES[panel.layout]
                }
              >
                <article className="h-full">
                  <Link
                    href={panel.action.href}
                    aria-label={actionAriaLabel || panel.action.label}
                    className={cn(
                      "group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A94420] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FCFAF7] dark:focus-visible:ring-[#E18A68] dark:focus-visible:ring-offset-[#0B1117]",
                      textAlignmentClass,
                    )}
                  >
                    <figure className="flex h-full flex-col">
                      <div
                        className={cn(
                          "relative overflow-hidden",
                          PANEL_ASPECT_CLASSES[panel.layout],
                        )}
                      >
                        <Image
                          src={panel.image.src}
                          alt={panel.image.alt}
                          fill
                          loading="lazy"
                          quality={82}
                          draggable={false}
                          sizes={sizes}
                          className={cn(
                            "scale-100 object-cover transition-transform duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none group-hover:scale-[1.018] group-focus-visible:scale-[1.018]",
                            objectPositionClass,
                          )}
                        />
                      </div>

                      <figcaption className="mt-5 sm:mt-6">
                        <div className={`${HOME_EYEBROW_ROW_CLASS} mb-2`}>
                          <span className={HOME_EYEBROW_ACCENT_CLASS}>
                            {panel.eyebrow}
                          </span>
                          <span
                            aria-hidden="true"
                            className={HOME_EYEBROW_LINE_CLASS}
                          />
                        </div>

                        <h3 className="text-xl font-normal leading-tight text-[#231F20] dark:text-[#F8F5F0] sm:text-2xl lg:text-3xl">
                          {panel.title}
                        </h3>

                        <p className="mt-3 max-w-xl text-sm leading-7 text-[#6C6662] dark:text-[#B8B2AC]">
                          {panel.description}
                        </p>

                        <p className="mt-5">
                          <span className="inline-flex min-h-11 items-center gap-2 text-sm text-[#231F20] dark:text-[#F8F5F0]">
                            <span className="underline underline-offset-4 decoration-[#231F20]/30 transition-colors duration-300 motion-reduce:transition-none group-hover:decoration-[#231F20] group-focus-visible:decoration-[#231F20] dark:decoration-[#F8F5F0]/30 dark:group-hover:decoration-[#F8F5F0] dark:group-focus-visible:decoration-[#F8F5F0]">
                              {panel.action.label}
                            </span>

                            <span className="text-[#A94420] dark:text-[#E18A68]">
                              <ArrowIcon
                                direction={arrowDirection}
                                className={ARROW_MOTION_CLASSES[locale]}
                              />
                            </span>
                          </span>
                        </p>
                      </figcaption>
                    </figure>
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
