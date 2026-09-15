import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;
import {
  defaultImageFit,
  defaultImagePosition,
  imageObjectFits,
  imageObjectPositions,
} from "@/lib/catalog/image-presentation";
import { requiredSlugField } from "./_catalog-fields";
import {
  createLocalizedTextListSchema,
  createLocalizedTextSchema,
  requiredLocalizedNameField,
} from "./_localized-content";

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
    colorIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Color" }],
      default: [],
    },
    sizeIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Size" }],
      default: [],
    },
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
    primaryImageObjectFit: {
      type: String,
      enum: imageObjectFits,
      default: defaultImageFit,
    },
    primaryImageObjectPosition: {
      type: String,
      enum: imageObjectPositions,
      default: defaultImagePosition,
    },
    imageIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "ImageAsset" }],
      default: [],
    },
  },
  { timestamps: true },
);

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ status: 1, _id: -1 });
productSchema.index({ status: 1, categoryId: 1, _id: -1 });
productSchema.index({ status: 1, subcategoryId: 1, _id: -1 });
productSchema.index({ status: 1, collectionIds: 1, _id: -1 });
productSchema.index({ status: 1, colorIds: 1, _id: -1 });
productSchema.index({ status: 1, sizeIds: 1, _id: -1 });
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
