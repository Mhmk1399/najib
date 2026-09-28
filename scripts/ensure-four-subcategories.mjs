import mongoose from "mongoose";

const now = new Date();

const text = (fa, en, ar) => ({ fa, en, ar });

const plannedSubcategories = {
  trousers: [
    {
      slug: "tailored-trousers",
      name: text("شلوار پارچه‌ای", "Tailored Trousers", "سراويل مفصلة"),
      description: text(
        "شلوارهای پارچه‌ای با برش تمیز برای استایل رسمی، کاری و روزمره شیک.",
        "Clean-cut tailored trousers for formal, business, and polished daily dressing.",
        "سراويل مفصلة بقصة نظيفة للإطلالات الرسمية والعملية واليومية الأنيقة.",
      ),
    },
    {
      slug: "pleated-trousers",
      name: text("شلوار پیلی‌دار", "Pleated Trousers", "سراويل بكسرات"),
      description: text(
        "شلوارهای پیلی‌دار با فرم راحت‌تر و ظاهر کلاسیک برای ترکیب با کت تک و پیراهن.",
        "Pleated trousers with a relaxed classic line for blazers and refined shirts.",
        "سراويل بكسرات بخط كلاسيكي مريح للتنسيق مع السترات والقمصان الأنيقة.",
      ),
    },
    {
      slug: "casual-trousers",
      name: text("شلوار روزمره شیک", "Smart Casual Trousers", "سراويل يومية أنيقة"),
      description: text(
        "شلوارهای روزمره با ظاهر مرتب برای موقعیت‌هایی که راحتی و وقار باید کنار هم باشند.",
        "Smart casual trousers for moments where comfort and composure need to meet.",
        "سراويل يومية أنيقة للمواقف التي تجمع بين الراحة والوقار.",
      ),
    },
    {
      slug: "linen-trousers",
      name: text("شلوار لینن", "Linen Trousers", "سراويل كتان"),
      description: text(
        "شلوارهای لینن سبک برای روزهای گرم، سفر و استایل‌های آرام تابستانی.",
        "Light linen trousers for warm days, travel, and relaxed summer dressing.",
        "سراويل كتان خفيفة للأيام الدافئة والسفر والإطلالات الصيفية الهادئة.",
      ),
    },
  ],
  shoes: [
    {
      slug: "loafers",
      name: text("لوفر", "Loafers", "أحذية لوفر"),
      description: text(
        "لوفرهای چرمی برای استایل نیمه‌رسمی، روزمره لوکس و ترکیب با شلوار پارچه‌ای.",
        "Leather loafers for smart-casual looks, refined daily wear, and tailored trousers.",
        "أحذية لوفر جلدية للإطلالات شبه الرسمية واليومية الفاخرة مع السراويل المفصلة.",
      ),
    },
    {
      slug: "leather-boots",
      name: text("بوت چرمی", "Leather Boots", "أحذية جلدية عالية"),
      description: text(
        "بوت‌های چرمی با فرم مردانه برای فصل سرد، کت تک و استایل شهری منظم.",
        "Leather boots with a masculine line for colder seasons, blazers, and city dressing.",
        "أحذية جلدية عالية بخط رجالي للمواسم الباردة والسترات وإطلالات المدينة.",
      ),
    },
    {
      slug: "smart-sneakers",
      name: text("اسنیکر شیک", "Smart Sneakers", "أحذية رياضية أنيقة"),
      description: text(
        "اسنیکرهای مینیمال برای استایل روزمره‌ای که همچنان تمیز و کنترل‌شده می‌ماند.",
        "Minimal smart sneakers for daily outfits that remain clean and composed.",
        "أحذية رياضية بسيطة لإطلالات يومية تبقى نظيفة ومتوازنة.",
      ),
    },
    {
      slug: "monk-strap-shoes",
      name: text("کفش مانک‌استرپ", "Monk-Strap Shoes", "أحذية مونك ستراب"),
      description: text(
        "کفش‌های مانک‌استرپ برای ظاهر رسمی‌تر با جزئیات متمایز و کنترل‌شده.",
        "Monk-strap shoes for a sharper formal look with distinctive restrained detail.",
        "أحذية مونك ستراب لإطلالة رسمية أكثر حدة بتفاصيل مميزة وهادئة.",
      ),
    },
  ],
  "sport-coats": [
    {
      slug: "unstructured-jackets",
      name: text("کت نرم و بدون ساختار", "Unstructured Jackets", "سترات غير مبطنة"),
      description: text(
        "کت‌های سبک و نرم برای استایل نیمه‌رسمی که آزادی حرکت و فرم مرتب را با هم دارد.",
        "Light unstructured jackets for smart-casual dressing with movement and polish.",
        "سترات خفيفة غير مبطنة لإطلالة شبه رسمية تجمع الحركة والأناقة.",
      ),
    },
    {
      slug: "linen-jackets",
      name: text("کت لینن", "Linen Jackets", "سترات كتان"),
      description: text(
        "کت‌های لینن برای روزهای روشن و گرم، با حس تنفس‌پذیر و ظاهر نجیب.",
        "Linen jackets for bright warm days with breathable comfort and noble ease.",
        "سترات كتان للأيام المشرقة والدافئة براحة قابلة للتنفس وأناقة هادئة.",
      ),
    },
    {
      slug: "evening-jackets",
      name: text("کت شب", "Evening Jackets", "سترات مسائية"),
      description: text(
        "کت‌های شب برای مهمانی، شام رسمی و موقعیت‌هایی که جزئیات باید برجسته‌تر باشند.",
        "Evening jackets for dinners, occasions, and moments that call for sharper detail.",
        "سترات مسائية للعشاء والمناسبات واللحظات التي تحتاج إلى تفاصيل أوضح.",
      ),
    },
    {
      slug: "textured-blazers",
      name: text("کت تک بافت‌دار", "Textured Blazers", "بليزرات بملمس"),
      description: text(
        "کت‌های تک با بافت ظریف برای اضافه کردن عمق بصری به استایل‌های مردانه.",
        "Textured blazers that add subtle visual depth to refined menswear looks.",
        "بليزرات بملمس ناعم تضيف عمقاً بصرياً إلى الإطلالات الرجالية الأنيقة.",
      ),
    },
  ],
  suits: [
    {
      slug: "business-suits",
      name: text("کت‌وشلوار کاری", "Business Suits", "بدلات عمل"),
      description: text(
        "کت‌وشلوارهای کاری با تناسب دقیق برای جلسات، دفتر و روزهای رسمی طولانی.",
        "Business suits with precise proportions for meetings, office days, and formal work.",
        "بدلات عمل بتناسق دقيق للاجتماعات والمكتب والأيام الرسمية الطويلة.",
      ),
    },
    {
      slug: "ceremony-suits",
      name: text("کت‌وشلوار مراسم", "Ceremony Suits", "بدلات مناسبات"),
      description: text(
        "کت‌وشلوارهای مراسم برای جشن، مهمانی رسمی و موقعیت‌هایی با حضور جدی‌تر.",
        "Ceremony suits for celebrations, formal events, and more considered presence.",
        "بدلات مناسبات للاحتفالات والفعاليات الرسمية والحضور الأكثر تميزاً.",
      ),
    },
    {
      slug: "tuxedos",
      name: text("تاکسیدو", "Tuxedos", "توكسيدو"),
      description: text(
        "تاکسیدوهای رسمی با جزئیات شبانه برای مراسم، ضیافت و لحظه‌های خاص.",
        "Formal tuxedos with evening detail for ceremonies, receptions, and special moments.",
        "توكسيدو رسمي بتفاصيل مسائية للمراسم والضيافات واللحظات الخاصة.",
      ),
    },
    {
      slug: "travel-suits",
      name: text("کت‌وشلوار سفر", "Travel Suits", "بدلات سفر"),
      description: text(
        "کت‌وشلوارهایی با راحتی بیشتر برای سفر کاری، جابه‌جایی و برنامه‌های فشرده.",
        "Travel suits with added ease for business trips, movement, and full schedules.",
        "بدلات سفر براحة أكبر لرحلات العمل والتنقل والبرامج المزدحمة.",
      ),
    },
  ],
  accessories: [
    {
      slug: "cufflinks",
      name: text("دکمه سردست", "Cufflinks", "أزرار أكمام"),
      description: text(
        "دکمه‌سردست‌های ظریف برای تکمیل پیراهن رسمی و اضافه کردن امضای شخصی.",
        "Refined cufflinks that complete formal shirts with a personal signature.",
        "أزرار أكمام راقية تكمل القمصان الرسمية بلمسة شخصية.",
      ),
    },
    {
      slug: "pocket-squares",
      name: text("پوشت", "Pocket Squares", "مناديل الجيب"),
      description: text(
        "پوشت‌های ابریشمی و پارچه‌ای برای اضافه کردن رنگ، بافت و وقار به کت.",
        "Silk and fabric pocket squares that add color, texture, and composure to jackets.",
        "مناديل جيب حريرية وقماشية تضيف اللون والملمس والوقار إلى السترة.",
      ),
    },
    {
      slug: "wallets-cardholders",
      name: text("کیف پول و جاکارتی", "Wallets & Cardholders", "محافظ وبطاقات"),
      description: text(
        "کیف پول و جاکارتی چرمی برای حمل روزانه با فرم مینیمال و ساخت تمیز.",
        "Leather wallets and cardholders for daily carry with minimal form and clean build.",
        "محافظ وبطاقات جلدية للحمل اليومي بتصميم بسيط وبناء نظيف.",
      ),
    },
    {
      slug: "belts",
      name: text("کمربند", "Belts", "أحزمة"),
      description: text(
        "کمربندهای چرمی برای اتصال دقیق پیراهن، شلوار و کفش در یک ظاهر کامل.",
        "Leather belts that connect shirt, trousers, and shoes into a complete look.",
        "أحزمة جلدية تربط القميص والسروال والحذاء في إطلالة مكتملة.",
      ),
    },
  ],
  fragrances: [
    {
      slug: "woody-fragrances",
      name: text("رایحه چوبی", "Woody Fragrances", "عطور خشبية"),
      description: text(
        "رایحه‌های چوبی با عمق گرم و مردانه برای امضای روزانه و شبانه.",
        "Woody fragrances with warm masculine depth for day and evening signatures.",
        "عطور خشبية بعمق دافئ ورجالي للتوقيع اليومي والمسائي.",
      ),
    },
    {
      slug: "fresh-fragrances",
      name: text("رایحه تازه", "Fresh Fragrances", "عطور منعشة"),
      description: text(
        "رایحه‌های تازه و تمیز برای شروع روز، قرارهای کاری و فصل‌های روشن.",
        "Fresh clean fragrances for the start of the day, business meetings, and bright seasons.",
        "عطور منعشة ونظيفة لبداية اليوم واجتماعات العمل والمواسم المشرقة.",
      ),
    },
    {
      slug: "amber-fragrances",
      name: text("رایحه آمبری", "Amber Fragrances", "عطور عنبرية"),
      description: text(
        "رایحه‌های آمبری با گرمای عمیق برای شب، مهمانی و حضور ماندگار.",
        "Amber fragrances with deep warmth for evenings, gatherings, and lasting presence.",
        "عطور عنبرية بدفء عميق للمساء والمناسبات والحضور الدائم.",
      ),
    },
    {
      slug: "signature-fragrances",
      name: text("رایحه امضا", "Signature Fragrances", "عطور التوقيع"),
      description: text(
        "رایحه‌هایی برای ساختن هویت شخصی؛ متعادل، ماندگار و مناسب استفاده روزانه.",
        "Fragrances made for personal identity: balanced, lasting, and suitable for daily use.",
        "عطور لصناعة الهوية الشخصية؛ متوازنة وثابتة ومناسبة للاستخدام اليومي.",
      ),
    },
  ],
};

function slugLabel(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function pageContentFor(seed, imageId) {
  return {
    primaryBanner: {
      imageId,
      objectFit: "cover",
      objectPosition: "center",
      eyebrow: text("انتخاب نجیب‌زاده", "Najibzadeh Selection", "اختيارات نجيب زاده"),
      heading: seed.name,
      body: seed.description,
      ctaLabel: text("مشاهده محصولات", "View Products", "تصفح المنتجات"),
      ctaHref: `/shop?subcategory=${seed.slug}`,
    },
    primaryDescription: {
      heading: text(
        "جزئیاتی برای ساختن استایل کامل",
        "Details for a complete look",
        "تفاصيل لإطلالة مكتملة",
      ),
      body: seed.description,
    },
    secondaryBanner: {
      imageId,
      objectFit: "cover",
      objectPosition: "center",
      eyebrow: text("راهنمای انتخاب", "Selection Guide", "دليل الاختيار"),
      heading: text(
        "فرم، کاربرد و هماهنگی",
        "Shape, use, and harmony",
        "الشكل والاستخدام والانسجام",
      ),
      body: seed.description,
      ctaLabel: text("ورود به فروشگاه", "Enter the Shop", "ادخل المتجر"),
      ctaHref: `/shop?subcategory=${seed.slug}`,
    },
    secondaryDescription: {
      heading: text(
        "برای چه موقعیتی مناسب است؟",
        "Where it works best",
        "أين يناسب أكثر",
      ),
      body: seed.description,
    },
    seoTitle: seed.name,
    seoDescription: seed.description,
  };
}

function categoryImageId(category, placeholderImageId) {
  return (
    category.thumbnailImageId ??
    category.pageContent?.primaryBanner?.imageId ??
    category.pageContent?.secondaryBanner?.imageId ??
    placeholderImageId
  );
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || "najib",
    serverSelectionTimeoutMS: 10000,
  });

  const db = mongoose.connection.db;
  const categories = db.collection("categories");
  const subcategories = db.collection("subcategories");
  const images = db.collection("imageassets");

  const placeholder = await images.findOne(
    { isActive: true },
    { projection: { _id: 1 } },
  );

  const categoryDocs = await categories
    .find({ isActive: true })
    .project({
      _id: 1,
      slug: 1,
      name: 1,
      sortOrder: 1,
      thumbnailImageId: 1,
      pageContent: 1,
    })
    .sort({ sortOrder: 1, _id: 1 })
    .toArray();

  const results = [];

  for (const category of categoryDocs) {
    const seeds = plannedSubcategories[category.slug] ?? [];
    const imageId = categoryImageId(category, placeholder?._id);

    if (!imageId) {
      throw new Error(
        `Category ${category.slug} needs an image or at least one active image must exist.`,
      );
    }

    const existing = await subcategories
      .find({ categoryId: category._id })
      .project({ _id: 1, slug: 1, isActive: 1, sortOrder: 1 })
      .sort({ sortOrder: 1, _id: 1 })
      .toArray();

    const existingBySlug = new Map(existing.map((item) => [item.slug, item]));
    let activeCount = existing.filter((item) => item.isActive !== false).length;
    const maxSortOrder = existing.reduce(
      (max, item) => Math.max(max, Number(item.sortOrder ?? 0)),
      0,
    );
    let nextSortOrder = maxSortOrder + 1;
    const categoryResult = {
      category: category.slug,
      before: activeCount,
      created: [],
      activated: [],
      after: activeCount,
    };

    for (const seed of seeds) {
      if (activeCount >= 4) break;

      const matched = existingBySlug.get(seed.slug);
      if (matched) {
        if (matched.isActive === false) {
          await subcategories.updateOne(
            { _id: matched._id },
            {
              $set: {
                isActive: true,
                updatedAt: now,
              },
            },
          );
          activeCount += 1;
          categoryResult.activated.push(seed.slug);
        }
        continue;
      }

      await subcategories.insertOne({
        categoryId: category._id,
        name: seed.name,
        slug: seed.slug,
        description: seed.description,
        thumbnailImageId: imageId,
        thumbnailObjectFit: "cover",
        thumbnailObjectPosition: "center",
        pageContent: pageContentFor(seed, imageId),
        isActive: true,
        sortOrder: nextSortOrder,
        createdAt: now,
        updatedAt: now,
      });

      activeCount += 1;
      nextSortOrder += 1;
      categoryResult.created.push(seed.slug);
    }

    if (activeCount < 4) {
      const categoryName = category.name?.en || category.name?.fa || slugLabel(category.slug);
      for (let index = activeCount + 1; index <= 4; index += 1) {
        const seed = {
          slug: `${category.slug}-selection-${index}`,
          name: text(
            `${category.name?.fa ?? categoryName} انتخاب ${index}`,
            `${categoryName} Selection ${index}`,
            `${category.name?.ar ?? categoryName} اختيار ${index}`,
          ),
          description: text(
            `گزیده‌ای از ${category.name?.fa ?? categoryName} برای کامل کردن استایل نجیب‌زاده.`,
            `A considered ${categoryName} selection for completing a Najibzadeh look.`,
            `مختارات من ${category.name?.ar ?? categoryName} لإكمال إطلالة نجيب زاده.`,
          ),
        };

        await subcategories.insertOne({
          categoryId: category._id,
          name: seed.name,
          slug: seed.slug,
          description: seed.description,
          thumbnailImageId: imageId,
          thumbnailObjectFit: "cover",
          thumbnailObjectPosition: "center",
          pageContent: pageContentFor(seed, imageId),
          isActive: true,
          sortOrder: nextSortOrder,
          createdAt: now,
          updatedAt: now,
        });

        activeCount += 1;
        nextSortOrder += 1;
        categoryResult.created.push(seed.slug);
      }
    }

    categoryResult.after = activeCount;
    results.push(categoryResult);
  }

  console.log(JSON.stringify({ results }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
