import mongoose from "mongoose";

const { Schema } = mongoose;

export const catalogLocales = ["fa", "en", "ar"] as const;

export function createLocalizedTextSchema(maxlength: number, requiredValues = true) {
  return new Schema(
    {
      fa: { type: String, required: requiredValues, trim: true, maxlength },
      en: { type: String, required: requiredValues, trim: true, maxlength },
      ar: { type: String, required: requiredValues, trim: true, maxlength },
    },
    { _id: false },
  );
}

export function createLocalizedTextListSchema() {
  return new Schema(
    {
      fa: { type: [{ type: String, trim: true }], default: [] },
      en: { type: [{ type: String, trim: true }], default: [] },
      ar: { type: [{ type: String, trim: true }], default: [] },
    },
    { _id: false },
  );
}

export const requiredLocalizedNameField = {
  type: createLocalizedTextSchema(160),
  required: true,
} as const;
