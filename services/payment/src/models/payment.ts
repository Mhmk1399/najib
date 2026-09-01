import { InferSchemaType, Schema, model, models } from "mongoose";

export const PAYMENT_STATUSES = [
  "created",
  "requires_customer_action",
  "authorized",
  "captured",
  "failed",
  "cancelled",
  "partially_refunded",
  "refunded",
] as const;

const statusHistorySchema = new Schema(
  {
    from: { type: String, enum: PAYMENT_STATUSES },
    to: { type: String, enum: PAYMENT_STATUSES, required: true },
    reason: { type: String, trim: true },
    occurredAt: { type: Date, required: true, default: Date.now },
    correlationId: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const paymentSchema = new Schema(
  {
    orderId: { type: String, required: true, trim: true, index: true },
    customerId: { type: String, trim: true, index: true },
    idempotencyKey: { type: String, required: true, trim: true },
    provider: { type: String, required: true, trim: true, lowercase: true },
    providerIntentId: { type: String, trim: true },
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    requestedAmountMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isSafeInteger,
    },
    authorizedAmountMinor: {
      type: Number,
      default: 0,
      min: 0,
      validate: Number.isSafeInteger,
    },
    capturedAmountMinor: {
      type: Number,
      default: 0,
      min: 0,
      validate: Number.isSafeInteger,
    },
    refundedAmountMinor: {
      type: Number,
      default: 0,
      min: 0,
      validate: Number.isSafeInteger,
    },
    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      default: "created",
      index: true,
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    metadata: { type: Map, of: String, default: {} },
  },
  { timestamps: true },
);

paymentSchema.pre("validate", function validatePaymentAmounts() {
  if (this.authorizedAmountMinor > this.requestedAmountMinor) {
    this.invalidate("authorizedAmountMinor", "Authorization exceeds requested amount");
  }
  if (this.capturedAmountMinor > this.authorizedAmountMinor) {
    this.invalidate("capturedAmountMinor", "Capture exceeds authorized amount");
  }
  if (this.refundedAmountMinor > this.capturedAmountMinor) {
    this.invalidate("refundedAmountMinor", "Refund exceeds captured amount");
  }
});

paymentSchema.index({ idempotencyKey: 1 }, { unique: true });
paymentSchema.index({ provider: 1, providerIntentId: 1 }, { unique: true, sparse: true });

const paymentAttemptSchema = new Schema(
  {
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      index: true,
    },
    attemptNumber: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
    providerRequestId: { type: String, trim: true },
    providerEventId: { type: String, trim: true },
    status: {
      type: String,
      enum: ["started", "requires_customer_action", "succeeded", "failed"],
      required: true,
      index: true,
    },
    failureCode: { type: String, trim: true },
    failureMessage: { type: String, trim: true },
    safeProviderData: { type: Map, of: String, default: {} },
  },
  { timestamps: true },
);
paymentAttemptSchema.index({ paymentId: 1, attemptNumber: 1 }, { unique: true });
paymentAttemptSchema.index({ providerEventId: 1 }, { unique: true, sparse: true });

export type PaymentDocument = InferSchemaType<typeof paymentSchema>;
export type PaymentAttemptDocument = InferSchemaType<typeof paymentAttemptSchema>;
export const Payment = models.Payment || model("Payment", paymentSchema);
export const PaymentAttempt =
  models.PaymentAttempt || model("PaymentAttempt", paymentAttemptSchema);

