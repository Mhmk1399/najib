import "server-only";

import mongoose from "mongoose";
import { z } from "zod";

import { connectToDatabase } from "@/lib/server/db";
import { notFound } from "@/lib/server/errors";
import { User } from "@/models/auth/user";
import { Cart } from "@/models/catalog/cart";
import { Color } from "@/models/catalog/color";
import { Order, ORDER_STATUSES } from "@/models/catalog/order";
import { ProductVariant } from "@/models/catalog/product-variant";
import { Product } from "@/models/catalog/product";
import { Size } from "@/models/catalog/size";

export const accountOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(ORDER_STATUSES).optional(),
}).strict();

export const accountProfileUpdateSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().min(1).max(100).optional(),
  phone: z.string().trim().max(30).regex(/^[+\d\s()-]*$/, "شماره تماس معتبر نیست.").optional(),
  preferredLocale: z.enum(["fa", "en", "ar"]).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: "حداقل یک فیلد برای ویرایش لازم است.",
});

type LocalizedText = { fa?: string; en?: string; ar?: string } | null | undefined;

function localized(value: LocalizedText, fallback: string) {
  return value?.fa || value?.en || value?.ar || fallback;
}

function safeProfile(user: Record<string, any>) {
  return {
    id: String(user._id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? "",
    preferredLocale: user.preferredLocale ?? "fa",
    addresses: (user.addresses ?? []).map((address: Record<string, any>) => ({
      id: String(address._id),
      label: address.label ?? "نشانی",
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone ?? "",
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      region: address.region ?? "",
      postalCode: address.postalCode,
      countryCode: address.countryCode,
      isDefault: Boolean(address.isDefault),
    })),
  };
}

function safeOrder(order: Record<string, any>, includeItems = false) {
  return {
    id: String(order._id),
    orderNumber: order.orderNumber,
    status: order.status,
    currency: order.currency,
    subtotalMinor: order.subtotalMinor,
    taxMinor: order.taxMinor,
    discountMinor: order.discountMinor,
    shippingMinor: order.shippingMinor,
    totalMinor: order.totalMinor,
    itemCount: (order.items ?? []).reduce(
      (total: number, item: Record<string, any>) => total + Number(item.quantity || 0),
      0,
    ),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    confirmedAt: order.confirmedAt ?? null,
    cancelledAt: order.cancelledAt ?? null,
    ...(includeItems
      ? {
          contact: {
            firstName: order.contact?.firstName,
            lastName: order.contact?.lastName,
            email: order.contact?.email,
            phone: order.contact?.phone ?? "",
          },
          items: (order.items ?? []).map((item: Record<string, any>) => ({
            id: String(item._id),
            productId: item.productId,
            variantId: item.variantId,
            productName: localized(item.productName as LocalizedText, "کالای حذف‌شده"),
            sku: item.sku,
            colorName: localized(item.colorName as LocalizedText, "—"),
            sizeName: localized(item.sizeName as LocalizedText, "—"),
            unitPriceMinor: item.unitPriceMinor,
            taxMinor: item.taxMinor,
            discountMinor: item.discountMinor,
            quantity: item.quantity,
            lineTotalMinor: item.lineTotalMinor,
          })),
        }
      : {}),
  };
}

async function loadProfile(accountId: string) {
  const user = await User.findById(accountId)
    .select("email firstName lastName phone preferredLocale addresses")
    .lean();
  if (!user) notFound("حساب کاربری پیدا نشد.");
  return safeProfile(user as unknown as Record<string, any>);
}

export const accountService = {
  async getSummary(accountId: string) {
    await connectToDatabase();
    const activeStatuses = [
      "pending_inventory",
      "pending_payment",
      "payment_failed",
      "confirmed",
      "compensation_required",
    ];
    const [profile, total, active, fulfilled, cancelled, spending, recentOrders, cart] =
      await Promise.all([
        loadProfile(accountId),
        Order.countDocuments({ userId: accountId }),
        Order.countDocuments({ userId: accountId, status: { $in: activeStatuses } }),
        Order.countDocuments({ userId: accountId, status: "fulfilled" }),
        Order.countDocuments({ userId: accountId, status: { $in: ["cancelled", "expired", "refunded"] } }),
        Order.aggregate([
          { $match: { userId: accountId, status: { $in: ["confirmed", "fulfilled"] } } },
          { $group: { _id: "$currency", totalMinor: { $sum: "$totalMinor" } } },
          { $sort: { _id: 1 } },
        ]),
        Order.find({ userId: accountId }).sort({ createdAt: -1, _id: -1 }).limit(4).lean(),
        Cart.findOne({ userId: accountId, status: { $in: ["active", "checkout_started"] } })
          .sort({ updatedAt: -1 })
          .lean(),
      ]);

    const activeCart = cart as unknown as Record<string, any> | null;

    return {
      profile: { ...profile, addresses: undefined, addressCount: profile.addresses.length },
      orders: { total, active, fulfilled, cancelled },
      spending: spending.map((entry) => ({ currency: entry._id, totalMinor: entry.totalMinor })),
      cart: activeCart
        ? {
            id: String(activeCart._id),
            status: activeCart.status,
            itemCount: activeCart.items.reduce((sum: number, item: Record<string, any>) => sum + item.quantity, 0),
            subtotalMinor: activeCart.items.reduce(
              (sum: number, item: Record<string, any>) => sum + item.quantity * item.unitPriceMinor,
              0,
            ),
            currency: activeCart.currency,
          }
        : null,
      recentOrders: recentOrders.map((order) => safeOrder(order as unknown as Record<string, any>)),
    };
  },

  async listOrders(accountId: string, query: z.infer<typeof accountOrdersQuerySchema>) {
    await connectToDatabase();
    const filter = { userId: accountId, ...(query.status ? { status: query.status } : {}) };
    const [items, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit)
        .lean(),
      Order.countDocuments(filter),
    ]);
    return {
      items: items.map((order) => safeOrder(order as unknown as Record<string, any>)),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.max(1, Math.ceil(total / query.limit)),
      },
    };
  },

  async getOrder(accountId: string, orderId: string) {
    await connectToDatabase();
    if (!mongoose.Types.ObjectId.isValid(orderId)) notFound("سفارش پیدا نشد.");
    const order = await Order.findOne({ _id: orderId, userId: accountId }).lean();
    if (!order) notFound("سفارش پیدا نشد.");
    return safeOrder(order as unknown as Record<string, any>, true);
  },

  async getCart(accountId: string) {
    await connectToDatabase();
    const cart = await Cart.findOne({
      userId: accountId,
      status: { $in: ["active", "checkout_started"] },
    }).sort({ updatedAt: -1 }).lean();
    if (!cart) return null;
    const activeCart = cart as unknown as Record<string, any>;

    const variantIds = activeCart.items.map((item: Record<string, any>) => item.variantId);
    const variants = await ProductVariant.find({ _id: { $in: variantIds } }).lean();
    const variantMap = new Map(variants.map((variant) => [String(variant._id), variant]));
    const [products, colors, sizes] = await Promise.all([
      Product.find({ _id: { $in: variants.map((variant) => variant.productId) } })
        .select("name slug")
        .lean(),
      Color.find({ _id: { $in: variants.map((variant) => variant.colorId) } })
        .select("name hex")
        .lean(),
      Size.find({ _id: { $in: variants.map((variant) => variant.sizeId) } })
        .select("name code")
        .lean(),
    ]);
    const productMap = new Map(products.map((item) => [String(item._id), item]));
    const colorMap = new Map(colors.map((item) => [String(item._id), item]));
    const sizeMap = new Map(sizes.map((item) => [String(item._id), item]));

    return {
      id: String(activeCart._id),
      status: activeCart.status,
      currency: activeCart.currency,
      expiresAt: activeCart.expiresAt,
      itemCount: activeCart.items.reduce((sum: number, item: Record<string, any>) => sum + item.quantity, 0),
      subtotalMinor: activeCart.items.reduce(
        (sum: number, item: Record<string, any>) => sum + item.quantity * item.unitPriceMinor,
        0,
      ),
      items: activeCart.items.map((item: Record<string, any>) => {
        const variant = variantMap.get(String(item.variantId));
        const product = variant ? productMap.get(String(variant.productId)) : undefined;
        const color = variant ? colorMap.get(String(variant.colorId)) : undefined;
        const size = variant ? sizeMap.get(String(variant.sizeId)) : undefined;
        return {
          id: String(item._id),
          variantId: String(item.variantId),
          quantity: item.quantity,
          unitPriceMinor: item.unitPriceMinor,
          lineTotalMinor: item.quantity * item.unitPriceMinor,
          productName: localized(product?.name as LocalizedText, "کالای حذف‌شده"),
          productSlug: product?.slug ?? null,
          sku: variant?.sku ?? "—",
          colorName: localized(color?.name as LocalizedText, "—"),
          colorHex: color?.hex ?? null,
          sizeName: localized(size?.name as LocalizedText, size?.code ?? "—"),
        };
      }),
    };
  },

  async getProfile(accountId: string) {
    await connectToDatabase();
    return loadProfile(accountId);
  },

  async updateProfile(accountId: string, input: unknown) {
    const updates = accountProfileUpdateSchema.parse(input);
    await connectToDatabase();
    const user = await User.findOneAndUpdate(
      { _id: accountId, roles: "customer", status: "active" },
      { $set: updates },
      { new: true, runValidators: true },
    )
      .select("email firstName lastName phone preferredLocale addresses")
      .lean();
    if (!user) notFound("حساب کاربری پیدا نشد.");
    return safeProfile(user as unknown as Record<string, any>);
  },
};
