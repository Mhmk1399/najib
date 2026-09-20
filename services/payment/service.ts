import "server-only";

import mongoose, { type ClientSession } from "mongoose";
import { randomUUID } from "node:crypto";
import { z } from "zod";

import { connectToDatabase } from "@/lib/server/db";
import { conflict, notFound } from "@/lib/server/errors";
import { User } from "@/models/auth/user";
import { Cart } from "@/models/catalog/cart";
import { CheckoutSession } from "@/models/catalog/checkout";
import { Color } from "@/models/catalog/color";
import { Order } from "@/models/catalog/order";
import { Outbox } from "@/models/catalog/outbox";
import { ProductVariant } from "@/models/catalog/product-variant";
import { Product } from "@/models/catalog/product";
import { Size } from "@/models/catalog/size";
import { PaymentAttempt, PaymentIntent } from "@/models/payment/payment-intent";
import { getPaymentProvider } from "@/services/integrations/payment-provider";
import { getSmsProvider } from "@/services/integrations/sms-provider";
import { transitionInventoryReservationInSession } from "@/services/inventory/service";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "شناسه معتبر نیست.");
const idempotencyKeySchema = z
  .string()
  .trim()
  .min(8)
  .max(120)
  .regex(/^[A-Za-z0-9._:-]+$/);

export const createPaymentIntentSchema = z.object({
  idempotencyKey: idempotencyKeySchema,
}).strict();

export const confirmPaymentSchema = z.object({
  idempotencyKey: idempotencyKeySchema,
  outcome: z.enum(["succeeded", "failed"]).optional(),
}).strict();

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
};

type PaymentRecord = {
  _id: unknown;
  checkoutSessionId: unknown;
  userId: unknown;
  provider: string;
  providerIntentId: string;
  amountMinor: number;
  currency: string;
  status: string;
  orderId?: unknown;
  lastErrorCode?: string;
  expiresAt: Date;
};

type LocalizedText = { fa: string; en: string; ar: string };
type VariantRecord = {
  _id: unknown;
  productId: unknown;
  colorId: unknown;
  sizeId: unknown;
  sku: string;
};
type ProductRecord = { _id: unknown; name: LocalizedText };
type ColorRecord = { _id: unknown; name: LocalizedText };
type SizeRecord = { _id: unknown; name: LocalizedText };
type UserRecord = {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

function duplicateKey(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}

function amount(checkout: CheckoutRecord) {
  return checkout.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPriceMinor,
    0,
  );
}

function serializePayment(value: PaymentRecord, idempotent = false) {
  return {
    id: String(value._id),
    checkoutSessionId: String(value.checkoutSessionId),
    provider: value.provider,
    amountMinor: value.amountMinor,
    currency: value.currency,
    status: value.status,
    orderId: value.orderId ? String(value.orderId) : null,
    errorCode: value.lastErrorCode ?? null,
    expiresAt: value.expiresAt,
    idempotent,
  };
}

async function ownedPayment(id: string, accountId: string, session?: ClientSession) {
  if (!mongoose.Types.ObjectId.isValid(id)) notFound("پرداخت پیدا نشد.");
  const query = PaymentIntent.findOne({ _id: id, userId: accountId });
  if (session) query.session(session);
  const payment = await query.lean() as unknown as PaymentRecord | null;
  if (!payment) notFound("پرداخت پیدا نشد.");
  return payment;
}

async function existingIntent(
  checkoutId: string,
  accountId: string,
  idempotencyKey: string,
  session?: ClientSession,
) {
  const query = PaymentIntent.findOne({
    $or: [{ checkoutSessionId: checkoutId }, { idempotencyKey }],
  });
  if (session) query.session(session);
  const existing = await query.lean() as unknown as PaymentRecord | null;
  if (!existing) return null;
  if (
    String(existing.userId) !== accountId ||
    String(existing.checkoutSessionId) !== checkoutId
  ) {
    conflict("این کلید قبلاً برای پرداخت دیگری استفاده شده است.");
  }
  return serializePayment(existing, true);
}

async function orderItems(checkout: CheckoutRecord, session: ClientSession) {
  const variantIds = checkout.items.map((item) => item.variantId);
  const variants = await ProductVariant.find({ _id: { $in: variantIds } })
    .session(session)
    .lean() as unknown as VariantRecord[];
  const variantMap = new Map(variants.map((item) => [String(item._id), item]));
  const [products, colors, sizes] = await Promise.all([
    Product.find({ _id: { $in: variants.map((item) => item.productId) } })
      .select("name")
      .session(session)
      .lean() as unknown as Promise<ProductRecord[]>,
    Color.find({ _id: { $in: variants.map((item) => item.colorId) } })
      .select("name")
      .session(session)
      .lean() as unknown as Promise<ColorRecord[]>,
    Size.find({ _id: { $in: variants.map((item) => item.sizeId) } })
      .select("name")
      .session(session)
      .lean() as unknown as Promise<SizeRecord[]>,
  ]);
  const productMap = new Map(products.map((item) => [String(item._id), item]));
  const colorMap = new Map(colors.map((item) => [String(item._id), item]));
  const sizeMap = new Map(sizes.map((item) => [String(item._id), item]));

  return checkout.items.map((item) => {
    const variant = variantMap.get(item.variantId);
    const product = variant ? productMap.get(String(variant.productId)) : undefined;
    const color = variant ? colorMap.get(String(variant.colorId)) : undefined;
    const size = variant ? sizeMap.get(String(variant.sizeId)) : undefined;
    if (!variant || !product || !color || !size) {
      conflict("اطلاعات یکی از کالاهای Checkout برای ساخت سفارش کامل نیست.");
    }
    return {
      variantId: item.variantId,
      productId: String(variant.productId),
      productName: product.name,
      sku: variant.sku,
      colorName: color.name,
      sizeName: size.name,
      unitPriceMinor: item.unitPriceMinor,
      taxMinor: 0,
      discountMinor: 0,
      quantity: item.quantity,
      lineTotalMinor: item.unitPriceMinor * item.quantity,
    };
  });
}

function orderNumber(paymentIntentId: string) {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `NJB-${day}-${paymentIntentId.slice(-8)}`.toUpperCase();
}

export const paymentService = {
  async createIntent(accountId: string, checkoutId: string, value: unknown) {
    if (!objectIdSchema.safeParse(checkoutId).success) notFound("Checkout پیدا نشد.");
    const input = createPaymentIntentSchema.parse(value);
    await connectToDatabase();
    const previous = await existingIntent(checkoutId, accountId, input.idempotencyKey);
    if (previous) return previous;

    const checkout = await CheckoutSession.findOne({
      _id: checkoutId,
      userId: accountId,
      status: "reserved",
      expiresAt: { $gt: new Date() },
    }).lean() as unknown as CheckoutRecord | null;
    if (!checkout) conflict("Checkout آماده پرداخت پیدا نشد یا زمان آن تمام شده است.");
    const provider = getPaymentProvider();
    const providerIntent = await provider.createIntent({
      idempotencyKey: input.idempotencyKey,
      amountMinor: amount(checkout),
      currency: checkout.currency,
      checkoutSessionId: checkoutId,
    });

    try {
      return await mongoose.connection.transaction(async (session) => {
        const repeated = await existingIntent(
          checkoutId,
          accountId,
          input.idempotencyKey,
          session,
        );
        if (repeated) return repeated;
        const current = await CheckoutSession.findOne({
          _id: checkoutId,
          userId: accountId,
          status: "reserved",
          expiresAt: { $gt: new Date() },
        }).session(session);
        if (!current) conflict("Checkout آماده پرداخت پیدا نشد یا زمان آن تمام شده است.");

        const [intent] = await PaymentIntent.create([{
          checkoutSessionId: checkoutId,
          userId: accountId,
          idempotencyKey: input.idempotencyKey,
          provider: provider.name,
          providerIntentId: providerIntent.providerIntentId,
          amountMinor: amount(current.toObject() as unknown as CheckoutRecord),
          currency: current.currency,
          status: providerIntent.status,
          expiresAt: current.expiresAt,
        }], { session });
        current.status = "payment_pending";
        current.paymentId = intent.id;
        await current.save({ session });
        await Outbox.create([{
          eventId: randomUUID(),
          eventType: "PaymentIntentCreated",
          correlationId: current.correlationId,
          destination: "events",
          payload: {
            paymentIntentId: intent.id,
            checkoutSessionId: current.id,
            userId: accountId,
          },
        }], { session });
        return serializePayment(intent.toObject() as unknown as PaymentRecord);
      });
    } catch (error) {
      if (duplicateKey(error)) {
        const existing = await existingIntent(checkoutId, accountId, input.idempotencyKey);
        if (existing) return existing;
      }
      throw error;
    }
  },

  async get(accountId: string, id: string) {
    await connectToDatabase();
    return serializePayment(await ownedPayment(id, accountId));
  },

  async confirm(accountId: string, id: string, value: unknown) {
    const input = confirmPaymentSchema.parse(value);
    await connectToDatabase();
    let payment = await ownedPayment(id, accountId);
    if (payment.status === "succeeded") {
      const order = payment.orderId ? await Order.findById(payment.orderId).lean() : null;
      return { payment: serializePayment(payment, true), order, sms: null };
    }
    if (payment.expiresAt.getTime() <= Date.now()) conflict("زمان پرداخت و رزرو موجودی تمام شده است.");

    let attempt = await PaymentAttempt.findOne({ idempotencyKey: input.idempotencyKey });
    if (attempt && String(attempt.paymentIntentId) !== id) {
      conflict("این کلید قبلاً برای تلاش پرداخت دیگری استفاده شده است.");
    }
    if (!attempt) {
      try {
        [attempt] = await PaymentAttempt.create([{
          paymentIntentId: id,
          idempotencyKey: input.idempotencyKey,
          status: "initiated",
        }]);
      } catch (error) {
        if (!duplicateKey(error)) throw error;
        attempt = await PaymentAttempt.findOne({ idempotencyKey: input.idempotencyKey });
      }
    }
    if (!attempt || String(attempt.paymentIntentId) !== id) {
      conflict("تلاش پرداخت معتبر نیست.");
    }
    if (attempt.status !== "initiated") {
      payment = await ownedPayment(id, accountId);
      const order = payment.orderId ? await Order.findById(payment.orderId).lean() : null;
      return { payment: serializePayment(payment, true), order, sms: null };
    }

    await PaymentIntent.updateOne(
      { _id: id, userId: accountId, status: { $in: ["requires_action", "failed"] } },
      { $set: { status: "processing", lastErrorCode: null } },
    );
    const provider = getPaymentProvider();
    const providerResult = await provider.confirmIntent({
      idempotencyKey: input.idempotencyKey,
      providerIntentId: payment.providerIntentId,
      amountMinor: payment.amountMinor,
      currency: payment.currency,
      checkoutSessionId: String(payment.checkoutSessionId),
      requestedOutcome: input.outcome,
    });

    if (providerResult.outcome === "failed") {
      const failedPayment = await mongoose.connection.transaction(async (session) => {
        await PaymentAttempt.updateOne({ _id: attempt.id }, {
          $set: {
            status: "failed",
            providerAttemptId: providerResult.providerAttemptId,
            errorCode: providerResult.errorCode,
          },
        }, { session });
        const updated = await PaymentIntent.findOneAndUpdate(
          { _id: id, userId: accountId, status: { $ne: "succeeded" } },
          { $set: { status: "failed", lastErrorCode: providerResult.errorCode } },
          { new: true, session },
        );
        if (!updated) conflict("وضعیت پرداخت قابل تغییر نیست.");
        return updated;
      });
      return {
        payment: serializePayment(failedPayment.toObject() as unknown as PaymentRecord),
        order: null,
        sms: null,
      };
    }

    const result = await mongoose.connection.transaction(async (session) => {
      const currentPayment = await PaymentIntent.findOne({ _id: id, userId: accountId })
        .session(session);
      if (!currentPayment) notFound("پرداخت پیدا نشد.");
      if (currentPayment.status === "succeeded" && currentPayment.orderId) {
        const existingOrder = await Order.findById(currentPayment.orderId).session(session).lean();
        return { payment: currentPayment, order: existingOrder, idempotent: true };
      }
      const currentCheckout = await CheckoutSession.findOne({
        _id: currentPayment.checkoutSessionId,
        userId: accountId,
        status: "payment_pending",
        expiresAt: { $gt: new Date() },
      }).session(session);
      if (!currentCheckout || !currentCheckout.inventoryReservationId) {
        conflict("Checkout دیگر آماده تکمیل پرداخت نیست.");
      }
      const checkoutRecord = currentCheckout.toObject() as unknown as CheckoutRecord;
      if (amount(checkoutRecord) !== currentPayment.amountMinor) {
        conflict("مبلغ Checkout با مبلغ پرداخت هماهنگ نیست.");
      }
      const user = await User.findById(accountId)
        .select("email firstName lastName phone")
        .session(session)
        .lean() as unknown as UserRecord | null;
      if (!user) notFound("حساب کاربری پیدا نشد.");
      const items = await orderItems(checkoutRecord, session);
      await transitionInventoryReservationInSession(
        currentCheckout.inventoryReservationId,
        { action: "commit", reason: "پرداخت تأییدشده" },
        session,
        accountId,
      );

      const [order] = await Order.create([{
        orderNumber: orderNumber(currentPayment.id),
        idempotencyKey: `payment:${currentPayment.id}`,
        correlationId: currentCheckout.correlationId,
        cartId: currentCheckout.cartId,
        checkoutSessionId: currentCheckout.id,
        userId: accountId,
        contact: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
        },
        storeId: currentCheckout.storeId,
        cityId: currentCheckout.cityId,
        inventoryReservationId: currentCheckout.inventoryReservationId,
        paymentIntentId: currentPayment.id,
        currency: currentCheckout.currency,
        items,
        subtotalMinor: currentPayment.amountMinor,
        taxMinor: 0,
        discountMinor: 0,
        shippingMinor: 0,
        totalMinor: currentPayment.amountMinor,
        status: "confirmed",
        policyVersion: "checkout-v1",
        confirmedAt: new Date(),
      }], { session });

      currentPayment.status = "succeeded";
      currentPayment.orderId = order._id;
      currentPayment.lastErrorCode = undefined;
      currentCheckout.status = "completed";
      await Promise.all([
        currentPayment.save({ session }),
        currentCheckout.save({ session }),
        PaymentAttempt.updateOne({ _id: attempt.id }, {
          $set: {
            status: "succeeded",
            providerAttemptId: providerResult.providerAttemptId,
          },
          $unset: { errorCode: 1 },
        }, { session }),
        Cart.updateOne(
          { _id: currentCheckout.cartId, userId: accountId, status: "checkout_started" },
          { $set: { status: "converted" } },
          { session },
        ),
        Outbox.create([{
          eventId: randomUUID(),
          eventType: "OrderConfirmed",
          correlationId: currentCheckout.correlationId,
          destination: "events",
          payload: { orderId: order.id, paymentIntentId: currentPayment.id, userId: accountId },
        }, {
          eventId: randomUUID(),
          eventType: "OrderConfirmationSmsRequested",
          correlationId: currentCheckout.correlationId,
          destination: "events",
          payload: { orderId: order.id, userId: accountId, phone: user.phone ?? null },
        }], { session, ordered: true }),
      ]);
      return { payment: currentPayment, order, user, idempotent: false };
    });

    let sms: { status: "accepted" | "skipped" | "deferred"; providerMessageId?: string };
    if (!("user" in result) || !result.user?.phone) {
      sms = { status: "skipped" };
    } else {
      try {
        const sent = await getSmsProvider().send({
          idempotencyKey: `order-confirmed:${result.order.id}`,
          to: result.user.phone,
          template: "order-confirmed",
          variables: { orderNumber: result.order.orderNumber },
        });
        sms = sent;
      } catch {
        sms = { status: "deferred" };
      }
    }
    return {
      payment: serializePayment(result.payment.toObject() as unknown as PaymentRecord, result.idempotent),
      order: result.order,
      sms,
    };
  },
};
