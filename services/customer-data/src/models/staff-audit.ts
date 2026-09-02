import mongoose, { type InferSchemaType } from "mongoose";

const { Schema, model, models } = mongoose;

const staffAuditSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    email: { type: String, trim: true, lowercase: true, maxlength: 320 },
    action: { type: String, enum: ["login", "refresh", "logout", "logout_all", "staff_bootstrap"], required: true },
    outcome: { type: String, enum: ["success", "failure"], required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: "StaffSession" },
    ipAddress: { type: String, trim: true, maxlength: 128 },
    userAgent: { type: String, trim: true, maxlength: 512 },
    reason: { type: String, trim: true, maxlength: 160 },
  },
  { timestamps: true },
);

staffAuditSchema.index({ createdAt: -1 });

export type StaffAuditDocument = InferSchemaType<typeof staffAuditSchema>;
export const StaffAudit = models.StaffAudit || model("StaffAudit", staffAuditSchema);
