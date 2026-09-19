import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const integerField = { type: Number, required: true, min: 0, validate: Number.isSafeInteger } as const;

const inventoryBalanceSchema = new Schema(
  {
    variantId: { type: Schema.Types.ObjectId, ref: "ProductVariant", required: true, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: "InventoryLocation", required: true, index: true },
    onHand: { ...integerField, default: 0 },
    reserved: { ...integerField, default: 0 },
    safetyStock: { ...integerField, default: 0 },
    version: { ...integerField, default: 0 },
  },
  { timestamps: true },
);

inventoryBalanceSchema.index({ variantId: 1, locationId: 1 }, { unique: true });
inventoryBalanceSchema.index({ locationId: 1, updatedAt: -1 });

export type InventoryBalanceDocument = InferSchemaType<typeof inventoryBalanceSchema>;
export const InventoryBalance = models.InventoryBalance || model("InventoryBalance", inventoryBalanceSchema);
