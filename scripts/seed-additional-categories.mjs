import mongoose from "mongoose";

const localized = (fa, en, ar) => ({ fa, en, ar });

const categorySeeds = [
  {
    slug: "trousers",
    name: localized("شلوار", "Trousers", "السراويل"),
    description: localized(
      "شلوارهای مردانه با برش دقیق برای استایل رسمی و روزمره.",
      "Precisely cut trousers for formal and everyday menswear.",
      "سراويل رجالية بقصّات دقيقة للإطلالات الرسمية واليومية.",
    ),
    seoTitle: localized("خرید شلوار مردانه", "Men's Trousers", "سراويل رجالية"),
    seoDescription: localized(
      "مجموعه شلوارهای مردانه نجیب‌زاده با پارچه‌های باکیفیت و فرم دقیق.",
      "Discover Najibzadeh men's trousers in considered fabrics and precise silhouettes.",
      "اكتشف سراويل نجيب زاده الرجالية بخامات مختارة وقصّات دقيقة.",
    ),
  },
  {
    slug: "shoes",
    name: localized("کفش", "Shoes", "الأحذية"),
    description: localized(
      "کفش‌های مردانه برای کامل کردن ظاهر رسمی، نیمه‌رسمی و روزمره.",
      "Men's shoes to complete formal, smart-casual, and everyday looks.",
      "أحذية رجالية لإكمال الإطلالات الرسمية وشبه الرسمية واليومية.",
    ),
    seoTitle: localized("خرید کفش مردانه", "Men's Shoes", "أحذية رجالية"),
    seoDescription: localized(
      "کفش‌های مردانه با طراحی ماندگار برای هر موقعیت.",
      "Timeless men's shoes designed for every occasion.",
      "أحذية رجالية بتصميم خالد لكل مناسبة.",
    ),
  },
  {
    slug: "sport-coats",
    name: localized("کت تک", "Sport Coats", "السترات المنفصلة"),
    description: localized(
      "کت‌های تک خوش‌فرم برای ساختن استایل‌های منعطف و متمایز.",
      "Refined sport coats for flexible, distinctive styling.",
      "سترات منفصلة أنيقة لإطلالات مرنة ومميزة.",
    ),
    seoTitle: localized("خرید کت تک مردانه", "Men's Sport Coats", "سترات رجالية منفصلة"),
    seoDescription: localized(
      "کت تک مردانه نجیب‌زاده برای استایل رسمی و نیمه‌رسمی.",
      "Najibzadeh men's sport coats for formal and smart-casual dressing.",
      "سترات نجيب زاده الرجالية للإطلالات الرسمية وشبه الرسمية.",
    ),
  },
  {
    slug: "suits",
    name: localized("کت و شلوار", "Suits", "البدلات"),
    description: localized(
      "کت‌وشلوارهای مردانه با تناسب دقیق برای حضورهای مهم.",
      "Precisely proportioned suits for important occasions.",
      "بدلات رجالية بتناسق دقيق للمناسبات المهمة.",
    ),
    seoTitle: localized("خرید کت و شلوار مردانه", "Men's Suits", "بدلات رجالية"),
    seoDescription: localized(
      "مجموعه کت‌وشلوارهای مردانه رسمی با طراحی دقیق نجیب‌زاده.",
      "Explore Najibzadeh men's suits with precise tailoring and quiet luxury.",
      "تصفح بدلات نجيب زاده الرجالية بخياطة دقيقة وفخامة هادئة.",
    ),
  },
  {
    slug: "accessories",
    name: localized("اکسسوری", "Accessories", "الإكسسوارات"),
    description: localized(
      "جزئیات کوچک و کاربردی برای کامل کردن استایل مردانه.",
      "Considered details that complete a man's wardrobe.",
      "تفاصيل مختارة تكمل خزانة الرجل الأنيقة.",
    ),
    seoTitle: localized("اکسسوری مردانه", "Men's Accessories", "إكسسوارات رجالية"),
    seoDescription: localized(
      "اکسسوری‌های مردانه برای تکمیل ظاهر با ظرافت و شخصیت.",
      "Men's accessories to finish every look with character and restraint.",
      "إكسسوارات رجالية لإكمال كل إطلالة بأناقة وشخصية.",
    ),
  },
  {
    slug: "fragrances",
    name: localized("ادکلن", "Fragrances", "العطور"),
    description: localized(
      "رایحه‌های مردانه برای امضای شخصی ماندگار.",
      "Men's fragrances for a memorable personal signature.",
      "عطور رجالية لبصمة شخصية لا تُنسى.",
    ),
    seoTitle: localized("ادکلن مردانه", "Men's Fragrances", "عطور رجالية"),
    seoDescription: localized(
      "ادکلن‌های مردانه با رایحه‌های متمایز برای هر فصل و موقعیت.",
      "Distinctive men's fragrances for every season and occasion.",
      "عطور رجالية مميزة لكل موسم ومناسبة.",
    ),
  },
];

function pageContent(seed, imageId) {
  const heading = localized(
    `انتخاب‌های ${seed.name.fa}`,
    `${seed.name.en} selection`,
    `مختارات ${seed.name.ar}`,
  );
  const body = localized(
    seed.description.fa,
    seed.description.en,
    seed.description.ar,
  );

  return {
    primaryBanner: {
      imageId,
      objectFit: "cover",
      objectPosition: "center",
      eyebrow: localized("مجموعه نجیب‌زاده", "Najibzadeh collection", "مجموعة نجيب زاده"),
      heading,
      body,
      ctaLabel: localized("مشاهده محصولات", "View products", "تصفح المنتجات"),
      ctaHref: `/shop?category=${seed.slug}`,
    },
    primaryDescription: {
      heading: localized(
        `برای انتخاب ${seed.name.fa}`,
        `A considered ${seed.name.en.toLowerCase()} wardrobe`,
        `لاختيار ${seed.name.ar}`,
      ),
      body,
    },
    secondaryBanner: {
      imageId,
      objectFit: "cover",
      objectPosition: "center",
      eyebrow: localized("جزئیات متمایز", "Signature details", "تفاصيل مميزة"),
      heading: localized(
        "فرم، کیفیت، حضور",
        "Form, quality, presence",
        "الشكل والجودة والحضور",
      ),
      body,
      ctaLabel: localized("ورود به فروشگاه", "Enter the shop", "الدخول إلى المتجر"),
      ctaHref: `/shop?category=${seed.slug}`,
    },
    secondaryDescription: {
      heading: localized(
        `یک انتخاب دقیق در ${seed.name.fa}`,
        `One precise choice in ${seed.name.en.toLowerCase()}`,
        `اختيار دقيق من ${seed.name.ar}`,
      ),
      body,
    },
    seoTitle: seed.seoTitle,
    seoDescription: seed.seoDescription,
  };
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || "najib",
    serverSelectionTimeoutMS: 10000,
  });

  const db = mongoose.connection.db;
  const categoryCollection = db.collection("categories");
  const imageCollection = db.collection("imageassets");
  const placeholder = await imageCollection.findOne(
    { isActive: true },
    { projection: { _id: 1 } },
  );

  if (!placeholder?._id) {
    throw new Error("No active image exists. Upload at least one image before seeding categories.");
  }

  const maxSortOrder = await categoryCollection.findOne(
    {},
    { sort: { sortOrder: -1 }, projection: { sortOrder: 1 } },
  );
  let sortOrder = Number(maxSortOrder?.sortOrder ?? 0) + 1;
  const now = new Date();
  const results = [];

  for (const seed of categorySeeds) {
    const existing = await categoryCollection.findOne(
      { slug: seed.slug },
      { projection: { sortOrder: 1 } },
    );
    const resolvedSortOrder = Number(existing?.sortOrder ?? sortOrder);
    const content = {
      slug: seed.slug,
      name: seed.name,
      description: seed.description,
      thumbnailImageId: placeholder._id,
      thumbnailObjectFit: "cover",
      thumbnailObjectPosition: "center",
      pageContent: pageContent(seed, placeholder._id),
      isActive: true,
      sortOrder: resolvedSortOrder,
      updatedAt: now,
    };

    const result = await categoryCollection.updateOne(
      { slug: seed.slug },
      {
        $set: content,
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );

    results.push({
      slug: seed.slug,
      action: result.upsertedCount ? "created" : "updated",
      sortOrder: resolvedSortOrder,
    });
    if (!existing) sortOrder += 1;
  }

  console.log(JSON.stringify({ placeholderImageId: String(placeholder._id), results }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
