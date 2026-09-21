import type { MetadataRoute } from "next";

import { localeHtmlLang, locales } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/routes";
import { siteUrl } from "@/lib/i18n/metadata";
import { getStorefrontCatalog } from "@/services/catalog/storefront";

type SitemapCategory = {
  _id: unknown;
  slug?: unknown;
};

type SitemapSubcategory = {
  categoryId?: unknown;
  slug?: unknown;
};

const staticPublicPaths = [
  "/",
  "/shop",
  "/about-us",
  "/contact-us",
  "/blog",
  "/privacy",
  "/terms-conditions",
] as const;

function absoluteUrl(pathname: string) {
  return new URL(pathname, siteUrl).toString();
}

function localizedSitemapEntry(pathname: string, now: Date) {
  return locales.map((locale) => ({
    url: absoluteUrl(localizedPath(pathname, locale)),
    lastModified: now,
    changeFrequency: pathname === "/" ? "daily" : "weekly",
    priority: pathname === "/" ? 1 : 0.7,
    alternates: {
      languages: Object.fromEntries(
        locales.map((item) => [
          localeHtmlLang[item],
          absoluteUrl(localizedPath(pathname, item)),
        ]),
      ),
    },
  })) satisfies MetadataRoute.Sitemap;
}

function idOf(value: unknown) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "toString" in value) {
    return String(value);
  }
  return "";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const catalog = await getStorefrontCatalog();
  const categories = catalog.categories as SitemapCategory[];
  const subcategories = catalog.subcategories as SitemapSubcategory[];

  const categoryPaths = categories
    .map((category) =>
      typeof category.slug === "string" ? `/${category.slug}` : null,
    )
    .filter((path): path is string => Boolean(path));
  const subcategoryPaths = subcategories
    .map((subcategory) => {
      const category = categories.find(
        (item) => idOf(item._id) === idOf(subcategory.categoryId),
      );
      if (
        typeof category?.slug !== "string" ||
        typeof subcategory.slug !== "string"
      ) {
        return null;
      }

      return `/${category.slug}/${subcategory.slug}`;
    })
    .filter((path): path is string => Boolean(path));

  return [...staticPublicPaths, ...categoryPaths, ...subcategoryPaths].flatMap(
    (pathname) => localizedSitemapEntry(pathname, now),
  );
}
