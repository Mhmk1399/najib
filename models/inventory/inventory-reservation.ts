import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const reservationItemSchema = new Schema(
  {
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", required: true },
    locationId: { type: Schema.Types.ObjectId, ref: "InventoryLocation", required: true },
    quantity: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
  },
  { _id: false },
);

const inventoryReservationSchema = new Schema(
  {
    idempotencyKey: { type: String, required: true, trim: true, maxlength: 160 },
    cartId: { type: Schema.Types.ObjectId, ref: "Cart", default: null, index: true },
    checkoutSessionId: { type: Schema.Types.ObjectId, ref: "CheckoutSession", default: null, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    items: { type: [reservationItemSchema], required: true },
    status: { type: String, enum: ["active", "committed", "released", "expired"], default: "active", index: true },
    expiresAt: { type: Date, required: true, index: true },
    committedAt: { type: Date, default: null },
    releasedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

inventoryReservationSchema.index({ idempotencyKey: 1 }, { unique: true });
inventoryReservationSchema.index({ status: 1, expiresAt: 1 });

export type InventoryReservationDocument = InferSchemaType<typeof inventoryReservationSchema>;
export const InventoryReservation = models.InventoryReservation || model("InventoryReservation", inventoryReservationSchema);
