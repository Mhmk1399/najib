import "server-only";

import mongoose, { type ClientSession } from "mongoose";
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { explicitPriceForCurrency, type CheckoutCurrency } from "@/lib/catalog/currency";
import { connectToDatabase } from "@/lib/server/db";
import { conflict, notFound } from "@/lib/server/errors";
import { Cart } from "@/models/catalog/cart";
import { CheckoutSession } from "@/models/catalog/checkout";
import { Color } from "@/models/catalog/color";
import { Outbox } from "@/models/catalog/outbox";
import { Product } from "@/models/catalog/product";
import { ProductVariant } from "@/models/catalog/product-variant";
import { Size } from "@/models/catalog/size";
import { City } from "@/models/inventory/city";
import { InventoryBalance } from "@/models/inventory/inventory-balance";
import { InventoryLocation } from "@/models/inventory/inventory-location";
import { Store } from "@/models/inventory/store";
import { PaymentIntent } from "@/models/payment/payment-intent";
import { reserveInventoryInSession, transitionInventoryReservationInSession } from "@/services/inventory/service";

const key = z.string().trim().min(8).max(120).regex(/^[A-Za-z0-9._:-]+$/);
export const startCheckoutSchema = z.object({ idempotencyKey: key, currency: z.enum(["IRR", "USD"]), fulfillmentPlanHash: z.string().length(64).regex(/^[a-f\d]+$/i) }).strict();
export const checkoutActionSchema = z.object({ action: z.literal("cancel") }).strict();
const TTL = 15 * 60 * 1000;
type Text = { fa: string; en: string; ar: string };
type CartItem = { variantId: unknown; quantity: number; unitPriceMinor: number };
type CartRecord = { _id: mongoose.Types.ObjectId; id: string; currency: string; status: string; items: CartItem[]; storeId?: string; cityId?: string; save(o?: { session?: ClientSession }): Promise<unknown> };
type Priced = { variantId: string; quantity: number; unitPriceMinor: number; productName: Text; colorName: Text; sizeName: Text; sku: string };
type Allocation = { variantId: string; locationId: string; quantity: number; productName: Text; colorName: Text; sizeName: Text; sku: string };
type Shipment = { storeId: string; cityId: string; storeCode: string; storeName: Text; address?: Text; shippingMinor: number; items: Allocation[] };
type Plan = { fulfillable: true; fulfillmentPlanHash: string; shipments: Shipment[]; shipmentCount: number; shippingMinor: number } | { fulfillable: false; fulfillmentPlanHash: null; shipments: []; shipmentCount: 0; shippingMinor: 0; unavailableItems: Array<{ variantId: string; requested: number; available: number; productName: Text; colorName: Text; sizeName: Text; sku: string }> };
type CheckoutRecord = { _id: unknown; cartId: string; userId?: string; storeId: string; cityId: string; currency: string; items: Array<{ variantId: string; quantity: number; unitPriceMinor: number }>; shipments?: Shipment[]; shippingMinor?: number; fulfillmentPlanHash?: string; status: string; expiresAt: Date; correlationId: string; inventoryReservationId?: string; paymentId?: unknown; createdAt?: Date; updatedAt?: Date };
type StoreRecord = { _id: unknown; code: string; cityId: unknown; name: Text; address?: Text; shippingFeeMinor?: number; shippingFeeIrrMinor?: number; shippingFeeUsdMinor?: number };
type Location = { _id: unknown; storeId: unknown; cityId: unknown };
type Balance = { variantId: unknown; locationId: unknown; onHand: number; reserved: number; safetyStock: number };

function duplicate(error: unknown) { return typeof error === "object" && error !== null && "code" in error && error.code === 11000; }
function itemSubtotal(items: CheckoutRecord["items"]) { return items.reduce((sum, item) => sum + item.quantity * item.unitPriceMinor, 0); }
function reservationItem(item: Allocation) { return { variantId: item.variantId, locationId: item.locationId, quantity: item.quantity }; }
function shipmentItem(item: Allocation) { return { ...reservationItem(item), productName: item.productName, colorName: item.colorName, sizeName: item.sizeName, sku: item.sku }; }
function checkoutItem(item: Priced) { return { variantId: item.variantId, quantity: item.quantity, unitPriceMinor: item.unitPriceMinor, productName: item.productName, colorName: item.colorName, sizeName: item.sizeName, sku: item.sku }; }
function serialize(value: CheckoutRecord, idempotent = false) { const shippingMinor = value.shippingMinor ?? 0; const subtotalMinor = itemSubtotal(value.items); return { id: String(value._id), cartId: value.cartId, storeId: value.storeId, cityId: value.cityId, currency: value.currency, status: value.status, expiresAt: value.expiresAt, correlationId: value.correlationId, inventoryReservationId: value.inventoryReservationId ?? null, paymentId: value.paymentId ? String(value.paymentId) : null, itemCount: value.items.reduce((sum, item) => sum + item.quantity, 0), subtotalMinor, shippingMinor, totalMinor: subtotalMinor + shippingMinor, shipments: value.shipments ?? [], fulfillmentPlanHash: value.fulfillmentPlanHash ?? null, items: value.items, createdAt: value.createdAt, updatedAt: value.updatedAt, idempotent }; }
async function existing(idempotencyKey: string, accountId: string, session?: ClientSession) { const query = CheckoutSession.findOne({ idempotencyKey }); if (session) query.session(session); const found = await query.lean() as unknown as CheckoutRecord | null; if (!found) return null; if (found.userId !== accountId) conflict("این کلید قبلاً برای Checkout دیگری استفاده شده است."); return serialize(found, true); }

async function cartFor(accountId: string, session?: ClientSession) { const query = Cart.findOne({ userId: accountId, status: "active", expiresAt: { $gt: new Date() } }); if (session) query.session(session); const cart = await query as unknown as CartRecord | null; if (!cart?.items.length) conflict("سبد خرید فعال و غیرخالی پیدا نشد."); return cart; }

async function price(items: CartItem[], currency: string, session?: ClientSession): Promise<Priced[]> {
  const ids = items.map((item) => item.variantId); const vq = ProductVariant.find({ _id: { $in: ids }, isActive: true }); if (session) vq.session(session);
  const variants = await vq.lean() as unknown as Array<{ _id: unknown; productId: unknown; colorId: unknown; sizeId: unknown; priceOverrideMinor?: number; priceOverrideIrrMinor?: number; priceOverrideUsdMinor?: number; sku: string }>;
  const vm = new Map(variants.map((v) => [String(v._id), v]));
  const pq = Product.find({ _id: { $in: variants.map((v) => v.productId) }, status: "active" }).select("basePriceMinor currency priceIrrMinor priceUsdMinor name");
  const cq = Color.find({ _id: { $in: variants.map((v) => v.colorId) }, isActive: true }).select("name"); const sq = Size.find({ _id: { $in: variants.map((v) => v.sizeId) }, isActive: true }).select("name");
  if (session) { pq.session(session); cq.session(session); sq.session(session); }
  const [products, colors, sizes] = await Promise.all([pq.lean() as unknown as Promise<Array<{ _id: unknown; basePriceMinor: number; currency: string; priceIrrMinor?: number; priceUsdMinor?: number; name: Text }>>, cq.lean() as unknown as Promise<Array<{ _id: unknown; name: Text }>>, sq.lean() as unknown as Promise<Array<{ _id: unknown; name: Text }>>]);
  const pm = new Map(products.map((p) => [String(p._id), p])); const cm = new Map(colors.map((c) => [String(c._id), c.name])); const sm = new Map(sizes.map((s) => [String(s._id), s.name]));
  return items.map((item) => { const variant = vm.get(String(item.variantId)); const product = variant && pm.get(String(variant.productId)); const colorName = variant && cm.get(String(variant.colorId)); const sizeName = variant && sm.get(String(variant.sizeId)); if (!variant || !product || !colorName || !sizeName) conflict("یکی از کالاهای سبد دیگر قابل فروش نیست."); const chosen = currency as CheckoutCurrency; const unitPriceMinor = explicitPriceForCurrency({ priceIrrMinor: variant.priceOverrideIrrMinor, priceUsdMinor: variant.priceOverrideUsdMinor, basePriceMinor: variant.priceOverrideMinor, currency: product.currency }, chosen) ?? explicitPriceForCurrency(product, chosen); if (unitPriceMinor === null) conflict("یکی از کالاهای سبد در ارز انتخاب‌شده قیمت ندارد.", { code: "PRICE_NOT_AVAILABLE", currency, variantId: String(item.variantId), productName: product.name }); return { variantId: String(item.variantId), quantity: item.quantity, unitPriceMinor, productName: product.name, colorName, sizeName, sku: variant.sku }; });
}

function combos<T>(items: T[], size: number, start = 0, picked: T[] = [], out: T[][] = []): T[][] { if (picked.length === size) { out.push([...picked]); return out; } for (let i = start; i <= items.length - (size - picked.length); i += 1) { picked.push(items[i]); combos(items, size, i + 1, picked, out); picked.pop(); } return out; }

async function planFor(items: Priced[], currency: string, session?: ClientSession): Promise<Plan> {
  const lq = InventoryLocation.find({ isActive: true, storeId: { $ne: null } }).select("storeId cityId").sort({ _id: 1 }); if (session) lq.session(session); const locations = await lq.lean() as unknown as Location[];
  const cityQuery = City.find({ _id: { $in: [...new Set(locations.map((l) => String(l.cityId)))] }, isActive: true }).select("_id"); if (session) cityQuery.session(session); const activeCityIds = new Set((await cityQuery.distinct("_id")).map(String));
  const sq = Store.find({ _id: { $in: [...new Set(locations.map((l) => String(l.storeId)))] }, isActive: true }).select("code name cityId address shippingFeeMinor shippingFeeIrrMinor shippingFeeUsdMinor").sort({ code: 1, _id: 1 }); if (session) sq.session(session); const stores = await sq.lean() as unknown as StoreRecord[];
  const fee = (store: StoreRecord) => currency === "USD" ? store.shippingFeeUsdMinor : (store.shippingFeeIrrMinor ?? store.shippingFeeMinor);
  const storeCities = new Map(stores.filter((s) => activeCityIds.has(String(s.cityId))).map((s) => [String(s._id), String(s.cityId)])); const activeStores = stores.filter((s) => storeCities.has(String(s._id)) && Number.isSafeInteger(fee(s))); const validLocations = locations.filter((l) => storeCities.get(String(l.storeId)) === String(l.cityId) && activeStores.some((store) => String(store._id) === String(l.storeId))); const lm = new Map(validLocations.map((l) => [String(l._id), l]));
  const bq = InventoryBalance.find({ variantId: { $in: items.map((i) => i.variantId) }, locationId: { $in: validLocations.map((l) => l._id) } }).select("variantId locationId onHand reserved safetyStock").sort({ _id: 1 }); if (session) bq.session(session); const balances = await bq.lean() as unknown as Balance[];
  const cap = new Map<string, number>(); for (const b of balances) { const l = lm.get(String(b.locationId)); if (!l) continue; const k = `${String(l.storeId)}:${String(b.variantId)}`; cap.set(k, (cap.get(k) ?? 0) + Math.max(b.onHand - b.reserved - b.safetyStock, 0)); }
  const covers = (selection: StoreRecord[]) => items.every((i) => selection.reduce((sum, s) => sum + (cap.get(`${String(s._id)}:${i.variantId}`) ?? 0), 0) >= i.quantity);
  let selected: StoreRecord[] | undefined;
  if (activeStores.length <= 15) { for (let n = 1; n <= activeStores.length && !selected; n += 1) selected = combos(activeStores, n).filter(covers).sort((a, b) => a.reduce((s, x) => s + Number(fee(x)), 0) - b.reduce((s, x) => s + Number(fee(x)), 0) || a.map((x) => x.code).join("|").localeCompare(b.map((x) => x.code).join("|")))[0]; }
  else { const left = new Map(items.map((i) => [i.variantId, i.quantity])); const candidates = [...activeStores]; selected = []; while ([...left.values()].some((v) => v > 0) && candidates.length) { const score = (s: StoreRecord) => [...left].reduce((sum, [v, q]) => sum + Math.min(q, cap.get(`${String(s._id)}:${v}`) ?? 0), 0); candidates.sort((a, b) => score(b) - score(a) || Number(fee(a)) - Number(fee(b)) || a.code.localeCompare(b.code)); const s = candidates.shift()!; selected.push(s); for (const [v, q] of left) left.set(v, Math.max(0, q - (cap.get(`${String(s._id)}:${v}`) ?? 0))); } if (!covers(selected)) selected = undefined; }
  if (!selected) { const unavailableItems = items.map((item) => ({ variantId: item.variantId, requested: item.quantity, available: activeStores.reduce((sum, store) => sum + (cap.get(`${String(store._id)}:${item.variantId}`) ?? 0), 0), productName: item.productName, colorName: item.colorName, sizeName: item.sizeName, sku: item.sku })).filter((item) => item.available < item.requested); return { fulfillable: false, fulfillmentPlanHash: null, shipments: [], shipmentCount: 0, shippingMinor: 0, unavailableItems }; }
  const selectedSet = new Set(selected.map((s) => String(s._id))); const shipments: Shipment[] = selected.map((s) => ({ storeId: String(s._id), cityId: String(s.cityId), storeCode: s.code, storeName: s.name, address: s.address, shippingMinor: Number(fee(s)), items: [] })); const sm = new Map(shipments.map((s) => [s.storeId, s]));
  for (const item of items) { let left = item.quantity; const rows = balances.filter((b) => String(b.variantId) === item.variantId && selectedSet.has(String(lm.get(String(b.locationId))?.storeId))).sort((a, b) => Math.max(b.onHand - b.reserved - b.safetyStock, 0) - Math.max(a.onHand - a.reserved - a.safetyStock, 0) || String(a.locationId).localeCompare(String(b.locationId))); for (const row of rows) { if (!left) break; const quantity = Math.min(left, Math.max(row.onHand - row.reserved - row.safetyStock, 0)); if (!quantity) continue; sm.get(String(lm.get(String(row.locationId))!.storeId))!.items.push({ variantId: item.variantId, locationId: String(row.locationId), quantity, productName: item.productName, colorName: item.colorName, sizeName: item.sizeName, sku: item.sku }); left -= quantity; } if (left) conflict("موجودی قابل فروش یکی از کالاهای سبد کافی نیست."); }
  const used = shipments.filter((s) => s.items.length).sort((a, b) => a.storeCode.localeCompare(b.storeCode)); const canonical = { currency, pricedItems: items.map(checkoutItem).sort((a, b) => a.variantId.localeCompare(b.variantId)), shipments: used.map((s) => ({ storeId: s.storeId, cityId: s.cityId, shippingMinor: s.shippingMinor, items: s.items.map(reservationItem).sort((a, b) => `${a.variantId}:${a.locationId}`.localeCompare(`${b.variantId}:${b.locationId}`)) })) }; const fulfillmentPlanHash = createHash("sha256").update(JSON.stringify(canonical)).digest("hex");
  return { fulfillable: true, fulfillmentPlanHash, shipments: used, shipmentCount: used.length, shippingMinor: used.reduce((sum, s) => sum + s.shippingMinor, 0) };
}

export const checkoutService = {
  async destinations() { return { cities: [], stores: [] }; },
  async destinationsForCart(accountId: string, currency?: CheckoutCurrency) { await connectToDatabase(); const cart = await cartFor(accountId); const selected = currency ?? cart.currency as CheckoutCurrency; const items = await price(cart.items, selected); const plan = await planFor(items, selected); const subtotalMinor = items.reduce((sum, i) => sum + i.quantity * i.unitPriceMinor, 0); return { ...plan, currency: selected, subtotalMinor, totalMinor: subtotalMinor + plan.shippingMinor }; },
  async start(accountId: string, value: unknown) {
    const input = startCheckoutSchema.parse(value);
    await connectToDatabase();
    const old = await existing(input.idempotencyKey, accountId);
    if (old) return old;
    try {
      return await mongoose.connection.transaction(async (session) => {
        const repeated = await existing(input.idempotencyKey, accountId, session);
        if (repeated) return repeated;
        const cart = await cartFor(accountId, session);
        cart.currency = input.currency;
        const attribution = await Cart.collection.findOne({ _id: cart._id }, { projection: { recoveryAbandonedCheckoutId: 1 }, session });
        const priced = await price(cart.items, cart.currency, session);
        const plan = await planFor(priced, cart.currency, session);
        if (!plan.fulfillable) conflict("موجودی مجموع شعبه‌ها برای تکمیل سبد کافی نیست.", { code: "INSUFFICIENT_INVENTORY", unavailableItems: plan.unavailableItems });
        if (input.fulfillmentPlanHash !== plan.fulfillmentPlanHash) conflict("موجودی، قیمت یا برنامه ارسال تغییر کرده است؛ برنامه جدید را دوباره تأیید کنید.", { code: "STALE_FULFILLMENT_PLAN" });
        const checkoutId = new mongoose.Types.ObjectId(); const expiresAt = new Date(Date.now() + TTL); const correlationId = randomUUID();
        const allocations = plan.shipments.flatMap((shipment) => shipment.items.map(reservationItem));
        const reservation = await reserveInventoryInSession({ idempotencyKey: `${input.idempotencyKey}:inventory`, cartId: cart.id, checkoutSessionId: checkoutId.toString(), userId: accountId, items: allocations, expiresAt }, session, accountId);
        const shipments = plan.shipments.map((shipment) => ({ ...shipment, items: shipment.items.map(shipmentItem) })); const primary = shipments[0];
        const [checkout] = await CheckoutSession.create([{ _id: checkoutId, cartId: cart.id, idempotencyKey: input.idempotencyKey, userId: accountId, storeId: primary.storeId, cityId: primary.cityId, currency: cart.currency, items: priced.map(checkoutItem), shipments, shippingMinor: plan.shippingMinor, fulfillmentPlanHash: plan.fulfillmentPlanHash, status: "reserved", expiresAt, correlationId, inventoryReservationId: reservation.id, recoveryAbandonedCheckoutId: attribution?.recoveryAbandonedCheckoutId }], { session });
        // Collection update also keeps new snapshot fields during Next dev HMR when Mongoose has cached an older model schema.
        await CheckoutSession.collection.updateOne({ _id: checkoutId }, { $set: { items: priced.map(checkoutItem), shipments, shippingMinor: plan.shippingMinor, fulfillmentPlanHash: plan.fulfillmentPlanHash } }, { session });
        cart.storeId = primary.storeId; cart.cityId = primary.cityId; cart.status = "checkout_started";
        for (const item of cart.items) { const pricedItem = priced.find((candidate) => candidate.variantId === String(item.variantId)); if (pricedItem) item.unitPriceMinor = pricedItem.unitPriceMinor; }
        await cart.save({ session });
        await Outbox.create([{ eventId: randomUUID(), eventType: "CheckoutInventoryReserved", correlationId, destination: "events", payload: { checkoutSessionId: checkout.id, cartId: cart.id, inventoryReservationId: reservation.id, userId: accountId, shipmentCount: shipments.length } }], { session });
        return serialize({ ...(checkout.toObject() as unknown as CheckoutRecord), items: priced.map(checkoutItem), shipments, shippingMinor: plan.shippingMinor, fulfillmentPlanHash: plan.fulfillmentPlanHash });
      });
    } catch (error) {
      if (duplicate(error)) { const found = await existing(input.idempotencyKey, accountId); if (found) return found; }
      throw error;
    }
  },
  async get(accountId: string, id: string) { if (!mongoose.Types.ObjectId.isValid(id)) notFound("Checkout پیدا نشد."); await connectToDatabase(); const checkout = await CheckoutSession.findOne({ _id: id, userId: accountId }).lean() as unknown as CheckoutRecord | null; if (!checkout) notFound("Checkout پیدا نشد."); return serialize(checkout); },
  async act(accountId: string, id: string, value: unknown) { if (!mongoose.Types.ObjectId.isValid(id)) notFound("Checkout پیدا نشد."); checkoutActionSchema.parse(value); await connectToDatabase(); return mongoose.connection.transaction(async (session) => { const checkout = await CheckoutSession.findOne({ _id: id, userId: accountId }).session(session); if (!checkout) notFound("Checkout پیدا نشد."); if (checkout.status === "cancelled") return serialize(checkout.toObject() as unknown as CheckoutRecord, true); if (!["reserved", "payment_pending"].includes(checkout.status) || !checkout.inventoryReservationId) conflict(`Checkout با وضعیت ${checkout.status} قابل لغو نیست.`); await transitionInventoryReservationInSession(checkout.inventoryReservationId, { action: "release", reason: "لغو Checkout توسط مشتری" }, session, accountId); checkout.status = "cancelled"; await checkout.save({ session }); await Promise.all([Cart.updateOne({ _id: checkout.cartId, userId: accountId, status: "checkout_started" }, { $set: { status: "active" } }, { session }), PaymentIntent.updateOne({ checkoutSessionId: checkout.id, userId: accountId, status: { $in: ["requires_action", "processing", "failed"] } }, { $set: { status: "cancelled" } }, { session })]); await Outbox.create([{ eventId: randomUUID(), eventType: "CheckoutCancelled", correlationId: checkout.correlationId, destination: "events", payload: { checkoutSessionId: checkout.id, cartId: checkout.cartId, inventoryReservationId: checkout.inventoryReservationId, userId: accountId } }], { session }); return serialize(checkout.toObject() as unknown as CheckoutRecord); }); },
};
