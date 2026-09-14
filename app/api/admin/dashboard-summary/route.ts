import { getAdminSession } from "@/lib/admin/auth";
import { connectToDatabase } from "@/lib/server/db";
import { forbidden, unauthorized } from "@/lib/server/errors";
import { jsonError, jsonResponse } from "@/lib/server/response";
import { User } from "@/models/auth/user";
import { Category } from "@/models/catalog/category";
import { Collection } from "@/models/catalog/collection";
import { ImageAsset } from "@/models/catalog/image-asset";
import { ProductVariant } from "@/models/catalog/product-variant";
import { Product } from "@/models/catalog/product";
import { Subcategory } from "@/models/catalog/subcategory";

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
    if (!session.staff.permissions.includes("catalog.read")) {
      forbidden("دسترسی مشاهده کاتالوگ برای این حساب فعال نیست.");
    }

    await connectToDatabase();
    const [
      productsTotal, productsActive, productsDraft, productsArchived,
      productsWithoutImage, categoriesTotal, categoriesActive,
      subcategoriesTotal, subcategoriesActive, collectionsTotal,
      collectionsActive, imagesTotal, imagesActive, variantsTotal,
      variantsActive, usersTotal, staffTotal, recentlyEditedProducts,
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
      },
      attention: {
        draftProducts: productsDraft,
        productsWithoutImage,
        inactiveTaxonomy: categoriesTotal - categoriesActive + subcategoriesTotal - subcategoriesActive,
        inactiveReferences: collectionsTotal - collectionsActive + variantsTotal - variantsActive,
      },
      recentlyEditedProducts,
      generatedAt: new Date().toISOString(),
    }, { cache: "no-store", startedAt });
  } catch (error) {
    return jsonError(error);
  }
}
