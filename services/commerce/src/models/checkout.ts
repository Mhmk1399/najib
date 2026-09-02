import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const checkoutItemSchema = new Schema(
  {
    variantId: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
    unitPriceMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isSafeInteger,
    },
  },
  { _id: false },
);

const checkoutSessionSchema = new Schema(
  {
    cartId: { type: String, required: true, trim: true, index: true },
    idempotencyKey: { type: String, required: true, trim: true },
    userId: { type: String, trim: true },
    anonymousId: { type: String, trim: true },
    storeId: { type: String, required: true, trim: true },
    cityId: { type: String, required: true, trim: true },
    currency: { type: String, required: true, trim: true, uppercase: true },
    items: { type: [checkoutItemSchema], required: true },
    status: {
      type: String,
      enum: ["started", "reserved", "payment_pending", "completed", "failed", "expired"],
      default: "started",
      index: true,
    },
    expiresAt: { type: Date, required: true, index: true },
    correlationId: { type: String, required: true, trim: true },
    inventoryReservationId: { type: String, trim: true },
    paymentId: { type: String, trim: true },
  },
  { timestamps: true },
);
checkoutSessionSchema.index({ idempotencyKey: 1 }, { unique: true });

const abandonedItemSchema = new Schema(
  {
    variantId: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    colorName: { type: String, required: true, trim: true },
    sizeName: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
    unitPriceMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isSafeInteger,
    },
  },
  { _id: false },
);

const abandonedCheckoutSchema = new Schema(
  {
    checkoutSessionId: { type: String, required: true, trim: true },
    cartId: { type: String, required: true, trim: true, index: true },
    userId: { type: String, trim: true, index: true },
    anonymousId: { type: String, trim: true, index: true },
    email: { type: String, trim: true, lowercase: true },
    storeId: { type: String, required: true, trim: true },
    cityId: { type: String, required: true, trim: true },
    currency: { type: String, required: true, trim: true, uppercase: true },
    items: { type: [abandonedItemSchema], required: true },
    subtotalMinor: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
    abandonedAt: { type: Date, required: true, default: Date.now },
    reason: {
      type: String,
      enum: ["inactivity", "payment_failed", "customer_left", "reservation_expired"],
      required: true,
    },
    recoveryStatus: {
      type: String,
      enum: ["eligible", "contacted", "recovered", "expired", "suppressed"],
      default: "eligible",
      index: true,
    },
    recoveryTokenHash: { type: String, select: false },
    recoveredOrderId: { type: String, trim: true },
  },
  { timestamps: true },
);
abandonedCheckoutSchema.index({ checkoutSessionId: 1 }, { unique: true });

export type CheckoutSessionDocument = InferSchemaType<typeof checkoutSessionSchema>;
export type AbandonedCheckoutDocument = InferSchemaType<typeof abandonedCheckoutSchema>;
export const CheckoutSession =
  models.CheckoutSession || model("CheckoutSession", checkoutSessionSchema);
export const AbandonedCheckout =
  models.AbandonedCheckout ||
  model("AbandonedCheckout", abandonedCheckoutSchema);
