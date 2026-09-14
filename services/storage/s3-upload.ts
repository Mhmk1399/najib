import "server-only";
import { randomUUID } from "node:crypto";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { z } from "zod";

const storageConfigSchema = z.object({
  endpoint: z.string().url(),
  region: z.string().trim().min(1),
  bucket: z.string().trim().min(1),
  accessKeyId: z.string().trim().min(1),
  secretAccessKey: z.string().trim().min(1),
  publicBaseUrl: z.string().url().optional(),
  forcePathStyle: z.boolean().default(true),
  uploadPrefix: z.string().trim().optional().default("uploads"),
  objectAcl: z
    .enum([
      "private",
      "public-read",
      "public-read-write",
      "authenticated-read",
      "bucket-owner-read",
      "bucket-owner-full-control",
    ])
    .optional(),
});

export type UploadToBucketInput = {
  buffer: Buffer;
  contentType: string;
  extension: string;
  folder?: string;
  filename?: string;
  cacheControl?: string;
  metadata?: Record<string, string>;
};

export type BucketUploadResult = {
  bucket: string;
  key: string;
  url: string;
  size: number;
  contentType: string;
};

let cachedClient: S3Client | null = null;
let cachedConfig: z.infer<typeof storageConfigSchema> | null = null;

function booleanFromEnv(value: string | undefined, fallback: boolean) {
  if (value === undefined || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function storageConfig() {
  const parsed = storageConfigSchema.safeParse({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || "default",
    bucket: process.env.S3_BUCKET,
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL || undefined,
    forcePathStyle: booleanFromEnv(process.env.S3_FORCE_PATH_STYLE, true),
    uploadPrefix: process.env.S3_UPLOAD_PREFIX || "uploads",
    objectAcl: process.env.S3_OBJECT_ACL || undefined,
  });

  if (!parsed.success) {
    throw new Error("S3 upload storage is not configured.");
  }

  return parsed.data;
}

function s3Client() {
  const config = storageConfig();
  if (cachedClient && cachedConfig && sameConfig(cachedConfig, config)) {
    return { client: cachedClient, config };
  }

  cachedConfig = config;
  cachedClient = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    forcePathStyle: config.forcePathStyle,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return { client: cachedClient, config };
}

function sameConfig(
  first: z.infer<typeof storageConfigSchema>,
  second: z.infer<typeof storageConfigSchema>,
) {
  return JSON.stringify(first) === JSON.stringify(second);
}

function normalizeSegment(value: string) {
  return value
    .trim()
    .replace(/\\/g, "/")
    .replace(/[^a-zA-Z0-9/_-]/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^\/|\/$/g, "");
}

function makeObjectKey(input: UploadToBucketInput, prefix: string) {
  const safePrefix = normalizeSegment(prefix);
  const safeFolder = normalizeSegment(input.folder ?? "files");
  const filename =
    input.filename ??
    `${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${input.extension}`;

  return [safePrefix, safeFolder, normalizeSegment(filename)]
    .filter(Boolean)
    .join("/");
}

function publicUrlFor(endpoint: string, bucket: string, key: string, base?: string) {
  if (base) return `${base.replace(/\/$/, "")}/${key}`;
  return `${endpoint.replace(/\/$/, "")}/${bucket}/${key}`;
}

export async function uploadToBucket(
  input: UploadToBucketInput,
): Promise<BucketUploadResult> {
  const { client, config } = s3Client();
  const key = makeObjectKey(input, config.uploadPrefix);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: input.buffer,
      ContentType: input.contentType,
      CacheControl: input.cacheControl ?? "public, max-age=31536000, immutable",
      Metadata: input.metadata,
      ...(config.objectAcl ? { ACL: config.objectAcl } : {}),
    }),
  );

  return {
    bucket: config.bucket,
    key,
    url: publicUrlFor(config.endpoint, config.bucket, key, config.publicBaseUrl),
    size: input.buffer.byteLength,
    contentType: input.contentType,
  };
}
