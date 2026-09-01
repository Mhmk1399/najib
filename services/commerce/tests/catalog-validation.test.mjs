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
