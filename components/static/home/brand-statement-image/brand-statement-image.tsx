import Image from "next/image";

import { BrandStatementImageClient } from "./brand-statement-image-client";
import type {
  BrandStatementContentTone,
  BrandStatementImageProps,
  BrandStatementObjectPosition,
  BrandStatementOverlayStrength,
} from "./brand-statement-image.types";
import {
  HOME_PAGE_SURFACE_CLASS,
  HOME_SECTION_DIVIDER_CLASS,
} from "../home-section-classes";

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

const OBJECT_POSITION_CLASSES: Record<BrandStatementObjectPosition, string> = {
  center: "object-center",
  top: "object-top",
  bottom: "object-bottom",
  left: "object-left",
  right: "object-right",
  "center-left": "object-[35%_50%]",
  "center-right": "object-[65%_50%]",
};

type OverlayKey =
  `${BrandStatementOverlayStrength}-${BrandStatementContentTone}`;

const OVERLAY_CLASSES: Record<OverlayKey, string> = {
  "none-light": "bg-transparent",
  "none-dark": "bg-transparent",
  "soft-light": "bg-black/[0.18]",
  "soft-dark": "bg-white/10",
  "medium-light": "bg-black/30",
  "medium-dark": "bg-white/[0.22]",
};

const STATEMENT_TONE_CLASSES: Record<BrandStatementContentTone, string> = {
  light: "text-[#F8F5F0]",
  dark: "text-[#231F20]",
};

const TAGLINE_TONE_CLASSES: Record<BrandStatementContentTone, string> = {
  light: "text-white/70",
  dark: "text-black/60",
};

export function BrandStatementImage(props: BrandStatementImageProps) {
  const sectionId =
    typeof props.id === "string" && props.id.trim().length > 0
      ? props.id.trim()
      : "brand-statement-image";

  const headingId = `${sectionId}-heading`;

  const contentTone: BrandStatementContentTone = props.contentTone ?? "light";
  const objectPosition: BrandStatementObjectPosition =
    props.objectPosition ?? "center";
  const overlayStrength: BrandStatementOverlayStrength =
    props.overlayStrength ?? "soft";
  const enableScrollReveal = props.enableScrollReveal !== false;

  const overlayKey: OverlayKey = `${overlayStrength}-${contentTone}`;
  const objectPositionClass = OBJECT_POSITION_CLASSES[objectPosition];
  const overlayClass = OVERLAY_CLASSES[overlayKey];
  const statementToneClass = STATEMENT_TONE_CLASSES[contentTone];
  const taglineToneClass = TAGLINE_TONE_CLASSES[contentTone];

  return (
    <section
      id={sectionId}
      aria-labelledby={headingId}
      className={cn(
        "relative min-h-[100svh] md:min-h-[125svh] lg:min-h-[140svh]",
        "overflow-clip",
        HOME_PAGE_SURFACE_CLASS,
        HOME_SECTION_DIVIDER_CLASS,
        props.className,
      )}
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-clip">
        <BrandStatementImageClient enableScrollReveal={enableScrollReveal}>
          <div
            data-sticky-inner
            className="relative h-full w-full overflow-hidden will-change-transform"
          >
            <Image
              src={props.image.src}
              alt={props.image.alt}
              fill
              loading="lazy"
              quality={84}
              draggable={false}
              sizes="100vw"
              className={cn("object-cover", objectPositionClass)}
            />

            <div
              aria-hidden="true"
              data-overlay
              className={cn(
                "pointer-events-none absolute inset-0 z-10",
                overlayClass,
              )}
            />

            <div
              aria-hidden="true"
              data-left-cover
              className="absolute inset-y-0 left-0 z-20 w-1/2 bg-[#FCFAF7] dark:bg-[#0B1117]"
            />

            <div
              aria-hidden="true"
              data-right-cover
              className="absolute inset-y-0 right-0 z-20 w-1/2 bg-[#FCFAF7] dark:bg-[#0B1117]"
            />

            <div
              data-statement-group
              className={cn(
                "pointer-events-none absolute inset-x-0 top-[58%] z-30",
                "px-5 text-center sm:px-8 lg:top-[60%]",
              )}
            >
              <h2
                id={headingId}
                className={cn(
                  "text-3xl font-light leading-[1.2] tracking-tight",
                  "sm:text-4xl lg:text-6xl xl:text-7xl",
                  statementToneClass,
                )}
              >
                {props.statement}
              </h2>

              {props.tagline ? (
                <p
                  data-tagline
                  className={cn(
                    "mt-4 text-[10px] uppercase tracking-[0.24em] sm:text-xs",
                    taglineToneClass,
                  )}
                >
                  {props.tagline}
                </p>
              ) : null}
            </div>
          </div>
        </BrandStatementImageClient>
      </div>
    </section>
  );
}
