import "server-only";

import mongoose, { type ClientSession, type Model } from "mongoose";
import { createHash } from "node:crypto";
import { z } from "zod";

import { connectToDatabase } from "@/lib/server/db";
import { badRequest, conflict, notFound } from "@/lib/server/errors";
import { StaffAudit } from "@/models/auth/staff-audit";
import { ProductVariant } from "@/models/catalog/product-variant";
import { City } from "@/models/inventory/city";
import { InventoryBalance } from "@/models/inventory/inventory-balance";
import { InventoryBatchRequest } from "@/models/inventory/inventory-batch-request";
import { InventoryLocation } from "@/models/inventory/inventory-location";
import { InventoryMovement } from "@/models/inventory/inventory-movement";
import { InventoryPool } from "@/models/inventory/inventory-pool";
import { InventoryReservation } from "@/models/inventory/inventory-reservation";
import { InventoryTransfer } from "@/models/inventory/inventory-transfer";
import { Store } from "@/models/inventory/store";
import {
  createInventoryReservationSchema,
  inventoryAdjustmentSchema,
  productStockBatchSchema,
  inventoryAvailabilityQuerySchema,
  inventoryListQuerySchema,
  inventoryMasterCreateSchemas,
  inventoryMasterPatchSchemas,
  inventoryReservationActionSchema,
  inventoryTransferSchema,
  type InventoryMasterResource,
  type InventoryResource,
} from "@/services/inventory/schemas";

type AnyModel = Model<Record<string, unknown>>;
type ListQuery = z.infer<typeof inventoryListQuerySchema>;

const resourceModels: Record<InventoryResource, AnyModel> = {
  cities: City,
  stores: Store,
  pools: InventoryPool,
  locations: InventoryLocation,
  balances: InventoryBalance,
  movements: InventoryMovement,
};

function parseId(value: string) {
  if (!mongoose.Types.ObjectId.isValid(value)) badRequest("شناسه معتبر نیست.");
  return value;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function available(balance: { onHand: number; reserved: number; safetyStock: number }) {
  return Math.max(balance.onHand - balance.reserved - balance.safetyStock, 0);
}

function serializeBalance<T extends Record<string, unknown>>(item: T) {
  if (typeof item.onHand !== "number" || typeof item.reserved !== "number" || typeof item.safetyStock !== "number") {
    return item;
  }
  return { ...item, available: available(item as T & { onHand: number; reserved: number; safetyStock: number }) };
}

function parseMasterInput(resource: InventoryMasterResource, value: unknown, patch: boolean) {
  return patch
    ? inventoryMasterPatchSchemas[resource].parse(value)
    : inventoryMasterCreateSchemas[resource].parse(value);
}

function duplicateKey(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

async function requireExists(
  model: Model<unknown>,
  id: string | null | undefined,
  label: string,
  session?: ClientSession,
) {
  if (!id) return;
  const exists = await model.exists({ _id: parseId(id) }).session(session ?? null);
  if (!exists) badRequest(`${label} پیدا نشد.`);
}

async function validateMasterReferences(resource: InventoryMasterResource, input: Record<string, unknown>) {
  if (resource === "stores") await requireExists(City, input.cityId as string, "شهر");
  if (resource === "pools") await requireExists(City, input.cityId as string | null | undefined, "شهر");
  if (resource === "locations") {
    await Promise.all([
      requireExists(City, input.cityId as string, "شهر"),
      requireExists(InventoryPool, input.poolId as string, "استخر موجودی"),
      requireExists(Store, input.storeId as string | null | undefined, "فروشگاه"),
    ]);
  }
}

async function audit(actorId: string, action: string, targetId: string, reason: string, session?: ClientSession) {
  await StaffAudit.create(
    [{ userId: actorId, action, outcome: "success", reason, targetType: "inventory", targetId }],
    { session },
  );
}

function listFilter(resource: InventoryResource, query: ListQuery) {
  const filter: Record<string, unknown> = {};
  for (const key of ["cityId", "poolId", "storeId", "variantId", "locationId", "type"]) {
    if (query[key as keyof ListQuery] !== undefined) filter[key] = query[key as keyof ListQuery];
  }
  if (query.isActive !== undefined) filter.isActive = query.isActive === "true";
  if (query.search && ["cities", "stores", "pools", "locations"].includes(resource)) {
    const regex = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [{ code: regex }, { "name.fa": regex }, { "name.en": regex }, { "name.ar": regex }];
  }
  return filter;
}

function populateReferences(query: mongoose.Query<unknown, unknown>, resource: InventoryResource) {
  if (resource === "stores") return query.populate("cityId", "code name isActive");
  if (resource === "pools") return query.populate("cityId", "code name isActive");
  if (resource === "locations") {
    return query
      .populate("cityId", "code name isActive")
      .populate("poolId", "code name isActive")
      .populate("storeId", "code name isActive");
  }
  if (resource === "balances") {
    return query
      .populate("variantId", "sku productId colorId sizeId isActive")
      .populate("locationId", "code name type cityId poolId storeId isActive");
  }
  if (resource === "movements") {
    return query
      .populate("variantId", "sku productId colorId sizeId isActive")
      .populate("locationId", "code name type isActive");
  }
  return query;
}

async function activeLocation(id: string, session: ClientSession) {
  const location = await InventoryLocation.findOne({ _id: parseId(id), isActive: true }).session(session).lean();
  if (!location) badRequest("محل فعال موجودی پیدا نشد.");
  return location;
}

async function activeVariant(id: string, session: ClientSession) {
  const variant = await ProductVariant.findOne({ _id: parseId(id), isActive: true }).session(session).lean();
  if (!variant) badRequest("تنوع فعال محصول پیدا نشد.");
  return variant;
}

async function createMovement(
  input: {
    idempotencyKey: string;
    type: "adjustment" | "reservation" | "commit" | "release" | "transfer_out" | "transfer_in";
    variantId: string;
    locationId: string;
    onHandDelta: number;
    reservedDelta: number;
    balance: { onHand: number; reserved: number };
    safetyStockAfter?: number;
    referenceType: string;
    referenceId: string;
    reason?: string;
    actorId?: string;
  },
  session: ClientSession,
) {
  await InventoryMovement.create(
    [{
      idempotencyKey: input.idempotencyKey,
      type: input.type,
      variantId: input.variantId,
      locationId: input.locationId,
      onHandDelta: input.onHandDelta,
      reservedDelta: input.reservedDelta,
      onHandAfter: input.balance.onHand,
      reservedAfter: input.balance.reserved,
      safetyStockAfter: input.safetyStockAfter,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      reason: input.reason,
      actorId: input.actorId,
    }],
    { session },
  );
}

export async function adjustInventoryInSession(
  input: z.infer<typeof inventoryAdjustmentSchema>,
  actorId: string,
  session: ClientSession,
  writeStaffAudit = true,
) {
  await Promise.all([activeVariant(input.variantId, session), activeLocation(input.locationId, session)]);
  const existing = await InventoryBalance.findOne({ variantId: input.variantId, locationId: input.locationId }).session(session);
  const current = existing ?? new InventoryBalance({ variantId: input.variantId, locationId: input.locationId });
  const nextOnHand = current.onHand + input.delta;
  const nextSafetyStock = input.safetyStock ?? current.safetyStock;
  if (nextOnHand < current.reserved) conflict("موجودی فیزیکی نمی‌تواند از مقدار رزروشده کمتر شود.");
  if (nextOnHand < 0) conflict("موجودی فیزیکی نمی‌تواند منفی شود.");
  current.onHand = nextOnHand;
  current.safetyStock = nextSafetyStock;
  current.version += 1;
  await current.save({ session });
  await createMovement({
    idempotencyKey: input.idempotencyKey,
    type: "adjustment",
    variantId: input.variantId,
    locationId: input.locationId,
    onHandDelta: input.delta,
    reservedDelta: 0,
    balance: current,
    safetyStockAfter: current.safetyStock,
    referenceType: "adjustment",
    referenceId: input.idempotencyKey,
    reason: input.reason,
    actorId,
  }, session);
  if (writeStaffAudit) await audit(actorId, "inventory.adjustment", current.id, input.reason, session);
  return current;
}

type ReservationInput = z.infer<typeof createInventoryReservationSchema>;
type ReservationAction = z.infer<typeof inventoryReservationActionSchema>;

export async function reserveInventoryInSession(
  input: ReservationInput,
  session: ClientSession,
  actorId?: string,
  writeStaffAudit = false,
) {
  const reservationId = new mongoose.Types.ObjectId();
  for (const [index, item] of input.items.entries()) {
    await Promise.all([
      activeVariant(item.variantId, session),
      activeLocation(item.locationId, session),
    ]);
    const balance = await InventoryBalance.findOneAndUpdate(
      {
        variantId: item.variantId,
        locationId: item.locationId,
        $expr: {
          $gte: [
            { $subtract: [{ $subtract: ["$onHand", "$reserved"] }, "$safetyStock"] },
            item.quantity,
          ],
        },
      },
      { $inc: { reserved: item.quantity, version: 1 } },
      { new: true, session, runValidators: true },
    );
    if (!balance) conflict("موجودی قابل فروش برای رزرو کافی نیست.");
    await createMovement({
      idempotencyKey: `${input.idempotencyKey}:reserve:${index}`,
      type: "reservation",
      variantId: item.variantId,
      locationId: item.locationId,
      onHandDelta: 0,
      reservedDelta: item.quantity,
      balance,
      referenceType: "reservation",
      referenceId: reservationId.toString(),
      actorId,
    }, session);
  }
  const [reservation] = await InventoryReservation.create(
    [{ _id: reservationId, ...input }],
    { session },
  );
  if (writeStaffAudit && actorId) {
    await audit(actorId, "inventory.reservation.create", reservation.id, "رزرو موجودی", session);
  }
  return reservation;
}

export async function transitionInventoryReservationInSession(
  id: string,
  input: ReservationAction,
  session: ClientSession,
  actorId?: string,
  writeStaffAudit = false,
) {
  const reservation = await InventoryReservation.findById(parseId(id)).session(session);
  if (!reservation) notFound("رزرو موجودی پیدا نشد.");
  const finalStatus = input.action === "commit"
    ? "committed"
    : input.action === "expire"
      ? "expired"
      : "released";
  if (reservation.status === finalStatus) {
    return { idempotent: true, reservation };
  }
  if (reservation.status !== "active") {
    conflict(`رزرو با وضعیت ${reservation.status} قابل تغییر نیست.`);
  }

  for (const [index, item] of reservation.items.entries()) {
    const increments = input.action === "commit"
      ? { onHand: -item.quantity, reserved: -item.quantity, version: 1 }
      : { reserved: -item.quantity, version: 1 };
    const balance = await InventoryBalance.findOneAndUpdate(
      {
        variantId: item.variantId,
        locationId: item.locationId,
        reserved: { $gte: item.quantity },
        ...(input.action === "commit" ? { onHand: { $gte: item.quantity } } : {}),
      },
      { $inc: increments },
      { new: true, session, runValidators: true },
    );
    if (!balance) conflict("مانده‌ی موجودی با رزرو هماهنگ نیست.");
    await createMovement({
      idempotencyKey: `${reservation.id}:${input.action}:${index}`,
      type: input.action === "commit" ? "commit" : "release",
      variantId: item.variantId.toString(),
      locationId: item.locationId.toString(),
      onHandDelta: input.action === "commit" ? -item.quantity : 0,
      reservedDelta: -item.quantity,
      balance,
      referenceType: "reservation",
      referenceId: reservation.id,
      reason: input.reason,
      actorId,
    }, session);
  }
  reservation.status = finalStatus;
  if (input.action === "commit") reservation.committedAt = new Date();
  else reservation.releasedAt = new Date();
  await reservation.save({ session });
  if (writeStaffAudit && actorId) {
    await audit(
      actorId,
      `inventory.reservation.${input.action}`,
      reservation.id,
      input.reason ?? input.action,
      session,
    );
  }
  return { idempotent: false, reservation };
}

export const inventoryService = {
  parseId,

  async productStock(productId: string, locationId: string) {
    parseId(productId); parseId(locationId);
    await connectToDatabase();
    const location = await InventoryLocation.findOne({ _id: locationId, isActive: true }).select("code name type storeId isActive").lean();
    if (!location) notFound("شعبه یا انبار فعال پیدا نشد.");
    const variants = await ProductVariant.find({ productId, isActive: true }).select("sku colorId sizeId isActive").populate("colorId", "name hex code").populate("sizeId", "name code").sort({ sku: 1 }).lean();
    const balances = await InventoryBalance.find({ variantId: { $in: variants.map((item) => item._id) }, locationId }).lean();
    const balanceMap = new Map(balances.map((item) => [String(item.variantId), serializeBalance(item as unknown as Record<string, unknown>)]));
    return { location, variants: variants.map((variant) => ({ ...variant, balance: balanceMap.get(String(variant._id)) ?? { onHand: 0, reserved: 0, safetyStock: 0, available: 0 } })) };
  },

  async list(resource: InventoryResource, query: ListQuery) {
    await connectToDatabase();
    const filter = listFilter(resource, query);
    const skip = (query.page - 1) * query.limit;
    let findQuery = resourceModels[resource]
      .find(filter)
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(query.limit);
    if (query.include === "references") findQuery = populateReferences(findQuery, resource) as typeof findQuery;
    const [rawItems, total] = await Promise.all([findQuery.lean(), resourceModels[resource].countDocuments(filter)]);
    const items = resource === "balances" ? rawItems.map((item) => serializeBalance(item)) : rawItems;
    return { items, pagination: { page: query.page, limit: query.limit, total, pages: Math.max(1, Math.ceil(total / query.limit)) } };
  },

  async get(resource: InventoryResource, id: string, include?: "references") {
    await connectToDatabase();
    let query = resourceModels[resource].findById(parseId(id));
    if (include === "references") query = populateReferences(query, resource) as typeof query;
    const item = await query.lean();
    if (!item) notFound("رکورد موجودی پیدا نشد.");
    return resource === "balances" ? serializeBalance(item) : item;
  },

  async createMaster(resource: InventoryMasterResource, value: unknown, actorId: string) {
    const input = parseMasterInput(resource, value, false) as Record<string, unknown>;
    await connectToDatabase();
    await validateMasterReferences(resource, input);
    try {
      const created = await mongoose.connection.transaction(async (session) => {
        const [item] = await resourceModels[resource].create(
          [{ ...input, code: String(input.code).toUpperCase() }],
          { session },
        );
        if (resource === "stores") {
          const fees = input as { shippingFeeIrrMinor?: number; shippingFeeUsdMinor?: number };
          await Store.collection.updateOne({ _id: item._id as mongoose.Types.ObjectId }, { $set: { ...(fees.shippingFeeIrrMinor === undefined ? {} : { shippingFeeIrrMinor: fees.shippingFeeIrrMinor }), ...(fees.shippingFeeUsdMinor === undefined ? {} : { shippingFeeUsdMinor: fees.shippingFeeUsdMinor }) } }, { session });
        }
        await audit(actorId, `inventory.${resource}.create`, item.id, "ایجاد رکورد پایه موجودی", session);
        return item.toObject();
      });
      return created;
    } catch (error) {
      if (duplicateKey(error)) conflict("کد واردشده قبلاً استفاده شده است.");
      throw error;
    }
  },

  async updateMaster(resource: InventoryMasterResource, id: string, value: unknown, actorId: string) {
    const input = parseMasterInput(resource, value, true) as Record<string, unknown>;
    if (Object.keys(input).length === 0) badRequest("حداقل یک فیلد برای تغییر ارسال کنید.");
    await connectToDatabase();
    if (resource === "locations") {
      const current = await InventoryLocation.findById(parseId(id)).select("type storeId").lean();
      if (!current) notFound("محل موجودی پیدا نشد.");
      const recorded = current as unknown as { type: string; storeId?: unknown };
      const nextType = String(input.type ?? recorded.type);
      const nextStoreId = Object.hasOwn(input, "storeId") ? input.storeId : recorded.storeId;
      if (nextType === "store" && !nextStoreId) badRequest("محل فروشگاهی باید به یک فروشگاه متصل باشد.");
    }
    await validateMasterReferences(resource, input);
    if (input.code) input.code = String(input.code).toUpperCase();
    try {
      const updated = await mongoose.connection.transaction(async (session) => {
        const item = await resourceModels[resource]
          .findByIdAndUpdate(parseId(id), input, { new: true, runValidators: true })
          .session(session)
          .lean();
        if (!item) notFound("رکورد موجودی پیدا نشد.");
        if (resource === "stores") {
          const fees = input as { shippingFeeIrrMinor?: number; shippingFeeUsdMinor?: number };
          await Store.collection.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: { ...(fees.shippingFeeIrrMinor === undefined ? {} : { shippingFeeIrrMinor: fees.shippingFeeIrrMinor }), ...(fees.shippingFeeUsdMinor === undefined ? {} : { shippingFeeUsdMinor: fees.shippingFeeUsdMinor }) } }, { session });
        }
        await audit(actorId, `inventory.${resource}.update`, id, "ویرایش رکورد پایه موجودی", session);
        return item;
      });
      return updated;
    } catch (error) {
      if (duplicateKey(error)) conflict("کد واردشده قبلاً استفاده شده است.");
      throw error;
    }
  },

  async adjust(value: unknown, actorId: string) {
    const input = inventoryAdjustmentSchema.parse(value);
    await connectToDatabase();
    const previous = await InventoryMovement.findOne({ idempotencyKey: input.idempotencyKey }).lean();
    if (previous) {
      const recorded = previous as unknown as {
        variantId: unknown;
        locationId: unknown;
        onHandDelta: number;
        safetyStockAfter?: number;
      };
      const matches =
        String(recorded.variantId) === input.variantId &&
        String(recorded.locationId) === input.locationId &&
        recorded.onHandDelta === input.delta &&
        (input.safetyStock === undefined || recorded.safetyStockAfter === input.safetyStock);
      if (!matches) conflict("این کلید idempotency قبلاً برای درخواست دیگری استفاده شده است.");
      return { idempotent: true, movement: previous };
    }

    return mongoose.connection.transaction(async (session) => {
      const current = await adjustInventoryInSession(input, actorId, session);
      return { idempotent: false, balance: serializeBalance(current.toObject()) };
    });
  },

  async addProductStock(value: unknown, actorId: string) {
    const input = productStockBatchSchema.parse(value);
    const canonical = JSON.stringify({ ...input, items: [...input.items].sort((a, b) => a.variantId.localeCompare(b.variantId)) });
    const requestHash = createHash("sha256").update(canonical).digest("hex");
    await connectToDatabase();
    type BatchRecord = { requestHash: string; result: Record<string, unknown> };
    const previous = await InventoryBatchRequest.findOne({ key: input.idempotencyKey }).lean() as BatchRecord | null;
    if (previous) {
      if (String(previous.requestHash) !== requestHash) conflict("این کلید ثبت قبلاً برای درخواست دیگری استفاده شده است.");
      return { ...(previous.result as Record<string, unknown>), idempotent: true };
    }
    try {
      return await mongoose.connection.transaction(async (session) => {
        const replay = await InventoryBatchRequest.findOne({ key: input.idempotencyKey }).session(session).lean() as BatchRecord | null;
        if (replay) {
          if (String(replay.requestHash) !== requestHash) conflict("این کلید ثبت قبلاً برای درخواست دیگری استفاده شده است.");
          return { ...(replay.result as Record<string, unknown>), idempotent: true };
        }
        await activeLocation(input.locationId, session);
        const variants = await ProductVariant.find({ _id: { $in: input.items.map((item) => item.variantId) }, productId: input.productId, isActive: true }).session(session).lean();
        if (variants.length !== input.items.length) badRequest("یک یا چند تنوع فعال به این محصول تعلق ندارد.");
        const balances = [];
        for (const [index, item] of input.items.entries()) {
          const balance = await adjustInventoryInSession({ idempotencyKey: `${input.idempotencyKey}:${index}`, variantId: item.variantId, locationId: input.locationId, delta: item.quantity, reason: "افزایش گروهی موجودی از جدول محصولات" }, actorId, session, false);
          balances.push(serializeBalance(balance.toObject()));
        }
        const result = { productId: input.productId, locationId: input.locationId, totalUnits: input.items.reduce((sum, item) => sum + item.quantity, 0), balances };
        await InventoryBatchRequest.create([{ key: input.idempotencyKey, requestHash, productId: input.productId, locationId: input.locationId, result }], { session });
        await audit(actorId, "inventory.product.batch-add", input.productId, `افزایش گروهی ${result.totalUnits} عدد`, session);
        return { ...result, idempotent: false };
      });
    } catch (error) {
      if (duplicateKey(error)) {
        const replay = await InventoryBatchRequest.findOne({ key: input.idempotencyKey }).lean() as BatchRecord | null;
        if (replay && String(replay.requestHash) === requestHash) return { ...(replay.result as Record<string, unknown>), idempotent: true };
      }
      throw error;
    }
  },

  async reserve(value: unknown, actorId: string) {
    const input = createInventoryReservationSchema.parse(value);
    await connectToDatabase();
    const previous = await InventoryReservation.findOne({ idempotencyKey: input.idempotencyKey }).lean();
    if (previous) {
      const recorded = previous as unknown as {
        cartId?: unknown;
        checkoutSessionId?: unknown;
        orderId?: unknown;
        userId?: unknown;
        items: Array<{ variantId: unknown; locationId: unknown; quantity: number }>;
      };
      const sameItems = recorded.items.length === input.items.length && recorded.items.every((item, index) => {
        const requested = input.items[index];
        return requested && String(item.variantId) === requested.variantId &&
          String(item.locationId) === requested.locationId && item.quantity === requested.quantity;
      });
      const sameOwners =
        String(recorded.cartId ?? "") === String(input.cartId ?? "") &&
        String(recorded.checkoutSessionId ?? "") === String(input.checkoutSessionId ?? "") &&
        String(recorded.orderId ?? "") === String(input.orderId ?? "") &&
        String(recorded.userId ?? "") === String(input.userId ?? "");
      if (!sameItems || !sameOwners) conflict("این کلید idempotency قبلاً برای رزرو دیگری استفاده شده است.");
      return { idempotent: true, reservation: previous };
    }

    return mongoose.connection.transaction(async (session) => ({
      idempotent: false,
      reservation: (
        await reserveInventoryInSession(input, session, actorId, true)
      ).toObject(),
    }));
  },

  async actOnReservation(id: string, value: unknown, actorId: string) {
    const input = inventoryReservationActionSchema.parse(value);
    await connectToDatabase();
    return mongoose.connection.transaction(async (session) => {
      const result = await transitionInventoryReservationInSession(
        id,
        input,
        session,
        actorId,
        true,
      );
      return { ...result, reservation: result.reservation.toObject() };
    });
  },

  async transfer(value: unknown, actorId: string) {
    const input = inventoryTransferSchema.parse(value);
    await connectToDatabase();
    const previous = await InventoryTransfer.findOne({ idempotencyKey: input.idempotencyKey }).lean();
    if (previous) {
      const recorded = previous as unknown as {
        sourceLocationId: unknown;
        destinationLocationId: unknown;
        items: Array<{ variantId: unknown; quantity: number }>;
      };
      const sameItems = recorded.items.length === input.items.length && recorded.items.every((item, index) => {
        const requested = input.items[index];
        return requested && String(item.variantId) === requested.variantId && item.quantity === requested.quantity;
      });
      const matches = sameItems && String(recorded.sourceLocationId) === input.sourceLocationId &&
        String(recorded.destinationLocationId) === input.destinationLocationId;
      if (!matches) conflict("این کلید idempotency قبلاً برای انتقال دیگری استفاده شده است.");
      return { idempotent: true, transfer: previous };
    }

    return mongoose.connection.transaction(async (session) => {
      await Promise.all([activeLocation(input.sourceLocationId, session), activeLocation(input.destinationLocationId, session)]);
      const transferId = new mongoose.Types.ObjectId();
      for (const [index, item] of input.items.entries()) {
        await activeVariant(item.variantId, session);
        const source = await InventoryBalance.findOneAndUpdate(
          {
            variantId: item.variantId,
            locationId: input.sourceLocationId,
            $expr: { $gte: [{ $subtract: [{ $subtract: ["$onHand", "$reserved"] }, "$safetyStock"] }, item.quantity] },
          },
          { $inc: { onHand: -item.quantity, version: 1 } },
          { new: true, session, runValidators: true },
        );
        if (!source) conflict("موجودی قابل انتقال در مبدأ کافی نیست.");
        const destination = await InventoryBalance.findOneAndUpdate(
          { variantId: item.variantId, locationId: input.destinationLocationId },
          { $inc: { onHand: item.quantity, version: 1 }, $setOnInsert: { reserved: 0, safetyStock: 0 } },
          { new: true, upsert: true, session, runValidators: true },
        );
        await Promise.all([
          createMovement({
            idempotencyKey: `${input.idempotencyKey}:out:${index}`,
            type: "transfer_out",
            variantId: item.variantId,
            locationId: input.sourceLocationId,
            onHandDelta: -item.quantity,
            reservedDelta: 0,
            balance: source,
            referenceType: "transfer",
            referenceId: transferId.toString(),
            reason: input.reason,
            actorId,
          }, session),
          createMovement({
            idempotencyKey: `${input.idempotencyKey}:in:${index}`,
            type: "transfer_in",
            variantId: item.variantId,
            locationId: input.destinationLocationId,
            onHandDelta: item.quantity,
            reservedDelta: 0,
            balance: destination,
            referenceType: "transfer",
            referenceId: transferId.toString(),
            reason: input.reason,
            actorId,
          }, session),
        ]);
      }
      const [transfer] = await InventoryTransfer.create([{
        _id: transferId,
        ...input,
        status: "completed",
        actorId,
        completedAt: new Date(),
      }], { session });
      await audit(actorId, "inventory.transfer", transfer.id, input.reason, session);
      return { idempotent: false, transfer: transfer.toObject() };
    });
  },

  async listReservations(query: ListQuery) {
    await connectToDatabase();
    const filter: Record<string, unknown> = {};
    if (query.status && ["active", "committed", "released", "expired"].includes(query.status)) filter.status = query.status;
    const skip = (query.page - 1) * query.limit;
    let find = InventoryReservation.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(query.limit);
    if (query.include === "references") find = find.populate("items.variantId", "sku isActive").populate("items.locationId", "code name type");
    const [items, total] = await Promise.all([find.lean(), InventoryReservation.countDocuments(filter)]);
    return { items, pagination: { page: query.page, limit: query.limit, total, pages: Math.max(1, Math.ceil(total / query.limit)) } };
  },

  async getReservation(id: string) {
    await connectToDatabase();
    const item = await InventoryReservation.findById(parseId(id)).lean();
    if (!item) notFound("رزرو موجودی پیدا نشد.");
    return item;
  },

  async listTransfers(query: ListQuery) {
    await connectToDatabase();
    const filter: Record<string, unknown> = {};
    if (query.status && ["completed", "cancelled"].includes(query.status)) filter.status = query.status;
    const skip = (query.page - 1) * query.limit;
    let find = InventoryTransfer.find(filter).sort({ createdAt: -1, _id: -1 }).skip(skip).limit(query.limit);
    if (query.include === "references") find = find.populate("sourceLocationId", "code name type").populate("destinationLocationId", "code name type").populate("items.variantId", "sku isActive");
    const [items, total] = await Promise.all([find.lean(), InventoryTransfer.countDocuments(filter)]);
    return { items, pagination: { page: query.page, limit: query.limit, total, pages: Math.max(1, Math.ceil(total / query.limit)) } };
  },

  async availability(value: unknown) {
    const input = inventoryAvailabilityQuerySchema.parse(value);
    await connectToDatabase();
    const locationFilter: Record<string, unknown> = { isActive: true };
    if (input.storeId) locationFilter.storeId = input.storeId;
    if (input.cityId) locationFilter.cityId = input.cityId;
    const locationIds = await InventoryLocation.find(locationFilter).distinct("_id");
    const rows = await InventoryBalance.find({ variantId: input.variantId, locationId: { $in: locationIds } })
      .select("onHand reserved safetyStock")
      .lean();
    const quantity = rows.reduce(
      (sum, row) => sum + available(row as unknown as { onHand: number; reserved: number; safetyStock: number }),
      0,
    );
    return { variantId: input.variantId, available: quantity, inStock: quantity > 0 };
  },
};
