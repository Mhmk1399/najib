import type {
  ColorStorySlide,
  ColorStorySliderProps,
} from "./color-story-slider.types";
import { ColorStorySliderClient } from "./color-story-slider-client";

const FALLBACK_COLOR = "#4B4642";

function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function warnDev(message: string): void {
  if (process.env.NODE_ENV !== "production") {
    console.warn(`[ColorStorySlider] ${message}`);
  }
}

function resolveInitialIndex(
  slides: readonly ColorStorySlide[],
  initialSlideId: string | undefined,
  sectionId: string,
): number {
  if (!initialSlideId) return 0;

  const found = slides.findIndex((s) => s.id === initialSlideId);

  if (found === -1) {
    warnDev(
      `Section "${sectionId}": initialSlideId "${initialSlideId}" not found. Defaulting to first slide.`,
    );
    return 0;
  }

  return found;
}

function validateSlides(
  sectionId: string,
  slides: readonly ColorStorySlide[],
): void {
  if (process.env.NODE_ENV === "production") return;

  const seenIds = new Set<string>();
  const seenHrefs = new Set<string>();

  for (const slide of slides) {
    if (!slide.id.trim()) {
      warnDev(`Section "${sectionId}" has a slide with an empty id.`);
    } else if (seenIds.has(slide.id)) {
      warnDev(`Section "${sectionId}" has duplicate slide id "${slide.id}".`);
    } else {
      seenIds.add(slide.id);
    }

    if (!slide.title.trim()) {
      warnDev(
        `Section "${sectionId}" has a slide with an empty title (id: "${slide.id}").`,
      );
    }

    if (!slide.description.trim()) {
      warnDev(
        `Section "${sectionId}" has a slide with an empty description (id: "${slide.id}").`,
      );
    }

    if (!slide.image.src.trim()) {
      warnDev(
        `Section "${sectionId}" has a slide with an empty image src (id: "${slide.id}").`,
      );
    }

    if (!slide.image.alt.trim()) {
      warnDev(
        `Section "${sectionId}" has a slide with empty image alt text (id: "${slide.id}").`,
      );
    }

    if (
      !Number.isFinite(slide.image.width) ||
      !Number.isFinite(slide.image.height) ||
      slide.image.width <= 0 ||
      slide.image.height <= 0
    ) {
      warnDev(
        `Section "${sectionId}" has invalid image dimensions for slide "${slide.id}".`,
      );
    }

    if (!/^#[0-9A-Fa-f]{3,8}$/.test(slide.dominantColor)) {
      warnDev(
        `Section "${sectionId}" has an invalid dominantColor "${slide.dominantColor}" for slide "${slide.id}". Using fallback "${FALLBACK_COLOR}".`,
      );
    }

    if (!slide.contentTone) {
      warnDev(
        `Section "${sectionId}" has a slide with missing contentTone (id: "${slide.id}"). Defaulting to "light".`,
      );
    }

    if (slide.href) {
      if (seenHrefs.has(slide.href)) {
        warnDev(`Section "${sectionId}" has duplicate href "${slide.href}".`);
      } else {
        seenHrefs.add(slide.href);
      }
    }
  }
}

export function ColorStorySlider(props: ColorStorySliderProps) {
  const sectionId =
    typeof props.id === "string" && props.id.trim().length > 0
      ? props.id.trim()
      : "color-story-slider";

  const locale = props.locale === "en" ? "en" : "fa";
  const direction = locale === "fa" ? "rtl" : "ltr";
  const headingId = `${sectionId}-heading`;
  const enablePointerDrag = props.enablePointerDrag !== false;

  const slides = Array.isArray(props.slides) ? props.slides : [];

  validateSlides(sectionId, slides);

  if (slides.length === 0) {
    return null;
  }

  const initialIndex = resolveInitialIndex(
    slides,
    props.initialSlideId,
    sectionId,
  );

  return (
    <section
      id={sectionId}
      dir={direction}
      aria-labelledby={headingId}
      className={cn("relative overflow-hidden", props.className)}
    >
      <div
        className={cn(
          "mx-auto max-w-[1500px] px-5 pb-6 pt-12 sm:px-8 sm:pb-8 sm:pt-16 lg:px-12 xl:px-16 2xl:px-20",
          locale === "fa" ? "text-right" : "text-left",
        )}
      >
        <header className="mb-10 max-w-2xl sm:mb-14 lg:mb-16">
          {props.eyebrow ? (
            <p className="text-xs tracking-[0.14em] text-[#A94420]">
              {props.eyebrow}
            </p>
          ) : null}

          <h2
            id={headingId}
            className="mt-3 text-3xl font-light leading-[1.12] text-[#231F20] dark:text-[#F8F5F0] sm:text-4xl lg:text-5xl"
          >
            {props.title}
          </h2>

          {props.description ? (
            <p className="mt-4 max-w-xl text-sm leading-8 text-[#6C6662] dark:text-[#B8B2AC] sm:text-base">
              {props.description}
            </p>
          ) : null}
        </header>
      </div>

      <ColorStorySliderClient
        slides={slides}
        initialIndex={initialIndex}
        enablePointerDrag={enablePointerDrag}
        locale={locale}
        sectionId={sectionId}
      />

      <ul
        className="sr-only"
        aria-label={locale === "fa" ? "همه اسلایدها" : "All slides"}
      >
        {slides.map((slide, idx) => (
          <li key={slide.id}>
            <article>
              <h3>{slide.title}</h3>
              <p>{slide.description}</p>
              {slide.href && slide.linkLabel ? (
                <a href={slide.href}>{slide.linkLabel}</a>
              ) : null}
              <p aria-label={locale === "fa" ? "شماره اسلاید" : "Slide number"}>
                {idx + 1} {locale === "fa" ? "از" : "of"} {slides.length}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
