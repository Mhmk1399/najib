import mongoose from "mongoose";

const localized = (fa, en, ar) => ({ fa, en, ar });

const collectionSeeds = [
  {
    slug: "autumn-tailoring-edit",
    name: localized(
      "ادیت پاییزی خیاطی",
      "Autumn Tailoring Edit",
      "تحرير الخياطة الخريفي",
    ),
    description: localized(
      "انتخابی گرم و رسمی برای روزهای پاییزی؛ کت ساختارمند، شلوار دقیق، پیراهن سفید و جزئیاتی که ظاهر را برای قرارهای کاری، مهمانی‌های عصر و مراسم نیمه‌رسمی کامل می‌کنند.",
      "A warm formal edit for autumn days: structured tailoring, precise trousers, a white shirt, and quiet details for business appointments, evening gatherings, and refined smart occasions.",
      "اختيار رسمي دافئ لأيام الخريف؛ سترة منظمة، سروال دقيق، قميص أبيض وتفاصيل هادئة تكمل الإطلالة لاجتماعات العمل والمناسبات المسائية الأنيقة.",
    ),
    products: [
      "charcoal-single-breasted-blazer",
      "charcoal-tailored-trousers",
      "midnight-silk-tie",
      "black-cap-toe-derby",
    ],
    heroCandidates: [
      "charcoal-single-breasted-blazer",
      "charcoal-tailored-trousers",
      "black-cap-toe-derby",
    ],
    heroObjectPosition: "center",
    sortOrder: 10,
  },
  {
    slug: "autumn-leather-essentials",
    name: localized(
      "ضروریات چرمی پاییز",
      "Autumn Leather Essentials",
      "أساسيات الجلد الخريفية",
    ),
    description: localized(
      "جزئیات تیره و کاربردی برای کامل کردن استایل پاییز؛ کیف چرمی، کمربند، کفش رسمی و ساعت چرمی که ظاهر مردانه را منظم، سنگین و آماده فصل‌های خنک‌تر می‌کند.",
      "Dark, functional finishing pieces for autumn styling: leather bag, belt, dress shoes, and a leather-strap watch that keep the look composed, grounded, and ready for cooler days.",
      "تفاصيل داكنة وعملية لإكمال إطلالة الخريف؛ حقيبة جلدية، حزام، حذاء رسمي وساعة بسوار جلدي تمنح المظهر وقارا واستعدادا للأيام الأبرد.",
    ),
    products: [
      "black-leather-work-bag",
      "black-grain-leather-belt",
      "black-cap-toe-derby",
      "rose-gold-chronograph-watch",
      "tortoiseshell-acetate-sunglasses",
    ],
    heroCandidates: [
      "black-leather-work-bag",
      "rose-gold-chronograph-watch",
      "black-cap-toe-derby",
    ],
    heroObjectPosition: "center",
    sortOrder: 11,
  },
];

function assertEnv() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required in .env");
  }
}

function productName(product) {
  return product?.name?.fa || product?.name?.en || product?.slug || "";
}

async function pickHeroImage(productsBySlug, seed) {
  for (const slug of seed.heroCandidates) {
    const product = productsBySlug.get(slug);
    if (product?.primaryImageId) return product.primaryImageId;
  }

  for (const slug of seed.products) {
    const product = productsBySlug.get(slug);
    if (product?.primaryImageId) return product.primaryImageId;
  }

  return null;
}

async function main() {
  assertEnv();

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || "najib",
    serverSelectionTimeoutMS: 10000,
  });

  const db = mongoose.connection.db;
  const productsCollection = db.collection("products");
  const collectionsCollection = db.collection("collections");
  const now = new Date();
  const summary = [];

  const wantedSlugs = [...new Set(collectionSeeds.flatMap((seed) => seed.products))];
  const products = await productsCollection
    .find(
      { slug: { $in: wantedSlugs }, status: { $ne: "archived" } },
      {
        projection: {
          _id: 1,
          slug: 1,
          name: 1,
          primaryImageId: 1,
          collectionIds: 1,
        },
      },
    )
    .toArray();
  const productsBySlug = new Map(products.map((product) => [product.slug, product]));

  for (const seed of collectionSeeds) {
    const resolvedProducts = seed.products
      .map((slug) => productsBySlug.get(slug))
      .filter(Boolean);
    const missingProducts = seed.products.filter((slug) => !productsBySlug.has(slug));

    if (resolvedProducts.length < 3) {
      throw new Error(
        `${seed.slug} needs at least 3 existing products. Missing: ${missingProducts.join(", ")}`,
      );
    }

    const productIds = resolvedProducts.map((product) => product._id);
    const heroImageId = await pickHeroImage(productsBySlug, seed);
    const existing = await collectionsCollection.findOne(
      { slug: seed.slug },
      { projection: { _id: 1 } },
    );
    const collectionId = existing?._id ?? new mongoose.Types.ObjectId();

    await collectionsCollection.updateOne(
      { _id: collectionId },
      {
        $set: {
          name: seed.name,
          slug: seed.slug,
          description: seed.description,
          productIds,
          heroImageId,
          heroObjectFit: "cover",
          heroObjectPosition: seed.heroObjectPosition,
          isActive: true,
          startsAt: new Date("2026-09-01T00:00:00.000Z"),
          endsAt: new Date("2026-12-20T23:59:59.999Z"),
          sortOrder: seed.sortOrder,
          updatedAt: now,
        },
        $setOnInsert: {
          _id: collectionId,
          createdAt: now,
        },
      },
      { upsert: true },
    );

    await productsCollection.updateMany(
      { collectionIds: collectionId },
      { $pull: { collectionIds: collectionId } },
    );
    await productsCollection.updateMany(
      { _id: { $in: productIds } },
      { $addToSet: { collectionIds: collectionId } },
    );

    summary.push({
      slug: seed.slug,
      action: existing ? "updated" : "created",
      id: String(collectionId),
      heroImageId: heroImageId ? String(heroImageId) : null,
      productCount: productIds.length,
      products: resolvedProducts.map((product) => ({
        slug: product.slug,
        name: productName(product),
      })),
      missingProducts,
    });
  }

  console.log(JSON.stringify({ collections: summary }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
