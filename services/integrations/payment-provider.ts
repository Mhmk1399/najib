import "server-only";

import { createHash } from "node:crypto";

import { ApiError } from "@/lib/server/errors";

export type PaymentProviderOutcome = "succeeded" | "failed";

type CreateIntentInput = {
  idempotencyKey: string;
  amountMinor: number;
  currency: string;
  checkoutSessionId: string;
};

type ConfirmIntentInput = CreateIntentInput & {
  providerIntentId: string;
  requestedOutcome?: PaymentProviderOutcome;
};

export type PaymentProvider = {
  name: string;
  createIntent(input: CreateIntentInput): Promise<{
    providerIntentId: string;
    status: "requires_action";
  }>;
  confirmIntent(input: ConfirmIntentInput): Promise<{
    providerAttemptId: string;
    outcome: PaymentProviderOutcome;
    errorCode?: string;
  }>;
};

function stableId(prefix: string, key: string) {
  return `${prefix}_${createHash("sha256").update(key).digest("hex").slice(0, 24)}`;
}

const mockProvider: PaymentProvider = {
  name: "mock",
  async createIntent(input) {
    return {
      providerIntentId: stableId("mock_pi", input.idempotencyKey),
      status: "requires_action",
    };
  },
  async confirmIntent(input) {
    const outcome = input.requestedOutcome ?? "succeeded";
    return {
      providerAttemptId: stableId("mock_pa", input.idempotencyKey),
      outcome,
      ...(outcome === "failed" ? { errorCode: "mock_payment_declined" } : {}),
    };
  },
};

export function getPaymentProvider(): PaymentProvider {
  const configured = process.env.PAYMENT_PROVIDER?.trim().toLowerCase();
  if (configured === "mock" || (!configured && process.env.NODE_ENV !== "production")) {
    return mockProvider;
  }
  throw new ApiError(503, "درگاه پرداخت هنوز پیکربندی نشده است.");
}
