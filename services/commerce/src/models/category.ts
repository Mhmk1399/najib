import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;
import { requiredNameField, requiredSlugField } from "./_catalog-fields.js";
import { categoryPageContentSchema } from "./_category-page-content.js";

const categorySchema = new Schema(
  {
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

categorySchema.index({ slug: 1 }, { unique: true });

export type CategoryDocument = InferSchemaType<typeof categorySchema>;
export const Category = models.Category || model("Category", categorySchema);
