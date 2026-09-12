# Catalog localization

The Admin application is a Persian-only staff workspace and uses right-to-left
layout. Catalog content is multilingual because the storefront serves Persian,
English, and Arabic customers.

## API shape

Every translated text value is returned as one object:

```json
{
  "fa": "کت‌وشلوار دوبل نوآر",
  "en": "Noir Double-Breasted Suit",
  "ar": "بدلة نوار مزدوجة الصدر"
}
```

Translated lists use the same language keys:

```json
{
  "fa": ["پشم خالص", "آستر کوپرو"],
  "en": ["virgin wool", "cupro lining"],
  "ar": ["صوف بكر", "بطانة كوبرو"]
}
```

All three keys are required for customer-facing core content. The API returns
all three languages and the storefront chooses the value for its active locale.
Translations are authored by staff; the platform does not silently machine
translate catalog copy.

## Localized fields

- Category and subcategory names, descriptions, page banners, page
  descriptions, calls to action, and SEO copy
- Collection names and descriptions
- Product names, descriptions, materials, fit, silhouette, pattern, seasons,
  occasions, and style tags
- Image alternative text and shoppable hotspot labels
- Color names/families and size/size-group names
- Product, color, and size names copied into order and abandoned-checkout
  snapshots

IDs, slugs, URLs, SKU, barcode, currency, integer prices, statuses, dates,
coordinates, sort order, and relationships are language-neutral.

## Admin behavior

- The full Admin navigation and operational copy are Persian.
- The document language is `fa` and its direction is `rtl`.
- Catalog editors open on Persian and provide `فارسی`, `English`, and
  `العربية` authoring tabs.
- Persian and Arabic fields use RTL direction; English and technical fields use
  LTR direction.
- Catalog lists display the Persian value while editors preserve all three.

## Existing data migration

Run the idempotent migration after deploying the localized model change:

```bash
pnpm migrate:catalog-locales
```

Legacy text is copied into all three language keys so no data is lost. Staff can
then replace those placeholders with proper translations. The reusable demo
seed already contains genuine Persian, English, and Arabic examples.
