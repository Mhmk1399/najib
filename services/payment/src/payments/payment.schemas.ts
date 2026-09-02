import { z } from "zod";
import { createPaymentRequestSchema, mongoObjectIdSchema } from "@najib/contracts";

export { createPaymentRequestSchema };
export const paymentIdSchema = mongoObjectIdSchema;
export const sandboxWebhookSchema = z.object({
  eventId: z.string().trim().min(1).max(200),
  paymentId: mongoObjectIdSchema,
  outcome: z.enum(["succeeded", "failed"]),
  failureCode: z.string().trim().max(120).optional(),
}).strict();
