import "server-only";

import { createHash, randomBytes, randomUUID } from "node:crypto";
import mongoose, { type ClientSession } from "mongoose";
import { z } from "zod";
import { explicitPriceForCurrency, type CheckoutCurrency } from "@/lib/catalog/currency";

import { connectToDatabase } from "@/lib/server/db";
import { conflict, forbidden, notFound } from "@/lib/server/errors";
import { StaffAudit } from "@/models/auth/staff-audit";
import { User } from "@/models/auth/user";
import { Cart } from "@/models/catalog/cart";
import { AbandonedCheckout } from "@/models/catalog/checkout";
import { Color } from "@/models/catalog/color";
import { Outbox } from "@/models/catalog/outbox";
import { ProductVariant } from "@/models/catalog/product-variant";
import { Product } from "@/models/catalog/product";
import { Size } from "@/models/catalog/size";
import { InventoryBalance } from "@/models/inventory/inventory-balance";
import { InventoryLocation } from "@/models/inventory/inventory-location";

const TOKEN_VALIDITY_MS = 7 * 24 * 60 * 60 * 1000;
const CART_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const tokenSchema = z.string().trim().regex(/^[A-Za-z0-9_-]{43}$/, "لینک بازیابی معتبر نیست.");

export const rotateRecoveryLinkSchema = z.object({
  reason: z.string().trim().min(3).max(300),
}).strict();

export const restoreRecoverySchema = z.object({ token: tokenSchema }).strict();

type LocalizedText = { fa?: string; en?: string; ar?: string };
type AbandonedRecord = {
  _id: unknown;
  userId?: string;
  storeId: string;
  cityId: string;
  currency: string;
  recoveryStatus: string;
  recoveryTokenHash?: string;
  recoveryTokenExpiresAt?: Date;
  recoveryTokenUsedAt?: Date;
  recoveryCartId?: string;
  items: Array<{
    variantId: string;
    productName: LocalizedText;
    colorName: LocalizedText;
    sizeName: LocalizedText;
    quantity: number;
    unitPriceMinor: number;
  }>;
};

type CartRecord = {
  _id: unknown;
  currency: string;
  status: string;
  items: Array<{ variantId: unknown; quantity: number; unitPriceMinor: number }>;
};

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function localized(value: LocalizedText | undefined, fallback: string): LocalizedText {
  return {
    fa: value?.fa?.trim() || value?.en?.trim() || value?.ar?.trim() || fallback,
    en: value?.en?.trim() || value?.fa?.trim() || value?.ar?.trim() || fallback,
    ar: value?.ar?.trim() || value?.fa?.trim() || value?.en?.trim() || fallback,
  };
}

async function findOwnedRecord(token: string, accountId: string, session?: ClientSession) {
  const query = AbandonedCheckout.findOne({ recoveryTokenHash: tokenHash(token) })
    .select("+recoveryTokenHash");
  if (session) query.session(session);
  const record = await query.lean() as unknown as AbandonedRecord | null;
  if (!record) notFound("لینک بازیابی معتبر نیست یا نوسازی شده است.", { code: "RECOVERY_INVALID" });
  if (!record.userId || record.userId !== accountId) {
    forbidden("این لینک بازیابی متعلق به حساب شما نیست.", { code: "RECOVERY_WRONG_OWNER" });
  }
  if (record.recoveryStatus === "recovered") conflict("این خرید قبلاً با موفقیت بازیابی شده است.", { code: "RECOVERY_COMPLETED" });
  if (["expired", "suppressed"].includes(record.recoveryStatus)) {
    conflict("این پرونده دیگر قابل بازیابی نیست.", { code: "RECOVERY_UNAVAILABLE" });
  }
  if (!record.recoveryTokenExpiresAt || record.recoveryTokenExpiresAt.getTime() <= Date.now()) {
    conflict("مهلت لینک بازیابی تمام شده است.", { code: "RECOVERY_EXPIRED" });
  }
  return record;
}

async function recoveryItems(record: AbandonedRecord, cart: CartRecord | null, session?: ClientSession) {
  const variantIds = record.items.map((item) => item.variantId);
  const variantQuery = ProductVariant.find({ _id: { $in: variantIds }, isActive: true });
  if (session) variantQuery.session(session);
  const variants = await variantQuery.lean();
  const variantMap = new Map(variants.map((item) => [String(item._id), item]));

  const productQuery = Product.find({
    _id: { $in: variants.map((item) => item.productId) },
    status: "active",
  }).select("name currency basePriceMinor priceIrrMinor priceUsdMinor");
  const colorQuery = Color.find({
    _id: { $in: variants.map((item) => item.colorId) },
    isActive: true,
  }).select("name");
  const sizeQuery = Size.find({
    _id: { $in: variants.map((item) => item.sizeId) },
    isActive: true,
  }).select("name code");
  const locationQuery = InventoryLocation.find({ isActive: true }).select("_id");
  if (session) {
    productQuery.session(session);
    colorQuery.session(session);
    sizeQuery.session(session);
    locationQuery.session(session);
  }
  const [products, colors, sizes, locations] = await Promise.all([
    productQuery.lean(), colorQuery.lean(), sizeQuery.lean(), locationQuery.lean(),
  ]);
  const balanceQuery = InventoryBalance.find({
    variantId: { $in: variantIds },
    locationId: { $in: locations.map((item) => item._id) },
  }).select("variantId onHand reserved safetyStock");
  if (session) balanceQuery.session(session);
  const balances = await balanceQuery.lean();

  const productMap = new Map(products.map((item) => [String(item._id), item]));
  const colorMap = new Map(colors.map((item) => [String(item._id), item]));
  const sizeMap = new Map(sizes.map((item) => [String(item._id), item]));
  const availableMap = new Map<string, number>();
  for (const balance of balances) {
    const id = String(balance.variantId);
    const available = Math.max(balance.onHand - balance.reserved - balance.safetyStock, 0);
    availableMap.set(id, (availableMap.get(id) ?? 0) + available);
  }
  const cartQuantity = new Map<string, number>();
  for (const item of cart?.items ?? []) {
    const id = String(item.variantId);
    cartQuantity.set(id, (cartQuantity.get(id) ?? 0) + item.quantity);
  }

  return record.items.map((snapshot) => {
    const variant = variantMap.get(snapshot.variantId);
    const product = variant ? productMap.get(String(variant.productId)) : undefined;
    const color = variant ? colorMap.get(String(variant.colorId)) : undefined;
    const size = variant ? sizeMap.get(String(variant.sizeId)) : undefined;
    const currency = (cart?.currency ?? record.currency) as CheckoutCurrency;
    const currentPriceMinor = variant && product
      ? (explicitPriceForCurrency({ priceIrrMinor: variant.priceOverrideIrrMinor, priceUsdMinor: variant.priceOverrideUsdMinor, basePriceMinor: variant.priceOverrideMinor, currency: product.currency }, currency) ?? explicitPriceForCurrency({ priceIrrMinor: product.priceIrrMinor, priceUsdMinor: product.priceUsdMinor, basePriceMinor: product.basePriceMinor, currency: product.currency }, currency))
      : null;
    const existingQuantity = cartQuantity.get(snapshot.variantId) ?? 0;
    const availableQuantity = availableMap.get(snapshot.variantId) ?? 0;
    let skipCode: "not_sellable" | "out_of_stock" | "quantity_limit" | null = null;
    if (!variant || !product || !color || !size) skipCode = "not_sellable";
    else if (availableQuantity <= existingQuantity) skipCode = "out_of_stock";
    else if (existingQuantity >= 99) skipCode = "quantity_limit";
    const restorableQuantity = skipCode
      ? 0
      : Math.max(0, Math.min(snapshot.quantity, availableQuantity - existingQuantity, 99 - existingQuantity));
    if (!skipCode && restorableQuantity === 0) skipCode = "out_of_stock";
    const skipReason: Record<Exclude<typeof skipCode, null>, LocalizedText> = {
      not_sellable: { fa: "این تنوع دیگر قابل فروش نیست.", en: "This variant is no longer sellable.", ar: "هذا الخيار لم يعد متاحاً للبيع." },
      out_of_stock: { fa: "موجودی قابل فروش کافی نیست.", en: "No sellable stock is currently available.", ar: "لا يتوفر مخزون قابل للبيع حالياً." },
      quantity_limit: { fa: "سقف ۹۹ عدد برای این تنوع پر شده است.", en: "The 99-item limit is already reached.", ar: "تم الوصول إلى حد 99 قطعة." },
    };
    return {
      variantId: snapshot.variantId,
      productName: localized(product?.name, localized(snapshot.productName, "محصول" ).fa || "محصول"),
      colorName: localized(color?.name, localized(snapshot.colorName, "رنگ").fa || "رنگ"),
      sizeName: localized(size?.name, size?.code || localized(snapshot.sizeName, "سایز").fa || "سایز"),
      requestedQuantity: snapshot.quantity,
      existingQuantity,
      availableQuantity,
      restorableQuantity,
      previousUnitPriceMinor: snapshot.unitPriceMinor,
      currentUnitPriceMinor: currentPriceMinor,
      priceChanged: currentPriceMinor !== null && currentPriceMinor !== snapshot.unitPriceMinor,
      available: restorableQuantity > 0,
      skipCode,
      skipReason: skipCode ? skipReason[skipCode] : null,
    };
  });
}

function summary(record: AbandonedRecord, items: Awaited<ReturnType<typeof recoveryItems>>, restored = false, idempotent = false, currency = record.currency) {
  return {
    abandonedCheckoutId: String(record._id),
    currency,
    recoveryStatus: record.recoveryStatus,
    tokenExpiresAt: record.recoveryTokenExpiresAt,
    restored,
    idempotent,
    recoveryCartId: record.recoveryCartId ?? null,
    items,
    requestedItemCount: items.reduce((sum, item) => sum + item.requestedQuantity, 0),
    restorableItemCount: items.reduce((sum, item) => sum + item.restorableQuantity, 0),
    currentSubtotalMinor: items.reduce(
      (sum, item) => sum + (item.currentUnitPriceMinor ?? 0) * item.restorableQuantity,
      0,
    ),
  };
}

export const recoveryService = {
  async rotateLink(id: string, value: unknown, actorId: string, origin: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) notFound("checkout رهاشده پیدا نشد.");
    const input = rotateRecoveryLinkSchema.parse(value);
    await connectToDatabase();
    const rawToken = randomBytes(32).toString("base64url");
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + TOKEN_VALIDITY_MS);

    const result = await mongoose.connection.transaction(async (session) => {
      const record = await AbandonedCheckout.findOne({
        _id: id,
        userId: { $exists: true, $nin: [null, ""] },
        recoveryStatus: { $in: ["eligible", "contacted"] },
      }).session(session);
      if (!record) conflict("این پرونده برای ساخت لینک بازیابی واجد شرایط نیست.");
      const user = await User.findById(record.userId)
        .select("preferredLocale")
        .session(session)
        .lean() as { preferredLocale?: string } | null;
      const locale = ["fa", "en", "ar"].includes(user?.preferredLocale ?? "")
        ? user?.preferredLocale
        : "fa";
      await AbandonedCheckout.collection.updateOne(
        { _id: record._id as mongoose.Types.ObjectId },
        {
          $set: {
            recoveryTokenHash: tokenHash(rawToken),
            recoveryTokenCreatedAt: createdAt,
            recoveryTokenExpiresAt: expiresAt,
          },
          $unset: { recoveryTokenUsedAt: "" },
        },
        { session },
      );
      await Promise.all([
        StaffAudit.create([{
          userId: actorId,
          action: "abandoned_checkout.rotate_recovery_link",
          outcome: "success",
          reason: input.reason,
          targetType: "abandoned_checkout",
          targetId: record.id,
        }], { session }),
        Outbox.create([{
          eventId: randomUUID(),
          eventType: "AbandonedCheckoutRecoveryLinkRotated",
          correlationId: `abandoned:${record.id}`,
          destination: "events",
          payload: { abandonedCheckoutId: record.id, actorId, expiresAt },
        }], { session }),
      ]);
      return { locale, recoveryStatus: record.recoveryStatus };
    });
    return {
      abandonedCheckoutId: id,
      recoveryStatus: result.recoveryStatus,
      expiresAt,
      recoveryUrl: `${origin}/${result.locale}/recover-checkout?token=${encodeURIComponent(rawToken)}`,
    };
  },

  async preview(accountId: string, rawToken: unknown) {
    const token = tokenSchema.parse(rawToken);
    await connectToDatabase();
    const record = await findOwnedRecord(token, accountId);
    const cart = await Cart.findOne({ userId: accountId, status: "active" }).lean() as unknown as CartRecord | null;
    const items = await recoveryItems(record, cart);
    return summary(record, items, Boolean(record.recoveryTokenUsedAt), Boolean(record.recoveryTokenUsedAt), cart?.currency ?? record.currency);
  },

  async restore(accountId: string, value: unknown) {
    const { token } = restoreRecoverySchema.parse(value);
    await connectToDatabase();
    return mongoose.connection.transaction(async (session) => {
      const record = await findOwnedRecord(token, accountId, session);
      if (record.recoveryTokenUsedAt && record.recoveryCartId) {
        const linked = await Cart.findOne({ _id: record.recoveryCartId, userId: accountId }).session(session).lean() as unknown as CartRecord | null;
        if (linked) {
          const items = await recoveryItems(record, linked, session);
          return summary(record, items, true, true, linked.currency);
        }
      }

      let cart = await Cart.findOne({ userId: accountId, status: "active" }).session(session);
      const currentCart = cart?.toObject() as unknown as CartRecord | null;
      const items = await recoveryItems(record, currentCart, session);
      const restorable = items.filter((item) => item.restorableQuantity > 0);
      if (restorable.length === 0) conflict("هیچ کالای قابل فروشی برای بازگرداندن وجود ندارد.", { code: "RECOVERY_NO_SELLABLE_ITEMS" });

      if (!cart) {
        [cart] = await Cart.create([{
          userId: accountId,
          currency: record.currency,
          status: "active",
          expiresAt: new Date(Date.now() + CART_TTL_MS),
          recoveryAbandonedCheckoutId: String(record._id),
          items: [],
        }], { session });
      }
      for (const item of restorable) {
        const existing = cart.items.find(
          (candidate: { variantId: unknown }) => String(candidate.variantId) === item.variantId,
        );
        if (existing) {
          existing.quantity += item.restorableQuantity;
          existing.unitPriceMinor = item.currentUnitPriceMinor!;
        } else {
          cart.items.push({
            variantId: new mongoose.Types.ObjectId(item.variantId),
            quantity: item.restorableQuantity,
            unitPriceMinor: item.currentUnitPriceMinor!,
            addedAt: new Date(),
          });
        }
      }
      cart.recoveryAbandonedCheckoutId = String(record._id);
      cart.expiresAt = new Date(Date.now() + CART_TTL_MS);
      await cart.save({ session });
      await Cart.collection.updateOne(
        { _id: cart._id },
        { $set: { recoveryAbandonedCheckoutId: String(record._id) } },
        { session },
      );
      const usedAt = new Date();
      await AbandonedCheckout.collection.updateOne(
        { _id: record._id as mongoose.Types.ObjectId, recoveryTokenHash: tokenHash(token) },
        { $set: { recoveryTokenUsedAt: usedAt, recoveryCartId: cart.id } },
        { session },
      );
      await Outbox.create([{
        eventId: randomUUID(),
        eventType: "AbandonedCheckoutRestoredToCart",
        correlationId: `abandoned:${String(record._id)}`,
        destination: "events",
        payload: {
          abandonedCheckoutId: String(record._id),
          cartId: cart.id,
          userId: accountId,
          restoredItems: restorable.map((item) => ({ variantId: item.variantId, quantity: item.restorableQuantity })),
        },
      }], { session });
      record.recoveryTokenUsedAt = usedAt;
      record.recoveryCartId = cart.id;
      return summary(record, items, true, false, cart.currency);
    });
  },
};
