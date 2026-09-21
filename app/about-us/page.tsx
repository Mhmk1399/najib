import type { Metadata } from "next";

import { AboutCraftSection } from "@/components/static/About/AboutCraftSection";

import { AboutHeroSection } from "@/components/static/About/AboutHeroSection";

import { AboutValuesSection } from "@/components/static/About/AboutValuesSection";

import { aboutCopy } from "@/lib/i18n/about-copy";

import {
  defaultLocale,
  getHtmlLang,
  getLocaleDirection,
  locales,
  type Locale,
} from "@/lib/i18n/config";

type AboutPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function resolveLocale(value: string): Locale {
  return locales.includes(value as Locale) ? (value as Locale) : defaultLocale;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;

  const locale = resolveLocale(localeParam);

  const copy = aboutCopy[locale];

  return {
    title: copy.metadata.title,

    description: copy.metadata.description,
  };
}

export default async function Page({ params }: AboutPageProps) {
  const { locale: localeParam } = await params;

  const locale = resolveLocale(localeParam);

  const copy = aboutCopy[locale];

  const direction = getLocaleDirection(locale);

  const htmlLang = getHtmlLang(locale);

  return (
    <main
      dir={direction}
      lang={htmlLang}
      className="
        w-full
        overflow-x-clip
      "
    >
      <AboutHeroSection
        locale={locale}
        copy={copy.hero}
        imageSrc="/assets/images/p4.webp"
        mobileImagePosition="68% center"
        desktopImagePosition="top"
      />

      <AboutCraftSection
        locale={locale}
        copy={copy.craft}
        images={[
          {
            id: "fabric",
            src: "/assets/images/p1.webp",
            alt: copy.craft.imageAlts.fabric,
            position: "center",
          },

          {
            id: "hand",
            src: "/assets/images/p2.webp",
            alt: copy.craft.imageAlts.hand,
            position: "center",
          },

          {
            id: "material",
            src: "/assets/images/p3.webp",
            alt: copy.craft.imageAlts.material,
            position: "center",
          },
        ]}
      />

      <AboutValuesSection
        locale={locale}
        copy={copy.values}
        imageSrc="/assets/images/p6.webp"
        mobileImagePosition="68% center"
        desktopImagePosition="top"
      />
    </main>
  );
}
