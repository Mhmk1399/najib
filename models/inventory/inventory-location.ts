import mongoose, { type InferSchemaType } from "mongoose";
import { requiredLocalizedNameField } from "@/models/catalog/_localized-content";

const { Schema, model, models } = mongoose;

const inventoryLocationSchema = new Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true, maxlength: 40 },
    name: requiredLocalizedNameField,
    type: { type: String, enum: ["warehouse", "store", "virtual"], required: true, index: true },
    cityId: { type: Schema.Types.ObjectId, ref: "City", required: true, index: true },
    poolId: { type: Schema.Types.ObjectId, ref: "InventoryPool", required: true, index: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", default: null, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

inventoryLocationSchema.index({ code: 1 }, { unique: true });
inventoryLocationSchema.index({ poolId: 1, isActive: 1 });

export type InventoryLocationDocument = InferSchemaType<typeof inventoryLocationSchema>;
export const InventoryLocation = models.InventoryLocation || model("InventoryLocation", inventoryLocationSchema);
