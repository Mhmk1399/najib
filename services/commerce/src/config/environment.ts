import { z } from "zod";

const localAccessSecret = "najib-local-staff-access-secret-change-me";
const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4001),
  HOST: z.string().min(1).default("0.0.0.0"),
  MONGODB_URI: z
    .string()
    .regex(/^mongodb(?:\+srv)?:\/\//, "MONGODB_URI must be a MongoDB URI"),
  MONGODB_DB_NAME: z.string().min(1).default("najib_commerce"),
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: z.coerce
    .number()
    .int()
    .min(100)
    .max(60_000)
    .default(5_000),
  REDIS_URL: z
    .string()
    .regex(/^rediss?:\/\//, "REDIS_URL must be a Redis URI")
    .optional(),
  RABBITMQ_URL: z
    .string()
    .regex(/^amqps?:\/\//, "RABBITMQ_URL must be an AMQP URI")
    .optional(),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  INVENTORY_API_URL: z.url().default("http://127.0.0.1:4002/api/v1"),
  PAYMENT_API_URL: z.url().default("http://127.0.0.1:4003/api/v1"),
  CUSTOMER_DATA_API_URL: z.url().default("http://127.0.0.1:4004/api/v1"),
  INTERNAL_SERVICE_TOKEN: z.string().min(16).default("najib-local-service-token"),
  AUTH_ACCESS_TOKEN_SECRET: z.string().min(32).default(localAccessSecret),
}).superRefine((value, context) => {
  if (value.NODE_ENV === "production" && value.AUTH_ACCESS_TOKEN_SECRET === localAccessSecret) {
    context.addIssue({ code: "custom", path: ["AUTH_ACCESS_TOKEN_SECRET"], message: "A unique production access-token secret is required" });
  }
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(
  configuration: Record<string, unknown>,
): Environment {
  const result = environmentSchema.safeParse(configuration);
  if (!result.success) {
    throw new Error(
      `Invalid Commerce configuration: ${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}
