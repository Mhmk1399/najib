import mongoose from "mongoose";

const id = (value) => new mongoose.Types.ObjectId(value);
const text = (fa, en, ar) => ({ fa, en, ar });

const now = new Date();

const categories = [
  {
    slug: "formalwear",
    sortOrder: 1,
    thumbnailImageId: id("6aaa81cbf8d029516eb45294"),
    name: text("پوشاک رسمی", "Formalwear", "الملابس الرسمية"),
    description: text(
      "کت، شلوار و آیتم‌های رسمی مردانه برای مراسم، جلسات مهم و لحظه‌هایی که ظاهر دقیق اهمیت دارد.",
      "Tailored menswear for ceremonies, important meetings, and moments where precision matters.",
      "ملابس رجالية مصممة للمناسبات والاجتماعات المهمة واللحظات التي تتطلب أناقة دقيقة.",
    ),
    pageContent: {
      primaryBanner: {
        imageId: id("6aae929242073fa27d377b61"),
        objectFit: "cover",
        objectPosition: "center",
        eyebrow: text("ویرایش رسمی", "Formal Edit", "مختارات رسمية"),
        heading: text(
          "تشریفات با برش نجیب‌زاده",
          "Ceremony-ready tailoring",
          "خياطة راقية للمناسبات",
        ),
        body: text(
          "از کت‌وشلوارهای دقیق تا پیراهن‌های تمیز، این مجموعه برای حضورهای جدی و بی‌نقص ساخته شده است.",
          "From precise suits to refined shirts, this category is built for confident, composed occasions.",
          "من البدلات الدقيقة إلى القمصان المصقولة، صُممت هذه المجموعة لحضور واثق ومتزن.",
        ),
        ctaLabel: text(
          "مشاهده پوشاک رسمی",
          "View formalwear",
          "تصفح الملابس الرسمية",
        ),
        ctaHref: "/shop?category=formalwear",
      },
      primaryDescription: {
        heading: text(
          "برای موقعیت‌هایی که جزئیات دیده می‌شوند",
          "For moments where details are noticed",
          "للمواقف التي تُلاحظ فيها التفاصيل",
        ),
        body: text(
          "پوشاک رسمی نجیب‌زاده روی فرم، تناسب و حس لوکس پارچه تمرکز دارد. هر انتخاب باید روی بدن آرام بنشیند، خط شانه را تمیز نشان دهد و در نور طبیعی و فضای رسمی همان‌قدر قدرتمند بماند.",
          "Najibzadeh formalwear focuses on structure, proportion, and the quiet luxury of fabric. Each piece is selected to sit cleanly on the body, sharpen the shoulder line, and remain composed in formal settings.",
          "تركز الملابس الرسمية من نجيب زاده على البنية والتناسب وفخامة القماش الهادئة. كل قطعة مختارة لتجلس بانسيابية على الجسم وتبرز خط الكتف بأناقة في البيئات الرسمية.",
        ),
      },
      secondaryBanner: {
        imageId: id("6aa7f4a3a0c99d58b33909fb"),
        objectFit: "cover",
        objectPosition: "center",
        eyebrow: text("جزئیات امضا", "Signature Details", "تفاصيل مميزة"),
        heading: text(
          "ساختار، پارچه، وقار",
          "Structure, fabric, presence",
          "بنية وقماش وحضور",
        ),
        body: text(
          "برای تکمیل ظاهر رسمی، سراغ آیتم‌هایی بروید که به جای اغراق، تناسب و کیفیت را نمایش می‌دهند.",
          "Complete the formal look with pieces that express proportion and quality instead of excess.",
          "أكمل الإطلالة الرسمية بقطع تعكس التناسب والجودة بعيداً عن المبالغة.",
        ),
        ctaLabel: text("ورود به فروشگاه", "Enter the shop", "ادخل المتجر"),
        ctaHref: "/shop?category=formalwear",
      },
      secondaryDescription: {
        heading: text(
          "یک کمد رسمی، چند انتخاب درست",
          "A formal wardrobe, edited well",
          "خزانة رسمية مختارة بعناية",
        ),
        body: text(
          "برای شروع، رنگ‌های عمیق، پیراهن‌های روشن و کفش‌های ساده را کنار هم قرار دهید. نتیجه استایلی است که بدون شلوغی، جدیت و شخصیت را منتقل می‌کند.",
          "Start with deep tones, crisp shirts, and restrained footwear. The result is a wardrobe that communicates discipline and character without visual noise.",
          "ابدأ بدرجات عميقة وقمصان نقية وأحذية هادئة. النتيجة خزانة تعكس الانضباط والشخصية دون ازدحام بصري.",
        ),
      },
      seoTitle: text(
        "پوشاک رسمی مردانه نجیب‌زاده",
        "Najibzadeh Men’s Formalwear",
        "الملابس الرسمية الرجالية من نجيب زاده",
      ),
      seoDescription: text(
        "خرید کت‌وشلوار، پیراهن و آیتم‌های رسمی مردانه با طراحی دقیق و کیفیت ممتاز در نجیب‌زاده.",
        "Shop men’s suits, shirts, and formal essentials with precise design and premium quality at Najibzadeh.",
        "تسوق البدلات والقمصان والقطع الرسمية الرجالية بتصميم دقيق وجودة فاخرة من نجيب زاده.",
      ),
    },
  },
  {
    slug: "mens-shirts",
    sortOrder: 2,
    thumbnailImageId: id("6aaa81e2f8d029516eb452ad"),
    name: text("پیراهن مردانه", "Men’s Shirts", "قمصان رجالية"),
    description: text(
      "پیراهن‌های مردانه برای استایل رسمی، روزمره و لایه‌سازی تمیز زیر کت و بافت.",
      "Men’s shirts for formal dressing, everyday refinement, and clean layering under jackets or knitwear.",
      "قمصان رجالية للإطلالات الرسمية واليومية والطبقات الأنيقة تحت السترات أو التريكو.",
    ),
    pageContent: {
      primaryBanner: {
        imageId: id("6aa91e3db3abe7446baf227b"),
        objectFit: "cover",
        objectPosition: "center",
        eyebrow: text("پیراهن‌های منتخب", "Shirt Selection", "مختارات القمصان"),
        heading: text(
          "خط تمیز، یقه دقیق، حضور آرام",
          "Clean lines, precise collars, quiet presence",
          "خطوط نظيفة وياقات دقيقة وحضور هادئ",
        ),
        body: text(
          "پیراهن خوب پایه‌ی استایل مردانه است؛ چه زیر کت رسمی باشد، چه کنار شلوار روزمره.",
          "A good shirt anchors a man’s wardrobe, whether worn beneath tailoring or with everyday trousers.",
          "القميص الجيد هو أساس خزانة الرجل، سواء ارتدي تحت البدلة أو مع بنطال يومي.",
        ),
        ctaLabel: text("مشاهده پیراهن‌ها", "View shirts", "تصفح القمصان"),
        ctaHref: "/shop?category=mens-shirts",
      },
      primaryDescription: {
        heading: text(
          "از دفتر تا قرار شبانه",
          "From office hours to evening plans",
          "من ساعات العمل إلى مواعيد المساء",
        ),
        body: text(
          "در این دسته روی پارچه‌هایی تمرکز شده که تنفس‌پذیر، خوش‌فرم و قابل اتکا باشند. فرم یقه، طول آستین و نسبت دکمه‌ها طوری انتخاب می‌شوند که پیراهن در استایل رسمی و نیمه‌رسمی تمیز بماند.",
          "This category focuses on breathable, reliable fabrics with a composed shape. Collar form, sleeve length, and button spacing are chosen so each shirt works cleanly across formal and smart-casual looks.",
          "تركز هذه الفئة على أقمشة مريحة وموثوقة وتحافظ على شكلها. صُممت الياقات وطول الأكمام وتوزيع الأزرار لتناسب الإطلالات الرسمية وشبه الرسمية.",
        ),
      },
      secondaryBanner: {
        imageId: id("6aa91e67b3abe7446baf227f"),
        objectFit: "cover",
        objectPosition: "center",
        eyebrow: text("ساختار روزانه", "Daily Structure", "بنية يومية"),
        heading: text(
          "پیراهنی که استایل را مرتب نگه می‌دارد",
          "The shirt that keeps the look composed",
          "القميص الذي يحافظ على أناقة الإطلالة",
        ),
        body: text(
          "برای انتخاب دقیق‌تر، به فرم یقه، ضخامت پارچه و رنگی فکر کنید که با کت و کفش شما هماهنگ می‌شود.",
          "For a sharper choice, consider collar shape, fabric weight, and the color that works with your jackets and shoes.",
          "لاختيار أدق، انتبه إلى شكل الياقة وسماكة القماش واللون المتناسق مع ستراتك وأحذيتك.",
        ),
        ctaLabel: text("انتخاب پیراهن", "Choose a shirt", "اختر قميصاً"),
        ctaHref: "/shop?category=mens-shirts",
      },
      secondaryDescription: {
        heading: text(
          "یک پیراهن، چند خوانش متفاوت",
          "One shirt, several moods",
          "قميص واحد بإطلالات متعددة",
        ),
        body: text(
          "پیراهن سفید یا آبی روشن با کت رسمی جدی می‌شود، با شلوار کتان آرام‌تر دیده می‌شود و زیر بافت ظریف، عمق بیشتری به استایل می‌دهد.",
          "A white or pale blue shirt turns formal under tailoring, relaxes with cotton trousers, and adds depth beneath fine knitwear.",
          "القميص الأبيض أو الأزرق الفاتح يبدو رسمياً تحت البدلة، وأكثر هدوءاً مع بنطال قطني، ويضيف عمقاً تحت التريكو الناعم.",
        ),
      },
      seoTitle: text(
        "پیراهن مردانه نجیب‌زاده",
        "Najibzadeh Men’s Shirts",
        "قمصان رجالية من نجيب زاده",
      ),
      seoDescription: text(
        "خرید پیراهن مردانه رسمی و روزمره با پارچه باکیفیت، فرم دقیق و طراحی سه‌زبانه در نجیب‌زاده.",
        "Shop men’s formal and everyday shirts with premium fabrics, precise fit, and refined styling at Najibzadeh.",
        "تسوق قمصاناً رجالية رسمية ويومية بخامات فاخرة وقصات دقيقة من نجيب زاده.",
      ),
    },
  },
  {
    slug: "smart-casual",
    sortOrder: 3,
    thumbnailImageId: id("6aaa8089f8d029516eb451ad"),
    name: text("استایل روزمره", "Smart Casual", "أناقة يومية"),
    description: text(
      "آیتم‌های خوش‌ساخت برای روزهایی که راحتی و وقار باید کنار هم باشند.",
      "Well-crafted pieces for days when ease and polish need to work together.",
      "قطع متقنة للأيام التي تجمع بين الراحة والأناقة.",
    ),
    pageContent: {
      primaryBanner: {
        imageId: id("6aaa8087f8d029516eb451ab"),
        objectFit: "cover",
        objectPosition: "center",
        eyebrow: text("روزمره دقیق", "Smart Casual", "أناقة يومية"),
        heading: text(
          "راحتی بدون از دست دادن فرم",
          "Ease without losing structure",
          "راحة دون فقدان البنية",
        ),
        body: text(
          "برای روزهای پررفت‌وآمد، لباس‌هایی انتخاب کنید که آزاد حرکت کنند اما ظاهر را منظم نگه دارند.",
          "For active days, choose clothes that move easily while keeping the silhouette composed.",
          "للأيام المزدحمة، اختر ملابس تمنحك حرية الحركة وتحافظ على شكل الإطلالة.",
        ),
        ctaLabel: text(
          "مشاهده استایل روزمره",
          "View smart casual",
          "تصفح الأناقة اليومية",
        ),
        ctaHref: "/shop?category=smart-casual",
      },
      primaryDescription: {
        heading: text(
          "برای فاصله‌ی میان رسمی و راحت",
          "Between formal and relaxed",
          "بين الرسمي والمريح",
        ),
        body: text(
          "استایل روزمره نجیب‌زاده برای موقعیت‌هایی ساخته شده که کت‌وشلوار کامل زیادی رسمی است و لباس خیلی ساده کافی نیست. تمرکز روی رنگ‌های قابل ترکیب، پارچه‌های ماندگار و فرم‌های آرام است.",
          "Najibzadeh smart casual is made for moments where a full suit feels too formal and plain basics are not enough. The focus is on versatile colors, durable fabrics, and relaxed structure.",
          "صُممت أناقة نجيب زاده اليومية للمواقف التي تكون فيها البدلة الكاملة رسمية أكثر من اللازم والملابس البسيطة غير كافية. التركيز على ألوان سهلة التنسيق وأقمشة متينة وقصات هادئة.",
        ),
      },
      secondaryBanner: {
        imageId: id("6aaa80a2f8d029516eb451b1"),
        objectFit: "cover",
        objectPosition: "center",
        eyebrow: text("کمد منعطف", "Flexible Wardrobe", "خزانة مرنة"),
        heading: text(
          "لباس‌هایی که با برنامه‌ی روز حرکت می‌کنند",
          "Pieces that move with the day",
          "قطع تتحرك مع يومك",
        ),
        body: text(
          "با چند انتخاب درست، از جلسه نیمه‌رسمی تا قرار عصرگاهی یک ظاهر منسجم خواهید داشت.",
          "With a few considered choices, your look stays coherent from a relaxed meeting to an evening plan.",
          "ببضع اختيارات مدروسة، تبقى إطلالتك متماسكة من اجتماع هادئ إلى موعد مسائي.",
        ),
        ctaLabel: text("ساختن استایل", "Build the look", "نسق الإطلالة"),
        ctaHref: "/shop?category=smart-casual",
      },
      secondaryDescription: {
        heading: text(
          "کمتر شلوغ، بیشتر قابل استفاده",
          "Less noise, more use",
          "تفاصيل أقل واستخدام أكثر",
        ),
        body: text(
          "رنگ‌های خنثی، بافت‌های طبیعی و برش‌های تمیز باعث می‌شوند هر آیتم با چند ترکیب مختلف کار کند و کمد روزمره شما سنگین نشود.",
          "Neutral tones, natural textures, and clean cuts let each piece work across several outfits without making the wardrobe feel heavy.",
          "تسمح الدرجات الحيادية والملمس الطبيعي والقصات النظيفة لكل قطعة بالعمل ضمن تنسيقات متعددة دون إثقال الخزانة.",
        ),
      },
      seoTitle: text(
        "استایل روزمره مردانه نجیب‌زاده",
        "Najibzadeh Smart Casual Menswear",
        "أناقة يومية رجالية من نجيب زاده",
      ),
      seoDescription: text(
        "خرید آیتم‌های smart casual مردانه برای استایل روزمره شیک، راحت و خوش‌ساخت در نجیب‌زاده.",
        "Shop smart casual menswear for polished, comfortable daily style at Najibzadeh.",
        "تسوق قطع smart casual رجالية لإطلالة يومية أنيقة ومريحة من نجيب زاده.",
      ),
    },
  },
];

const imageAlts = {
  "6aaa81cbf8d029516eb45294": text(
    "نمای نزدیک پوشاک رسمی مردانه نجیب‌زاده",
    "Najibzadeh men’s formalwear detail",
    "تفاصيل ملابس رسمية رجالية من نجيب زاده",
  ),
  "6aae929242073fa27d377b61": text(
    "بنر پوشاک رسمی مردانه",
    "Men’s formalwear banner",
    "بنر الملابس الرسمية الرجالية",
  ),
  "6aa7f4a3a0c99d58b33909fb": text(
    "استایل رسمی مردانه در فضای لوکس",
    "Luxury men’s formal style",
    "إطلالة رسمية رجالية فاخرة",
  ),
  "6aaa81e2f8d029516eb452ad": text(
    "پیراهن مردانه با پارچه روشن",
    "Men’s light fabric shirt",
    "قميص رجالي بقماش فاتح",
  ),
  "6aa91e3db3abe7446baf227b": text(
    "بنر پیراهن مردانه رسمی",
    "Formal men’s shirt banner",
    "بنر قميص رجالي رسمي",
  ),
  "6aa91e67b3abe7446baf227f": text(
    "پیراهن مردانه برای استایل روزانه",
    "Men’s shirt for daily styling",
    "قميص رجالي لإطلالة يومية",
  ),
  "6aaa8089f8d029516eb451ad": text(
    "اکسسوری و آیتم‌های روزمره مردانه",
    "Men’s everyday accessories and essentials",
    "إكسسوارات وقطع يومية رجالية",
  ),
  "6aaa8087f8d029516eb451ab": text(
    "بنر استایل روزمره مردانه",
    "Men’s smart casual banner",
    "بنر أناقة يومية رجالية",
  ),
  "6aaa80a2f8d029516eb451b1": text(
    "استایل روزمره مردانه با نور گرم",
    "Warm editorial men’s casual style",
    "إطلالة يومية رجالية بإضاءة دافئة",
  ),
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || "najib",
    serverSelectionTimeoutMS: 5000,
  });

  const db = mongoose.connection.db;
  const categoryCollection = db.collection("categories");
  const imageCollection = db.collection("imageassets");

  for (const category of categories) {
    await categoryCollection.updateOne(
      { slug: category.slug },
      {
        $set: {
          ...category,
          thumbnailObjectFit: "cover",
          thumbnailObjectPosition: "center",
          isActive: true,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
  }

  for (const [imageId, alt] of Object.entries(imageAlts)) {
    await imageCollection.updateOne(
      { _id: id(imageId) },
      { $set: { alt, updatedAt: now } },
    );
  }

  const updated = await categoryCollection
    .find(
      { slug: { $in: categories.map((category) => category.slug) } },
      {
        projection: {
          slug: 1,
          name: 1,
          description: 1,
          sortOrder: 1,
          isActive: 1,
          "pageContent.primaryBanner.heading": 1,
          "pageContent.secondaryBanner.heading": 1,
          "pageContent.seoTitle": 1,
        },
      },
    )
    .sort({ sortOrder: 1 })
    .toArray();

  console.log(JSON.stringify(updated, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
