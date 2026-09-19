import mongoose, { type InferSchemaType } from "mongoose";
import { requiredLocalizedNameField } from "@/models/catalog/_localized-content";

const { Schema, model, models } = mongoose;

const inventoryPoolSchema = new Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true, maxlength: 32 },
    name: requiredLocalizedNameField,
    cityId: { type: Schema.Types.ObjectId, ref: "City", default: null, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

inventoryPoolSchema.index({ code: 1 }, { unique: true });

export type InventoryPoolDocument = InferSchemaType<typeof inventoryPoolSchema>;
export const InventoryPool = models.InventoryPool || model("InventoryPool", inventoryPoolSchema);
