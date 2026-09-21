import type { Metadata } from "next";

import { BlogListingPage } from "@/components/static/Blog/BlogListingSection";
import { blogCopy } from "@/lib/i18n/blog-copy";
import {
  defaultLocale,
  getHtmlLang,
  getLocaleDirection,
  locales,
  type Locale,
} from "@/lib/i18n/config";

type BlogPageProps = {
  params: Promise<{
    locale: string;
  }>;
};

function resolveLocale(value: string): Locale {
  return locales.includes(value as Locale)
    ? (value as Locale)
    : defaultLocale;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const copy = blogCopy[locale];

  return {
    title: copy.metadata.title,
    description: copy.metadata.description,
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const copy = blogCopy[locale];

  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);

  return (
    <div dir={direction} lang={htmlLang}>
      <BlogListingPage
        locale={locale}
        copy={copy}
        heroImage="/assets/images/banner.webp"
        heroDesktopImagePosition="center"
        heroMobileImagePosition="62% center"
        postsPerPage={6}
      />
    </div>
  );
}
