import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const inventoryPoolSchema = new Schema(
  {
    cityId: {
      type: Schema.Types.ObjectId,
      ref: "City",
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
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

inventoryPoolSchema.index({ cityId: 1, code: 1 }, { unique: true });

export type InventoryPoolDocument = InferSchemaType<typeof inventoryPoolSchema>;
export const InventoryPool =
  models.InventoryPool || model("InventoryPool", inventoryPoolSchema);

