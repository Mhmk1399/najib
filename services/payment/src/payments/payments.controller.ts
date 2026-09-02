import { Body, Controller, Get, Headers, Inject, Param, Post } from "@nestjs/common";
import { PaymentsService } from "./payments.service.js";
@Controller()
export class PaymentsController {
  constructor(@Inject(PaymentsService) private readonly payments: PaymentsService) {}
  @Post("payments") create(@Body() body: unknown) { return this.payments.create(this.payments.parseCreate(body)); }
  @Get("payments/:id") find(@Param("id") id: string) { return this.payments.find(this.payments.parseId(id)); }
  @Post("webhooks/sandbox") webhook(@Body() body: unknown, @Headers("x-sandbox-signature") signature?: string) {
    return this.payments.processWebhook(this.payments.parseWebhook(body), signature);
  }
}
