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
      if (query[key] !== undefined) filter[key] = query[key];
    }
    if (query.isActive !== undefined) filter.isActive = query.isActive === "true";
    if (query.search) {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
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
      return await models[resource].create(input);
    } catch (error) {
      this.handleDatabaseError(error);
    }
  }

  async update(resource: CatalogResource, id: string, input: unknown) {
    try {
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
