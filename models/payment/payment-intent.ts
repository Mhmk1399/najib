import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const paymentAttemptSchema = new Schema(
  {
    paymentIntentId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentIntent",
      required: true,
      index: true,
    },
    idempotencyKey: { type: String, required: true, trim: true, maxlength: 160 },
    providerAttemptId: { type: String, trim: true, maxlength: 160 },
    status: {
      type: String,
      enum: ["initiated", "succeeded", "failed"],
      default: "initiated",
      index: true,
    },
    errorCode: { type: String, trim: true, maxlength: 160 },
  },
  { timestamps: true },
);
paymentAttemptSchema.index({ idempotencyKey: 1 }, { unique: true });

const paymentIntentSchema = new Schema(
  {
    checkoutSessionId: {
      type: Schema.Types.ObjectId,
      ref: "CheckoutSession",
      required: true,
      index: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    idempotencyKey: { type: String, required: true, trim: true, maxlength: 160 },
    provider: { type: String, required: true, trim: true, maxlength: 80 },
    providerIntentId: { type: String, required: true, trim: true, maxlength: 160 },
    amountMinor: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    status: {
      type: String,
      enum: ["requires_action", "processing", "succeeded", "failed", "cancelled"],
      default: "requires_action",
      index: true,
    },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null, index: true },
    lastErrorCode: { type: String, trim: true, maxlength: 160 },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);
paymentIntentSchema.index({ idempotencyKey: 1 }, { unique: true });
paymentIntentSchema.index({ checkoutSessionId: 1 }, { unique: true });

export type PaymentIntentDocument = InferSchemaType<typeof paymentIntentSchema>;
export type PaymentAttemptDocument = InferSchemaType<typeof paymentAttemptSchema>;
export const PaymentIntent = models.PaymentIntent || model("PaymentIntent", paymentIntentSchema);
export const PaymentAttempt = models.PaymentAttempt || model("PaymentAttempt", paymentAttemptSchema);
