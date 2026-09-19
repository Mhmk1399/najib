import Image from "next/image";
import Link from "next/link";

import { type CSSProperties } from "react";
import { Layers, Search, Sparkles } from "lucide-react";

import { ArrowLeftIcon, Button } from "@/components/ui/Button";
import { getStorefrontImageStories } from "@/services/catalog/storefront";
import { brandColors, lightTokens } from "@/theme/theme-colors";

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
  colors?: Array<{ _id?: string; name?: LocalizedText; hex?: string }>;
  sizes?: Array<{ _id?: string; name?: LocalizedText; code?: string }>;
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
const numberFormatter = new Intl.NumberFormat("fa-IR");

function fa(value: LocalizedText | null | undefined, fallback = "") {
  return value?.fa?.trim() || value?.en?.trim() || value?.ar?.trim() || fallback;
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

function formatMoney(minor: number | undefined, currency: string | undefined) {
  if (typeof minor !== "number") return "";

  try {
    return new Intl.NumberFormat("fa-IR", {
      style: "currency",
      currency: currency || "IRR",
      maximumFractionDigits: 0,
    }).format(minor / 100);
  } catch {
    return `${numberFormatter.format(minor / 100)} ${currency ?? ""}`.trim();
  }
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

function productName(product: StoryProduct) {
  return fa(product.label, fa(product.name, product.slug));
}

export async function DynamicIslandExperienceSections() {
  const payload =
    (await getStorefrontImageStories().catch(() => null)) as ImageStoriesPayload | null;
  const stories = compactStories(payload?.stories ?? []);
  const completeLookStory = chooseCompleteLook(stories);
  const occasionStories = chooseDistinctStories(
    stories,
    completeLookStory ? [completeLookStory.id] : [],
    3,
  );

  if (!completeLookStory && !occasionStories.length) return null;

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
      dir="rtl"
      lang="fa"
      style={themeVars}
      className="isolate bg-[var(--island-sections-black)] text-[var(--island-sections-white)]"
    >
      {completeLookStory ? (
        <CompleteTheLookSection story={completeLookStory} />
      ) : null}

      {occasionStories.length ? (
        <OccasionIntentSection stories={occasionStories} />
      ) : null}
    </div>
  );
}

function CompleteTheLookSection({ story }: { story: ImageStory }) {
  const products = story.linkedProducts.slice(0, 4);
  const title = fa(story.image.alt, "استایل کامل نجیب زاده");
  const featuredProduct = products[0];

  return (
    <section
      data-image-story-id={story.id}
      data-image-story-url={story.image.url}
      aria-labelledby="complete-look-title"
      className="relative grid min-h-[760px] overflow-hidden border-t border-white/[0.08] lg:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)]"
    >
      <div className="relative order-1 min-h-[460px] overflow-hidden lg:order-2 lg:min-h-[760px]">
        <Image
          src={story.image.url}
          alt={fa(story.image.alt, title)}
          fill
          sizes="(max-width: 1023px) 100vw, 58vw"
          className="object-cover"
          draggable={false}
          style={{
            objectFit: imageFit(story.image.objectFit),
            objectPosition: story.image.objectPosition ?? "center",
          }}
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--island-sections-black-rgb)/0.04)_0%,rgb(var(--island-sections-black-rgb)/0.14)_50%,rgb(var(--island-sections-black-rgb)/0.58)_100%)]"
        />

        <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 sm:inset-x-8 sm:bottom-8">
          <div className="max-w-[310px] border border-white/12 bg-black/35 px-4 py-3 backdrop-blur-xl">
            <p className="text-[10px] leading-5 text-white/62">
              این تصویر به {numberFormatter.format(products.length)} محصول وصل
              است و داینامیک ایلند انتخاب‌های مرتبط را زنده نمایش می‌دهد.
            </p>
          </div>

          <span className="grid size-11 shrink-0 place-items-center border border-white/16 bg-white/[0.08] text-white backdrop-blur-xl">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
        </div>
      </div>

      <div className="order-2 flex min-h-[560px] flex-col justify-center px-5 py-16 sm:px-8 lg:order-1 lg:min-h-[760px] lg:px-12 xl:px-16">
        <div className="max-w-[620px]">
          <div className="flex items-center gap-3 text-[10px] font-medium text-[var(--island-sections-copper)] sm:text-[11px]">
            <span className="h-px w-8 bg-[var(--island-sections-copper)]" />
            <span>ست پیشنهادی</span>
          </div>

          <h2
            id="complete-look-title"
            className="mt-5 max-w-[590px] text-balance text-[clamp(2.9rem,11vw,4.7rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-[clamp(3.5rem,7vw,5.5rem)] lg:text-[clamp(3.7rem,4.8vw,5.9rem)]"
          >
            {title}
          </h2>

          <p className="mt-5 max-w-[510px] text-pretty text-[12px] leading-7 text-white/62 sm:text-[13px] lg:text-[14px] lg:leading-8">
            هر محصول این تصویر به همان تجربه پایین صفحه وصل است؛ کاربر می‌تواند
            محصول را انتخاب کند، جزئیاتش را زیر همین سکشن ببیند و بعد وارد
            صفحه محصول شود.
          </p>

          <div className="mt-8 grid gap-2.5 sm:mt-10">
            {products.map((product, index) => (
              <ProductRow key={product.id} product={product} index={index} />
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
            {featuredProduct ? (
              <Button
                href={featuredProduct.href}
                variant="cream"
                size="lg"
                icon={<ArrowLeftIcon />}
                iconPosition="right"
                className="!tracking-normal"
              >
                دیدن محصول شاخص
              </Button>
            ) : null}

            <Button
              href="/shop"
              variant="outline"
              size="lg"
              icon={<Search className="size-4" aria-hidden="true" />}
              iconPosition="right"
              className="border-white/28 bg-white/[0.03] !tracking-normal text-white backdrop-blur-md hover:border-white hover:bg-white hover:text-black"
            >
              جستجو در فروشگاه
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductRow({
  product,
  index,
}: {
  product: StoryProduct;
  index: number;
}) {
  const name = productName(product);
  const price = formatMoney(product.priceMinor, product.currency);

  return (
    <Link
      href={product.href}
      data-image-story-url={product.image?.url}
      aria-label={`مشاهده ${name}`}
      className="group grid min-h-[86px] grid-cols-[64px_1fr_auto] items-center gap-3 border border-white/10 bg-white/[0.045] p-2.5 transition-[border-color,background-color] duration-500 hover:border-white/24 hover:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
    >
      <span className="relative aspect-[4/5] overflow-hidden bg-white/[0.07]">
        {product.image?.url ? (
          <Image
            src={product.image.url}
            alt=""
            fill
            sizes="64px"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            style={{
              objectFit: imageFit(product.image.objectFit),
              objectPosition: product.image.objectPosition ?? "center",
            }}
          />
        ) : null}
      </span>

      <span className="min-w-0">
        <span className="text-[9px] text-[var(--island-sections-copper)]">
          انتخاب {numberFormatter.format(index + 1)}
        </span>
        <strong className="mt-1 block truncate text-[14px] font-semibold leading-6 text-white">
          {name}
        </strong>
        {price ? (
          <span className="mt-1 block text-[10px] text-white/55">{price}</span>
        ) : null}
      </span>

      <span className="grid size-9 place-items-center border border-white/12 text-white/60 transition-[border-color,color,background-color] duration-500 group-hover:border-[var(--island-sections-copper)]/60 group-hover:bg-[var(--island-sections-copper)]/[0.10] group-hover:text-white">
        <ArrowLeftIcon />
      </span>
    </Link>
  );
}

function OccasionIntentSection({ stories }: { stories: ImageStory[] }) {
  return (
    <section
      aria-labelledby="occasion-intent-title"
      className="border-t border-white/[0.08] bg-[var(--island-sections-cream)] px-4 py-16 text-[var(--island-sections-black)] sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <header className="mx-auto flex max-w-[860px] flex-col items-center text-center">
        <div className="flex items-center gap-3 text-[10px] font-semibold text-[var(--island-sections-copper)]">
          <span className="h-px w-7 bg-[var(--island-sections-copper)]" />
          <span>راهنمای انتخاب</span>
          <span className="h-px w-7 bg-[var(--island-sections-copper)]" />
        </div>

        <h2
          id="occasion-intent-title"
          className="mt-4 max-w-[760px] text-balance text-[clamp(2.6rem,10vw,4.4rem)] font-semibold leading-[1.02] tracking-[-0.045em]"
        >
          چند نقطه هوشمند برای داینامیک ایلند
        </h2>

        <p className="mt-5 max-w-[560px] text-[12px] leading-7 text-[var(--island-sections-muted)] sm:text-[13px]">
          هر تصویر این بخش یک context جدا دارد؛ با رسیدن کاربر به هر تصویر،
          ایلند محصولات و پیشنهادهای همان فضا را نمایش می‌دهد.
        </p>
      </header>

      <div className="mx-auto mt-10 grid w-full max-w-[1480px] grid-cols-1 gap-3 md:grid-cols-3 lg:mt-12">
        {stories.map((story, index) => (
          <IntentStoryTile key={story.id} story={story} index={index} />
        ))}
      </div>
    </section>
  );
}

function IntentStoryTile({
  story,
  index,
}: {
  story: ImageStory;
  index: number;
}) {
  const title = fa(story.image.alt, `انتخاب ${numberFormatter.format(index + 1)}`);
  const products = story.linkedProducts.slice(0, 3);

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
        <div className="mb-4 inline-flex items-center gap-2 border border-white/14 bg-white/[0.08] px-3 py-2 text-[10px] text-white/68 backdrop-blur-xl">
          <Layers className="size-3.5 text-[var(--island-sections-copper)]" />
          {numberFormatter.format(story.linkedProducts.length)} محصول مرتبط
        </div>

        <h3 className="max-w-[360px] text-balance text-[clamp(2.2rem,8vw,3.8rem)] font-semibold leading-[0.98] tracking-[-0.045em]">
          {title}
        </h3>

        {products.length ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {products.map((product) => (
              <Link
                key={product.id}
                href={product.href}
                className="border border-white/14 bg-black/30 px-3 py-2 text-[10px] text-white/78 backdrop-blur-xl transition-[border-color,background-color,color] duration-300 hover:border-white/38 hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {productName(product)}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
