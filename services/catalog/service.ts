import mongoose, { type Model } from "mongoose";
import { type z } from "zod";
import { connectToDatabase } from "@/lib/server/db";
import { CATALOG_CURRENCY } from "@/lib/catalog/currency";
import { badRequest, conflict, notFound } from "@/lib/server/errors";
import { Category } from "@/models/catalog/category";
import { Collection } from "@/models/catalog/collection";
import { Color } from "@/models/catalog/color";
import { ImageAsset } from "@/models/catalog/image-asset";
import { ProductVariant } from "@/models/catalog/product-variant";
import { Product } from "@/models/catalog/product";
import { SizeGroup } from "@/models/catalog/size-group";
import { Size } from "@/models/catalog/size";
import { Subcategory } from "@/models/catalog/subcategory";
import {
  catalogResources,
  createSchemas,
  listCatalogQuerySchema,
  objectIdSchema,
  updateSchemas,
  type CatalogResource,
} from "@/services/catalog/schemas";

type CatalogModel = Model<Record<string, unknown>>;
type ListQuery = ReturnType<typeof listCatalogQuerySchema.parse>;

const models: Record<CatalogResource, CatalogModel> = {
  categories: Category as CatalogModel,
  subcategories: Subcategory as CatalogModel,
  collections: Collection as CatalogModel,
  colors: Color as CatalogModel,
  "size-groups": SizeGroup as CatalogModel,
  sizes: Size as CatalogModel,
  products: Product as CatalogModel,
  variants: ProductVariant as CatalogModel,
  images: ImageAsset as CatalogModel,
};

export class CatalogService {
  parseResource(value: string): CatalogResource {
    if (!catalogResources.includes(value as CatalogResource)) {
      notFound(`Unknown catalog resource: ${value}`);
    }
    return value as CatalogResource;
  }

  parseId(value: string): string {
    return this.parse(objectIdSchema, value) as string;
  }

  parseListQuery(value: unknown): ListQuery {
    return this.parse(listCatalogQuerySchema, value) as ListQuery;
  }

  parseCreate(resource: CatalogResource, value: unknown): unknown {
    return this.parse(createSchemas[resource], value);
  }

  parseUpdate(resource: CatalogResource, value: unknown): unknown {
    const result = this.parse(updateSchemas[resource], value);
    if (Object.keys(result as object).length === 0) {
      badRequest("At least one field must be provided");
    }
    return result;
  }

  async list(resource: CatalogResource, query: ListQuery) {
    await connectToDatabase();
    const filter: Record<string, unknown> = {};
    const permittedFilters = [
      "categoryId",
      "subcategoryId",
      "productId",
      "sizeGroupId",
      "kind",
      "status",
    ] as const;

    for (const key of permittedFilters) {
      if (query[key] === undefined) continue;
      if (resource === "images" && key === "productId") {
        filter["linkedProducts.productId"] = query[key];
      } else {
        filter[key] = query[key];
      }
    }
    if (query.isActive !== undefined) filter.isActive = query.isActive === "true";
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = resource === "images"
        ? [
            { "alt.fa": { $regex: escaped, $options: "i" } },
            { "alt.en": { $regex: escaped, $options: "i" } },
            { "alt.ar": { $regex: escaped, $options: "i" } },
            { url: { $regex: escaped, $options: "i" } },
          ]
        : [
            { "name.fa": { $regex: escaped, $options: "i" } },
            { "name.en": { $regex: escaped, $options: "i" } },
            { "name.ar": { $regex: escaped, $options: "i" } },
            { slug: { $regex: escaped, $options: "i" } },
            { sku: { $regex: escaped, $options: "i" } },
          ];
    }

    const model = models[resource];
    const skip = (query.page - 1) * query.limit;
    const [items, total] = await Promise.all([
      model.find(filter).sort({ sortOrder: 1, createdAt: -1 }).skip(skip).limit(query.limit).lean(),
      model.countDocuments(filter),
    ]);

    const outputItems = resource === "collections"
      ? await this.withCollectionProductIds(items)
      : items;

    return {
      items: outputItems,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    };
  }

  private async withCollectionProductIds(items: Array<Record<string, unknown>>) {
    if (items.length === 0) return items;

    const collectionIds = items.map((item) => String(item._id));
    const legacyProducts = await Product.find({
      collectionIds: { $in: collectionIds },
    })
      .select({ collectionIds: 1 })
      .lean();
    const productsByCollection = new Map<string, string[]>();

    for (const product of legacyProducts) {
      for (const collectionId of this.idList(product.collectionIds)) {
        const current = productsByCollection.get(collectionId) ?? [];
        current.push(String(product._id));
        productsByCollection.set(collectionId, current);
      }
    }

    return items.map((item) => ({
      ...item,
      productIds: this.idList([
        ...this.idList(item.productIds),
        ...(productsByCollection.get(String(item._id)) ?? []),
      ]),
    }));
  }

  async findById(resource: CatalogResource, id: string) {
    await connectToDatabase();
    const item = await models[resource].findById(id).lean();
    if (!item) notFound(`${resource} record was not found`);
    return item;
  }

  async create(resource: CatalogResource, input: unknown) {
    await connectToDatabase();
    try {
      if (resource === "products") {
        await this.assertProductReferences(input as Record<string, unknown>);
      }
      if (resource === "collections") {
        await this.assertCollectionReferences(input as Record<string, unknown>);
      }
      if (resource === "categories" || resource === "subcategories") {
        await this.assertTaxonomyReferences(resource, input as Record<string, unknown>);
      }
      if (resource === "images") {
        await this.assertImageReferences(input as Record<string, unknown>);
      }
      const createInput = resource === "products"
        ? { ...(input as Record<string, unknown>), currency: CATALOG_CURRENCY }
        : input;
      const item = await models[resource].create(createInput);
      if (resource === "products") {
        await this.syncProductCollections(
          String(item._id),
          this.idList(item.collectionIds),
        );
      }
      if (resource === "collections") {
        await this.syncCollectionProducts(
          String(item._id),
          this.idList(item.productIds),
        );
      }
      return item;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async update(resource: CatalogResource, id: string, input: unknown) {
    await connectToDatabase();
    try {
      let mergedCollection: Record<string, unknown> | null = null;
      if (resource === "products") {
        const existing = await Product.findById(id).lean();
        if (!existing) notFound("products record was not found");
        await this.assertProductReferences({
          ...existing,
          ...(input as Record<string, unknown>),
        });
      }
      if (resource === "collections") {
        const existing = await Collection.findById(id).lean();
        if (!existing) notFound("collections record was not found");
        mergedCollection = { ...existing, ...(input as Record<string, unknown>) };
        await this.assertCollectionReferences(mergedCollection);
      }
      if (resource === "categories" || resource === "subcategories" || resource === "images") {
        const existing = await models[resource].findById(id).lean();
        if (!existing) notFound(`${resource} record was not found`);
        const merged = { ...existing, ...(input as Record<string, unknown>) };
        if (resource === "images") {
          await this.assertImageReferences(merged);
        } else {
          await this.assertTaxonomyReferences(resource, merged);
        }
      }
      const item = await models[resource]
        .findByIdAndUpdate(id, input as Record<string, unknown>, {
          new: true,
          runValidators: true,
        })
        .lean();
      if (!item) notFound(`${resource} record was not found`);
      if (resource === "products") {
        const value = input as { priceIrrMinor?: number; priceUsdMinor?: number };
        await Product.collection.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: { ...(value.priceIrrMinor === undefined ? {} : { priceIrrMinor: value.priceIrrMinor }), ...(value.priceUsdMinor === undefined ? {} : { priceUsdMinor: value.priceUsdMinor }) } });
        await this.syncProductCollections(String(item._id), this.idList(item.collectionIds));
      }
      if (resource === "collections") {
        await this.syncCollectionProducts(
          String(item._id),
          this.idList(item.productIds ?? mergedCollection?.productIds),
        );
      }
      if (resource === "variants") {
        const value = input as { priceOverrideIrrMinor?: number; priceOverrideUsdMinor?: number };
        await ProductVariant.collection.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { $set: { ...(value.priceOverrideIrrMinor === undefined ? {} : { priceOverrideIrrMinor: value.priceOverrideIrrMinor }), ...(value.priceOverrideUsdMinor === undefined ? {} : { priceOverrideUsdMinor: value.priceOverrideUsdMinor }) } });
      }
      return item;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async remove(resource: CatalogResource, id: string) {
    await connectToDatabase();
    if (resource !== "collections") {
      badRequest("Only collection records can be deleted from this endpoint");
    }

    try {
      const existing = await Collection.findById(id).lean();
      if (!existing) notFound("collections record was not found");

      await Product.updateMany(
        { collectionIds: id },
        { $pull: { collectionIds: id } },
      );
      const deleted = await Collection.findByIdAndDelete(id).lean();
      if (!deleted) notFound("collections record was not found");

      return { id, deleted: true };
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private parse(schema: z.ZodType, value: unknown): unknown {
    const result = schema.safeParse(value);
    if (!result.success) {
      badRequest("Validation failed", result.error.issues);
    }
    return result.data;
  }

  private async assertProductReferences(input: Record<string, unknown>): Promise<void> {
    const categoryId = String(input.categoryId);
    const subcategoryId = String(input.subcategoryId);
    const [categoryExists, subcategoryValue] = await Promise.all([
      Category.exists({ _id: categoryId }),
      Subcategory.findById(subcategoryId).select({ categoryId: 1 }).lean(),
    ]);
    const subcategory = subcategoryValue as { categoryId: unknown } | null;

    if (!categoryExists) badRequest("Product category does not exist");
    if (!subcategory) badRequest("Product subcategory does not exist");
    if (String(subcategory.categoryId) !== categoryId) {
      badRequest("Product subcategory does not belong to the selected category");
    }

    const collectionIds = Array.isArray(input.collectionIds)
      ? input.collectionIds.map(String)
      : [];
    if (collectionIds.length > 0) {
      const collectionCount = await Collection.countDocuments({ _id: { $in: collectionIds } });
      if (collectionCount !== new Set(collectionIds).size) {
        badRequest("One or more product collections do not exist");
      }
    }

    const colorIds = Array.isArray(input.colorIds)
      ? input.colorIds.map(String)
      : [];
    if (input.status !== "archived" && colorIds.length === 0) {
      badRequest("At least one product color is required");
    }
    if (colorIds.length > 0) {
      const colorCount = await Color.countDocuments({ _id: { $in: colorIds } });
      if (colorCount !== new Set(colorIds).size) {
        badRequest("One or more product colors do not exist");
      }
    }

    const sizeIds = Array.isArray(input.sizeIds)
      ? input.sizeIds.map(String)
      : [];
    if (input.status !== "archived" && sizeIds.length === 0) {
      badRequest("At least one product size is required");
    }
    if (sizeIds.length > 0) {
      const sizeCount = await Size.countDocuments({ _id: { $in: sizeIds } });
      if (sizeCount !== new Set(sizeIds).size) {
        badRequest("One or more product sizes do not exist");
      }
    }

    const imageIds = new Set<string>();
    if (input.primaryImageId) imageIds.add(String(input.primaryImageId));
    if (Array.isArray(input.imageIds)) {
      for (const imageId of input.imageIds) imageIds.add(String(imageId));
    }
    if (imageIds.size > 0) {
      const imageCount = await ImageAsset.countDocuments({ _id: { $in: [...imageIds] } });
      if (imageCount !== imageIds.size) {
        badRequest("One or more product images do not exist");
      }
    }
  }

  private async assertCollectionReferences(
    input: Record<string, unknown>,
  ): Promise<void> {
    const rawProductIds = Array.isArray(input.productIds)
      ? input.productIds.filter(Boolean).map(String)
      : [];
    const productIds = [...new Set(rawProductIds)];
    if (rawProductIds.length !== productIds.length) {
      badRequest("Collection products must be unique");
    }

    if (productIds.length > 0) {
      const productCount = await Product.countDocuments({
        _id: { $in: productIds },
      });
      if (productCount !== productIds.length) {
        badRequest("One or more collection products do not exist");
      }
    }

    if (input.heroImageId) {
      const imageExists = await ImageAsset.exists({ _id: input.heroImageId });
      if (!imageExists) badRequest("Collection hero image does not exist");
    }

    const startsAt = input.startsAt ? new Date(String(input.startsAt)) : null;
    const endsAt = input.endsAt ? new Date(String(input.endsAt)) : null;
    if (startsAt && endsAt && startsAt > endsAt) {
      badRequest("Collection start date must be before its end date");
    }
  }

  private async syncCollectionProducts(
    collectionId: string,
    productIds: string[],
  ): Promise<void> {
    await Product.updateMany(
      { collectionIds: collectionId },
      { $pull: { collectionIds: collectionId } },
    );
    if (productIds.length === 0) return;

    await Product.updateMany(
      { _id: { $in: productIds } },
      { $addToSet: { collectionIds: collectionId } },
    );
  }

  private async syncProductCollections(
    productId: string,
    collectionIds: string[],
  ): Promise<void> {
    await Collection.updateMany(
      { productIds: productId },
      { $pull: { productIds: productId } },
    );
    if (collectionIds.length === 0) return;

    await Collection.updateMany(
      { _id: { $in: collectionIds } },
      { $addToSet: { productIds: productId } },
    );
  }

  private idList(value: unknown): string[] {
    return Array.isArray(value)
      ? [...new Set(value.filter(Boolean).map(String))]
      : [];
  }

  private async assertTaxonomyReferences(
    resource: "categories" | "subcategories",
    input: Record<string, unknown>,
  ): Promise<void> {
    if (resource === "subcategories") {
      const categoryExists = await Category.exists({ _id: input.categoryId });
      if (!categoryExists) badRequest("Subcategory parent category does not exist");
    }

    const pageContent = input.pageContent as {
      primaryBanner?: { imageId?: unknown };
      secondaryBanner?: { imageId?: unknown };
    } | undefined;
    const requiredImageIds = [
      pageContent?.primaryBanner?.imageId,
      pageContent?.secondaryBanner?.imageId,
    ].filter(Boolean).map(String);

    if (requiredImageIds.length !== 2) {
      badRequest("Two banner images are required for category page content");
    }

    const allowedKinds = resource === "categories"
      ? ["category_banner", "editorial", "lookbook"]
      : ["subcategory_banner", "editorial", "lookbook"];
    const bannerCount = await ImageAsset.countDocuments({
      _id: { $in: requiredImageIds },
      kind: { $in: allowedKinds },
    });
    if (bannerCount !== new Set(requiredImageIds).size) {
      badRequest(
        `Page banners must reference existing ${resource === "categories" ? "category" : "subcategory"}, editorial, or lookbook images`,
      );
    }

    if (input.thumbnailImageId) {
      const thumbnailExists = await ImageAsset.exists({ _id: input.thumbnailImageId });
      if (!thumbnailExists) badRequest("Taxonomy thumbnail image does not exist");
    }
  }

  private async assertImageReferences(input: Record<string, unknown>): Promise<void> {
    const links = Array.isArray(input.linkedProducts)
      ? input.linkedProducts as Array<Record<string, unknown>>
      : [];
    if (links.length === 0) return;

    const productIds = [...new Set(links.map((link) => String(link.productId)))];
    const productCount = await Product.countDocuments({ _id: { $in: productIds } });
    if (productCount !== productIds.length) {
      badRequest("One or more linked products do not exist");
    }

    const variantIds = [...new Set(
      links.filter((link) => link.variantId).map((link) => String(link.variantId)),
    )];
    if (variantIds.length === 0) return;

    const variants = await ProductVariant.find({ _id: { $in: variantIds } })
      .select({ _id: 1, productId: 1 })
      .lean();
    const variantProducts = new Map(
      variants.map((variant) => [String(variant._id), String(variant.productId)]),
    );
    for (const link of links) {
      if (!link.variantId) continue;
      const productId = variantProducts.get(String(link.variantId));
      if (!productId) badRequest("One or more linked variants do not exist");
      if (productId !== String(link.productId)) {
        badRequest("A linked variant does not belong to its selected product");
      }
    }
  }

  private handleDatabaseError(error: unknown): never {
    if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
      badRequest(error.message);
    }
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      conflict("A catalog record with the same unique value already exists");
    }
    throw error;
  }
}

export const catalogService = new CatalogService();
