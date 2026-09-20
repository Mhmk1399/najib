# Multilingual Routing Plan

This project uses locale-prefixed public routes and keeps admin/API routes outside localization.

## Locales

- `fa` is the default and primary SEO locale.
- `en` is English.
- `ar` is Arabic.
- `fa` and `ar` are RTL. `en` is LTR.

## URL Contract

Public storefront URLs must use a locale prefix:

```txt
/fa
/fa/shop
/fa/shop/[slug]
/fa/[categorySlug]
/fa/[categorySlug]/[subcategorySlug]

/en
/ar
```

System routes stay unprefixed:

```txt
/admin
/api
/_next
/assets
/pwa
/sw.js
/manifest.webmanifest
```

`/` and old public URLs such as `/shop` redirect to the Persian URL, for example `/fa/shop`.

## SEO Rules

- Every indexable page must have one canonical URL for the active locale.
- Every translated page should expose `hreflang` alternates for `fa-IR`, `en-US`, `ar`, and `x-default`.
- Persian is allowed to be indexed first.
- English and Arabic pages should only be added to sitemap/index when their real localized content exists.
- Do not publish English/Arabic URLs with copied Persian content as indexable pages.

## Data Rules

Catalog models may keep the current localized fields:

```ts
{
  fa: string;
  en?: string;
  ar?: string;
}
```

Future slug migration should be additive:

```ts
slug: string;
localizedSlugs?: {
  fa?: string;
  en?: string;
  ar?: string;
};
```

The current `slug` remains the fallback and Persian canonical slug until localized slugs are filled.

## Implementation Stages

1. Add `lib/i18n` config, route helpers, metadata helpers, and proxy redirects.
2. Move public dynamic catalog routes under `app/[locale]`.
3. Add locale wrappers for current public pages.
4. Make storefront fetchers and React Query keys locale-aware.
5. Localize navbar/footer links with a single route helper.
6. Add localized metadata, sitemap, and robots rules.
7. Add admin translation-completeness indicators for catalog records.

## Page Copy Architecture

Keep page-level static copy in one file per route or feature area:

```txt
lib/i18n/home-copy.ts
lib/i18n/about-copy.ts
lib/i18n/contact-copy.ts
lib/i18n/shop-copy.ts
```

Each copy file should export a typed `Record<Locale, PageCopy>` object. The
page should read the active locale on the server with `getRequestLocale()` and
pass only the needed section copy into components.

Example:

```tsx
import { homeCopy } from "@/lib/i18n/home-copy";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function Page() {
  const locale = await getRequestLocale();
  const copy = homeCopy[locale];

  return <HeroSection copy={copy.hero} locale={locale} />;
}
```

Component rule:

```tsx
export function HeroSection({ copy, locale }: HeroSectionProps) {
  return (
    <section dir={getLocaleDirection(locale)} lang={getHtmlLang(locale)}>
      {copy.title}
    </section>
  );
}
```

Link rule:

```tsx
href={localizedHref(copy.primaryAction.href, locale)}
```

This keeps SEO routes, UI direction, and internal links aligned without
duplicating components per language.

## Migration Workflow For Each Page

1. Create a route copy file in `lib/i18n`, for example `about-copy.ts`.
2. Define a `PageCopy` type with keys for each section.
3. Fill `fa`, `en`, and `ar`; Persian is the source of truth.
4. In the route page, call `getRequestLocale()` and select `pageCopy[locale]`.
5. Pass `copy.sectionName` and `locale` into the section component.
6. In the component, remove hardcoded strings and read from `copy`.
7. Set `dir` and `lang` for major semantic sections when text direction can differ.
8. Wrap internal URLs with `localizedHref(...)`.
9. Keep data-driven catalog text using localized model fields, not static copy files.
10. Run `npm run typecheck` after each page or group of sections.

## Guardrails

- Admin UI remains Persian.
- API routes remain unlocalized.
- Locale must be part of client cache keys.
- Route helpers must be used instead of hardcoded internal storefront URLs.
- Dynamic category routes must stay below `[locale]` so fixed pages like `/fa/about-us` do not get swallowed by catalog routes.
