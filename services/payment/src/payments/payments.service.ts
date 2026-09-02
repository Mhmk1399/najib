import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createPaymentRequestSchema, paymentCallbackSchema, type CreatePaymentRequest } from "@najib/contracts";
import mongoose from "mongoose";
import { z } from "zod";
import { Payment, PaymentAttempt } from "../models/payment.js";
import { sandboxWebhookSchema } from "./payment.schemas.js";

type SandboxWebhook = z.infer<typeof sandboxWebhookSchema>;
type PaymentCallbackRecord = { _id: { toString(): string }; orderId: string; status: string; statusHistory: Array<{ correlationId: string }> };

@Injectable()
export class PaymentsService {
  constructor(@Inject(ConfigService) private readonly config: ConfigService) {}

  parseCreate(value: unknown): CreatePaymentRequest { return this.parse(createPaymentRequestSchema, value); }
  parseId(value: unknown): string { return this.parse(z.string().regex(/^[a-f\d]{24}$/i), value); }
  parseWebhook(value: unknown): SandboxWebhook { return this.parse(sandboxWebhookSchema, value); }

  async find(id: string) {
    const payment = await Payment.findById(id).lean();
    if (!payment) throw new NotFoundException("Payment was not found");
    return payment;
  }

  async create(input: CreatePaymentRequest) {
    if (input.provider !== "sandbox") throw new BadRequestException("Only the sandbox provider is enabled");
    const existing = await Payment.findOne({ idempotencyKey: input.idempotencyKey }).lean();
    if (existing) return existing;
    try {
      const payment = await Payment.create({
        orderId: input.orderId,
        idempotencyKey: input.idempotencyKey,
        provider: "sandbox",
        providerIntentId: `sandbox_${randomUUID()}`,
        currency: input.amount.currency,
        requestedAmountMinor: input.amount.amountMinor,
        status: "created",
        statusHistory: [{ to: "created", correlationId: input.correlationId }],
        metadata: { paymentMethod: "sandbox_token" },
      });
      await PaymentAttempt.create({ paymentId: payment._id, attemptNumber: 1, status: "started" });
      return payment;
    } catch (error) {
      if (this.isDuplicate(error)) {
        const duplicate = await Payment.findOne({ idempotencyKey: input.idempotencyKey }).lean();
        if (duplicate) return duplicate;
      }
      throw error;
    }
  }

  signWebhook(input: SandboxWebhook): string {
    return createHmac("sha256", this.config.getOrThrow<string>("SANDBOX_WEBHOOK_SECRET"))
      .update(`${input.eventId}.${input.paymentId}.${input.outcome}`)
      .digest("hex");
  }

  async processWebhook(input: SandboxWebhook, signature: string | undefined) {
    const expected = this.signWebhook(input);
    const actualBuffer = Buffer.from(signature ?? "", "utf8");
    const expectedBuffer = Buffer.from(expected, "utf8");
    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
      throw new UnauthorizedException("Invalid sandbox webhook signature");
    }
    const duplicate = await PaymentAttempt.findOne({ providerEventId: input.eventId }).lean();
    if (duplicate) {
      const payment = await Payment.findById(input.paymentId).lean() as unknown as PaymentCallbackRecord | null;
      if (!payment) throw new NotFoundException("Payment was not found");
      const callback = paymentCallbackSchema.parse({
        paymentId: payment._id.toString(), orderId: payment.orderId,
        status: payment.status === "captured" ? "captured" : "failed",
        correlationId: payment.statusHistory[0].correlationId,
        failureCode: input.failureCode,
      });
      return this.deliverCallback(callback, true);
    }

    const session = await mongoose.startSession();
    let callback: z.infer<typeof paymentCallbackSchema> | undefined;
    try {
      await session.withTransaction(async () => {
        const payment = await Payment.findById(input.paymentId).session(session);
        if (!payment) throw new NotFoundException("Payment was not found");
        const attemptNumber = await PaymentAttempt.countDocuments({ paymentId: payment._id }).session(session) + 1;
        const status = input.outcome === "succeeded" ? "captured" : "failed";
        const previous = payment.status;
        if (status === "captured") {
          payment.authorizedAmountMinor = payment.requestedAmountMinor;
          payment.capturedAmountMinor = payment.requestedAmountMinor;
        }
        payment.status = status;
        payment.statusHistory.push({ from: previous, to: status, reason: input.failureCode, correlationId: payment.statusHistory[0].correlationId });
        await payment.save({ session });
        await PaymentAttempt.create([{
          paymentId: payment._id,
          attemptNumber,
          providerEventId: input.eventId,
          status: input.outcome === "succeeded" ? "succeeded" : "failed",
          failureCode: input.failureCode,
        }], { session });
        callback = paymentCallbackSchema.parse({
          paymentId: payment._id.toString(), orderId: payment.orderId, status,
          correlationId: payment.statusHistory[0].correlationId, failureCode: input.failureCode,
        });
      });
    } finally { await session.endSession(); }

    if (!callback) throw new ConflictException("Payment webhook was not applied");
    return this.deliverCallback(callback, false);
  }

  private async deliverCallback(callback: z.infer<typeof paymentCallbackSchema>, duplicate: boolean) {
    const response = await fetch(`${this.config.getOrThrow<string>("COMMERCE_API_URL")}/internal/payments/callback`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-internal-service-token": this.config.getOrThrow<string>("INTERNAL_SERVICE_TOKEN") },
      body: JSON.stringify(callback),
    });
    const callbackBody = await response.text();
    return {
      duplicate,
      callbackDelivered: response.ok,
      callbackStatus: response.status,
      callbackError: response.ok ? undefined : callbackBody.slice(0, 1000),
      payment: callback,
    };
  }

  private parse<T>(schema: z.ZodType<T>, value: unknown): T {
    const result = schema.safeParse(value);
    if (!result.success) throw new BadRequestException({ message: "Validation failed", issues: result.error.issues });
    return result.data;
  }
  private isDuplicate(error: unknown) { return typeof error === "object" && error !== null && "code" in error && error.code === 11000; }
}
