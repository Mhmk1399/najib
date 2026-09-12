import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;
import { requiredSlugField } from "./_catalog-fields.js";
import {
  createLocalizedTextListSchema,
  createLocalizedTextSchema,
  requiredLocalizedNameField,
} from "./_localized-content.js";

const productSchema = new Schema(
  {
    name: requiredLocalizedNameField,
    slug: requiredSlugField,
    description: { type: createLocalizedTextSchema(12000), required: true },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    subcategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
      index: true,
    },
    collectionIds: [{ type: Schema.Types.ObjectId, ref: "Collection" }],
    basePriceMinor: {
      type: Number,
      required: true,
      min: 0,
      validate: Number.isSafeInteger,
    },
    currency: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 3,
      maxlength: 3,
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived"],
      default: "draft",
      index: true,
    },
    material: { type: createLocalizedTextListSchema(), default: () => ({ fa: [], en: [], ar: [] }) },
    fit: { type: createLocalizedTextSchema(120, false) },
    silhouette: { type: createLocalizedTextSchema(120, false) },
    pattern: { type: createLocalizedTextSchema(120, false) },
    seasons: { type: createLocalizedTextListSchema(), default: () => ({ fa: [], en: [], ar: [] }) },
    occasions: { type: createLocalizedTextListSchema(), default: () => ({ fa: [], en: [], ar: [] }) },
    styleTags: { type: createLocalizedTextListSchema(), default: () => ({ fa: [], en: [], ar: [] }) },
    primaryImageId: { type: Schema.Types.ObjectId, ref: "ImageAsset" },
    imageIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "ImageAsset" }],
      default: [],
    },
  },
  { timestamps: true },
);

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({
  "name.fa": "text",
  "name.en": "text",
  "name.ar": "text",
  "description.fa": "text",
  "description.en": "text",
  "description.ar": "text",
}, { name: "localized_catalog_text", default_language: "none" });

export type ProductDocument = InferSchemaType<typeof productSchema>;
export const Product = models.Product || model("Product", productSchema);
