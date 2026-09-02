import { z } from "zod";

export const mongoObjectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Must be a valid MongoDB ObjectId");

export const externalIdSchema = z.string().trim().min(1).max(160);
export const idempotencyKeySchema = z.string().trim().min(8).max(200);
export const correlationIdSchema = z.string().trim().min(1).max(200);
export const currencySchema = z.string().trim().length(3).transform((value) => value.toUpperCase());
export const dateTimeSchema = z.iso.datetime({ offset: true });

export const moneySchema = z
  .object({
    amountMinor: z.number().int().nonnegative(),
    currency: currencySchema,
  })
  .strict();

export const paginationQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const paginationSchema = z
  .object({
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    total: z.number().int().nonnegative(),
    pages: z.number().int().nonnegative(),
  })
  .strict();

export const problemDetailsSchema = z
  .object({
    status: z.number().int().min(400).max(599),
    code: z.string().trim().min(1).max(100),
    message: z.string().trim().min(1).max(1000),
    correlationId: correlationIdSchema.optional(),
    details: z.unknown().optional(),
  })
  .strict();

export type Money = z.infer<typeof moneySchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type ProblemDetails = z.infer<typeof problemDetailsSchema>;
