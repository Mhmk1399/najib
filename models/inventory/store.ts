import mongoose, { type InferSchemaType } from "mongoose";
import { createLocalizedTextSchema, requiredLocalizedNameField } from "@/models/catalog/_localized-content";

const { Schema, model, models } = mongoose;

const storeSchema = new Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true, maxlength: 32 },
    name: requiredLocalizedNameField,
    cityId: { type: Schema.Types.ObjectId, ref: "City", required: true, index: true },
    address: { type: createLocalizedTextSchema(500, false), default: undefined },
    shippingFeeMinor: { type: Number, default: 0, min: 0, validate: Number.isSafeInteger },
    shippingFeeIrrMinor: { type: Number, min: 0, validate: Number.isSafeInteger },
    shippingFeeUsdMinor: { type: Number, min: 0, validate: Number.isSafeInteger },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

storeSchema.index({ code: 1 }, { unique: true });

export type StoreDocument = InferSchemaType<typeof storeSchema>;
export const Store = models.Store || model("Store", storeSchema);
