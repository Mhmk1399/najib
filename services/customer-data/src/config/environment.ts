import { z } from "zod";
const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4004),
  HOST: z.string().min(1).default("0.0.0.0"),
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\//),
  MONGODB_DB_NAME: z.string().min(1).default("najib_customer_data"),
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: z.coerce.number().int().min(100).max(60_000).default(5_000),
  INTERNAL_SERVICE_TOKEN: z.string().min(16).default("najib-local-service-token"),
});
export type Environment = z.infer<typeof schema>;
export function validateEnvironment(value: Record<string, unknown>): Environment {
  const result = schema.safeParse(value);
  if (!result.success) throw new Error(`Invalid Customer Data configuration: ${z.prettifyError(result.error)}`);
  return result.data;
}
