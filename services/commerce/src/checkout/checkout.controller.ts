import { Body, Controller, Get, Headers, Inject, Param, Post, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { mongoObjectIdSchema } from "@najib/contracts";
import { CartService } from "./cart.service.js";
import { CheckoutService } from "./checkout.service.js";

@Controller()
export class CheckoutController {
  constructor(
    @Inject(CartService) private readonly carts: CartService,
    @Inject(CheckoutService) private readonly checkout: CheckoutService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}
  @Post("carts") createCart(@Body() body: unknown) { return this.carts.create(this.carts.parseCreate(body)); }
  @Get("carts/:id") getCart(@Param("id") id: string) { return this.carts.find(mongoObjectIdSchema.parse(id)); }
  @Post("carts/:id/items") addItem(@Param("id") id: string, @Body() body: unknown) { return this.carts.addItem(mongoObjectIdSchema.parse(id), this.carts.parseItem(body)); }
  @Post("checkouts") start(@Body() body: unknown) { return this.checkout.start(this.checkout.parseStart(body)); }
  @Get("orders/:id") getOrder(@Param("id") id: string) { return this.checkout.findOrder(mongoObjectIdSchema.parse(id)); }
  @Post("internal/payments/callback") callback(@Body() body: unknown, @Headers("x-internal-service-token") token?: string) {
    if (token !== this.config.getOrThrow("INTERNAL_SERVICE_TOKEN")) throw new UnauthorizedException();
    return this.checkout.paymentCallback(this.checkout.parseCallback(body));
  }
}
