import { getAdminSession } from "@/lib/admin/auth";
import { connectToDatabase } from "@/lib/server/db";
import { unauthorized } from "@/lib/server/errors";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { User } from "@/models/auth/user";
import { Category } from "@/models/catalog/category";
import { Cart } from "@/models/catalog/cart";
import { AbandonedCheckout, CheckoutSession } from "@/models/catalog/checkout";
import { Collection } from "@/models/catalog/collection";
import { ImageAsset } from "@/models/catalog/image-asset";
import { ProductVariant } from "@/models/catalog/product-variant";
import { Product } from "@/models/catalog/product";
import { Subcategory } from "@/models/catalog/subcategory";
import { Order } from "@/models/catalog/order";

const staffRoles = [
  "owner", "administrator", "catalog_manager", "inventory_manager",
  "order_manager", "customer_support", "finance", "store_staff",
  "accountant", "merchandiser",
];

export async function GET() {
  const startedAt = performance.now();
  try {
    const session = await getAdminSession();
    if (!session || !session.staff.permissions.includes("admin.access")) {
      unauthorized("نشست مدیریت منقضی شده است.");
    }
    await connectToDatabase();
    const [
      productsTotal, productsActive, productsDraft, productsArchived,
      productsWithoutImage, categoriesTotal, categoriesActive,
      subcategoriesTotal, subcategoriesActive, collectionsTotal,
      collectionsActive, imagesTotal, imagesActive, variantsTotal,
      variantsActive, usersTotal, staffTotal, recentlyEditedProducts,
      ordersTotal, ordersPending, ordersConfirmed, ordersAttention,
      activeCarts, activeCheckouts, abandonedEligible, orderRevenue,
      recentOrders,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ status: "active" }),
      Product.countDocuments({ status: "draft" }),
      Product.countDocuments({ status: "archived" }),
      Product.countDocuments({
        status: { $ne: "archived" },
        $or: [{ primaryImageId: { $exists: false } }, { primaryImageId: null }],
      }),
      Category.countDocuments(),
      Category.countDocuments({ isActive: true }),
      Subcategory.countDocuments(),
      Subcategory.countDocuments({ isActive: true }),
      Collection.countDocuments(),
      Collection.countDocuments({ isActive: true }),
      ImageAsset.countDocuments(),
      ImageAsset.countDocuments({ isActive: true }),
      ProductVariant.countDocuments(),
      ProductVariant.countDocuments({ isActive: true }),
      User.countDocuments({ status: { $ne: "deleted" } }),
      User.countDocuments({ roles: { $in: staffRoles }, status: { $ne: "deleted" } }),
      Product.find()
        .sort({ updatedAt: -1 })
        .limit(6)
        .select({ name: 1, slug: 1, status: 1, updatedAt: 1 })
        .lean(),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ["pending_inventory", "pending_payment"] } }),
      Order.countDocuments({ status: { $in: ["confirmed", "fulfilled"] } }),
      Order.countDocuments({ status: { $in: ["payment_failed", "compensation_required"] } }),
      Cart.countDocuments({ status: { $in: ["active", "checkout_started"] }, expiresAt: { $gt: new Date() } }),
      CheckoutSession.countDocuments({ status: { $in: ["started", "reserved", "payment_pending"] }, expiresAt: { $gt: new Date() } }),
      AbandonedCheckout.countDocuments({ recoveryStatus: "eligible" }),
      Order.aggregate<{ totalMinor: number }>([
        { $match: { status: { $in: ["confirmed", "fulfilled"] } } },
        { $group: { _id: null, totalMinor: { $sum: "$totalMinor" } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select({ orderNumber: 1, status: 1, totalMinor: 1, currency: 1, contact: 1, createdAt: 1 })
        .lean(),
    ]);

    return jsonResponse({
      counts: {
        products: { total: productsTotal, active: productsActive, draft: productsDraft, archived: productsArchived },
        categories: { total: categoriesTotal, active: categoriesActive },
        subcategories: { total: subcategoriesTotal, active: subcategoriesActive },
        collections: { total: collectionsTotal, active: collectionsActive },
        images: { total: imagesTotal, active: imagesActive },
        variants: { total: variantsTotal, active: variantsActive },
        users: { total: usersTotal, staff: staffTotal },
        orders: {
          total: ordersTotal,
          pending: ordersPending,
          confirmed: ordersConfirmed,
          attention: ordersAttention,
          revenueMinor: orderRevenue[0]?.totalMinor ?? 0,
        },
        carts: { active: activeCarts },
        checkouts: { active: activeCheckouts, abandonedEligible },
      },
      attention: {
        draftProducts: productsDraft,
        productsWithoutImage,
        inactiveTaxonomy: categoriesTotal - categoriesActive + subcategoriesTotal - subcategoriesActive,
        inactiveReferences: collectionsTotal - collectionsActive + variantsTotal - variantsActive,
      },
      recentlyEditedProducts,
      recentOrders,
      generatedAt: new Date().toISOString(),
    }, { cache: "no-store", startedAt });
  } catch (error) {
    return jsonError(error);
  }
}
