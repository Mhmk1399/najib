import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const cartItemSchema = new Schema(
  {
    variantId: {
      type: Schema.Types.ObjectId,
      ref: "ProductVariant",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
    unitPriceMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isSafeInteger,
    },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const cartSchema = new Schema(
  {
    userId: { type: String, trim: true, index: true },
    anonymousId: { type: String, trim: true, index: true },
    storeId: { type: String, trim: true },
    cityId: { type: String, trim: true },
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    items: { type: [cartItemSchema], default: [] },
    status: {
      type: String,
      enum: ["active", "checkout_started", "converted", "abandoned", "expired"],
      default: "active",
      index: true,
    },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

cartSchema.pre("validate", function validateCartIdentity() {
  if (!this.userId && !this.anonymousId) {
    this.invalidate("anonymousId", "A cart requires userId or anonymousId");
  }
});

cartSchema.index({ anonymousId: 1, status: 1 });
cartSchema.index({ userId: 1, status: 1 });

export type CartDocument = InferSchemaType<typeof cartSchema>;
export const Cart = models.Cart || model("Cart", cartSchema);

