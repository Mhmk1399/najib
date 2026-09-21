import "server-only";

import { randomUUID } from "node:crypto";
import mongoose, { type ClientSession } from "mongoose";

import { connectToDatabase } from "@/lib/server/db";
import { User } from "@/models/auth/user";
import { Cart } from "@/models/catalog/cart";
import { AbandonedCheckout, CheckoutSession } from "@/models/catalog/checkout";
import { Color } from "@/models/catalog/color";
import { Outbox } from "@/models/catalog/outbox";
import { ProductVariant } from "@/models/catalog/product-variant";
import { Product } from "@/models/catalog/product";
import { Size } from "@/models/catalog/size";
import { PaymentIntent } from "@/models/payment/payment-intent";
import { transitionInventoryReservationInSession } from "@/services/inventory/service";

type LocalizedText = { fa: string; en: string; ar: string };

type ExpiringCheckout = {
  _id: mongoose.Types.ObjectId;
  cartId: string;
  userId?: string;
  anonymousId?: string;
  storeId: string;
  cityId: string;
  currency: string;
  items: Array<{ variantId: string; quantity: number; unitPriceMinor: number }>;
  correlationId: string;
  inventoryReservationId?: string;
};

function localized(value: unknown, fallback: string): LocalizedText {
  const source = (value ?? {}) as Partial<LocalizedText>;
  return {
    fa: source.fa?.trim() || source.en?.trim() || source.ar?.trim() || fallback,
    en: source.en?.trim() || source.fa?.trim() || source.ar?.trim() || fallback,
    ar: source.ar?.trim() || source.fa?.trim() || source.en?.trim() || fallback,
  };
}

async function abandonedItems(checkout: ExpiringCheckout, session: ClientSession) {
  const variantIds = checkout.items.map((item) => item.variantId);
  const variants = await ProductVariant.find({ _id: { $in: variantIds } })
    .select("productId colorId sizeId sku")
    .session(session)
    .lean();
  const variantMap = new Map(variants.map((item) => [String(item._id), item]));
  const [products, colors, sizes] = await Promise.all([
    Product.find({ _id: { $in: variants.map((item) => item.productId) } })
      .select("name slug")
      .session(session)
      .lean(),
    Color.find({ _id: { $in: variants.map((item) => item.colorId) } })
      .select("name slug")
      .session(session)
      .lean(),
    Size.find({ _id: { $in: variants.map((item) => item.sizeId) } })
      .select("name code")
      .session(session)
      .lean(),
  ]);
  const productMap = new Map(products.map((item) => [String(item._id), item]));
  const colorMap = new Map(colors.map((item) => [String(item._id), item]));
  const sizeMap = new Map(sizes.map((item) => [String(item._id), item]));

  return checkout.items.map((item) => {
    const variant = variantMap.get(item.variantId);
    const product = variant ? productMap.get(String(variant.productId)) : undefined;
    const color = variant ? colorMap.get(String(variant.colorId)) : undefined;
    const size = variant ? sizeMap.get(String(variant.sizeId)) : undefined;
    return {
      variantId: item.variantId,
      productName: localized(product?.name, product?.slug ?? variant?.sku ?? "محصول"),
      colorName: localized(color?.name, color?.slug ?? "رنگ"),
      sizeName: localized(size?.name, size?.code ?? "سایز"),
      quantity: item.quantity,
      unitPriceMinor: item.unitPriceMinor,
    };
  });
}

async function expireOne(checkoutId: string, now: Date) {
  return mongoose.connection.transaction(async (session) => {
    const checkout = (await CheckoutSession.findOneAndUpdate(
      {
        _id: checkoutId,
        status: { $in: ["reserved", "payment_pending"] },
        expiresAt: { $lte: now },
      },
      { $set: { status: "expired" } },
      { new: true, session },
    ).lean()) as ExpiringCheckout | null;
    if (!checkout) return false;

    if (checkout.inventoryReservationId) {
      await transitionInventoryReservationInSession(
        checkout.inventoryReservationId,
        { action: "expire", reason: "پایان خودکار مهلت Checkout" },
        session,
      );
    }

    const items = await abandonedItems(checkout, session);
    const user = checkout.userId
      ? ((await User.findById(checkout.userId)
          .select("email")
          .session(session)
          .lean()) as { email: string } | null)
      : null;
    const subtotalMinor = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPriceMinor,
      0,
    );

    await Promise.all([
      AbandonedCheckout.updateOne(
        { checkoutSessionId: String(checkout._id) },
        {
          $setOnInsert: {
            checkoutSessionId: String(checkout._id),
            cartId: checkout.cartId,
            userId: checkout.userId,
            anonymousId: checkout.anonymousId,
            email: user?.email,
            storeId: checkout.storeId,
            cityId: checkout.cityId,
            currency: checkout.currency,
            items,
            subtotalMinor,
            abandonedAt: now,
            reason: "reservation_expired",
            recoveryStatus: "eligible",
          },
        },
        { upsert: true, session },
      ),
      Cart.updateOne(
        { _id: checkout.cartId, status: "checkout_started" },
        { $set: { status: "abandoned" } },
        { session },
      ),
      PaymentIntent.updateOne(
        {
          checkoutSessionId: checkout._id,
          status: { $in: ["requires_action", "processing", "failed"] },
        },
        { $set: { status: "cancelled" } },
        { session },
      ),
      Outbox.create(
        [
          {
            eventId: randomUUID(),
            eventType: "CheckoutExpired",
            correlationId: checkout.correlationId,
            destination: "events",
            payload: {
              checkoutSessionId: String(checkout._id),
              cartId: checkout.cartId,
              userId: checkout.userId,
              reason: "reservation_expired",
            },
          },
        ],
        { session },
      ),
    ]);
    return true;
  });
}

export async function expireDueCheckouts(options: { limit?: number; now?: Date } = {}) {
  await connectToDatabase();
  const now = options.now ?? new Date();
  const limit = Math.max(1, Math.min(options.limit ?? 50, 200));
  const due = await CheckoutSession.find({
    status: { $in: ["reserved", "payment_pending"] },
    expiresAt: { $lte: now },
  })
    .select("_id")
    .sort({ expiresAt: 1, _id: 1 })
    .limit(limit)
    .lean();

  let expired = 0;
  const failures: Array<{ checkoutId: string; error: string }> = [];
  for (const item of due) {
    try {
      if (await expireOne(String(item._id), now)) expired += 1;
    } catch (error) {
      failures.push({
        checkoutId: String(item._id),
        error: error instanceof Error ? error.message : "Unknown expiry error",
      });
    }
  }
  return { scanned: due.length, expired, failed: failures.length, failures };
}
