import mongoose, { type InferSchemaType } from "mongoose";
const { Schema, model, models } = mongoose;
const outboxSchema = new Schema({
  eventId: { type: String, required: true, unique: true },
  eventType: { type: String, required: true, index: true },
  correlationId: { type: String, required: true, index: true },
  destination: { type: String, enum: ["events", "accounting"], required: true, index: true },
  payload: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: ["pending", "published", "failed"], default: "pending", index: true },
  attempts: { type: Number, default: 0, min: 0 },
}, { timestamps: true });
outboxSchema.index({ status: 1, createdAt: 1 });
export type OutboxDocument = InferSchemaType<typeof outboxSchema>;
export const Outbox = models.Outbox || model("Outbox", outboxSchema);
