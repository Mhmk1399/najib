import "server-only";

import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { connectToDatabase } from "@/lib/server/db";
import { badRequest, conflict, notFound } from "@/lib/server/errors";
import { StaffAudit } from "@/models/auth/staff-audit";
import { Cart } from "@/models/catalog/cart";
import { AbandonedCheckout, CheckoutSession } from "@/models/catalog/checkout";
import { Order, ORDER_STATUSES } from "@/models/catalog/order";
import { Outbox } from "@/models/catalog/outbox";

const directionSchema = z.enum(["asc", "desc"]).default("desc");
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(160).default(""),
  sortDirection: directionSchema,
}).strict();

export const orderListQuerySchema = paginationSchema.extend({
  status: z.enum(ORDER_STATUSES).optional(),
  storeId: z.string().trim().max(100).optional(),
  cityId: z.string().trim().max(100).optional(),
  userId: z.string().trim().max(100).optional(),
  sortKey: z.enum(["createdAt", "updatedAt", "orderNumber", "totalMinor", "status"]).default("createdAt"),
});

export const cartListQuerySchema = paginationSchema.extend({
  status: z.enum(["active", "checkout_started", "converted", "abandoned", "expired"]).optional(),
  storeId: z.string().trim().max(100).optional(),
  cityId: z.string().trim().max(100).optional(),
  userId: z.string().trim().max(100).optional(),
  sortKey: z.enum(["createdAt", "updatedAt", "expiresAt", "status"]).default("updatedAt"),
});

export const checkoutListQuerySchema = paginationSchema.extend({
  status: z.enum(["started", "reserved", "payment_pending", "completed", "failed", "expired"]).optional(),
  storeId: z.string().trim().max(100).optional(),
  cityId: z.string().trim().max(100).optional(),
  userId: z.string().trim().max(100).optional(),
  sortKey: z.enum(["createdAt", "updatedAt", "expiresAt", "status"]).default("updatedAt"),
});

export const abandonedListQuerySchema = paginationSchema.extend({
  recoveryStatus: z.enum(["eligible", "contacted", "recovered", "expired", "suppressed"]).optional(),
  reason: z.enum(["inactivity", "payment_failed", "customer_left", "reservation_expired"]).optional(),
  storeId: z.string().trim().max(100).optional(),
  cityId: z.string().trim().max(100).optional(),
  userId: z.string().trim().max(100).optional(),
  sortKey: z.enum(["createdAt", "updatedAt", "abandonedAt", "subtotalMinor", "recoveryStatus"]).default("abandonedAt"),
});

export const orderActionSchema = z.object({
  action: z.enum(["cancel", "retry_payment", "mark_fulfilled"]),
  reason: z.string().trim().min(3).max(300),
}).strict();

export const cartActionSchema = z.object({
  action: z.enum(["mark_abandoned", "expire"]),
  reason: z.string().trim().min(3).max(300),
}).strict();

export const abandonedActionSchema = z.object({
  recoveryStatus: z.enum(["contacted", "suppressed", "expired"]),
  reason: z.string().trim().min(3).max(300),
}).strict();

function parseId(value: string) {
  if (!mongoose.Types.ObjectId.isValid(value)) badRequest("شناسه معتبر نیست.");
  return value;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function pageResult(items: unknown[], total: number, page: number, limit: number) {
  return {
    items,
    pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
  };
}

function withSharedFilters(query: Record<string, unknown>) {
  const filter: Record<string, unknown> = {};
  for (const key of ["status", "storeId", "cityId", "userId", "reason", "recoveryStatus"]) {
    if (query[key] !== undefined) filter[key] = query[key];
  }
  return filter;
}

async function audit(
  actorId: string,
  action: string,
  targetId: string,
  reason: string,
  session?: mongoose.ClientSession,
) {
  await StaffAudit.create([{
    userId: actorId,
    action,
    outcome: "success",
    reason,
    targetType: action.split(".")[0],
    targetId,
  }], { session });
}

export const commerceOperationsService = {
  parseId,

  async listOrders(query: z.infer<typeof orderListQuerySchema>) {
    await connectToDatabase();
    const filter = withSharedFilters(query);
    if (query.search) {
      const regex = new RegExp(escapeRegex(query.search), "i");
      filter.$or = [
        { orderNumber: regex },
        { "contact.email": regex },
        { "contact.firstName": regex },
        { "contact.lastName": regex },
      ];
    }
    const skip = (query.page - 1) * query.limit;
    const direction = query.sortDirection === "asc" ? 1 : -1;
    const [items, total] = await Promise.all([
      Order.find(filter).sort({ [query.sortKey]: direction, _id: direction }).skip(skip).limit(query.limit).lean(),
      Order.countDocuments(filter),
    ]);
    return pageResult(items, total, query.page, query.limit);
  },

  async getOrder(id: string) {
    await connectToDatabase();
    const item = await Order.findById(parseId(id)).lean();
    if (!item) notFound("سفارش پیدا نشد.");
    return item;
  },

  async actOnOrder(id: string, value: unknown, actorId: string) {
    const input = orderActionSchema.parse(value);
    await connectToDatabase();
    return mongoose.connection.transaction(async (session) => {
      const order = await Order.findById(parseId(id)).session(session);
      if (!order) notFound("سفارش پیدا نشد.");

      const allowed: Record<typeof input.action, readonly string[]> = {
        cancel: ["pending_inventory", "pending_payment", "payment_failed"],
        retry_payment: ["payment_failed"],
        mark_fulfilled: ["confirmed"],
      };
      if (!allowed[input.action].includes(order.status)) {
        conflict(`عملیات ${input.action} برای وضعیت ${order.status} مجاز نیست.`);
      }

      const nextStatus = input.action === "cancel"
        ? "cancelled"
        : input.action === "retry_payment"
          ? "pending_payment"
          : "fulfilled";
      order.status = nextStatus;
      if (nextStatus === "cancelled") order.cancelledAt = new Date();
      await order.save({ session });

      await Promise.all([
        audit(actorId, `order.${input.action}`, order.id, input.reason, session),
        Outbox.create([{
          eventId: randomUUID(),
          eventType: input.action === "cancel" ? "OrderCancelled" : input.action === "mark_fulfilled" ? "OrderFulfilled" : "OrderPaymentRetryRequested",
          correlationId: order.correlationId,
          destination: "events",
          payload: { orderId: order.id, orderNumber: order.orderNumber, status: order.status, actorId, reason: input.reason },
        }], { session }),
      ]);
      return order.toObject();
    });
  },

  async listCarts(query: z.infer<typeof cartListQuerySchema>) {
    await connectToDatabase();
    const filter = withSharedFilters(query);
    if (query.search) {
      const regex = new RegExp(escapeRegex(query.search), "i");
      filter.$or = [{ userId: regex }, { anonymousId: regex }];
    }
    const skip = (query.page - 1) * query.limit;
    const direction = query.sortDirection === "asc" ? 1 : -1;
    const [items, total] = await Promise.all([
      Cart.find(filter).sort({ [query.sortKey]: direction, _id: direction }).skip(skip).limit(query.limit).lean(),
      Cart.countDocuments(filter),
    ]);
    return pageResult(items, total, query.page, query.limit);
  },

  async getCart(id: string) {
    await connectToDatabase();
    const item = await Cart.findById(parseId(id)).lean();
    if (!item) notFound("سبد خرید پیدا نشد.");
    return item;
  },

  async actOnCart(id: string, value: unknown, actorId: string) {
    const input = cartActionSchema.parse(value);
    await connectToDatabase();
    return mongoose.connection.transaction(async (session) => {
      const cart = await Cart.findById(parseId(id)).session(session);
      if (!cart) notFound("سبد خرید پیدا نشد.");
      if (!["active", "checkout_started"].includes(cart.status)) {
        conflict(`تغییر وضعیت سبد ${cart.status} مجاز نیست.`);
      }
      cart.status = input.action === "expire" ? "expired" : "abandoned";
      await cart.save({ session });
      await audit(actorId, `cart.${input.action}`, cart.id, input.reason, session);
      return cart.toObject();
    });
  },

  async listCheckouts(query: z.infer<typeof checkoutListQuerySchema>) {
    await connectToDatabase();
    const filter = withSharedFilters(query);
    if (query.search) {
      const regex = new RegExp(escapeRegex(query.search), "i");
      filter.$or = [{ cartId: regex }, { correlationId: regex }, { userId: regex }, { anonymousId: regex }];
    }
    const skip = (query.page - 1) * query.limit;
    const direction = query.sortDirection === "asc" ? 1 : -1;
    const [items, total] = await Promise.all([
      CheckoutSession.find(filter).sort({ [query.sortKey]: direction, _id: direction }).skip(skip).limit(query.limit).lean(),
      CheckoutSession.countDocuments(filter),
    ]);
    return pageResult(items, total, query.page, query.limit);
  },

  async getCheckout(id: string) {
    await connectToDatabase();
    const item = await CheckoutSession.findById(parseId(id)).lean();
    if (!item) notFound("نشست پرداخت پیدا نشد.");
    return item;
  },

  async listAbandoned(query: z.infer<typeof abandonedListQuerySchema>) {
    await connectToDatabase();
    const filter = withSharedFilters(query);
    if (query.search) {
      const regex = new RegExp(escapeRegex(query.search), "i");
      filter.$or = [{ email: regex }, { cartId: regex }, { checkoutSessionId: regex }, { userId: regex }, { anonymousId: regex }];
    }
    const skip = (query.page - 1) * query.limit;
    const direction = query.sortDirection === "asc" ? 1 : -1;
    const [items, total] = await Promise.all([
      AbandonedCheckout.find(filter).sort({ [query.sortKey]: direction, _id: direction }).skip(skip).limit(query.limit).lean(),
      AbandonedCheckout.countDocuments(filter),
    ]);
    return pageResult(items, total, query.page, query.limit);
  },

  async getAbandoned(id: string) {
    await connectToDatabase();
    const item = await AbandonedCheckout.findById(parseId(id)).lean();
    if (!item) notFound("checkout رهاشده پیدا نشد.");
    return item;
  },

  async updateAbandoned(id: string, value: unknown, actorId: string) {
    const input = abandonedActionSchema.parse(value);
    await connectToDatabase();
    return mongoose.connection.transaction(async (session) => {
      const item = await AbandonedCheckout.findById(parseId(id)).session(session);
      if (!item) notFound("checkout رهاشده پیدا نشد.");
      if (["recovered", "expired"].includes(item.recoveryStatus)) {
        conflict("وضعیت نهایی checkout رهاشده قابل تغییر نیست.");
      }
      item.recoveryStatus = input.recoveryStatus;
      await item.save({ session });
      await audit(actorId, `abandoned_checkout.${input.recoveryStatus}`, item.id, input.reason, session);
      return item.toObject();
    });
  },
};
