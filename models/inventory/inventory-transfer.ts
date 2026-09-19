import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const transferItemSchema = new Schema(
  {
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", required: true },
    quantity: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
  },
  { _id: false },
);

const inventoryTransferSchema = new Schema(
  {
    idempotencyKey: { type: String, required: true, trim: true, maxlength: 160 },
    sourceLocationId: { type: Schema.Types.ObjectId, ref: "InventoryLocation", required: true, index: true },
    destinationLocationId: { type: Schema.Types.ObjectId, ref: "InventoryLocation", required: true, index: true },
    items: { type: [transferItemSchema], required: true },
    status: { type: String, enum: ["completed", "cancelled"], default: "completed", index: true },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    actorId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    completedAt: { type: Date, required: true },
  },
  { timestamps: true },
);

inventoryTransferSchema.index({ idempotencyKey: 1 }, { unique: true });
inventoryTransferSchema.index({ createdAt: -1 });

export type InventoryTransferDocument = InferSchemaType<typeof inventoryTransferSchema>;
export const InventoryTransfer = models.InventoryTransfer || model("InventoryTransfer", inventoryTransferSchema);
