import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;
import { requiredNameField } from "./_catalog-fields.js";

const sizeGroupSchema = new Schema(
  {
    name: requiredNameField,
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 40,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

sizeGroupSchema.index({ code: 1 }, { unique: true });

export type SizeGroupDocument = InferSchemaType<typeof sizeGroupSchema>;
export const SizeGroup =
  models.SizeGroup || model("SizeGroup", sizeGroupSchema);
