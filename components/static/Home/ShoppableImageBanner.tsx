import Image from "next/image";
import Link from "next/link";

import { type CSSProperties } from "react";

import { ArrowLeftIcon, Button } from "@/components/ui/Button";
import { getStorefrontImageStories } from "@/services/catalog/storefront";
import { brandColors } from "@/theme/theme-colors";

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
  hotspotX?: number;
  hotspotY?: number;
  image?: StoryImage | null;
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

const preferredKinds = new Set([
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

function pickHomeStory(stories: ImageStory[]) {
  return (
    stories.find(
      (story) =>
        preferredKinds.has(story.kind) && story.linkedProducts.length >= 3,
    ) ?? stories.find((story) => story.linkedProducts.length >= 3)
  );
}

export async function ShoppableImageBanner() {
  const payload =
    (await getStorefrontImageStories().catch(() => null)) as ImageStoriesPayload | null;
  const story = pickHomeStory(payload?.stories ?? []);

  if (!story) return null;

  const products = story.linkedProducts.slice(0, 3);
  const title = fa(story.image.alt, "انتخاب‌های خریدپذیر نجیب‌زاده");
  const themeVars = {
    "--shoppable-black": brandColors.black.hex,
    "--shoppable-black-rgb": brandColors.black.rgb,
    "--shoppable-white": brandColors.white.hex,
    "--shoppable-copper": brandColors.copper.hex,
  } as CSSProperties;

  return (
    <section
      dir="rtl"
      lang="fa"
      data-image-story-id={story.id}
      data-image-story-url={story.image.url}
      style={themeVars}
      aria-labelledby="home-shoppable-banner-title"
      className="relative isolate w-full overflow-hidden bg-[var(--shoppable-black)] text-[var(--shoppable-white)]"
    >
      <div className="mx-auto grid min-h-[720px] w-full max-w-[1760px] grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(430px,0.9fr)]">
        <div className="relative min-h-[520px] overflow-hidden lg:min-h-[720px]">
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
            className="absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--shoppable-black-rgb)/0.08)_0%,rgb(var(--shoppable-black-rgb)/0.18)_46%,rgb(var(--shoppable-black-rgb)/0.62)_100%)]"
          />

          {products.map((product, index) =>
            typeof product.hotspotX === "number" &&
            typeof product.hotspotY === "number" ? (
              <Link
                key={`${product.id}-hotspot`}
                href={product.href}
                aria-label={`مشاهده ${fa(product.name, product.slug)}`}
                className="absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center border border-white/70 bg-black/55 text-[11px] font-semibold text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-md transition-[background-color,border-color,transform] duration-500 hover:scale-105 hover:border-[var(--shoppable-copper)] hover:bg-[var(--shoppable-copper)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                style={{
                  left: `${product.hotspotX}%`,
                  top: `${product.hotspotY}%`,
                }}
              >
                {numberFormatter.format(index + 1)}
              </Link>
            ) : null,
          )}
        </div>

        <div className="flex min-h-[520px] flex-col justify-center px-5 py-14 sm:px-8 lg:min-h-[720px] lg:px-10 xl:px-14">
          <div className="max-w-[620px]">
            <div className="flex items-center gap-3 text-[10px] font-medium text-[var(--shoppable-copper)] sm:text-[11px]">
              <span className="h-px w-8 bg-[var(--shoppable-copper)]" aria-hidden="true" />
              <span>تصویر خریدپذیر</span>
            </div>

            <h2
              id="home-shoppable-banner-title"
              className="mt-5 text-balance text-[clamp(2.7rem,10vw,4.8rem)] font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-[clamp(3.4rem,7vw,5.7rem)] lg:text-[clamp(3.7rem,4.8vw,6rem)]"
            >
              {title}
            </h2>

            <p className="mt-5 max-w-[500px] text-pretty text-[12px] leading-7 text-white/62 sm:text-[13px] lg:text-[14px] lg:leading-8">
              این تصویر به سه محصول منتخب وصل شده است؛ هر محصول را مستقیم ببینید
              یا جزیره پایین صفحه را برای پیشنهادهای کامل‌تر باز کنید.
            </p>

            <div className="mt-8 grid gap-2.5 sm:mt-10">
              {products.map((product, index) => {
                const name = fa(product.label, fa(product.name, product.slug));
                const price = formatMoney(product.priceMinor, product.currency);

                return (
                  <Link
                    key={product.id}
                    href={product.href}
                    className="group grid grid-cols-[74px_1fr_auto] items-center gap-3 border border-white/10 bg-white/[0.045] p-2.5 transition-[border-color,background-color] duration-500 hover:border-white/22 hover:bg-white/[0.075] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span className="relative aspect-[4/5] overflow-hidden bg-white/[0.07]">
                      {product.image?.url ? (
                        <Image
                          src={product.image.url}
                          alt=""
                          fill
                          sizes="74px"
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          style={{
                            objectPosition: product.image.objectPosition ?? "center",
                          }}
                        />
                      ) : null}
                    </span>

                    <span className="min-w-0">
                      <span className="text-[9px] text-[var(--shoppable-copper)]">
                        محصول {numberFormatter.format(index + 1)}
                      </span>
                      <strong className="mt-1 block truncate text-[14px] font-semibold leading-6 text-white">
                        {name}
                      </strong>
                      {price ? (
                        <span className="mt-1 block text-[10px] text-white/55">
                          {price}
                        </span>
                      ) : null}
                    </span>

                    <span className="grid size-9 place-items-center border border-white/12 text-white/60 transition-[border-color,color,background-color] duration-500 group-hover:border-[var(--shoppable-copper)]/60 group-hover:bg-[var(--shoppable-copper)]/[0.10] group-hover:text-white">
                      <ArrowLeftIcon />
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-8 max-w-[230px]">
              <Button
                href="/shop"
                variant="cream"
                size="lg"
                fullWidth
                icon={<ArrowLeftIcon />}
                iconPosition="right"
                className="!tracking-normal"
              >
                ورود به فروشگاه
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
