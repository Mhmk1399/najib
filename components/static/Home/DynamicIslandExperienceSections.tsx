import Image from "next/image";
import Link from "next/link";
import { type CSSProperties } from "react";
import { Layers } from "lucide-react";
import type { HomeCopy } from "@/lib/i18n/home-copy";
import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/routes";
import { getStorefrontImageStories } from "@/services/catalog/storefront";
import { brandColors, lightTokens } from "@/theme/theme-colors";
import { estedad } from "@/next-persian-fonts/estedad";

/* ==========================================================================
   TYPES
============================================================================ */

type LocalizedText = {
  fa?: string;
  en?: string;
  ar?: string;
};

type StoryImage = {
  id: string;
  url: string;
  alt?: LocalizedText;
  objectFit?: string;
  objectPosition?: string;
};

type StoryProduct = {
  id: string;
  slug: string;
  name?: LocalizedText;
  href: string;
  priceMinor?: number;
  currency?: string;
  label?: LocalizedText;
  image?: StoryImage | null;
  colors?: Array<{
    _id?: string;
    name?: LocalizedText;
    hex?: string;
  }>;
  sizes?: Array<{
    _id?: string;
    name?: LocalizedText;
    code?: string;
  }>;
  tags?: string[];
};

type ImageStory = {
  id: string;
  kind: string;
  image: StoryImage;
  linkedProducts: StoryProduct[];
};

type ImageStoriesPayload = {
  stories?: ImageStory[];
};

type DynamicIslandExperienceSectionsProps = {
  copy: HomeCopy["dynamicIsland"];
  locale: Locale;
};

/* ==========================================================================
   CONSTANTS
============================================================================ */

const preferredHeroKinds = new Set([
  "lookbook",
  "editorial",
  "collection_banner",
]);

const visualStoryKinds = new Set([
  "lookbook",
  "editorial",
  "collection_banner",
  "category_banner",
  "subcategory_banner",
]);

/* ==========================================================================
   HELPERS
============================================================================ */

function localizedText(
  value: LocalizedText | null | undefined,
  locale: Locale,
  fallback = "",
) {
  const currentValue = value?.[locale]?.trim();

  if (currentValue) {
    return currentValue;
  }

  const fallbackOrder: Locale[] =
    locale === "fa"
      ? ["en", "ar"]
      : locale === "en"
        ? ["fa", "ar"]
        : ["fa", "en"];

  for (const fallbackLocale of fallbackOrder) {
    const fallbackValue = value?.[fallbackLocale]?.trim();

    if (fallbackValue) {
      return fallbackValue;
    }
  }

  return fallback;
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(getHtmlLang(locale)).format(value);
}

function formatTemplate(
  template: string,
  values: Record<string, string | number>,
) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function imageFit(value: string | undefined): CSSProperties["objectFit"] {
  if (
    value === "contain" ||
    value === "cover" ||
    value === "fill" ||
    value === "none" ||
    value === "scale-down"
  ) {
    return value;
  }

  return "cover";
}

function compactStories(stories: ImageStory[]) {
  return stories.filter(
    (story) => story.image?.url && story.linkedProducts.length > 0,
  );
}

function chooseCompleteLook(stories: ImageStory[]) {
  return (
    stories.find(
      (story) =>
        preferredHeroKinds.has(story.kind) && story.linkedProducts.length >= 3,
    ) ?? stories.find((story) => story.linkedProducts.length >= 3)
  );
}

function chooseDistinctStories(
  stories: ImageStory[],
  usedStoryIds: string[],
  limit: number,
) {
  const used = new Set(usedStoryIds);

  return stories
    .filter((story) => !used.has(story.id) && visualStoryKinds.has(story.kind))
    .slice(0, limit);
}

function productName(product: StoryProduct, locale: Locale) {
  return localizedText(
    product.label,
    locale,
    localizedText(product.name, locale, product.slug),
  );
}

/* ==========================================================================
   MAIN COMPONENT
============================================================================ */

export async function DynamicIslandExperienceSections({
  copy,
  locale,
}: DynamicIslandExperienceSectionsProps) {
  const payload = (await getStorefrontImageStories().catch(
    () => null,
  )) as ImageStoriesPayload | null;

  const stories = compactStories(payload?.stories ?? []);

  const completeLookStory = chooseCompleteLook(stories);

  const occasionStories = chooseDistinctStories(
    stories,
    completeLookStory ? [completeLookStory.id] : [],
    3,
  );

  if (!completeLookStory && !occasionStories.length) {
    return null;
  }

  const direction = getLocaleDirection(locale);

  const htmlLang = getHtmlLang(locale);

  const themeVars = {
    "--island-sections-black": brandColors.black.hex,
    "--island-sections-black-rgb": brandColors.black.rgb,
    "--island-sections-white": brandColors.white.hex,
    "--island-sections-copper": brandColors.copper.hex,
    "--island-sections-cream": brandColors.cream.hex,
    "--island-sections-muted": lightTokens.textMuted,
  } as CSSProperties;

  return (
    <div
      dir={direction}
      lang={htmlLang}
      style={themeVars}
      className="isolate bg-[var(--island-sections-black)] text-[var(--island-sections-white)]"
    >
      

      {occasionStories.length ? (
        <OccasionIntentSection
          stories={occasionStories}
          copy={copy}
          locale={locale}
        />
      ) : null}
    </div>
  );
}

/* ==========================================================================
   OCCASION INTENT
============================================================================ */

function OccasionIntentSection({
  stories,
  copy,
  locale,
}: {
  stories: ImageStory[];
  copy: HomeCopy["dynamicIsland"];
  locale: Locale;
}) {
  return (
    <section
      aria-labelledby="occasion-intent-title"
      className="border-t border-white/[0.08] bg-[var(--island-sections-cream)] px-4 py-16 text-[var(--island-sections-black)] sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <header className="mx-auto flex max-w-[860px] flex-col items-center text-center">
        <div className="flex items-center gap-3 text-[10px] font-semibold text-[var(--island-sections-copper)]">
          <span
            aria-hidden="true"
            className="h-px w-7 bg-[var(--island-sections-copper)]"
          />

          <span>{copy.occasion.eyebrow}</span>

          <span
            aria-hidden="true"
            className="h-px w-7 bg-[var(--island-sections-copper)]"
          />
        </div>

        <h2
          id="occasion-intent-title"
          className="mt-4 max-w-[760px] text-balance text-3xl lg:text-5xl font-semibold leading-[1.02] tracking-[-0.045em]"
        >
          {copy.occasion.title}
        </h2>

        <p className={`mt-5 max-w-[560px] text-[12px] leading-7 ${estedad.className} text-[var(--island-sections-muted)] sm:text-[13px]`}>
          {copy.occasion.description}
        </p>
      </header>

      <div className="mx-auto mt-10 grid w-full max-w-[1480px] grid-cols-1 gap-3 md:grid-cols-3 lg:mt-12">
        {stories.map((story, index) => (
          <IntentStoryTile
            key={story.id}
            story={story}
            index={index}
            copy={copy}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}

/* ==========================================================================
   INTENT STORY TILE
============================================================================ */

function IntentStoryTile({
  story,
  index,
  copy,
  locale,
}: {
  story: ImageStory;
  index: number;
  copy: HomeCopy["dynamicIsland"];
  locale: Locale;
}) {
  const fallbackTitle = formatTemplate(copy.occasion.storyFallbackTitle, {
    number: formatNumber(index + 1, locale),
  });

  const title = localizedText(story.image.alt, locale, fallbackTitle);

  const products = story.linkedProducts.slice(0, 3);

  const relatedProductsLabel = formatTemplate(
    copy.occasion.relatedProductsLabel,
    {
      count: formatNumber(story.linkedProducts.length, locale),
    },
  );

  return (
    <article
      data-image-story-id={story.id}
      data-image-story-url={story.image.url}
      className="group relative isolate min-h-[520px] overflow-hidden bg-black text-white"
    >
      <Image
        src={story.image.url}
        alt={title}
        fill
        sizes="(max-width: 767px) 100vw, 33vw"
        className="-z-30 object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
        draggable={false}
        style={{
          objectFit: imageFit(story.image.objectFit),
          objectPosition: story.image.objectPosition ?? "center",
        }}
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgb(var(--island-sections-black-rgb)/0.04)_0%,rgb(var(--island-sections-black-rgb)/0.24)_50%,rgb(var(--island-sections-black-rgb)/0.76)_100%)]"
      />

      <div className="absolute inset-x-5 bottom-5 z-10 sm:inset-x-6 sm:bottom-6">
       

        <h3 className="max-w-[360px] text-balance text-3xl font-semibold leading-[0.98] tracking-[-0.045em]">
          {title}
        </h3>

        {products.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {products.map((product) => (
              <Link
                key={product.id}
                href={localizedHref(product.href, locale)}
                className="border border-white/14 bg-black/30 px-3 py-2 text-[10px] text-white/78 backdrop-blur-xl transition-[border-color,background-color,color] duration-300 hover:border-white/38 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {productName(product, locale)}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
