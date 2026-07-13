import Image from "next/image";
import Link from "next/link";

import { SilentLookbookTrack } from "./silent-lookbook-track";
import type {
  LookbookItem,
  LookbookItemSize,
  LookbookLocale,
  LookbookObjectPosition,
  SilentLookbookProps,
} from "./silent-lookbook.types";
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
  HOME_TRACK_PADDING_END_CLASS,
  HOME_TRACK_PADDING_START_CLASS,
} from "../home-section-classes";

const MAX_ITEMS = 8;

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function warnDev(message: string): void {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[SilentLookbook] ${message}`);
  }
}

const OBJECT_POSITION_CLASSES: Record<LookbookObjectPosition, string> = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
  "center-left": "object-[35%_50%]",
  "center-right": "object-[65%_50%]",
};

type SizeConfig = {
  readonly widthClasses: string;
  readonly aspectClass: string;
  readonly verticalOffsetClass: string;
  readonly sizes: string;
};

const SIZE_CONFIG: Record<LookbookItemSize, SizeConfig> = {
  wide: {
    widthClasses: "w-[84vw] max-w-[620px] lg:w-[min(52vw,820px)]",
    aspectClass: "aspect-[3/2]",
    verticalOffsetClass: "lg:mt-0",
    sizes: "(max-width: 767px) 84vw, 52vw",
  },
  portrait: {
    widthClasses: "w-[68vw] max-w-[420px] lg:w-[min(28vw,430px)]",
    aspectClass: "aspect-[3/4]",
    verticalOffsetClass: "lg:mt-8",
    sizes: "(max-width: 767px) 68vw, 28vw",
  },
  "large-portrait": {
    widthClasses: "w-[76vw] max-w-[500px] lg:w-[min(34vw,520px)]",
    aspectClass: "aspect-[3/4]",
    verticalOffsetClass: "lg:mt-8",
    sizes: "(max-width: 767px) 76vw, 34vw",
  },
  landscape: {
    widthClasses: "w-[82vw] max-w-[600px] lg:w-[min(44vw,700px)]",
    aspectClass: "aspect-[3/2]",
    verticalOffsetClass: "lg:mt-10",
    sizes: "(max-width: 767px) 82vw, 44vw",
  },
  narrow: {
    widthClasses: "w-[62vw] max-w-[380px] lg:w-[min(24vw,370px)]",
    aspectClass: "aspect-[2/3]",
    verticalOffsetClass: "lg:mt-6",
    sizes: "(max-width: 767px) 62vw, 24vw",
  },
  "final-wide": {
    widthClasses: "w-[86vw] max-w-[660px] lg:w-[min(56vw,880px)]",
    aspectClass: "aspect-[3/2]",
    verticalOffsetClass: "lg:mt-0",
    sizes: "(max-width: 767px) 86vw, 56vw",
  },
};

function validateItems(
  sectionId: string,
  items: readonly LookbookItem[],
): void {
  if (process.env.NODE_ENV === "production") return;

  const seenIds = new Set<string>();
  const seenHrefs = new Set<string>();

  for (const item of items) {
    if (!item.id.trim()) {
      warnDev(`Section "${sectionId}" contains an item with an empty id.`);
    } else if (seenIds.has(item.id)) {
      warnDev(
        `Section "${sectionId}" contains duplicate item id "${item.id}".`,
      );
    } else {
      seenIds.add(item.id);
    }

    if (!item.title.trim()) {
      warnDev(
        `Section "${sectionId}" contains an item with an empty title (id: "${item.id}").`,
      );
    }

    if (!item.image.src.trim()) {
      warnDev(
        `Section "${sectionId}" contains an item with an empty image src (id: "${item.id}").`,
      );
    }

    if (!item.image.alt.trim()) {
      warnDev(
        `Section "${sectionId}" contains an item with empty image alt text (id: "${item.id}").`,
      );
    }

    if (
      !Number.isFinite(item.image.width) ||
      !Number.isFinite(item.image.height) ||
      item.image.width <= 0 ||
      item.image.height <= 0
    ) {
      warnDev(
        `Section "${sectionId}" contains invalid image dimensions for item "${item.id}".`,
      );
    }

    if (item.href) {
      if (seenHrefs.has(item.href)) {
        warnDev(
          `Section "${sectionId}" contains duplicate href "${item.href}".`,
        );
      } else {
        seenHrefs.add(item.href);
      }
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
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 12H5m0 0 6-6m-6 6 6 6"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 12h14m0 0-6-6m6 6-6 6"
        />
      )}
    </svg>
  );
}

type LookbookItemCardProps = {
  readonly item: LookbookItem;
  readonly locale: LookbookLocale;
};

function LookbookItemCard({ item, locale }: LookbookItemCardProps) {
  const config = SIZE_CONFIG[item.size];
  const objectPositionClass =
    item.objectPosition !== undefined
      ? OBJECT_POSITION_CLASSES[item.objectPosition]
      : "object-center";

  const figureContent = (
    <figure className="flex flex-col">
      <div className={cn("relative overflow-hidden", config.aspectClass)}>
        <Image
          src={item.image.src}
          alt={item.image.alt}
          fill
          loading="lazy"
          quality={82}
          draggable={false}
          sizes={config.sizes}
          className={cn(
            "scale-100 object-cover transition-transform duration-700 ease-out",
            "motion-reduce:transform-none motion-reduce:transition-none",
            item.href
              ? "group-hover:scale-[1.015] group-focus-visible:scale-[1.015]"
              : "",
            objectPositionClass,
          )}
        />
      </div>

      <figcaption className="mt-4 flex items-baseline gap-4">
        <span
          className="text-[10px] tracking-[0.18em] text-[#A94420] dark:text-[#E18A68]"
          aria-hidden="true"
        >
          {item.number}
        </span>
        <span className="text-sm text-[#231F20] dark:text-[#F8F5F0] sm:text-base">
          {item.title}
        </span>
      </figcaption>
    </figure>
  );

  const focusRingClasses =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A94420] dark:focus-visible:ring-[#E18A68] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FCFAF7] dark:focus-visible:ring-offset-[#0B1117]";

  if (item.href) {
    return (
      <Link
        href={item.href}
        className={cn("group block", focusRingClasses)}
        aria-label={`${item.number} — ${item.title}`}
      >
        {figureContent}
      </Link>
    );
  }

  return <div className="block">{figureContent}</div>;
}

export function SilentLookbook(props: SilentLookbookProps) {
  const sectionId =
    typeof props.id === "string" && props.id.trim().length > 0
      ? props.id.trim()
      : "silent-lookbook";

  const locale: LookbookLocale = props.locale === "en" ? "en" : "fa";
  const direction = locale === "fa" ? "rtl" : "ltr";
  const enablePointerDrag = props.enablePointerDrag !== false;
  const headingId = `${sectionId}-title`;
  const trackLabel =
    locale === "fa" ? "لوک‌بوک تصویری نجیب‌زاده" : "Najibzadeh Visual Lookbook";

  const rawItems: readonly LookbookItem[] = Array.isArray(props.items)
    ? props.items
    : [];

  if (process.env.NODE_ENV !== "production" && rawItems.length > MAX_ITEMS) {
    warnDev(
      `Section "${sectionId}" received ${rawItems.length} items. Only the first ${MAX_ITEMS} will be rendered on the homepage.`,
    );
  }

  const items = rawItems.slice(0, MAX_ITEMS);

  validateItems(sectionId, items);

  if (items.length === 0) {
    return null;
  }

  const sectionEyebrow = props.eyebrow?.trim();
  const sectionTitle = props.title.trim();
  const sectionDescription = props.description?.trim();

  const arrowDirection = locale === "fa" ? "left" : "right";
  const arrowHoverClass =
    locale === "fa"
      ? "transition-transform duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none group-hover:-translate-x-1 group-focus-visible:-translate-x-1"
      : "transition-transform duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none group-hover:translate-x-1 group-focus-visible:translate-x-1";

  const focusRingClasses =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A94420] dark:focus-visible:ring-[#E18A68] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FCFAF7] dark:focus-visible:ring-offset-[#0B1117]";

  return (
    <section
      id={sectionId}
      dir={direction}
      aria-labelledby={headingId}
      className={cn(
        HOME_PAGE_SURFACE_CLASS,
        HOME_SECTION_SPACING_CLASS,
        "overflow-x-hidden",
        props.className,
      )}
    >
      <div
        className={`${HOME_SECTION_CONTAINER_CLASS} ${HOME_SECTION_PADDING_X_CLASS}`}
      >
        <header
          className={cn(
            HOME_HEADER_GRID_CLASS,
            locale === "fa" ? "text-right" : "text-left",
          )}
        >
          <div className={HOME_HEADER_TITLE_COLUMN_CLASS}>
            {sectionEyebrow ? (
              <div className={HOME_EYEBROW_ROW_CLASS}>
                <span className={HOME_EYEBROW_ACCENT_CLASS}>
                  {sectionEyebrow}
                </span>
                <span aria-hidden="true" className={HOME_EYEBROW_LINE_CLASS} />
              </div>
            ) : null}

            <h2
              id={headingId}
              className={`${HOME_SECTION_TITLE_CLASS} mt-3`}
            >
              {sectionTitle}
            </h2>
          </div>

          {sectionDescription ? (
            <p className={`${HOME_BODY_TEXT_CLASS} lg:col-span-4 lg:col-start-9`}>
              {sectionDescription}
            </p>
          ) : null}
        </header>
      </div>

      <div className="mt-12 sm:mt-14 lg:mt-16 xl:mt-20">
        <SilentLookbookTrack
          enablePointerDrag={enablePointerDrag}
          locale={locale}
          trackLabel={trackLabel}
        >
          <ul
            className={cn(
              "flex w-max list-none items-start p-0",
              "gap-4 sm:gap-5 lg:gap-7 xl:gap-8",
              "snap-x snap-mandatory lg:snap-proximity",
              HOME_TRACK_PADDING_START_CLASS,
              HOME_TRACK_PADDING_END_CLASS,
            )}
          >
            {items.map((item) => {
              const config = SIZE_CONFIG[item.size];
              return (
                <li
                  key={item.id}
                  className={cn(
                    "flex-none snap-start",
                    config.widthClasses,
                    config.verticalOffsetClass,
                  )}
                >
                  <article>
                    <LookbookItemCard item={item} locale={locale} />
                  </article>
                </li>
              );
            })}
          </ul>
        </SilentLookbookTrack>
      </div>

      {props.finalAction ? (
        <div
          className={`${HOME_SECTION_CONTAINER_CLASS} ${HOME_SECTION_PADDING_X_CLASS} mt-10`}
        >
          <div
            className={cn(
              "flex",
              locale === "fa" ? "justify-start" : "justify-end",
            )}
          >
            <Link
              href={props.finalAction.href}
              aria-label={
                props.finalAction.ariaLabel?.trim() || props.finalAction.label
              }
              className={cn(
                "group inline-flex min-h-11 items-center gap-2",
                "text-sm text-[#231F20] dark:text-[#F8F5F0]",
                "border-b border-[#231F20]/30 dark:border-[#F8F5F0]/30",
                "transition-colors duration-300 motion-reduce:transition-none",
                "hover:border-[#231F20] dark:hover:border-[#F8F5F0]",
                focusRingClasses,
              )}
            >
              <span>{props.finalAction.label}</span>
              <span className="text-[#A94420] dark:text-[#E18A68]">
                <ArrowIcon
                  direction={arrowDirection}
                  className={arrowHoverClass}
                />
              </span>
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
