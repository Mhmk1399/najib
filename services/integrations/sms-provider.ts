import "server-only";

import { createHash } from "node:crypto";

import { ApiError } from "@/lib/server/errors";

type SmsInput = {
  idempotencyKey: string;
  to: string;
  template: string;
  variables: Record<string, string>;
};

export type SmsProvider = {
  name: string;
  send(input: SmsInput): Promise<{
    status: "accepted";
    providerMessageId: string;
  }>;
};

const mockProvider: SmsProvider = {
  name: "mock",
  async send(input) {
    return {
      status: "accepted",
      providerMessageId: `mock_sms_${createHash("sha256")
        .update(input.idempotencyKey)
        .digest("hex")
        .slice(0, 24)}`,
    };
  },
};

export function getSmsProvider(): SmsProvider {
  const configured = process.env.SMS_PROVIDER?.trim().toLowerCase();
  if (configured === "mock" || (!configured && process.env.NODE_ENV !== "production")) {
    return mockProvider;
  }
  throw new ApiError(503, "سرویس پیامک هنوز پیکربندی نشده است.");
}
