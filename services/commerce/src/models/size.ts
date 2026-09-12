import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;
import { requiredLocalizedNameField } from "./_localized-content.js";

const sizeSchema = new Schema(
  {
    sizeGroupId: {
      type: Schema.Types.ObjectId,
      ref: "SizeGroup",
      required: true,
      index: true,
    },
    name: requiredLocalizedNameField,
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 40,
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

sizeSchema.index({ sizeGroupId: 1, code: 1 }, { unique: true });

export type SizeDocument = InferSchemaType<typeof sizeSchema>;
export const Size = models.Size || model("Size", sizeSchema);
