export const requiredNameField = {
  type: String,
  required: true,
  trim: true,
  maxlength: 160,
} as const;

export const requiredSlugField = {
  type: String,
  required: true,
  trim: true,
  lowercase: true,
  maxlength: 180,
  match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

