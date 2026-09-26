"use client";

import Image from "next/image";
import Link from "next/link";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import type {
  CategoryProduct,
  SubcategoryPageData,
} from "@/types/category-page";

import {
  catalogNumber,
  catalogPageCopy,
  type CatalogPageCopy,
} from "@/lib/i18n/catalog-page-copy";
import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/routes";
import { brandColors, lightTokens } from "@/theme/theme-colors";

import { ArrowRightIcon, Button } from "@/components/ui/Button";

type SubcategoryLandingPageProps = {
  data: SubcategoryPageData;
  locale: Locale;
};

const SUBCATEGORY_THEME_VARS = {
  "--category-white": brandColors.white.hex,
  "--category-black": "#0B0B0B",
  "--category-black-rgb": "11 11 11",
  "--category-cream": lightTokens.surfaceBrand,
  "--category-muted": lightTokens.textMuted,
  "--category-border": lightTokens.border,
  "--category-copper": brandColors.copper.hex,
} as CSSProperties;

function DirectionalArrowIcon({ locale }: { locale: Locale }) {
  const direction = getLocaleDirection(locale);

  return (
    <span
      aria-hidden="true"
      className={`inline-grid size-4 shrink-0 place-items-center ${
        direction === "rtl" ? "[&>svg]:rotate-180" : ""
      }`}
    >
      <ArrowRightIcon />
    </span>
  );
}

export function SubcategoryLandingPage({
  data,
  locale,
}: SubcategoryLandingPageProps) {
  const direction = getLocaleDirection(locale);
  const copy = catalogPageCopy[locale];

  return (
    <main
      dir={direction}
      lang={getHtmlLang(locale)}
      style={SUBCATEGORY_THEME_VARS}
      className="
        w-full
        overflow-hidden

        bg-white
        text-start
        text-[var(--category-black)]
      "
    >
      <SubcategoryHero data={data} locale={locale} />

      <SubcategoryIntro data={data} />

      <SubcategoryProducts data={data} locale={locale} copy={copy} />

      <SubcategoryFeature data={data} />

      <SubcategoryFinalCTA data={data} locale={locale} />
    </main>
  );
}

function SubcategoryHero({
  data,
  locale,
}: {
  data: SubcategoryPageData;
  locale: Locale;
}) {
  const { ref, revealed } = useRevealOnce<HTMLElement>();

  const hero = data.hero;

  return (
    <section
      ref={ref}
      aria-labelledby="subcategory-hero-title"
      data-image-story-id={hero.imageAssetId}
      data-image-story-url={hero.image}
      style={
        {
          "--hero-mobile-position": hero.mobileImagePosition ?? "center",

          "--hero-desktop-position": hero.desktopImagePosition ?? "center",
        } as CSSProperties
      }
      className="
        relative
        isolate

        min-h-[100svh]

        w-full
        overflow-hidden

        bg-[#0B0B0B]
        text-white
      "
    >
      <Image
        src={hero.image}
        alt={hero.imageAlt ?? data.name}
        fill
        priority
        sizes="100vw"
        draggable={false}
        className="
          -z-30

          object-cover

          object-[var(--hero-mobile-position)]

          md:object-[var(--hero-desktop-position)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-20

          bg-[linear-gradient(270deg,rgb(var(--category-black-rgb)/0.92)_0%,rgb(var(--category-black-rgb)/0.64)_32%,rgb(var(--category-black-rgb)/0.12)_70%,rgb(var(--category-black-rgb)/0.10)_100%)]

          max-md:bg-[linear-gradient(180deg,rgb(var(--category-black-rgb)/0.06)_0%,rgb(var(--category-black-rgb)/0.12)_38%,rgb(var(--category-black-rgb)/0.88)_100%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-10

          bg-[radial-gradient(circle_at_center,transparent_40%,rgb(var(--category-black-rgb)/0.32)_120%)]
        "
      />

      <div
        className="
          relative
          z-10

          flex

          min-h-[100svh]

          items-end -mt-20 lg:mt-0

          px-6

          pb-28
          pt-28

          sm:px-8

          md:items-center
          md:px-[7vw]
          md:pb-0

          text-start
        "
      >
        <div
          className={`
            rtl:ml-auto
            ltr:mr-auto
            w-full
            max-w-[680px]

            text-start

            transition-[opacity,transform]
            duration-[900ms]

            ease-[cubic-bezier(0.22,1,0.36,1)]

            motion-reduce:transform-none
            motion-reduce:transition-none

            ${
              revealed
                ? `
                  translate-y-0
                  opacity-100
                `
                : `
                  translate-y-10
                  opacity-0
                `
            }
          `}
        >
          {hero.eyebrow && (
            <div
              className="
                mb-5

                flex
                items-center
                gap-3

                text-[7px]
                font-semibold

                uppercase
                tracking-[0.23em]

                text-[var(--category-copper)]

                sm:text-[8px]
              "
            >
              <span>{hero.eyebrow}</span>

              <span className="h-px w-6 bg-[var(--category-copper)]" />
            </div>
          )}

          <h1
            id="subcategory-hero-title"
            className="
              whitespace-pre-line

               

              text-2xl
              font-bold

              leading-[0.9]
              tracking-[-0.06em]

              text-white

              md:text-6xl
            "
          >
            {hero.title}
          </h1>

          <p
            className="
             mt-3 lg:mt-7

              max-w-[460px]

              text-[10px]

              leading-[1.85]

              text-white/62

              sm:text-[11px]
            "
          >
            {hero.description}
          </p>

          <div className="mt-8 hidden w-full max-w-[250px] md:block">
            <Button
              href={localizedHref(hero.action.href, locale)}
              variant="cream"
              size="lg"
              icon={<DirectionalArrowIcon locale={locale} />}
              fullWidth
            >
              {hero.action.label}
            </Button>
          </div>
        </div>
      </div>

      <div
        className="
          absolute

          inset-x-4

          bottom-[max(88px,env(safe-area-inset-bottom))]

          z-20

          md:hidden
        "
      >
        <Button
          href={localizedHref(hero.action.href, locale)}
          variant="cream"
          size="lg"
          icon={<DirectionalArrowIcon locale={locale} />}
        >
          {hero.action.label}
        </Button>
      </div>
    </section>
  );
}

function SubcategoryIntro({ data }: { data: SubcategoryPageData }) {
  const intro = data.intro;

  return (
    <section aria-label={intro.title || data.name} className="w-full bg-white">
      <div
        className="
          mx-auto

          flex

          max-w-[1000px]

          w-full
          flex-col
          items-start

          px-6

          py-16

          text-start

          sm:px-8
          sm:py-20

          lg:py-24
        "
      >
        {intro.eyebrow && (
          <div
            className="
              mb-5

              flex
              items-center
              gap-3

              text-[7px]
              font-semibold

              uppercase
              tracking-[0.23em]

              text-[var(--category-copper)]
            "
          >
            <span className="h-px w-5 bg-[var(--category-copper)]" />

            <span>{intro.eyebrow}</span>

            <span className="h-px w-5 bg-[var(--category-copper)]" />
          </div>
        )}

        {intro.title && (
          <h2
            className="
              max-w-[720px]

               

              text-[clamp(2.5rem,9vw,4.4rem)]

              leading-[0.98]
              tracking-[-0.05em]

              text-black
            "
          >
            {intro.title}
          </h2>
        )}

        <p
          className={`
            max-w-[760px]

            text-[11px]

            leading-[1.9]

            text-[var(--category-muted)]

            sm:text-[12px]

            ${intro.title ? "mt-6" : ""}
          `}
        >
          {intro.description}
        </p>
      </div>
    </section>
  );
}

function SubcategoryProducts({
  data,
  locale,
  copy,
}: {
  data: SubcategoryPageData;
  locale: Locale;
  copy: CatalogPageCopy;
}) {
  const direction = getLocaleDirection(locale);

  return (
    <section
      aria-labelledby="subcategory-products-heading"
      className="
        w-full

        bg-white

        pb-16

        sm:pb-20

        lg:pb-28
      "
    >
      <div
        className="
          mx-auto

          flex

          max-w-[1600px]

          items-center
          justify-between

          px-6

          pb-6

          sm:px-8

          lg:px-12
        "
      >
        <div>
          <h2
            id="subcategory-products-heading"
            className="
              text-[8px]
              font-semibold

              uppercase
              tracking-[0.18em]

              text-black
            "
          >
            {copy.productsHeading}
          </h2>

          <p className="mt-2 text-[9px] text-black/40">
            {copy.productCount(catalogNumber(data.products.length, locale))}
          </p>
        </div>

        <Link
          href={localizedHref(`/shop?subcategory=${data.slug}`, locale)}
          className="
            group

            hidden

            items-center
            gap-3

            text-[7px]
            font-semibold

            uppercase
            tracking-[0.16em]

            text-black/55

            transition-colors

            hover:text-black

            focus-visible:outline-none
            focus-visible:ring-1
            focus-visible:ring-black/60
            focus-visible:ring-offset-4

            sm:flex
          "
        >
          {copy.viewAll}
          <span className="transition-transform rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1">
            <span aria-hidden="true">{direction === "rtl" ? "←" : "→"}</span>
          </span>
        </Link>
      </div>

      {data.products.length > 0 ? (
        <ul
          className="
            mx-auto

            grid

            max-w-[1600px]

            m-0
            list-none
            grid-cols-1

            gap-px

            bg-black/10

            p-0

            sm:grid-cols-2

            xl:grid-cols-4

            lg:px-12
          "
        >
          {data.products.map((product, index) => (
            <li key={product.id} className="min-w-0">
              <ProductCard index={index} locale={locale} product={product} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-6 sm:px-8 lg:px-12">
          <div
            className="
              mx-auto
              grid
              min-h-[360px]
              max-w-[1600px]
              place-items-center
              bg-[var(--category-cream)]
              px-6
              text-start
            "
          >
            <div>
              <p className="  text-[42px] tracking-[-0.05em]">
                {copy.emptyProductsTitle}
              </p>
              <p className="mt-4 max-w-[420px] text-[10px] leading-[1.8] text-black/45">
                {copy.emptyProductsDescription}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 pt-6 sm:hidden">
        <Button
          href={localizedHref(`/shop?subcategory=${data.slug}`, locale)}
          variant="black"
          size="lg"
          icon={<DirectionalArrowIcon locale={locale} />}
          fullWidth
        >
          {copy.viewAllNamed(data.name)}
        </Button>
      </div>
    </section>
  );
}

function ProductCard({
  product,
  index,
  locale,
}: {
  product: CategoryProduct;

  index: number;
  locale: Locale;
}) {
  const direction = getLocaleDirection(locale);

  return (
    <Link
      href={localizedHref(product.href, locale)}
      data-image-story-id={product.imageAssetId}
      data-image-story-url={product.image}
      className="
        group
        block
        h-full

        relative
        isolate

        min-h-[430px]

        overflow-hidden

        bg-[#111111]

        sm:min-h-[500px]

        xl:min-h-[540px]

        text-start

        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-inset
        focus-visible:ring-white
      "
    >
      <Image
        src={product.image}
        alt={product.imageAlt ?? product.title}
        fill
        loading="lazy"
        sizes="
          (max-width: 639px) 100vw,
          (max-width: 1279px) 50vw,
          25vw
        "
        draggable={false}
        style={{
          objectPosition: product.imagePosition ?? "center",
        }}
        className="
          -z-30

          object-cover

          transition-transform
          duration-[1000ms]

          ease-[cubic-bezier(0.22,1,0.36,1)]

          group-hover:scale-[1.035]

          motion-reduce:transform-none
          motion-reduce:transition-none
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-20

          bg-gradient-to-t

          from-black/82
          via-black/14
          to-transparent
        "
      />

      <span
        aria-hidden="true"
        className="
          absolute

          start-5
          top-5

          text-[6px]
          font-medium

          tracking-[0.18em]

          text-white/35
        "
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {product.badge && (
        <span
          className="
            absolute
            end-5
            top-5
            bg-white
            px-3
            py-2
            text-[7px]
            font-semibold
            uppercase
            tracking-[0.14em]
            text-black
          "
        >
          {product.badge}
        </span>
      )}

      <div
        className="
          absolute

          inset-x-0
          bottom-0

          p-6

          sm:p-7

          lg:p-8
        "
      >
        <div className="flex items-end justify-between gap-5 text-start">
          <div className="min-w-0">
            <h3
              className="
                max-w-[310px]

                 

                text-[clamp(2.15rem,7vw,3.35rem)]

                leading-[0.95]
                tracking-[-0.045em]

                text-white
              "
            >
              {product.title}
            </h3>

            <div
              className="
                mt-4
                flex
                flex-wrap
                items-center
                gap-x-4
                gap-y-2
              "
            >
              {product.subtitle && (
                <span
                  className="
                    text-[8px]
                    font-semibold
                    uppercase
                    tracking-[0.13em]
                    text-white/56
                  "
                >
                  {product.subtitle}
                </span>
              )}

              {product.priceLabel && (
                <>
                  <span className="h-px w-5 bg-white/25" />

                  <span
                    className="
                      text-[8px]
                      font-semibold
                      uppercase
                      tracking-[0.13em]
                      text-white/68
                    "
                  >
                    {product.priceLabel}
                  </span>
                </>
              )}
            </div>

            {product.colors && product.colors.length > 0 && (
              <div className="mt-5 flex items-center gap-2">
                {product.colors.map((color) => (
                  <span
                    key={color}
                    aria-hidden="true"
                    className="
                      size-3
                      border
                      border-white/35
                    "
                    style={{
                      backgroundColor: color,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <span
            className="
              grid
              size-10

              shrink-0
              place-items-center

              border
              border-white/30

              text-white

              transition-[background-color,color,border-color,transform]

              rtl:group-hover:-translate-x-1
              ltr:group-hover:translate-x-1

              group-hover:border-white
              group-hover:bg-white
              group-hover:text-black
            "
          >
            <span aria-hidden="true">{direction === "rtl" ? "←" : "→"}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function SubcategoryFeature({ data }: { data: SubcategoryPageData }) {
  const feature = data.feature;

  return (
    <section
      aria-labelledby="subcategory-feature-title"
      data-image-story-id={feature.imageAssetId}
      data-image-story-url={feature.image}
      style={
        {
          "--feature-mobile-position": feature.mobileImagePosition ?? "center",

          "--feature-desktop-position":
            feature.desktopImagePosition ?? "center",
        } as CSSProperties
      }
      className="
        relative
        isolate

        min-h-[88svh]

        overflow-hidden

        bg-[#0B0B0B]
        text-white

        md:min-h-[100svh]
      "
    >
      <Image
        src={feature.image}
        alt={feature.imageAlt ?? feature.title}
        fill
        loading="lazy"
        sizes="100vw"
        draggable={false}
        className="
          -z-30

          object-cover

          object-[var(--feature-mobile-position)]

          md:object-[var(--feature-desktop-position)]
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          -z-20

          bg-[linear-gradient(270deg,rgb(var(--category-black-rgb)/0.94)_0%,rgb(var(--category-black-rgb)/0.70)_40%,rgb(var(--category-black-rgb)/0.12)_75%)]

          max-md:bg-[linear-gradient(180deg,rgb(var(--category-black-rgb)/0.05)_0%,rgb(var(--category-black-rgb)/0.20)_40%,rgb(var(--category-black-rgb)/0.90)_100%)]
        "
      />

      <div
        className="
          relative
          z-10

          flex

          min-h-[88svh]

          items-end

          px-6
          py-16

          sm:px-8

          md:min-h-[100svh]

          md:items-center
          md:px-[7vw]

          text-start
        "
      >
        <div className="max-w-[620px] text-start rtl:ml-auto ltr:mr-auto">
          {feature.eyebrow && (
            <div
              className="
                mb-5

                flex
                items-center
                gap-3

                text-[7px]
                font-semibold

                uppercase
                tracking-[0.22em]

                text-[var(--category-copper)]
              "
            >
              <span>{feature.eyebrow}</span>

              <span className="h-px w-6 bg-[var(--category-copper)]" />
            </div>
          )}

          <h2
            id="subcategory-feature-title"
            className="
              flex
              flex-col

               

              text-[clamp(3.3rem,12vw,5rem)]

              leading-[0.93]
              tracking-[-0.055em]

              text-white

              md:text-[clamp(4.5rem,5.8vw,6.6rem)]
            "
          >
            <span>{feature.title}</span>

            {feature.italicTitle && (
              <span className="mt-[0.1em] italic text-white/75">
                {feature.italicTitle}
              </span>
            )}
          </h2>

          <p
            className="
              mt-7

              max-w-[440px]

              text-[10px]

              leading-[1.85]

              text-white/58

              sm:text-[11px]
            "
          >
            {feature.description}
          </p>
        </div>
      </div>
    </section>
  );
}

function SubcategoryFinalCTA({
  data,
  locale,
}: {
  data: SubcategoryPageData;
  locale: Locale;
}) {
  const cta = data.finalCTA;

  return (
    <section
      aria-labelledby="subcategory-final-cta-title"
      className="
        bg-[var(--category-cream)]

        px-5

        py-14

        sm:px-8
        sm:py-20

        lg:px-12
        lg:py-24
      "
    >
      <div
        data-image-story-id={cta.imageAssetId}
        data-image-story-url={cta.image}
        className="
          mx-auto

          grid
          max-w-[1600px]

          overflow-hidden

          bg-white

          lg:grid-cols-[0.85fr_1.15fr]
        "
      >
        <div
          className="
            flex

            flex-col

            justify-center

            text-start

            px-7
            py-10

            sm:px-10
            sm:py-14

            lg:px-14
          "
        >
          {cta.eyebrow && (
            <div
              className="
                mb-5

                flex
                items-center
                gap-3

                text-[7px]
                font-semibold

                uppercase
                tracking-[0.22em]

                text-[var(--category-copper)]
              "
            >
              {cta.eyebrow}

              <span className="h-px w-6 bg-[var(--category-copper)]" />
            </div>
          )}

          <h2
            id="subcategory-final-cta-title"
            className="
              max-w-[540px]

               

              text-[clamp(2.8rem,9vw,4.8rem)]

              leading-[0.96]
              tracking-[-0.055em]

              text-black
            "
          >
            {cta.title}
          </h2>

          <p
            className="
              mt-5

              max-w-[430px]

              text-[10px]

              leading-[1.8]

              text-[var(--category-muted)]

              sm:text-[11px]
            "
          >
            {cta.description}
          </p>

          <div className="mt-8 w-full max-w-[250px]">
            <Button
              href={localizedHref(cta.action.href, locale)}
              variant="black"
              size="lg"
              icon={<DirectionalArrowIcon locale={locale} />}
              fullWidth
            >
              {cta.action.label}
            </Button>
          </div>
        </div>

        <div
          className="
            relative

            min-h-[420px]

            sm:min-h-[520px]

            lg:min-h-[620px]
          "
        >
          <Image
            src={cta.image}
            alt={cta.imageAlt ?? cta.title}
            fill
            loading="lazy"
            sizes="
              (max-width: 1023px) 100vw,
              60vw
            "
            draggable={false}
            style={{
              objectPosition: cta.imagePosition ?? "center",
            }}
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

function useRevealOnce<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => {
        setRevealed(true);
      });

      return () => {
        cancelAnimationFrame(frame);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        requestAnimationFrame(() => {
          setRevealed(true);
        });

        observer.disconnect();
      },
      {
        threshold: 0.08,

        rootMargin: "0px 0px -5% 0px",
      },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return {
    ref,
    revealed,
  };
}
