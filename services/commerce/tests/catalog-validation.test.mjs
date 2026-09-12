import test from "node:test";
import assert from "node:assert/strict";
import {
  createSchemas,
  listCatalogQuerySchema,
  updateSchemas,
} from "../dist/catalog/catalog.schemas.js";

const text = (value) => ({ fa: value, en: value, ar: value });
const list = (values = []) => ({ fa: values, en: values, ar: values });

test("catalog list query applies safe pagination defaults", () => {
  const query = listCatalogQuerySchema.parse({});
  assert.deepEqual(query, { page: 1, limit: 20 });
});

test("product input requires exact Mongo references and integer money", () => {
  const result = createSchemas.products.safeParse({
    name: text("Wool Suit"),
    slug: "wool-suit",
    description: text("A tailored wool suit."),
    categoryId: "not-an-object-id",
    subcategoryId: "not-an-object-id",
    basePriceMinor: 199.99,
    currency: "EUR",
  });
  assert.equal(result.success, false);
});

test("shoppable image hotspots require both coordinates", () => {
  const result = createSchemas.images.safeParse({
    url: "/images/lookbook.jpg",
    alt: text("Model wearing a suit"),
    kind: "lookbook",
    linkedProducts: [
      {
        productId: "507f1f77bcf86cd799439011",
        hotspotX: 30,
      },
    ],
  });
  assert.equal(result.success, false);
});

test("catalog updates reject fields outside the model contract", () => {
  const result = updateSchemas.categories.safeParse({ admin: true });
  assert.equal(result.success, false);
});

test("category page content matches the Mongo category model", () => {
  const result = createSchemas.categories.safeParse({
    name: text("Tailoring"),
    slug: "tailoring",
    pageContent: {
      primaryBanner: {
        imageId: "507f1f77bcf86cd799439011",
        heading: text("The tailoring edit"),
      },
      primaryDescription: { heading: text("Cut"), body: text("Built with a precise line.") },
      secondaryBanner: {
        imageId: "507f1f77bcf86cd799439012",
        heading: text("Evening form"),
      },
      secondaryDescription: { body: text("Made for an assured entrance.") },
      seoTitle: text("Tailoring | Najibzadeh"),
      seoDescription: text("Discover the Najibzadeh tailoring collection."),
    },
  });

  assert.equal(result.success, true);
  assert.equal(result.data.pageContent.primaryDescription.body.en, "Built with a precise line.");
});

test("catalog copy requires Persian, English, and Arabic values", () => {
  const complete = createSchemas.products.safeParse({
    name: { fa: "کت و شلوار", en: "Suit", ar: "بدلة" },
    slug: "trilingual-suit",
    description: text("Description"),
    categoryId: "507f1f77bcf86cd799439011",
    subcategoryId: "507f1f77bcf86cd799439012",
    basePriceMinor: 100000,
    currency: "EUR",
    material: list(["wool"]),
  });
  const missingArabic = createSchemas.products.safeParse({
    name: { fa: "کت و شلوار", en: "Suit" },
    slug: "incomplete-suit",
    description: text("Description"),
    categoryId: "507f1f77bcf86cd799439011",
    subcategoryId: "507f1f77bcf86cd799439012",
    basePriceMinor: 100000,
    currency: "EUR",
  });

  assert.equal(complete.success, true);
  assert.equal(missingArabic.success, false);
});

test("product optional story fields can be cleared explicitly", () => {
  const result = updateSchemas.products.safeParse({ fit: null, silhouette: null, pattern: null });
  assert.equal(result.success, true);
});

test("image URLs must be HTTP(S) or root-relative", () => {
  const unsafe = createSchemas.images.safeParse({
    url: "javascript:alert(1)",
    alt: text("Unsafe image"),
    kind: "editorial",
  });
  const safe = createSchemas.images.safeParse({
    url: "/images/editorial/lookbook.jpg",
    alt: text("Model wearing a tailored suit"),
    kind: "editorial",
  });
  assert.equal(unsafe.success, false);
  assert.equal(safe.success, true);
});

test("nullable catalog image references can be cleared", () => {
  assert.equal(updateSchemas.categories.safeParse({ thumbnailImageId: null }).success, true);
  assert.equal(updateSchemas.products.safeParse({ primaryImageId: null }).success, true);
  assert.equal(updateSchemas.categories.safeParse({ description: null }).success, true);
  assert.equal(updateSchemas.images.safeParse({ width: null, height: null }).success, true);
});
