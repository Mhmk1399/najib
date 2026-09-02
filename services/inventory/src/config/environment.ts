import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4002),
  HOST: z.string().min(1).default("0.0.0.0"),
  MONGODB_URI: z
    .string()
    .regex(/^mongodb(?:\+srv)?:\/\//, "MONGODB_URI must be a MongoDB URI"),
  MONGODB_DB_NAME: z.string().min(1).default("najib_inventory"),
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
});

export type Environment = z.infer<typeof environmentSchema>;

export function validateEnvironment(
  configuration: Record<string, unknown>,
): Environment {
  const result = environmentSchema.safeParse(configuration);
  if (!result.success) {
    throw new Error(
      `Invalid Inventory configuration: ${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}
