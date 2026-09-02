import { z } from "zod";
export declare const mongoObjectIdSchema: z.ZodString;
export declare const externalIdSchema: z.ZodString;
export declare const idempotencyKeySchema: z.ZodString;
export declare const correlationIdSchema: z.ZodString;
export declare const currencySchema: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
export declare const dateTimeSchema: z.ZodISODateTime;
export declare const moneySchema: z.ZodObject<{
    amountMinor: z.ZodNumber;
    currency: z.ZodPipe<z.ZodString, z.ZodTransform<string, string>>;
}, z.core.$strict>;
export declare const paginationQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strict>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodNumber;
    limit: z.ZodNumber;
    total: z.ZodNumber;
    pages: z.ZodNumber;
}, z.core.$strict>;
export declare const problemDetailsSchema: z.ZodObject<{
    status: z.ZodNumber;
    code: z.ZodString;
    message: z.ZodString;
    correlationId: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodUnknown>;
}, z.core.$strict>;
export type Money = z.infer<typeof moneySchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type ProblemDetails = z.infer<typeof problemDetailsSchema>;
