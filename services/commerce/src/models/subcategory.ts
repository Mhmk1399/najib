import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;
import { requiredNameField, requiredSlugField } from "./_catalog-fields.js";
import { categoryPageContentSchema } from "./_category-page-content.js";

const subcategorySchema = new Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    name: requiredNameField,
    slug: requiredSlugField,
    description: { type: String, trim: true, maxlength: 2000 },
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
