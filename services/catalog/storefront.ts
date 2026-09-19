import "server-only";

import { connectToDatabase } from "@/lib/server/db";
import { notFound } from "@/lib/server/errors";
import { Category } from "@/models/catalog/category";
import { Color } from "@/models/catalog/color";
import { ImageAsset } from "@/models/catalog/image-asset";
import { Product } from "@/models/catalog/product";
import { ProductVariant } from "@/models/catalog/product-variant";
import { Size } from "@/models/catalog/size";
import { Subcategory } from "@/models/catalog/subcategory";

type ProductListInput = {
  categoryId?: string;
  subcategoryId?: string;
  limit?: number;
  sort?: "curated" | "latest";
};

type PlainCatalogRecord = Record<string, unknown>;
type LocalizedRecord = {
  fa?: string;
  en?: string;
  ar?: string;
};

function toPlainJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function uniqueIds(values: unknown[]) {
  return [
    ...new Set(
      values
        .filter(Boolean)
        .map(String)
        .filter(Boolean),
    ),
  ];
}

function recordIds(value: unknown) {
  return Array.isArray(value) ? value.filter(Boolean).map(String) : [];
}

function textArray(value: unknown) {
  if (!value || typeof value !== "object") return [];
  const localized = value as LocalizedRecord;
  return [
    ...(Array.isArray(localized.fa) ? localized.fa : []),
    ...(Array.isArray(localized.en) ? localized.en : []),
    ...(Array.isArray(localized.ar) ? localized.ar : []),
  ].filter((item): item is string => typeof item === "string" && item.trim().length > 0);
}

function storyImagePayload(image: PlainCatalogRecord | null | undefined) {
  if (!image) return null;

  return {
    id: String(image._id),
    url: image.url,
    alt: image.alt,
    storyTitle: image.storyTitle,
    storyDescription: image.storyDescription,
    storyCtaLabel: image.storyCtaLabel,
    storyProductLimit: image.storyProductLimit,
    storyRevealEnabled: image.storyRevealEnabled,
    objectFit: image.objectFit,
    objectPosition: image.objectPosition,
    focalPointX: image.focalPointX,
    focalPointY: image.focalPointY,
  };
}

export async function getStorefrontCatalog() {
  await connectToDatabase();

  const [categories, subcategories, images] = await Promise.all([
    Category.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean(),
    Subcategory.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean(),
    ImageAsset.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean(),
  ]);

  return toPlainJson({
    categories,
    subcategories,
    images,
  });
}

export async function getStorefrontCategoryRoute(slug: string) {
  await connectToDatabase();

  const category = await Category.findOne({ slug, isActive: true })
    .select({ name: 1, slug: 1 })
    .lean();

  return category ? toPlainJson(category as PlainCatalogRecord) : null;
}

export async function getStorefrontSubcategoryRoute(
  categorySlug: string,
  subcategorySlug: string,
) {
  await connectToDatabase();

  const category = (await Category.findOne({
    slug: categorySlug,
    isActive: true,
  })
    .select({ name: 1, slug: 1 })
    .lean()) as PlainCatalogRecord | null;

  if (!category) return null;

  const subcategory = (await Subcategory.findOne({
    slug: subcategorySlug,
    categoryId: category._id,
    isActive: true,
  })
    .select({ name: 1, slug: 1, categoryId: 1 })
    .lean()) as PlainCatalogRecord | null;

  if (!subcategory) return null;

  return toPlainJson({ category, subcategory });
}

export async function getStorefrontProducts(input: ProductListInput = {}) {
  await connectToDatabase();

  const filter: Record<string, unknown> = {
    status: "active",
  };

  if (input.categoryId) filter.categoryId = input.categoryId;
  if (input.subcategoryId) filter.subcategoryId = input.subcategoryId;

  const limit = Math.min(Math.max(input.limit ?? 48, 1), 100);
  const sort: Record<string, 1 | -1> =
    input.sort === "latest"
      ? { createdAt: -1, _id: -1 }
      : { sortOrder: 1, createdAt: -1 };

  const products = await Product.find(filter)
    .sort(sort)
    .limit(limit)
    .lean() as PlainCatalogRecord[];

  const productIds = products.map((product) => String(product._id));
  const variants = productIds.length
    ? await ProductVariant.find({ productId: { $in: productIds }, isActive: true })
        .select({ productId: 1, colorId: 1, sizeId: 1 })
        .lean() as PlainCatalogRecord[]
    : [];

  const variantsByProduct = new Map<string, PlainCatalogRecord[]>();
  for (const variant of variants) {
    const key = String(variant.productId);
    const items = variantsByProduct.get(key) ?? [];
    items.push(variant);
    variantsByProduct.set(key, items);
  }

  const enrichedProducts = products.map((product) => {
    const productVariants = variantsByProduct.get(String(product._id)) ?? [];
    const colorIds = uniqueIds([
      ...recordIds(product.colorIds),
      ...productVariants.map((variant) => variant.colorId),
    ]);
    const sizeIds = uniqueIds([
      ...recordIds(product.sizeIds),
      ...productVariants.map((variant) => variant.sizeId),
    ]);

    return {
      ...product,
      colorIds,
      sizeIds,
    };
  });

  const colorIds = uniqueIds(
    enrichedProducts.flatMap((product) => recordIds(product.colorIds)),
  );
  const sizeIds = uniqueIds(
    enrichedProducts.flatMap((product) => recordIds(product.sizeIds)),
  );

  const [colors, sizes] = await Promise.all([
    colorIds.length
      ? Color.find({ _id: { $in: colorIds }, isActive: true })
          .sort({ sortOrder: 1, createdAt: -1 })
          .lean()
      : [],
    sizeIds.length
      ? Size.find({ _id: { $in: sizeIds }, isActive: true })
          .sort({ sortOrder: 1, createdAt: -1 })
          .lean()
      : [],
  ]);

  return toPlainJson({
    items: enrichedProducts,
    colors,
    sizes,
    pagination: {
      page: 1,
      limit,
      total: enrichedProducts.length,
      pages: enrichedProducts.length > 0 ? 1 : 0,
    },
  });
}

export async function getStorefrontImageStories() {
  await connectToDatabase();

  const [manualStoryImages, categories, subcategories, catalogProducts] =
    (await Promise.all([
      ImageAsset.find({
        isActive: true,
        "linkedProducts.0": { $exists: true },
      })
        .sort({ updatedAt: -1, createdAt: -1 })
        .limit(80)
        .lean(),
      Category.find({ isActive: true })
        .select({
          thumbnailImageId: 1,
          pageContent: 1,
        })
        .lean(),
      Subcategory.find({ isActive: true })
        .select({
          categoryId: 1,
          thumbnailImageId: 1,
          pageContent: 1,
        })
        .lean(),
      Product.find({ status: "active" })
        .select({
          name: 1,
          slug: 1,
          description: 1,
          categoryId: 1,
          subcategoryId: 1,
          basePriceMinor: 1,
          currency: 1,
          material: 1,
          seasons: 1,
          occasions: 1,
          styleTags: 1,
          primaryImageId: 1,
          primaryImageObjectFit: 1,
          primaryImageObjectPosition: 1,
          imageIds: 1,
          colorIds: 1,
          sizeIds: 1,
        })
        .sort({ sortOrder: 1, createdAt: -1 })
        .limit(240)
        .lean(),
    ])) as [
      PlainCatalogRecord[],
      PlainCatalogRecord[],
      PlainCatalogRecord[],
      PlainCatalogRecord[],
    ];

  const manualProductIds = uniqueIds(
    manualStoryImages.flatMap((image) =>
      Array.isArray(image.linkedProducts)
        ? image.linkedProducts.map((link) =>
            link && typeof link === "object"
              ? (link as PlainCatalogRecord).productId
              : null,
          )
        : [],
    ),
  );

  const loadedProductIds = new Set(catalogProducts.map((product) => String(product._id)));
  const missingManualProductIds = manualProductIds.filter(
    (productId) => !loadedProductIds.has(productId),
  );
  const manualProducts = missingManualProductIds.length
    ? ((await Product.find({
        _id: { $in: missingManualProductIds },
        status: "active",
      })
        .select({
          name: 1,
          slug: 1,
          description: 1,
          categoryId: 1,
          subcategoryId: 1,
          basePriceMinor: 1,
          currency: 1,
          material: 1,
          seasons: 1,
          occasions: 1,
          styleTags: 1,
          primaryImageId: 1,
          primaryImageObjectFit: 1,
          primaryImageObjectPosition: 1,
          imageIds: 1,
          colorIds: 1,
          sizeIds: 1,
        })
        .lean()) as PlainCatalogRecord[])
    : [];

  const products = [...catalogProducts, ...manualProducts];
  const productMap = new Map(products.map((product) => [String(product._id), product]));
  const productIds = products.map((product) => String(product._id));

  if (!productIds.length) {
    return toPlainJson({ stories: [] });
  }

  const productIdsByCategory = new Map<string, string[]>();
  const productIdsBySubcategory = new Map<string, string[]>();
  for (const product of products) {
    const productId = String(product._id);
    const categoryId = String(product.categoryId ?? "");
    const subcategoryId = String(product.subcategoryId ?? "");

    if (categoryId) {
      const current = productIdsByCategory.get(categoryId) ?? [];
      current.push(productId);
      productIdsByCategory.set(categoryId, current);
    }

    if (subcategoryId) {
      const current = productIdsBySubcategory.get(subcategoryId) ?? [];
      current.push(productId);
      productIdsBySubcategory.set(subcategoryId, current);
    }
  }

  const storyLinksByImageId = new Map<string, PlainCatalogRecord[]>();

  function addStoryLink(imageId: unknown, link: PlainCatalogRecord) {
    const id = String(imageId ?? "");
    const productId = String(link.productId ?? "");
    if (!id || !productId || !productMap.has(productId)) return;

    const current = storyLinksByImageId.get(id) ?? [];
    const existingIndex = current.findIndex(
      (item) => String(item.productId) === productId,
    );

    if (existingIndex >= 0) {
      const existing = current[existingIndex];
      current[existingIndex] = {
        ...link,
        ...existing,
        label: existing.label ?? link.label,
        hotspotX: existing.hotspotX ?? link.hotspotX,
        hotspotY: existing.hotspotY ?? link.hotspotY,
      };
    } else {
      current.push(link);
    }

    storyLinksByImageId.set(id, current);
  }

  function linkedImageIds(record: PlainCatalogRecord) {
    const pageContent = record.pageContent as
      | {
          primaryBanner?: { imageId?: unknown };
          secondaryBanner?: { imageId?: unknown };
        }
      | undefined;

    return uniqueIds([
      record.thumbnailImageId,
      pageContent?.primaryBanner?.imageId,
      pageContent?.secondaryBanner?.imageId,
    ]);
  }

  for (const product of products) {
    const productId = String(product._id);
    const imageIds = uniqueIds([
      product.primaryImageId,
      ...(Array.isArray(product.imageIds) ? product.imageIds : []),
    ]);

    imageIds.forEach((imageId, index) =>
      addStoryLink(imageId, {
        productId,
        sortOrder: index,
      }),
    );
  }

  for (const category of categories) {
    const categoryProductIds = productIdsByCategory
      .get(String(category._id))
      ?.slice(0, 6);
    if (!categoryProductIds?.length) continue;

    linkedImageIds(category).forEach((imageId) => {
      categoryProductIds.forEach((productId, index) =>
        addStoryLink(imageId, { productId, sortOrder: index + 10 }),
      );
    });
  }

  for (const subcategory of subcategories) {
    const subcategoryProductIds = productIdsBySubcategory
      .get(String(subcategory._id))
      ?.slice(0, 6);
    if (!subcategoryProductIds?.length) continue;

    linkedImageIds(subcategory).forEach((imageId) => {
      subcategoryProductIds.forEach((productId, index) =>
        addStoryLink(imageId, { productId, sortOrder: index + 10 }),
      );
    });
  }

  for (const image of manualStoryImages) {
    const links = Array.isArray(image.linkedProducts)
      ? (image.linkedProducts as PlainCatalogRecord[])
      : [];

    links.forEach((link, index) =>
      addStoryLink(image._id, {
        ...link,
        sortOrder: Number(link.sortOrder ?? index),
      }),
    );
  }

  const storyImageIds = [...storyLinksByImageId.keys()];
  if (!storyImageIds.length) {
    return toPlainJson({ stories: [] });
  }

  const storyImages = (await ImageAsset.find({
    _id: { $in: storyImageIds },
    isActive: true,
  })
    .sort({ updatedAt: -1, createdAt: -1 })
    .limit(80)
    .lean()) as PlainCatalogRecord[];
  const primaryImageIds = uniqueIds(products.map((product) => product.primaryImageId));
  const colorIds = uniqueIds(products.flatMap((product) => recordIds(product.colorIds)));
  const sizeIds = uniqueIds(products.flatMap((product) => recordIds(product.sizeIds)));

  const [productImages, colors, sizes] = await Promise.all([
    primaryImageIds.length
      ? ImageAsset.find({ _id: { $in: primaryImageIds }, isActive: true }).lean()
      : [],
    colorIds.length
      ? Color.find({ _id: { $in: colorIds }, isActive: true })
          .select({ name: 1, hex: 1, sortOrder: 1 })
          .sort({ sortOrder: 1, createdAt: -1 })
          .lean()
      : [],
    sizeIds.length
      ? Size.find({ _id: { $in: sizeIds }, isActive: true })
          .select({ name: 1, code: 1, sortOrder: 1 })
          .sort({ sortOrder: 1, createdAt: -1 })
          .lean()
      : [],
  ]);

  const imageMap = new Map(
    (productImages as PlainCatalogRecord[]).map((image) => [String(image._id), image]),
  );
  const colorMap = new Map(
    (colors as PlainCatalogRecord[]).map((color) => [String(color._id), color]),
  );
  const sizeMap = new Map(
    (sizes as PlainCatalogRecord[]).map((size) => [String(size._id), size]),
  );

  const stories = storyImages
    .map((image) => {
      const links = storyLinksByImageId.get(String(image._id)) ?? [];

      const linkedProducts = links
        .map((link) => {
          const product = productMap.get(String(link.productId));
          if (!product) return null;
          const primaryImage = imageMap.get(String(product.primaryImageId));

          return {
            id: String(product._id),
            slug: product.slug,
            name: product.name,
            description: product.description,
            href: `/shop/${product.slug}`,
            priceMinor: product.basePriceMinor,
            currency: product.currency,
            label: link.label,
            hotspotX: link.hotspotX,
            hotspotY: link.hotspotY,
            sortOrder: Number(link.sortOrder ?? 0),
            image: storyImagePayload(primaryImage),
            colors: recordIds(product.colorIds)
              .map((colorId) => colorMap.get(colorId))
              .filter(Boolean),
            sizes: recordIds(product.sizeIds)
              .map((sizeId) => sizeMap.get(sizeId))
              .filter(Boolean),
            tags: uniqueIds([
              ...textArray(product.material),
              ...textArray(product.seasons),
              ...textArray(product.occasions),
              ...textArray(product.styleTags),
            ]).slice(0, 5),
          };
        })
        .filter(Boolean)
        .sort((a, b) => Number(a?.sortOrder ?? 0) - Number(b?.sortOrder ?? 0));

      if (!linkedProducts.length) return null;

      return {
        id: String(image._id),
        kind: image.kind,
        storyTitle: image.storyTitle,
        storyDescription: image.storyDescription,
        storyCtaLabel: image.storyCtaLabel,
        storyProductLimit: image.storyProductLimit,
        storyRevealEnabled: image.storyRevealEnabled,
        image: storyImagePayload(image),
        linkedProducts,
        updatedAt: image.updatedAt,
      };
    })
    .filter(Boolean);

  return toPlainJson({ stories });
}

export async function getStorefrontProductBySlug(slug: string) {
  await connectToDatabase();

  const product = (await Product.findOne({
    slug,
    status: "active",
  }).lean()) as PlainCatalogRecord | null;

  if (!product) notFound("Product was not found.");

  const productId = String(product._id);
  const [variants, category, subcategory, relatedProducts] = await Promise.all([
    ProductVariant.find({ productId, isActive: true })
      .sort({ createdAt: -1 })
      .lean(),
    Category.findById(product.categoryId).lean(),
    Subcategory.findById(product.subcategoryId).lean(),
    Product.find({
      _id: { $ne: product._id },
      status: "active",
      $or: [
        { subcategoryId: product.subcategoryId },
        { categoryId: product.categoryId },
      ],
    })
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(6)
      .lean(),
  ]) as [
    PlainCatalogRecord[],
    PlainCatalogRecord | null,
    PlainCatalogRecord | null,
    PlainCatalogRecord[],
  ];

  const colorIds = uniqueIds([
    ...recordIds(product.colorIds),
    ...variants.map((variant) => variant.colorId),
  ]);
  const sizeIds = uniqueIds([
    ...recordIds(product.sizeIds),
    ...variants.map((variant) => variant.sizeId),
  ]);
  const productImageIds = [
    product.primaryImageId,
    ...(Array.isArray(product.imageIds) ? product.imageIds : []),
    ...relatedProducts.map((item) => item.primaryImageId),
  ].filter(Boolean).map(String);

  const [colors, sizes, images] = await Promise.all([
    colorIds.length
      ? Color.find({ _id: { $in: colorIds }, isActive: true })
          .sort({ sortOrder: 1, createdAt: -1 })
          .lean()
      : [],
    sizeIds.length
      ? Size.find({ _id: { $in: sizeIds }, isActive: true })
          .sort({ sortOrder: 1, createdAt: -1 })
          .lean()
      : [],
    ImageAsset.find({
      isActive: true,
      $or: [
        { _id: { $in: productImageIds } },
        { "linkedProducts.productId": product._id },
      ],
    })
      .sort({ sortOrder: 1, createdAt: -1 })
      .lean(),
  ]);

  return toPlainJson({
    product,
    category,
    subcategory,
    variants,
    colors,
    sizes,
    images,
    relatedProducts,
  });
}
