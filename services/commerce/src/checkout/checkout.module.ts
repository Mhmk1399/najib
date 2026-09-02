import { Module } from "@nestjs/common";
import { CartService } from "./cart.service.js";
import { CheckoutController } from "./checkout.controller.js";
import { CheckoutService } from "./checkout.service.js";
@Module({ controllers: [CheckoutController], providers: [CartService, CheckoutService] })
export class CheckoutModule {}
