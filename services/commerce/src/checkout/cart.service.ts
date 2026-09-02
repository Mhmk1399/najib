import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { z } from "zod";
import { type Types } from "mongoose";
import { Cart } from "../models/cart.js";
import { ProductVariant } from "../models/product-variant.js";
import { Product } from "../models/product.js";
import { addCartItemSchema, createCartSchema } from "./checkout.schemas.js";
type CartRecord = { status: string; items: Array<{ variantId: Types.ObjectId; quantity: number; unitPriceMinor: number; addedAt?: Date }>; save(): Promise<unknown> };
type VariantRecord = { _id: Types.ObjectId; productId: Types.ObjectId; priceOverrideMinor?: number };
type ProductRecord = { basePriceMinor: number };
@Injectable()
export class CartService {
  parseCreate(value: unknown): z.infer<typeof createCartSchema> { return this.parse(createCartSchema, value); }
  parseItem(value: unknown): z.infer<typeof addCartItemSchema> { return this.parse(addCartItemSchema, value); }
  async create(input: z.infer<typeof createCartSchema>) {
    return Cart.create({ ...input, currency: input.currency.toUpperCase(), expiresAt: new Date(Date.now() + 30 * 86400_000) });
  }
  async find(id: string) { const cart = await Cart.findById(id).lean(); if (!cart) throw new NotFoundException("Cart was not found"); return cart; }
  async addItem(id: string, input: z.infer<typeof addCartItemSchema>) {
    const cart = await Cart.findById(id) as unknown as CartRecord | null; if (!cart) throw new NotFoundException("Cart was not found");
    if (cart.status !== "active") throw new ConflictException("Only an active cart can be changed");
    const variant = await ProductVariant.findOne({ _id: input.variantId, isActive: true }).lean() as unknown as VariantRecord | null;
    if (!variant) throw new NotFoundException("Active product variant was not found");
    const product = await Product.findOne({ _id: variant.productId, status: "active" }).lean() as unknown as ProductRecord | null;
    if (!product) throw new NotFoundException("Active product was not found");
    const existing = cart.items.find((item) => item.variantId.equals(input.variantId));
    if (existing) existing.quantity = input.quantity;
    else cart.items.push({ variantId: variant._id, quantity: input.quantity, unitPriceMinor: variant.priceOverrideMinor ?? product.basePriceMinor, addedAt: new Date() });
    await cart.save(); return cart;
  }
  private parse<T>(schema: z.ZodType<T>, value: unknown): T { const result = schema.safeParse(value); if (!result.success) throw new BadRequestException({ message: "Validation failed", issues: result.error.issues }); return result.data; }
}
