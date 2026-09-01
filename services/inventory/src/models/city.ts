import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const citySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 30,
    },
    countryCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 2,
    },
    timezone: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

citySchema.index({ countryCode: 1, code: 1 }, { unique: true });

export type CityDocument = InferSchemaType<typeof citySchema>;
export const City = models.City || model("City", citySchema);

