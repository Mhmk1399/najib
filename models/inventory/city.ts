import mongoose, { type InferSchemaType } from "mongoose";
import { requiredLocalizedNameField } from "@/models/catalog/_localized-content";

const { Schema, model, models } = mongoose;

const citySchema = new Schema(
  {
    code: { type: String, required: true, trim: true, uppercase: true, maxlength: 32 },
    name: requiredLocalizedNameField,
    countryCode: { type: String, required: true, trim: true, uppercase: true, minlength: 2, maxlength: 2 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

citySchema.index({ code: 1 }, { unique: true });

export type CityDocument = InferSchemaType<typeof citySchema>;
export const City = models.City || model("City", citySchema);
