import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import * as commerceModels from "../dist/index.js";

const { Types } = mongoose;
const { AbandonedCheckout, Cart, Category, ImageAsset, ProductVariant } = commerceModels;

function pageContent(imageId) {
  return {
    primaryBanner: {
      imageId,
      heading: "Primary category story",
    },
    primaryDescription: {
      body: "The opening description for this category page.",
    },
    secondaryBanner: {
      imageId,
      heading: "Secondary category story",
    },
    secondaryDescription: {
      body: "The closing description for this category page.",
    },
  };
}

test("product variants require an exact product, color, and size", async () => {
  const variant = new ProductVariant({
    productId: new Types.ObjectId(),
    colorId: new Types.ObjectId(),
    sizeId: new Types.ObjectId(),
    sku: "shirt-white-l",
  });

  await variant.validate();
  assert.equal(variant.sku, "SHIRT-WHITE-L");
});

test("product variants declare a unique product/color/size index", () => {
  const index = ProductVariant.schema.indexes().find(
    ([fields]) =>
      fields.productId === 1 && fields.colorId === 1 && fields.sizeId === 1,
  );

  assert.ok(index);
  assert.equal(index[1].unique, true);
});

test("anonymous visitors can own carts", async () => {
  const cart = new Cart({
    anonymousId: "visitor_123",
    currency: "eur",
    expiresAt: new Date(Date.now() + 60_000),
  });

  await cart.validate();
  assert.equal(cart.currency, "EUR");
  assert.equal(cart.status, "active");
});

test("a cart without a user or anonymous visitor is rejected", async () => {
  const cart = new Cart({
    currency: "EUR",
    expiresAt: new Date(Date.now() + 60_000),
  });

  await assert.rejects(cart.validate(), /requires userId or anonymousId/);
});

test("one checkout session can create only one abandonment record", () => {
  const index = AbandonedCheckout.schema.indexes().find(
    ([fields]) => fields.checkoutSessionId === 1,
  );

  assert.ok(index);
  assert.equal(index[1].unique, true);
});

test("category pages contain two banners and two descriptions", async () => {
  const category = new Category({
    name: "Suits",
    slug: "suits",
    pageContent: pageContent(new Types.ObjectId()),
  });

  await category.validate();
  assert.equal(category.pageContent.primaryBanner.heading, "Primary category story");
  assert.match(category.pageContent.secondaryDescription.body, /closing/);
});

test("shoppable images can link multiple product hotspots", async () => {
  const image = new ImageAsset({
    url: "/assets/editorial/suit-look.webp",
    alt: "A man wearing a suit, shoes, and trousers",
    kind: "editorial",
    linkedProducts: [
      {
        productId: new Types.ObjectId(),
        hotspotX: 44,
        hotspotY: 30,
        label: "Suit jacket",
      },
      {
        productId: new Types.ObjectId(),
        hotspotX: 48,
        hotspotY: 88,
        label: "Shoes",
      },
    ],
  });

  await image.validate();
  assert.equal(image.linkedProducts.length, 2);
});

test("shoppable image hotspot coordinates must be paired", async () => {
  const image = new ImageAsset({
    url: "/assets/editorial/suit-look.webp",
    alt: "A complete formal outfit",
    kind: "lookbook",
    linkedProducts: [
      {
        productId: new Types.ObjectId(),
        hotspotX: 50,
      },
    ],
  });

  await assert.rejects(image.validate(), /Hotspot X and Y must be provided together/);
});
