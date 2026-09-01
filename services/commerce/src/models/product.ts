import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;
import { requiredNameField, requiredSlugField } from "./_catalog-fields.js";

const productSchema = new Schema(
  {
    name: requiredNameField,
    slug: requiredSlugField,
    description: { type: String, required: true, trim: true, maxlength: 12000 },
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
    material: [{ type: String, trim: true }],
    fit: { type: String, trim: true },
    silhouette: { type: String, trim: true },
    pattern: { type: String, trim: true },
    seasons: [{ type: String, trim: true }],
    occasions: [{ type: String, trim: true }],
    styleTags: [{ type: String, trim: true, lowercase: true }],
    primaryImageId: { type: Schema.Types.ObjectId, ref: "ImageAsset" },
    imageIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "ImageAsset" }],
      default: [],
    },
  },
  { timestamps: true },
);

productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ name: "text", description: "text", styleTags: "text" });

export type ProductDocument = InferSchemaType<typeof productSchema>;
export const Product = models.Product || model("Product", productSchema);
