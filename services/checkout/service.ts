import "server-only";

import mongoose, { type ClientSession } from "mongoose";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { connectToDatabase } from "@/lib/server/db";
import { conflict, notFound } from "@/lib/server/errors";
import { Cart } from "@/models/catalog/cart";
import { CheckoutSession } from "@/models/catalog/checkout";
import { Color } from "@/models/catalog/color";
import { Outbox } from "@/models/catalog/outbox";
import { ProductVariant } from "@/models/catalog/product-variant";
import { Product } from "@/models/catalog/product";
import { Size } from "@/models/catalog/size";
import { City } from "@/models/inventory/city";
import { InventoryBalance } from "@/models/inventory/inventory-balance";
import { InventoryLocation } from "@/models/inventory/inventory-location";
import { Store } from "@/models/inventory/store";
import { PaymentIntent } from "@/models/payment/payment-intent";
import {
  reserveInventoryInSession,
  transitionInventoryReservationInSession,
} from "@/services/inventory/service";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "شناسه معتبر نیست.");
const idempotencyKeySchema = z
  .string()
  .trim()
  .min(8)
  .max(120)
  .regex(/^[A-Za-z0-9._:-]+$/);

export const startCheckoutSchema = z.object({
  idempotencyKey: idempotencyKeySchema,
  storeId: objectIdSchema,
  cityId: objectIdSchema,
}).strict();

export const checkoutActionSchema = z.object({
  action: z.literal("cancel"),
}).strict();

const CHECKOUT_TTL_MS = 15 * 60 * 1000;

type CartItem = {
  variantId: unknown;
  quantity: number;
  unitPriceMinor: number;
};

type VariantRecord = {
  _id: unknown;
  productId: unknown;
  colorId: unknown;
  sizeId: unknown;
  priceOverrideMinor?: number;
};

type ProductRecord = {
  _id: unknown;
  basePriceMinor: number;
  currency: string;
};

type BalanceRecord = {
  variantId: unknown;
  locationId: unknown;
  onHand: number;
  reserved: number;
  safetyStock: number;
};

type AvailabilityCartRecord = {
  items: Array<{ variantId: unknown; quantity: number }>;
};

type CheckoutRecord = {
  _id: unknown;
  cartId: string;
  userId?: string;
  storeId: string;
  cityId: string;
  currency: string;
  items: Array<{ variantId: string; quantity: number; unitPriceMinor: number }>;
  status: string;
  expiresAt: Date;
  correlationId: string;
  inventoryReservationId?: string;
  paymentId?: unknown;
  createdAt?: Date;
  updatedAt?: Date;
};

type DestinationRecord = {
  cities: Array<{ id: string; code: string; name: unknown }>;
  stores: Array<{
    id: string;
    code: string;
    cityId: string;
    name: unknown;
    address: unknown;
  }>;
};

function duplicateKey(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

function serializeCheckout(value: CheckoutRecord, idempotent = false) {
  return {
    id: String(value._id),
    cartId: value.cartId,
    storeId: value.storeId,
    cityId: value.cityId,
    currency: value.currency,
    status: value.status,
    expiresAt: value.expiresAt,
    correlationId: value.correlationId,
    inventoryReservationId: value.inventoryReservationId ?? null,
    paymentId: value.paymentId ? String(value.paymentId) : null,
    itemCount: value.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotalMinor: value.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPriceMinor,
      0,
    ),
    items: value.items,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    idempotent,
  };
}

async function existingForKey(
  idempotencyKey: string,
  accountId: string,
  storeId: string,
  cityId: string,
  session?: ClientSession,
) {
  const query = CheckoutSession.findOne({ idempotencyKey });
  if (session) query.session(session);
  const existing = await query.lean() as unknown as CheckoutRecord | null;
  if (!existing) return null;
  if (
    existing.userId !== accountId ||
    existing.storeId !== storeId ||
    existing.cityId !== cityId
  ) {
    conflict("این کلید قبلاً برای Checkout دیگری استفاده شده است.");
  }
  return serializeCheckout(existing, true);
}

async function validateDestination(storeId: string, cityId: string, session: ClientSession) {
  const [city, store] = await Promise.all([
    City.exists({ _id: cityId, isActive: true }).session(session),
    Store.exists({ _id: storeId, cityId, isActive: true }).session(session),
  ]);
  if (!city || !store) conflict("شهر یا فروشگاه انتخاب‌شده فعال و معتبر نیست.");

  const locationIds = await InventoryLocation.find({
    storeId,
    cityId,
    isActive: true,
  }).session(session).distinct("_id");
  if (locationIds.length === 0) conflict("برای فروشگاه انتخاب‌شده محل موجودی فعالی وجود ندارد.");
  return locationIds;
}

async function priceCartItems(items: CartItem[], currency: string, session: ClientSession) {
  const variantIds = items.map((item) => item.variantId);
  const variants = await ProductVariant.find({
    _id: { $in: variantIds },
    isActive: true,
  }).session(session).lean() as unknown as VariantRecord[];
  const variantMap = new Map(variants.map((item) => [String(item._id), item]));

  const [products, activeColorIds, activeSizeIds] = await Promise.all([
    Product.find({
      _id: { $in: variants.map((item) => item.productId) },
      status: "active",
    }).select("basePriceMinor currency").session(session).lean() as unknown as Promise<ProductRecord[]>,
    Color.find({
      _id: { $in: variants.map((item) => item.colorId) },
      isActive: true,
    }).session(session).distinct("_id"),
    Size.find({
      _id: { $in: variants.map((item) => item.sizeId) },
      isActive: true,
    }).session(session).distinct("_id"),
  ]);
  const productMap = new Map(products.map((item) => [String(item._id), item]));
  const colorSet = new Set(activeColorIds.map(String));
  const sizeSet = new Set(activeSizeIds.map(String));

  return items.map((item) => {
    const variant = variantMap.get(String(item.variantId));
    const product = variant ? productMap.get(String(variant.productId)) : undefined;
    if (
      !variant ||
      !product ||
      !colorSet.has(String(variant.colorId)) ||
      !sizeSet.has(String(variant.sizeId))
    ) {
      conflict("یکی از کالاهای سبد دیگر قابل فروش نیست.");
    }
    if (product.currency.toUpperCase() !== currency) {
      conflict("ارز یکی از کالاها با ارز سبد هماهنگ نیست.");
    }
    return {
      variantId: String(item.variantId),
      quantity: item.quantity,
      unitPriceMinor: variant.priceOverrideMinor ?? product.basePriceMinor,
    };
  });
}

async function allocateInventory(
  items: Array<{ variantId: string; quantity: number }>,
  locationIds: unknown[],
  session: ClientSession,
) {
  const balances = await InventoryBalance.find({
    variantId: { $in: items.map((item) => item.variantId) },
    locationId: { $in: locationIds },
  }).sort({ _id: 1 }).session(session).lean() as unknown as BalanceRecord[];

  const allocations: Array<{ variantId: string; locationId: string; quantity: number }> = [];
  for (const item of items) {
    let remaining = item.quantity;
    for (const balance of balances) {
      if (String(balance.variantId) !== item.variantId || remaining === 0) continue;
      const available = Math.max(balance.onHand - balance.reserved - balance.safetyStock, 0);
      const quantity = Math.min(available, remaining);
      if (quantity > 0) {
        allocations.push({
          variantId: item.variantId,
          locationId: String(balance.locationId),
          quantity,
        });
        remaining -= quantity;
      }
    }
    if (remaining > 0) conflict("موجودی قابل فروش یکی از کالاهای سبد کافی نیست.");
  }
  return allocations;
}

async function loadDestinations(): Promise<DestinationRecord> {
  const activeLocations = await InventoryLocation.find({ isActive: true, storeId: { $ne: null } })
    .select("cityId storeId")
    .lean();
  const cityIds = [...new Set(activeLocations.map((item) => String(item.cityId)))];
  const storeIds = [...new Set(activeLocations.map((item) => String(item.storeId)))];
  const [cities, stores] = await Promise.all([
    City.find({ _id: { $in: cityIds }, isActive: true })
      .select("code name")
      .sort({ code: 1 })
      .lean(),
    Store.find({ _id: { $in: storeIds }, cityId: { $in: cityIds }, isActive: true })
      .select("code name cityId address")
      .sort({ code: 1 })
      .lean(),
  ]);
  const activeCityIds = new Set(cities.map((city) => String(city._id)));
  return {
    cities: cities.map((city) => ({
      id: String(city._id),
      code: city.code,
      name: city.name,
    })),
    stores: stores
      .filter((store) => activeCityIds.has(String(store.cityId)))
      .map((store) => ({
        id: String(store._id),
        code: store.code,
        cityId: String(store.cityId),
        name: store.name,
        address: store.address ?? null,
      })),
  };
}

export const checkoutService = {
  async destinations() {
    await connectToDatabase();
    return loadDestinations();
  },

  async destinationsForCart(accountId: string) {
    await connectToDatabase();
    const [destinations, cart] = await Promise.all([
      loadDestinations(),
      Cart.findOne({
        userId: accountId,
        status: "active",
        expiresAt: { $gt: new Date() },
      }).select("items.variantId items.quantity").lean() as unknown as Promise<AvailabilityCartRecord | null>,
    ]);
    if (!cart || cart.items.length === 0) conflict("سبد خرید فعال و غیرخالی پیدا نشد.");

    const requestedByVariant = new Map<string, number>();
    for (const item of cart.items) {
      const variantId = String(item.variantId);
      requestedByVariant.set(variantId, (requestedByVariant.get(variantId) ?? 0) + item.quantity);
    }

    const destinationPairs = destinations.stores.map((store) => ({
      storeId: store.id,
      cityId: store.cityId,
    }));
    const locations = destinationPairs.length > 0
      ? await InventoryLocation.find({
          isActive: true,
          $or: destinationPairs,
        }).select("storeId cityId").lean()
      : [];
    const locationToStore = new Map(locations.map((location) => [String(location._id), String(location.storeId)]));
    const balances = await InventoryBalance.find({
      variantId: { $in: [...requestedByVariant.keys()] },
      locationId: { $in: locations.map((location) => location._id) },
    }).select("variantId locationId onHand reserved safetyStock").lean() as unknown as BalanceRecord[];

    const availableByStoreVariant = new Map<string, number>();
    for (const balance of balances) {
      const storeId = locationToStore.get(String(balance.locationId));
      if (!storeId) continue;
      const key = `${storeId}:${String(balance.variantId)}`;
      const sellable = Math.max(balance.onHand - balance.reserved - balance.safetyStock, 0);
      availableByStoreVariant.set(key, (availableByStoreVariant.get(key) ?? 0) + sellable);
    }

    const stores = destinations.stores.map((store) => {
      let unavailableItemCount = 0;
      for (const [variantId, quantity] of requestedByVariant) {
        if ((availableByStoreVariant.get(`${store.id}:${variantId}`) ?? 0) < quantity) {
          unavailableItemCount += 1;
        }
      }
      return { ...store, available: unavailableItemCount === 0, unavailableItemCount };
    });

    return {
      cities: destinations.cities,
      stores,
      availableStoreCount: stores.filter((store) => store.available).length,
    };
  },

  async start(accountId: string, value: unknown) {
    const input = startCheckoutSchema.parse(value);
    await connectToDatabase();
    const previous = await existingForKey(
      input.idempotencyKey,
      accountId,
      input.storeId,
      input.cityId,
    );
    if (previous) return previous;

    try {
      return await mongoose.connection.transaction(async (session) => {
        const repeated = await existingForKey(
          input.idempotencyKey,
          accountId,
          input.storeId,
          input.cityId,
          session,
        );
        if (repeated) return repeated;

        const cart = await Cart.findOne({
          userId: accountId,
          status: "active",
          expiresAt: { $gt: new Date() },
        }).session(session);
        if (!cart || cart.items.length === 0) conflict("سبد خرید فعال و غیرخالی پیدا نشد.");

        const locationIds = await validateDestination(input.storeId, input.cityId, session);
        const checkoutItems = await priceCartItems(
          cart.items as unknown as CartItem[],
          cart.currency,
          session,
        );
        const allocations = await allocateInventory(checkoutItems, locationIds, session);
        const checkoutId = new mongoose.Types.ObjectId();
        const expiresAt = new Date(Date.now() + CHECKOUT_TTL_MS);
        const correlationId = randomUUID();
        const reservation = await reserveInventoryInSession({
          idempotencyKey: `${input.idempotencyKey}:inventory`,
          cartId: cart.id,
          checkoutSessionId: checkoutId.toString(),
          userId: accountId,
          items: allocations,
          expiresAt,
        }, session, accountId);

        const [checkout] = await CheckoutSession.create([{
          _id: checkoutId,
          cartId: cart.id,
          idempotencyKey: input.idempotencyKey,
          userId: accountId,
          storeId: input.storeId,
          cityId: input.cityId,
          currency: cart.currency,
          items: checkoutItems,
          status: "reserved",
          expiresAt,
          correlationId,
          inventoryReservationId: reservation.id,
        }], { session });

        cart.storeId = input.storeId;
        cart.cityId = input.cityId;
        cart.status = "checkout_started";
        for (const item of cart.items) {
          const priced = checkoutItems.find(
            (candidate) => candidate.variantId === String(item.variantId),
          );
          if (priced) item.unitPriceMinor = priced.unitPriceMinor;
        }
        await cart.save({ session });
        await Outbox.create([{
          eventId: randomUUID(),
          eventType: "CheckoutInventoryReserved",
          correlationId,
          destination: "events",
          payload: {
            checkoutSessionId: checkout.id,
            cartId: cart.id,
            inventoryReservationId: reservation.id,
            userId: accountId,
          },
        }], { session });

        return serializeCheckout(checkout.toObject() as unknown as CheckoutRecord);
      });
    } catch (error) {
      if (duplicateKey(error)) {
        const existing = await existingForKey(
          input.idempotencyKey,
          accountId,
          input.storeId,
          input.cityId,
        );
        if (existing) return existing;
      }
      throw error;
    }
  },

  async get(accountId: string, id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) notFound("Checkout پیدا نشد.");
    await connectToDatabase();
    const checkout = await CheckoutSession.findOne({ _id: id, userId: accountId })
      .lean() as unknown as CheckoutRecord | null;
    if (!checkout) notFound("Checkout پیدا نشد.");
    return serializeCheckout(checkout);
  },

  async act(accountId: string, id: string, value: unknown) {
    if (!mongoose.Types.ObjectId.isValid(id)) notFound("Checkout پیدا نشد.");
    checkoutActionSchema.parse(value);
    await connectToDatabase();

    return mongoose.connection.transaction(async (session) => {
      const checkout = await CheckoutSession.findOne({ _id: id, userId: accountId })
        .session(session);
      if (!checkout) notFound("Checkout پیدا نشد.");
      if (checkout.status === "cancelled") {
        return serializeCheckout(checkout.toObject() as unknown as CheckoutRecord, true);
      }
      if (!(["reserved", "payment_pending"] as string[]).includes(checkout.status) || !checkout.inventoryReservationId) {
        conflict(`Checkout با وضعیت ${checkout.status} قابل لغو نیست.`);
      }

      await transitionInventoryReservationInSession(
        checkout.inventoryReservationId,
        { action: "release", reason: "لغو Checkout توسط مشتری" },
        session,
        accountId,
      );
      checkout.status = "cancelled";
      await checkout.save({ session });
      await Promise.all([
        Cart.updateOne(
          { _id: checkout.cartId, userId: accountId, status: "checkout_started" },
          { $set: { status: "active" } },
          { session },
        ),
        PaymentIntent.updateOne(
          {
            checkoutSessionId: checkout.id,
            userId: accountId,
            status: { $in: ["requires_action", "processing", "failed"] },
          },
          { $set: { status: "cancelled" } },
          { session },
        ),
      ]);
      await Outbox.create([{
        eventId: randomUUID(),
        eventType: "CheckoutCancelled",
        correlationId: checkout.correlationId,
        destination: "events",
        payload: {
          checkoutSessionId: checkout.id,
          cartId: checkout.cartId,
          inventoryReservationId: checkout.inventoryReservationId,
          userId: accountId,
        },
      }], { session });
      return serializeCheckout(checkout.toObject() as unknown as CheckoutRecord);
    });
  },
};
