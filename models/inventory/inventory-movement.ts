import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const inventoryMovementSchema = new Schema(
  {
    idempotencyKey: { type: String, required: true, trim: true, maxlength: 240 },
    type: {
      type: String,
      enum: ["adjustment", "reservation", "commit", "release", "transfer_out", "transfer_in", "return"],
      required: true,
      index: true,
    },
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", required: true, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: "InventoryLocation", required: true, index: true },
    onHandDelta: { type: Number, required: true, validate: Number.isSafeInteger },
    reservedDelta: { type: Number, required: true, validate: Number.isSafeInteger },
    onHandAfter: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
    reservedAfter: { type: Number, required: true, min: 0, validate: Number.isSafeInteger },
    safetyStockAfter: { type: Number, min: 0, validate: Number.isSafeInteger },
    referenceType: { type: String, trim: true, maxlength: 40 },
    referenceId: { type: String, trim: true, maxlength: 120 },
    reason: { type: String, trim: true, maxlength: 500 },
    actorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

inventoryMovementSchema.index({ idempotencyKey: 1 }, { unique: true });
inventoryMovementSchema.index({ variantId: 1, locationId: 1, createdAt: -1 });

export type InventoryMovementDocument = InferSchemaType<typeof inventoryMovementSchema>;
export const InventoryMovement = models.InventoryMovement || model("InventoryMovement", inventoryMovementSchema);
