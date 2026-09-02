import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const orderItemSchema = new Schema(
  {
    variantId: { type: String, required: true, trim: true },
    productId: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true, uppercase: true },
    colorName: { type: String, required: true, trim: true },
    sizeName: { type: String, required: true, trim: true },
    unitPriceMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isSafeInteger,
    },
    taxMinor: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
    discountMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isSafeInteger,
    },
    quantity: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
    lineTotalMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isSafeInteger,
    },
  },
  { _id: true },
);

const contactSchema = new Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, trim: true, uppercase: true },
    idempotencyKey: { type: String, required: true, trim: true },
    cartId: { type: String, required: true, trim: true },
    checkoutSessionId: { type: String, required: true, trim: true },
    userId: { type: String, trim: true, index: true },
    anonymousId: { type: String, trim: true },
    contact: { type: contactSchema, required: true },
    storeId: { type: String, required: true, trim: true },
    cityId: { type: String, required: true, trim: true },
    inventoryReservationId: { type: String, trim: true },
    paymentIntentId: { type: String, trim: true },
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(items: unknown[]) => items.length > 0, "Order requires at least one item"],
    },
    subtotalMinor: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
    taxMinor: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
    discountMinor: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
    shippingMinor: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
    totalMinor: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
    status: {
      type: String,
      enum: [
        "pending_inventory",
        "pending_payment",
        "payment_failed",
        "confirmed",
        "cancelled",
        "expired",
        "compensation_required",
        "refunded",
      ],
      default: "pending_inventory",
      index: true,
    },
    policyVersion: { type: String, required: true, trim: true },
    confirmedAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true },
);

orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ idempotencyKey: 1 }, { unique: true });
orderSchema.index({ checkoutSessionId: 1 }, { unique: true });

export type OrderDocument = InferSchemaType<typeof orderSchema>;
export const Order = models.Order || model("Order", orderSchema);

