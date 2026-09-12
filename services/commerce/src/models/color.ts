import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;
import { requiredSlugField } from "./_catalog-fields.js";
import { createLocalizedTextSchema, requiredLocalizedNameField } from "./_localized-content.js";

const colorSchema = new Schema(
  {
    name: requiredLocalizedNameField,
    slug: requiredSlugField,
    family: { type: createLocalizedTextSchema(80), required: true },
    hex: {
      type: String,
      trim: true,
      uppercase: true,
      match: /^#[0-9A-F]{6}$/,
    },
    swatchImageUrl: { type: String, trim: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

colorSchema.index({ slug: 1 }, { unique: true });

export type ColorDocument = InferSchemaType<typeof colorSchema>;
export const Color = models.Color || model("Color", colorSchema);
