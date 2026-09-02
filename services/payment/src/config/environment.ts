import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(4003),
  HOST: z.string().min(1).default("0.0.0.0"),
  MONGODB_URI: z.string().regex(/^mongodb(?:\+srv)?:\/\//),
  MONGODB_DB_NAME: z.string().min(1).default("najib_payment"),
  MONGODB_SERVER_SELECTION_TIMEOUT_MS: z.coerce.number().int().min(100).max(60_000).default(5_000),
  SANDBOX_WEBHOOK_SECRET: z.string().min(16).default("najib-local-sandbox-secret"),
  COMMERCE_API_URL: z.url().default("http://127.0.0.1:4001/api/v1"),
  INTERNAL_SERVICE_TOKEN: z.string().min(16).default("najib-local-service-token"),
});

export type Environment = z.infer<typeof schema>;
export function validateEnvironment(value: Record<string, unknown>): Environment {
  const result = schema.safeParse(value);
  if (!result.success) throw new Error(`Invalid Payment configuration: ${z.prettifyError(result.error)}`);
  return result.data;
}
