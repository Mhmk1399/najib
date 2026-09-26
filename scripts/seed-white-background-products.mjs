import mongoose from "mongoose";

const localized = (fa, en, ar) => ({ fa, en, ar });
const localizedList = (fa, en, ar) => ({ fa, en, ar });
const now = new Date();

const subcategorySeeds = [
  {
    categorySlug: "trousers",
    slug: "formal-trousers",
    name: localized("شلوار رسمی", "Formal Trousers", "سراويل رسمية"),
    description: localized(
      "شلوارهای رسمی با برش دقیق برای کت و استایل‌های شهری.",
      "Precisely cut trousers for tailoring and city dressing.",
      "سراويل رسمية بقصّات دقيقة للبدلات والإطلالات الحضرية.",
    ),
  },
  {
    categorySlug: "shoes",
    slug: "dress-shoes",
    name: localized("کفش رسمی", "Dress Shoes", "أحذية رسمية"),
    description: localized(
      "کفش‌های رسمی چرمی برای کامل کردن ظاهر مردانه.",
      "Leather dress shoes that complete a considered menswear look.",
      "أحذية جلدية رسمية تكمل إطلالة الرجل الأنيقة.",
    ),
  },
  {
    categorySlug: "sport-coats",
    slug: "blazers",
    name: localized("کت‌های تک", "Blazers", "السترات المنفصلة"),
    description: localized(
      "کت‌های تک برای استایل رسمی و نیمه‌رسمی.",
      "Sport coats for formal and smart-casual styling.",
      "سترات منفصلة للإطلالات الرسمية وشبه الرسمية.",
    ),
  },
  {
    categorySlug: "suits",
    slug: "classic-suits",
    name: localized("کت و شلوار کلاسیک", "Classic Suits", "البدلات الكلاسيكية"),
    description: localized(
      "کت‌وشلوارهای کلاسیک با فرم دقیق و ماندگار.",
      "Classic suits with precise, enduring proportions.",
      "بدلات كلاسيكية بتناسق دقيق وخالد.",
    ),
  },
  {
    categorySlug: "accessories",
    slug: "leather-goods",
    name: localized("چرم و کیف", "Leather Goods", "المنتجات الجلدية"),
    description: localized(
      "کیف و کمربندهای چرمی برای استفاده‌ی روزمره و رسمی.",
      "Leather bags and belts for everyday and formal use.",
      "حقائب وأحزمة جلدية للاستخدام اليومي والرسمي.",
    ),
  },
  {
    categorySlug: "accessories",
    slug: "watches-eyewear",
    name: localized("ساعت و عینک", "Watches & Eyewear", "الساعات والنظارات"),
    description: localized(
      "ساعت و عینک‌هایی که به استایل شخصیت می‌دهند.",
      "Watches and eyewear that give the look its character.",
      "ساعات ونظارات تمنح الإطلالة شخصيتها.",
    ),
  },
  {
    categorySlug: "accessories",
    slug: "ties",
    name: localized("کراوات", "Ties", "ربطات العنق"),
    description: localized(
      "کراوات‌های رسمی برای تکمیل کت‌وشلوار و پیراهن.",
      "Formal ties to finish suits and dress shirts.",
      "ربطات عنق رسمية لإكمال البدلات والقمصان.",
    ),
  },
  {
    categorySlug: "mens-shirts",
    slug: "dress-shirts",
    name: localized("پیراهن رسمی", "Dress Shirts", "قمصان رسمية"),
    description: localized(
      "پیراهن‌های رسمی با یقه‌ی دقیق و پارچه‌ی خوش‌فرم.",
      "Dress shirts with precise collars and composed fabrics.",
      "قمصان رسمية بياقات دقيقة وأقمشة أنيقة.",
    ),
  },
];

const productSeeds = [
  {
    slug: "charcoal-tailored-trousers",
    categorySlug: "trousers",
    subcategorySlug: "formal-trousers",
    name: localized("شلوار رسمی ذغالی", "Charcoal Tailored Trousers", "بنطال رسمي فحمي"),
    description: localized(
      "شلوار رسمی ذغالی با برش تمیز برای ترکیب با کت تک یا کت‌وشلوار.",
      "Charcoal tailored trousers with a clean cut for blazers and suiting.",
      "بنطال رسمي فحمي بقصّة نظيفة للتنسيق مع السترات والبدلات.",
    ),
    priceMinor: 980000000,
    colorSlugs: ["charcoal-gray"],
    sizeRequired: true,
  },
  {
    slug: "black-cap-toe-derby",
    categorySlug: "shoes",
    subcategorySlug: "dress-shoes",
    name: localized("کفش دربی مشکی", "Black Cap-Toe Derby", "حذاء دربي أسود"),
    description: localized(
      "کفش دربی مشکی با پنجه‌ی کلاسیک برای استایل رسمی.",
      "A black cap-toe derby with a classic profile for formal dressing.",
      "حذاء دربي أسود بواجهة كلاسيكية للإطلالات الرسمية.",
    ),
    priceMinor: 1450000000,
    colorSlugs: ["midnight-black"],
  },
  {
    slug: "charcoal-single-breasted-blazer",
    categorySlug: "sport-coats",
    subcategorySlug: "blazers",
    name: localized("کت تک ذغالی", "Charcoal Single-Breasted Blazer", "سترة منفصلة فحمية"),
    description: localized(
      "کت تک ذغالی با فرم ساختاریافته برای استایل‌های رسمی و نیمه‌رسمی.",
      "A structured charcoal blazer for formal and smart-casual looks.",
      "سترة منفصلة فحمية ببنية متقنة للإطلالات الرسمية وشبه الرسمية.",
    ),
    priceMinor: 1680000000,
    colorSlugs: ["charcoal-gray"],
    sizeRequired: true,
  },
  {
    slug: "white-poplin-dress-shirt",
    categorySlug: "mens-shirts",
    subcategorySlug: "dress-shirts",
    name: localized("پیراهن رسمی پوپلین سفید", "White Poplin Dress Shirt", "قميص بوبلين أبيض رسمي"),
    description: localized(
      "پیراهن سفید پوپلین با یقه‌ی تمیز برای زیر کت رسمی.",
      "A crisp white poplin shirt made for formal tailoring.",
      "قميص بوبلين أبيض نقي مصمم للإطلالات الرسمية.",
    ),
    priceMinor: 690000000,
    colorSlugs: ["soft-white"],
    sizeRequired: true,
  },
  {
    slug: "black-leather-work-bag",
    categorySlug: "accessories",
    subcategorySlug: "leather-goods",
    name: localized("کیف دستی چرمی مشکی", "Black Leather Work Bag", "حقيبة عمل جلدية سوداء"),
    description: localized(
      "کیف دستی چرمی مشکی با فرم مینیمال برای استفاده‌ی روزانه.",
      "A minimal black leather work bag for everyday carry.",
      "حقيبة عمل جلدية سوداء بتصميم بسيط للاستخدام اليومي.",
    ),
    priceMinor: 1850000000,
    colorSlugs: ["midnight-black"],
  },
  {
    slug: "rose-gold-chronograph-watch",
    categorySlug: "accessories",
    subcategorySlug: "watches-eyewear",
    name: localized("ساعت کرنوگراف طلایی", "Rose Gold Chronograph Watch", "ساعة كرونوغراف ذهبية وردية"),
    description: localized(
      "ساعت کرنوگراف با صفحه‌ی مشکی و بند چرمی برای استایل رسمی.",
      "A black-dial chronograph with a leather strap for formal styling.",
      "ساعة كرونوغراف بقرص أسود وسوار جلدي للإطلالات الرسمية.",
    ),
    priceMinor: 2600000000,
    colorSlugs: ["midnight-black"],
  },
  {
    slug: "black-grain-leather-belt",
    categorySlug: "accessories",
    subcategorySlug: "leather-goods",
    name: localized("کمربند چرمی مشکی", "Black Grain Leather Belt", "حزام جلدي أسود"),
    description: localized(
      "کمربند چرمی مشکی با سگک ساده برای استایل رسمی و روزمره.",
      "A black grain leather belt with a restrained buckle for daily and formal wear.",
      "حزام جلدي أسود بإبزيم هادئ للإطلالات اليومية والرسمية.",
    ),
    priceMinor: 480000000,
    colorSlugs: ["midnight-black"],
  },
  {
    slug: "tortoiseshell-acetate-sunglasses",
    categorySlug: "accessories",
    subcategorySlug: "watches-eyewear",
    name: localized("عینک آفتابی لاک‌پشتی", "Tortoiseshell Acetate Sunglasses", "نظارات شمسية بإطار صدفي"),
    description: localized(
      "عینک آفتابی با فریم لاک‌پشتی برای تکمیل استایل شهری.",
      "Acetate sunglasses with a tortoiseshell frame for city dressing.",
      "نظارات شمسية بإطار أسيتات صدفي لإطلالات المدينة.",
    ),
    priceMinor: 820000000,
    colorSlugs: ["warm-beige"],
  },
  {
    slug: "midnight-silk-tie",
    categorySlug: "accessories",
    subcategorySlug: "ties",
    name: localized("کراوات ابریشمی سرمه‌ای", "Midnight Silk Tie", "ربطة عنق حريرية كحلية"),
    description: localized(
      "کراوات ابریشمی سرمه‌ای برای کامل کردن پیراهن سفید و کت رسمی.",
      "A midnight silk tie made to finish a white shirt and formal suit.",
      "ربطة عنق حريرية كحلية لإكمال القميص الأبيض والبدلة الرسمية.",
    ),
    priceMinor: 320000000,
    colorSlugs: ["navy-blue"],
  },
];

function subcategoryContent(seed, imageId) {
  return {
    primaryBanner: {
      imageId,
      objectFit: "cover",
      objectPosition: "center",
      eyebrow: localized("مجموعه نجیب‌زاده", "Najibzadeh selection", "مختارات نجيب زاده"),
      heading: seed.name,
      body: seed.description,
      ctaLabel: localized("مشاهده محصولات", "View products", "تصفح المنتجات"),
      ctaHref: `/shop?subcategory=${seed.slug}`,
    },
    primaryDescription: {
      heading: localized("انتخاب دقیق برای کمد مردانه", "Considered choices for a man's wardrobe", "اختيارات مدروسة لخزانة الرجل"),
      body: seed.description,
    },
    secondaryBanner: {
      imageId,
      objectFit: "cover",
      objectPosition: "center",
      eyebrow: localized("جزئیات کاربردی", "Practical details", "تفاصيل عملية"),
      heading: localized("فرم، کیفیت و استفاده‌ی روزانه", "Shape, quality, everyday use", "الشكل والجودة والاستخدام اليومي"),
      body: seed.description,
      ctaLabel: localized("ورود به فروشگاه", "Enter the shop", "الدخول إلى المتجر"),
      ctaHref: `/shop?subcategory=${seed.slug}`,
    },
    secondaryDescription: {
      heading: localized("چطور انتخاب کنیم؟", "How to choose", "كيف تختار؟"),
      body: seed.description,
    },
    seoTitle: seed.name,
    seoDescription: seed.description,
  };
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || "najib",
    serverSelectionTimeoutMS: 10000,
  });

  const db = mongoose.connection.db;
  const categories = db.collection("categories");
  const subcategories = db.collection("subcategories");
  const products = db.collection("products");
  const images = db.collection("imageassets");
  const colors = db.collection("colors");
  const sizes = db.collection("sizes");

  const placeholder = await images.findOne(
    { isActive: true },
    { projection: { _id: 1 } },
  );
  if (!placeholder?._id) {
    throw new Error("No active image exists. Upload at least one image before seeding catalog records.");
  }

  const categoryDocs = await categories
    .find({ slug: { $in: [...new Set([...subcategorySeeds.map((item) => item.categorySlug), ...productSeeds.map((item) => item.categorySlug)])] } })
    .project({ _id: 1, slug: 1 })
    .toArray();
  const categoryMap = new Map(categoryDocs.map((item) => [item.slug, item._id]));
  const missingCategories = [...new Set(productSeeds.map((item) => item.categorySlug))].filter(
    (slug) => !categoryMap.has(slug),
  );
  if (missingCategories.length) {
    throw new Error(`Missing categories: ${missingCategories.join(", ")}`);
  }

  const subcategoryMap = new Map();
  const subcategoryResults = [];
  for (const seed of subcategorySeeds) {
    const categoryId = categoryMap.get(seed.categorySlug);
    const existing = await subcategories.findOne(
      { categoryId, slug: seed.slug },
      { projection: { _id: 1, sortOrder: 1 } },
    );
    const sortOrder = Number(existing?.sortOrder ?? 1);
    if (!existing) {
      await subcategories.insertOne({
        categoryId,
        name: seed.name,
        slug: seed.slug,
        description: seed.description,
        thumbnailImageId: placeholder._id,
        thumbnailObjectFit: "cover",
        thumbnailObjectPosition: "center",
        pageContent: subcategoryContent(seed, placeholder._id),
        isActive: true,
        sortOrder,
        createdAt: now,
        updatedAt: now,
      });
    }
    const saved = existing ?? await subcategories.findOne({ categoryId, slug: seed.slug }, { projection: { _id: 1 } });
    subcategoryMap.set(`${seed.categorySlug}/${seed.slug}`, saved._id);
    subcategoryResults.push({
      category: seed.categorySlug,
      slug: seed.slug,
      action: existing ? "reused-existing" : "created",
    });
  }

  const colorDocs = await colors
    .find({ slug: { $in: [...new Set(productSeeds.flatMap((item) => item.colorSlugs))] }, isActive: true })
    .project({ _id: 1, slug: 1 })
    .toArray();
  const colorMap = new Map(colorDocs.map((item) => [item.slug, item._id]));
  const sizeIds = (await sizes.find({ isActive: true }).sort({ sortOrder: 1 }).project({ _id: 1 }).toArray()).map((item) => item._id);

  const productResults = [];
  for (const seed of productSeeds) {
    const categoryId = categoryMap.get(seed.categorySlug);
    const subcategoryId = subcategoryMap.get(`${seed.categorySlug}/${seed.subcategorySlug}`);
    const colorIds = seed.colorSlugs.map((slug) => colorMap.get(slug)).filter(Boolean);
    const payload = {
      name: seed.name,
      slug: seed.slug,
      description: seed.description,
      categoryId,
      subcategoryId,
      collectionIds: [],
      colorIds,
      sizeIds: seed.sizeRequired ? sizeIds : [],
      basePriceMinor: seed.priceMinor,
      currency: "IRR",
      status: "draft",
      material: localizedList(
        ["پارچه و متریال ممتاز"],
        ["Premium materials"],
        ["خامات فاخرة"],
      ),
      fit: localized("فیت استاندارد", "Regular fit", "قصة عادية"),
      silhouette: localized("فرم کلاسیک", "Classic silhouette", "قصة كلاسيكية"),
      pattern: localized("ساده", "Solid", "سادة"),
      seasons: localizedList(["بهار", "پاییز", "زمستان"], ["Spring", "Autumn", "Winter"], ["الربيع", "الخريف", "الشتاء"]),
      occasions: localizedList(["رسمی", "روزمره شیک"], ["Formal", "Polished daily wear"], ["رسمي", "أناقة يومية"]),
      styleTags: localizedList(["مردانه", "مینیمال"], ["Menswear", "Minimal"], ["رجالي", "بسيط"]),
      primaryImageObjectFit: "contain",
      primaryImageObjectPosition: "center",
      imageIds: [],
      updatedAt: now,
    };
    const existing = await products.findOne({ slug: seed.slug }, { projection: { _id: 1 } });
    if (!existing) {
      await products.insertOne({ ...payload, createdAt: now });
    }
    productResults.push({ slug: seed.slug, action: existing ? "skipped-existing" : "created", status: existing ? "unchanged" : "draft" });
  }

  console.log(JSON.stringify({
    placeholderImageId: String(placeholder._id),
    subcategories: subcategoryResults,
    products: productResults,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
