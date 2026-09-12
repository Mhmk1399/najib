import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;
import { requiredSlugField } from "./_catalog-fields.js";
import { categoryPageContentSchema } from "./_category-page-content.js";
import { createLocalizedTextSchema, requiredLocalizedNameField } from "./_localized-content.js";

const subcategorySchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    name: requiredLocalizedNameField,
    slug: requiredSlugField,
    description: { type: createLocalizedTextSchema(2000, false) },
    thumbnailImageId: { type: Schema.Types.ObjectId, ref: "ImageAsset" },
    pageContent: { type: categoryPageContentSchema, required: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

subcategorySchema.index({ categoryId: 1, slug: 1 }, { unique: true });

export type SubcategoryDocument = InferSchemaType<typeof subcategorySchema>;
export const Subcategory =
  models.Subcategory || model("Subcategory", subcategorySchema);
