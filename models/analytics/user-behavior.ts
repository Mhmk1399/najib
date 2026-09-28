import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

export const USER_BEHAVIOR_EVENTS = [
  "product_view",
  "wishlist_add",
  "cart_add",
  "checkout_start",
  "purchase",
] as const;

const userBehaviorSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant" },
    eventType: { type: String, enum: USER_BEHAVIOR_EVENTS, required: true },
    idempotencyKey: { type: String, required: true, trim: true, maxlength: 120 },
    coalescingKey: { type: String, trim: true, maxlength: 180 },
    locale: { type: String, enum: ["fa", "en", "ar"] },
    source: { type: String, trim: true, maxlength: 80 },
    quantity: { type: Number, min: 1, max: 99, default: 1 },
    occurredAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
);

userBehaviorSchema.index({ userId: 1, idempotencyKey: 1 }, { unique: true });
userBehaviorSchema.index({ coalescingKey: 1 }, { unique: true, sparse: true });
userBehaviorSchema.index({ userId: 1, occurredAt: -1, _id: -1 });
userBehaviorSchema.index({ occurredAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export type UserBehaviorDocument = InferSchemaType<typeof userBehaviorSchema>;
export const UserBehavior = models.UserBehavior || model("UserBehavior", userBehaviorSchema);

const userBehaviorRateBucketSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  windowStart: { type: Date, required: true },
  count: { type: Number, required: true, min: 0, default: 0 },
  expiresAt: { type: Date, required: true },
});
userBehaviorRateBucketSchema.index({ userId: 1, windowStart: 1 }, { unique: true });
userBehaviorRateBucketSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const UserBehaviorRateBucket = models.UserBehaviorRateBucket || model("UserBehaviorRateBucket", userBehaviorRateBucketSchema);
