import test from "node:test";
import assert from "node:assert/strict";
import {
  createSchemas,
  listCatalogQuerySchema,
  updateSchemas,
} from "../dist/catalog/catalog.schemas.js";

test("catalog list query applies safe pagination defaults", () => {
  const query = listCatalogQuerySchema.parse({});
  assert.deepEqual(query, { page: 1, limit: 20 });
});

test("product input requires exact Mongo references and integer money", () => {
  const result = createSchemas.products.safeParse({
    name: "Wool Suit",
    slug: "wool-suit",
    description: "A tailored wool suit.",
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
    alt: "Model wearing a suit",
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
    name: "Tailoring",
    slug: "tailoring",
    pageContent: {
      primaryBanner: {
        imageId: "507f1f77bcf86cd799439011",
        heading: "The tailoring edit",
      },
      primaryDescription: { heading: "Cut", body: "Built with a precise line." },
      secondaryBanner: {
        imageId: "507f1f77bcf86cd799439012",
        heading: "Evening form",
      },
      secondaryDescription: { body: "Made for an assured entrance." },
      seoTitle: "Tailoring | Najibzadeh",
      seoDescription: "Discover the Najibzadeh tailoring collection.",
    },
  });

  assert.equal(result.success, true);
  assert.equal(result.data.pageContent.primaryDescription.body, "Built with a precise line.");
});

test("product optional story fields can be cleared explicitly", () => {
  const result = updateSchemas.products.safeParse({ fit: null, silhouette: null, pattern: null });
  assert.equal(result.success, true);
});

test("image URLs must be HTTP(S) or root-relative", () => {
  const unsafe = createSchemas.images.safeParse({
    url: "javascript:alert(1)",
    alt: "Unsafe image",
    kind: "editorial",
  });
  const safe = createSchemas.images.safeParse({
    url: "/images/editorial/lookbook.jpg",
    alt: "Model wearing a tailored suit",
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
