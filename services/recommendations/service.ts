import "server-only";

import { z } from "zod";
import { connectToDatabase } from "@/lib/server/db";
import { notFound } from "@/lib/server/errors";
import { User } from "@/models/auth/user";
import { UserBehavior, UserBehaviorRateBucket } from "@/models/analytics/user-behavior";
import { Product } from "@/models/catalog/product";
import { ProductVariant } from "@/models/catalog/product-variant";
import { ImageAsset } from "@/models/catalog/image-asset";
import { Order } from "@/models/catalog/order";
import { Cart } from "@/models/catalog/cart";
import { CheckoutSession } from "@/models/catalog/checkout";
import { InventoryBalance } from "@/models/inventory/inventory-balance";
import { InventoryLocation } from "@/models/inventory/inventory-location";
import { Store } from "@/models/inventory/store";
import { City } from "@/models/inventory/city";

const objectId = z.string().regex(/^[a-f\d]{24}$/i);
export const activitySchema = z.object({
  eventType: z.literal("product_view"), productId: objectId,
  idempotencyKey: z.uuid(), locale: z.enum(["fa", "en", "ar"]).optional(),
  source: z.string().trim().max(80).optional(),
}).strict();
export const recommendationQuerySchema = z.object({
  locale: z.enum(["fa", "en", "ar"]).default("fa"),
  limit: z.coerce.number().int().min(1).max(24).default(8),
}).strict();
const personalizationSchema = z.object({ enabled: z.boolean() }).strict();
const PERSONALIZATION_POLICY_VERSION = "personalization-v1";

type Localized = { fa?: string; en?: string; ar?: string };
function localized(v: Localized | undefined, fallback: string, locale: "fa" | "en" | "ar") {
  return v?.[locale]?.trim() || v?.fa?.trim() || v?.en?.trim() || v?.ar?.trim() || fallback;
}
function latestConsent(consents: Array<{ scope?: string; granted?: boolean; recordedAt?: Date }>) {
  return consents.filter((c) => c.scope === "personalization").sort((a, b) => +new Date(b.recordedAt ?? 0) - +new Date(a.recordedAt ?? 0))[0]?.granted === true;
}

export async function recordProductView(accountId: string, value: unknown) {
  const input = activitySchema.parse(value);
  await connectToDatabase();
  const user = await User.findOne({ _id: accountId, roles: "customer", status: "active" }).select("consents").lean() as unknown as { consents?: Array<{ scope?: string; granted?: boolean; recordedAt?: Date }> } | null;
  if (!user) notFound("حساب کاربری پیدا نشد.");
  if (!latestConsent(user.consents ?? [])) return { recorded: false, reason: "consent_required" };
  const product = await Product.exists({ _id: input.productId, status: "active" });
  if (!product) notFound("محصول فعال پیدا نشد.");
  const now = Date.now();
  const windowStart = new Date(Math.floor(now / 60_000) * 60_000);
  try {
    const rate = await UserBehaviorRateBucket.findOneAndUpdate(
      { userId: accountId, windowStart, count: { $lt: 60 } },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date(now + 2 * 60 * 60_000) } },
      { upsert: true, new: true },
    );
    if (!rate) return { recorded: false, reason: "rate_limited" };
    const viewWindow = Math.floor(now / (10 * 60_000));
    await UserBehavior.create({ userId: accountId, productId: input.productId, eventType: input.eventType, idempotencyKey: input.idempotencyKey, coalescingKey: `${accountId}:product_view:${input.productId}:${viewWindow}`, locale: input.locale, source: input.source, occurredAt: new Date(now) });
  } catch (error) {
    if ((error as { code?: number }).code !== 11000) throw error;
    return { recorded: false, reason: "coalesced" };
  }
  return { recorded: true };
}

export async function getPersonalizationPreference(accountId: string) {
  await connectToDatabase();
  const user = await User.findOne({ _id: accountId, roles: "customer", status: "active" }).select("consents").lean() as unknown as { consents?: Array<{ scope?: string; granted?: boolean; recordedAt?: Date }> } | null;
  if (!user) notFound("حساب کاربری پیدا نشد.");
  return { enabled: latestConsent(user.consents ?? []), policyVersion: PERSONALIZATION_POLICY_VERSION };
}

export async function updatePersonalizationPreference(accountId: string, value: unknown) {
  const { enabled } = personalizationSchema.parse(value);
  await connectToDatabase();
  const user = await User.findOneAndUpdate(
    { _id: accountId, roles: "customer", status: "active" },
    { $push: { consents: { scope: "personalization", granted: enabled, source: "customer_dashboard", recordedAt: new Date(), policyVersion: PERSONALIZATION_POLICY_VERSION } } },
    { new: true, runValidators: true },
  ).select("_id").lean();
  if (!user) notFound("حساب کاربری پیدا نشد.");
  return { enabled, policyVersion: PERSONALIZATION_POLICY_VERSION };
}

export async function recordAccountSignal(accountId: string, productId: string, eventType: "wishlist_add" | "cart_add", variantId?: string, quantity = 1) {
  try {
    await connectToDatabase();
    await UserBehavior.create({ userId: accountId, productId, variantId, eventType, quantity, idempotencyKey: `${eventType}:${productId}:${variantId ?? "-"}:${Date.now()}`, source: "account" });
  } catch { /* Recommendations must never block commerce. */ }
}

export async function clearBehavior(accountId: string) {
  await connectToDatabase();
  const result = await UserBehavior.deleteMany({ userId: accountId });
  return { deleted: result.deletedCount };
}

export async function getRecommendations(accountId: string, query: z.infer<typeof recommendationQuerySchema>) {
  await connectToDatabase();
  const preference = await getPersonalizationPreference(accountId);
  const [events, orders, user, cart, checkouts] = await Promise.all([
    UserBehavior.find({ userId: accountId, ...(preference.enabled ? {} : { eventType: { $ne: "product_view" } }) }).sort({ occurredAt: -1 }).limit(300).lean(),
    Order.find({ userId: accountId, status: { $in: ["confirmed", "fulfilled"] } }).select("items.productId createdAt").sort({ createdAt: -1 }).limit(30).lean(),
    User.findById(accountId).select("wishlistProductIds").lean(),
    Cart.findOne({ userId: accountId, status: { $in: ["active", "checkout_started"] } }).select("items.variantId updatedAt").lean(),
    CheckoutSession.find({ userId: accountId, status: { $in: ["started", "reserved", "payment_pending"] } }).select("items.variantId updatedAt").sort({ updatedAt: -1 }).limit(10).lean(),
  ]) as unknown as [Array<{ productId: unknown; eventType: string; occurredAt: Date }>, Array<{ items: Array<{ productId: string }>; createdAt: Date }>, { wishlistProductIds?: unknown[] } | null, { items?: Array<{ variantId: unknown }>; updatedAt?: Date } | null, Array<{ items?: Array<{ variantId: unknown }>; updatedAt?: Date }>];
  const signalIds = new Set<string>();
  const signalWeights = new Map<string, number>();
  const now = Date.now();
  const addWeight = (id: string, base: number, occurredAt: Date) => {
    signalIds.add(id);
    const ageDays = Math.max(0, (now - +new Date(occurredAt)) / 86_400_000);
    signalWeights.set(id, (signalWeights.get(id) ?? 0) + base * Math.pow(0.5, ageDays / 45));
  };
  const eventBase: Record<string, number> = { product_view: 1, wishlist_add: 4, cart_add: 6, checkout_start: 8, purchase: 12 };
  events.forEach((e) => addWeight(String(e.productId), eventBase[e.eventType] ?? 1, e.occurredAt));
  orders.forEach((o) => o.items.forEach((i) => addWeight(String(i.productId), 12, o.createdAt)));
  user?.wishlistProductIds?.forEach((id) => addWeight(String(id), 4, new Date()));
  const variantSignals = [
    ...(cart?.items ?? []).map((item) => ({ variantId: item.variantId, weight: 6, at: cart?.updatedAt ?? new Date() })),
    ...checkouts.flatMap((checkout) => (checkout.items ?? []).map((item) => ({ variantId: item.variantId, weight: 8, at: checkout.updatedAt ?? new Date() }))),
  ];
  const signalVariants = variantSignals.length ? await ProductVariant.find({ _id: { $in: variantSignals.map((item) => item.variantId) } }).select("productId").lean() : [];
  const variantProductMap = new Map(signalVariants.map((variant) => [String(variant._id), String(variant.productId)]));
  variantSignals.forEach((signal) => { const productId = variantProductMap.get(String(signal.variantId)); if (productId) addWeight(productId, signal.weight, signal.at); });
  const signalProducts = await Product.find({ _id: { $in: [...signalIds] } }).select("categoryId subcategoryId collectionIds styleTags material seasons occasions").lean();
  const affinity = { category: new Map<string, number>(), subcategory: new Map<string, number>(), collections: new Map<string, number>(), tags: new Map<string, number>() };
  const bump = (map: Map<string, number>, key: string, value: number) => map.set(key, (map.get(key) ?? 0) + value);
  signalProducts.forEach((p) => {
    const weight = signalWeights.get(String(p._id)) ?? 1;
    bump(affinity.category, String(p.categoryId), weight); bump(affinity.subcategory, String(p.subcategoryId), weight);
    p.collectionIds?.forEach((id: unknown) => bump(affinity.collections, String(id), weight));
    for (const field of [p.styleTags, p.material, p.seasons, p.occasions]) for (const values of Object.values(field ?? {}) as string[][]) values?.forEach((v) => bump(affinity.tags, v.toLowerCase(), weight));
  });
  // Start from positive inventory, then join active locations, variants, and products.
  // Limiting after these joins guarantees that an eligible older product is not hidden
  // by a window of newer sold-out catalog rows.
  const candidates = await InventoryBalance.aggregate([
    { $match: { $expr: { $gt: [{ $subtract: [{ $subtract: [{ $ifNull: ["$onHand", 0] }, { $ifNull: ["$reserved", 0] }] }, { $ifNull: ["$safetyStock", 0] }] }, 0] } } },
    { $lookup: { from: InventoryLocation.collection.name, localField: "locationId", foreignField: "_id", as: "location" } },
    { $unwind: "$location" },
    { $match: { "location.isActive": true, "location.storeId": { $ne: null } } },
    { $lookup: { from: Store.collection.name, localField: "location.storeId", foreignField: "_id", as: "store" } },
    { $unwind: "$store" },
    { $match: { "store.isActive": true, $expr: { $eq: ["$location.cityId", "$store.cityId"] } } },
    { $lookup: { from: City.collection.name, localField: "store.cityId", foreignField: "_id", as: "city" } },
    { $unwind: "$city" },
    { $match: { "city.isActive": true } },
    { $lookup: { from: ProductVariant.collection.name, localField: "variantId", foreignField: "_id", as: "variant" } },
    { $unwind: "$variant" },
    { $match: { "variant.isActive": true } },
    { $lookup: { from: Product.collection.name, localField: "variant.productId", foreignField: "_id", as: "product" } },
    { $unwind: "$product" },
    { $match: { "product.status": "active" } },
    { $group: { _id: "$product._id", product: { $first: "$product" } } },
    { $sort: { _id: -1 } },
    { $limit: 500 },
    { $replaceRoot: { newRoot: "$product" } },
  ]);
  const ranked = candidates.map((p) => {
    let score = 0;
    if (signalIds.has(String(p._id))) score -= 1_000;
    score += (affinity.category.get(String(p.categoryId)) ?? 0) * 5;
    score += (affinity.subcategory.get(String(p.subcategoryId)) ?? 0) * 8;
    score += (p.collectionIds ?? []).reduce((sum: number, id: unknown) => sum + (affinity.collections.get(String(id)) ?? 0) * 4, 0);
    for (const field of [p.styleTags, p.material, p.seasons, p.occasions]) for (const values of Object.values(field ?? {}) as string[][]) score += values?.reduce((sum, v) => sum + (affinity.tags.get(v.toLowerCase()) ?? 0), 0) ?? 0;
    return { product: p, score };
  }).sort((a, b) => b.score - a.score || String(b.product._id).localeCompare(String(a.product._id))).slice(0, query.limit);
  const images = await ImageAsset.find({ _id: { $in: ranked.map((r) => r.product.primaryImageId).filter(Boolean) }, isActive: true }).select("url alt objectPosition").lean();
  const imageMap = new Map(images.map((i) => [String(i._id), i]));
  const hasSignals = signalIds.size > 0;
  return { mode: hasSignals ? "personalized" : "discovery", emptyReason: ranked.length ? null : "no_sellable_products", items: ranked.map(({ product, score }) => { const image = imageMap.get(String(product.primaryImageId)); return {
    id: String(product._id), slug: product.slug, name: localized(product.name, product.slug, query.locale),
    priceMinor: product.basePriceMinor, currency: product.currency,
    image: image ? { url: image.url, alt: localized(image.alt, product.slug, query.locale), objectPosition: product.primaryImageObjectPosition ?? image.objectPosition ?? "center" } : null,
    reason: score > 0 ? (query.locale === "en" ? "Based on your interests" : query.locale === "ar" ? "بناءً على اهتماماتك" : "براساس علاقه‌مندی‌های شما") : (query.locale === "en" ? "Selected for you" : query.locale === "ar" ? "مختار لك" : "انتخاب‌شده برای شما"),
  }; }) };
}
