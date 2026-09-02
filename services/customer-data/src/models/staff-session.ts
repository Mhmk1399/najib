import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const staffSessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User", index: true },
    tokenHash: { type: String, required: true, unique: true, select: false },
    usedTokenHashes: { type: [{ type: String, select: false }], default: [], select: false },
    expiresAt: { type: Date, required: true },
    lastUsedAt: { type: Date, required: true, default: Date.now },
    revokedAt: Date,
    ipAddress: { type: String, trim: true, maxlength: 128 },
    userAgent: { type: String, trim: true, maxlength: 512 },
  },
  { timestamps: true },
);

staffSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
staffSessionSchema.index({ usedTokenHashes: 1 });

export type StaffSessionDocument = InferSchemaType<typeof staffSessionSchema>;
export const StaffSession = models.StaffSession || model("StaffSession", staffSessionSchema);
