import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import mongoose, { type Model } from "mongoose";
import { type z } from "zod";
import { Category } from "../models/category.js";
import { Collection } from "../models/collection.js";
import { Color } from "../models/color.js";
import { ImageAsset } from "../models/image-asset.js";
import { ProductVariant } from "../models/product-variant.js";
import { Product } from "../models/product.js";
import { SizeGroup } from "../models/size-group.js";
import { Size } from "../models/size.js";
import { Subcategory } from "../models/subcategory.js";
import {
  catalogResources,
  createSchemas,
  listCatalogQuerySchema,
  objectIdSchema,
  updateSchemas,
  type CatalogResource,
} from "./catalog.schemas.js";

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

@Injectable()
export class CatalogService {
  parseResource(value: string): CatalogResource {
    if (!catalogResources.includes(value as CatalogResource)) {
      throw new NotFoundException(`Unknown catalog resource: ${value}`);
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
      throw new BadRequestException("At least one field must be provided");
    }
    return result;
  }

  async list(resource: CatalogResource, query: ListQuery) {
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

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        pages: Math.ceil(total / query.limit),
      },
    };
  }

  async findById(resource: CatalogResource, id: string) {
    const item = await models[resource].findById(id).lean();
    if (!item) throw new NotFoundException(`${resource} record was not found`);
    return item;
  }

  async create(resource: CatalogResource, input: unknown) {
    try {
      if (resource === "products") {
        await this.assertProductReferences(input as Record<string, unknown>);
      }
      if (resource === "categories" || resource === "subcategories") {
        await this.assertTaxonomyReferences(resource, input as Record<string, unknown>);
      }
      if (resource === "images") {
        await this.assertImageReferences(input as Record<string, unknown>);
      }
      return await models[resource].create(input);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async update(resource: CatalogResource, id: string, input: unknown) {
    try {
      if (resource === "products") {
        const existing = await Product.findById(id).lean();
        if (!existing) throw new NotFoundException("products record was not found");
        await this.assertProductReferences({
          ...existing,
          ...(input as Record<string, unknown>),
        });
      }
      if (resource === "categories" || resource === "subcategories" || resource === "images") {
        const existing = await models[resource].findById(id).lean();
        if (!existing) throw new NotFoundException(`${resource} record was not found`);
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
      if (!item) throw new NotFoundException(`${resource} record was not found`);
      return item;
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  private parse(schema: z.ZodType, value: unknown): unknown {
    const result = schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({ message: "Validation failed", issues: result.error.issues });
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

    if (!categoryExists) throw new BadRequestException("Product category does not exist");
    if (!subcategory) throw new BadRequestException("Product subcategory does not exist");
    if (String(subcategory.categoryId) !== categoryId) {
      throw new BadRequestException("Product subcategory does not belong to the selected category");
    }

    const collectionIds = Array.isArray(input.collectionIds)
      ? input.collectionIds.map(String)
      : [];
    if (collectionIds.length > 0) {
      const collectionCount = await Collection.countDocuments({ _id: { $in: collectionIds } });
      if (collectionCount !== new Set(collectionIds).size) {
        throw new BadRequestException("One or more product collections do not exist");
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
        throw new BadRequestException("One or more product images do not exist");
      }
    }
  }

  private async assertTaxonomyReferences(
    resource: "categories" | "subcategories",
    input: Record<string, unknown>,
  ): Promise<void> {
    if (resource === "subcategories") {
      const categoryExists = await Category.exists({ _id: input.categoryId });
      if (!categoryExists) throw new BadRequestException("Subcategory parent category does not exist");
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
      throw new BadRequestException("Two banner images are required for category page content");
    }

    const allowedKinds = resource === "categories"
      ? ["category_banner", "editorial", "lookbook"]
      : ["subcategory_banner", "editorial", "lookbook"];
    const bannerCount = await ImageAsset.countDocuments({
      _id: { $in: requiredImageIds },
      kind: { $in: allowedKinds },
    });
    if (bannerCount !== new Set(requiredImageIds).size) {
      throw new BadRequestException(
        `Page banners must reference existing ${resource === "categories" ? "category" : "subcategory"}, editorial, or lookbook images`,
      );
    }

    if (input.thumbnailImageId) {
      const thumbnailExists = await ImageAsset.exists({ _id: input.thumbnailImageId });
      if (!thumbnailExists) throw new BadRequestException("Taxonomy thumbnail image does not exist");
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
      throw new BadRequestException("One or more linked products do not exist");
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
      if (!productId) throw new BadRequestException("One or more linked variants do not exist");
      if (productId !== String(link.productId)) {
        throw new BadRequestException("A linked variant does not belong to its selected product");
      }
    }
  }

  private handleDatabaseError(error: unknown): never {
    if (error instanceof NotFoundException) throw error;
    if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
      throw new BadRequestException(error.message);
    }
    if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
      throw new ConflictException("A catalog record with the same unique value already exists");
    }
    throw error;
  }
}
