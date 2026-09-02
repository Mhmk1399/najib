import { randomUUID } from "node:crypto";
import { BadGatewayException, BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  commerceOrderConfirmedV1Schema,
  paymentCallbackSchema,
  recordCustomerActivitySchema,
  startCheckoutRequestSchema,
  type PaymentCallback,
  type StartCheckoutRequest,
} from "@najib/contracts";
import mongoose from "mongoose";
import { type Types } from "mongoose";
import { z } from "zod";
import { Cart } from "../models/cart.js";
import { CheckoutSession } from "../models/checkout.js";
import { Color } from "../models/color.js";
import { Order } from "../models/order.js";
import { Outbox } from "../models/outbox.js";
import { ProductVariant } from "../models/product-variant.js";
import { Product } from "../models/product.js";
import { Size } from "../models/size.js";

type DependencyResponse = { _id?: string; [key: string]: unknown };
type CartRecord = { _id: Types.ObjectId; status: string; storeId: string; cityId: string; currency: string; items: Array<{ variantId: Types.ObjectId; quantity: number }> };
type VariantRecord = { _id: Types.ObjectId; productId: Types.ObjectId; colorId: Types.ObjectId; sizeId: Types.ObjectId; sku: string; priceOverrideMinor?: number };
type NamedRecord = { _id: Types.ObjectId; name: string };
type ProductRecord = NamedRecord & { basePriceMinor: number };
type OrderSnapshot = { variantId: string; productId: string; productName: string; sku: string; colorName: string; sizeName: string; unitPriceMinor: number; taxMinor: number; discountMinor: number; quantity: number; lineTotalMinor: number };
type CreatedRecord = { _id: Types.ObjectId };

@Injectable()
export class CheckoutService {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}
  parseStart(value: unknown): StartCheckoutRequest { return this.parse(startCheckoutRequestSchema, value); }
  parseCallback(value: unknown): PaymentCallback { return this.parse(paymentCallbackSchema, value); }

  async findOrder(id: string) {
    const order = await Order.findById(id).lean();
    if (!order) throw new NotFoundException("Order was not found");
    return order;
  }

  async start(input: StartCheckoutRequest) {
    const duplicate = await Order.findOne({ idempotencyKey: input.idempotencyKey }).lean();
    if (duplicate) return { order: duplicate, duplicate: true };
    const cart = await Cart.findById(input.cartId).lean() as unknown as CartRecord | null;
    if (!cart || cart.status !== "active") throw new ConflictException("An active cart is required");
    if (cart.storeId !== input.storeId) throw new BadRequestException("Checkout store must match the cart store");
    if (cart.items.length === 0) throw new BadRequestException("The cart is empty");

    const snapshots: OrderSnapshot[] = [];
    for (const item of cart.items) {
      const variant = await ProductVariant.findOne({ _id: item.variantId, isActive: true }).lean() as unknown as VariantRecord | null;
      if (!variant) throw new ConflictException(`Variant ${item.variantId} is unavailable`);
      const [product, color, size] = await Promise.all([
        Product.findOne({ _id: variant.productId, status: "active" }).lean() as unknown as Promise<ProductRecord | null>,
        Color.findOne({ _id: variant.colorId, isActive: true }).lean() as unknown as Promise<NamedRecord | null>,
        Size.findOne({ _id: variant.sizeId, isActive: true }).lean() as unknown as Promise<NamedRecord | null>,
      ]);
      if (!product || !color || !size) throw new ConflictException("The selected variant is incomplete or inactive");
      const unitPriceMinor = variant.priceOverrideMinor ?? product.basePriceMinor;
      snapshots.push({
        variantId: variant._id.toString(), productId: product._id.toString(), productName: product.name,
        sku: variant.sku, colorName: color.name, sizeName: size.name, unitPriceMinor,
        taxMinor: 0, discountMinor: 0, quantity: item.quantity,
        lineTotalMinor: unitPriceMinor * item.quantity,
      });
    }
    const subtotalMinor = snapshots.reduce((total, item) => total + item.lineTotalMinor, 0);
    const expiresAt = new Date(Date.now() + 15 * 60_000);
    const session = await mongoose.startSession();
    let orderId = "";
    let checkoutId = "";
    try {
      await session.withTransaction(async () => {
        const [checkout] = await CheckoutSession.create([{
          cartId: cart._id.toString(), idempotencyKey: input.idempotencyKey,
          userId: input.customer.userId, anonymousId: input.customer.anonymousId,
          storeId: cart.storeId, cityId: cart.cityId, currency: cart.currency,
          items: snapshots.map(({ variantId, quantity, unitPriceMinor }) => ({ variantId, quantity, unitPriceMinor })),
          status: "started", expiresAt, correlationId: input.correlationId,
        }], { session }) as unknown as CreatedRecord[];
        const [order] = await Order.create([{
          orderNumber: `ORD-${randomUUID()}`, idempotencyKey: input.idempotencyKey,
          correlationId: input.correlationId, cartId: cart._id.toString(), checkoutSessionId: checkout._id.toString(),
          userId: input.customer.userId, anonymousId: input.customer.anonymousId,
          contact: { email: input.customer.email, firstName: input.customer.firstName, lastName: input.customer.lastName, phone: input.customer.phone },
          storeId: cart.storeId, cityId: cart.cityId, currency: cart.currency, items: snapshots,
          subtotalMinor, taxMinor: 0, discountMinor: 0, shippingMinor: 0, totalMinor: subtotalMinor,
          status: "pending_inventory", policyVersion: "development-v1",
        }], { session }) as unknown as CreatedRecord[];
        orderId = order._id.toString(); checkoutId = checkout._id.toString();
      });
    } finally { await session.endSession(); }

    let reservation;
    try {
      reservation = await this.requestJson(`${this.config.getOrThrow<string>("INVENTORY_API_URL")}/reservations`, {
        idempotencyKey: `inventory:${input.idempotencyKey}`, orderId, storeId: input.storeId,
        lines: snapshots.map((item) => ({ productVariantId: item.variantId, quantity: item.quantity })),
        expiresAt, correlationId: input.correlationId,
      });
      await Promise.all([
        Order.updateOne({ _id: orderId }, { status: "pending_payment", inventoryReservationId: reservation._id }),
        CheckoutSession.updateOne({ _id: checkoutId }, { status: "reserved", inventoryReservationId: reservation._id }),
        Cart.updateOne({ _id: cart._id }, { status: "checkout_started" }),
      ]);
      const payment = await this.requestJson(`${this.config.getOrThrow<string>("PAYMENT_API_URL")}/payments`, {
        orderId, amount: { amountMinor: subtotalMinor, currency: cart.currency }, provider: "sandbox",
        paymentMethodToken: input.paymentMethodToken, idempotencyKey: `payment:${input.idempotencyKey}`,
        correlationId: input.correlationId,
      });
      await Promise.all([
        Order.updateOne({ _id: orderId }, { paymentIntentId: payment._id }),
        CheckoutSession.updateOne({ _id: checkoutId }, { status: "payment_pending", paymentId: payment._id }),
      ]);
      return { order: await this.findOrder(orderId), checkoutSessionId: checkoutId, payment, duplicate: false };
    } catch (error) {
      if (reservation?._id) {
        await this.requestJson(`${this.config.getOrThrow<string>("INVENTORY_API_URL")}/reservations/${reservation._id}/release`, { correlationId: input.correlationId, reason: "Checkout setup failed" }).catch(() => undefined);
      }
      await Promise.all([Order.updateOne({ _id: orderId }, { status: "cancelled" }), CheckoutSession.updateOne({ _id: checkoutId }, { status: "failed" })]);
      throw error;
    }
  }

  async paymentCallback(input: PaymentCallback) {
    const order = await Order.findById(input.orderId);
    if (!order) throw new NotFoundException("Order was not found");
    if (order.status === "confirmed") return order;
    if (!order.inventoryReservationId) throw new ConflictException("Order has no inventory reservation");
    if (input.status === "failed") {
      await this.requestJson(`${this.config.getOrThrow<string>("INVENTORY_API_URL")}/reservations/${order.inventoryReservationId}/release`, { correlationId: input.correlationId, reason: input.failureCode ?? "Payment failed" });
      order.status = "payment_failed"; await order.save();
      await CheckoutSession.updateOne({ _id: order.checkoutSessionId }, { status: "failed" });
      return order;
    }
    try {
      await this.requestJson(`${this.config.getOrThrow<string>("INVENTORY_API_URL")}/reservations/${order.inventoryReservationId}/commit`, { correlationId: input.correlationId });
    } catch (error) {
      order.status = "compensation_required"; await order.save(); throw error;
    }
    const event = commerceOrderConfirmedV1Schema.parse({
      eventId: randomUUID(), eventType: "commerce.order.confirmed.v1", eventVersion: 1,
      occurredAt: new Date().toISOString(), producer: "commerce", correlationId: input.correlationId,
      causationId: input.paymentId, payload: { orderId: order._id.toString(), status: "confirmed" },
    });
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        order.status = "confirmed"; order.confirmedAt = new Date(); await order.save({ session });
        await Cart.updateOne({ _id: order.cartId }, { status: "converted" }, { session });
        await CheckoutSession.updateOne({ _id: order.checkoutSessionId }, { status: "completed" }, { session });
        await Outbox.create([
          { eventId: event.eventId, eventType: event.eventType, correlationId: input.correlationId, destination: "events", payload: event },
          { eventId: randomUUID(), eventType: "accounting.order-confirmed.v1", correlationId: input.correlationId, destination: "accounting", payload: { orderId: order._id.toString(), orderNumber: order.orderNumber, totalMinor: order.totalMinor, currency: order.currency } },
        ], { session, ordered: true });
      });
    } finally { await session.endSession(); }
    const activity = recordCustomerActivitySchema.parse({
      eventId: randomUUID(), eventType: "PurchaseCompleted", occurredAt: new Date(),
      userId: order.userId, anonymousId: order.anonymousId, sessionId: order.checkoutSessionId,
      storeId: order.storeId, cityId: order.cityId, correlationId: input.correlationId,
      consentScope: "essential", payload: { orderId: order._id.toString(), totalMinor: order.totalMinor, currency: order.currency },
    });
    await fetch(`${this.config.getOrThrow<string>("CUSTOMER_DATA_API_URL")}/activities`, {
      method: "POST", headers: { "content-type": "application/json", "x-internal-service-token": this.config.getOrThrow<string>("INTERNAL_SERVICE_TOKEN") }, body: JSON.stringify(activity),
    }).catch(() => undefined);
    return order;
  }

  private async requestJson(url: string, body: unknown): Promise<DependencyResponse> {
    const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(8_000) });
    const data = await response.json() as DependencyResponse;
    if (!response.ok) throw new BadGatewayException({ message: "A checkout dependency rejected the request", dependencyStatus: response.status, dependency: data });
    return data;
  }
  private parse<T>(schema: z.ZodType<T>, value: unknown): T { const result = schema.safeParse(value); if (!result.success) throw new BadRequestException({ message: "Validation failed", issues: result.error.issues }); return result.data; }
}
