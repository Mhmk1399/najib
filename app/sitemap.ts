import type { MetadataRoute } from "next";

import { localeHtmlLang, locales } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/routes";
import { siteUrl } from "@/lib/i18n/metadata";

const staticPublicPaths = [
  "/",
  "/shop",
  "/about-us",
  "/contact-us",
  "/blog",
  "/privacy",
  "/terms-conditions",
  "/cookies",
] as const;

function absoluteUrl(pathname: string) {
  return new URL(pathname, siteUrl).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return staticPublicPaths.flatMap((pathname) =>
    locales.map((locale) => ({
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
    })),
  );
}
