import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const inventoryLocationSchema = new Schema(
  {
    inventoryPoolId: {
      type: Schema.Types.ObjectId,
      ref: "InventoryPool",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 40,
    },
    kind: {
      type: String,
      enum: ["store", "warehouse", "fulfillment_center", "returns"],
      required: true,
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

inventoryLocationSchema.index(
  { inventoryPoolId: 1, code: 1 },
  { unique: true },
);

export type InventoryLocationDocument = InferSchemaType<
  typeof inventoryLocationSchema
>;
export const InventoryLocation =
  models.InventoryLocation ||
  model("InventoryLocation", inventoryLocationSchema);

