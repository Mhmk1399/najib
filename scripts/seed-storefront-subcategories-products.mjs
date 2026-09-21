import mongoose from "mongoose";

const id = (value) => new mongoose.Types.ObjectId(value);
const text = (fa, en, ar) => ({ fa, en, ar });
const list = (fa, en, ar) => ({ fa, en, ar });
const now = new Date();

const imageIds = {
  suitA: "6aaa8479f8d029516eb4547b",
  suitB: "6aaa8476f8d029516eb45479",
  suitC: "6aaa8475f8d029516eb45477",
  shirtA: "6aaa8456f8d029516eb45453",
  shirtB: "6aaa8456f8d029516eb45451",
  shirtC: "6aaa8454f8d029516eb4544f",
  casualA: "6aaa83f5f8d029516eb45428",
  casualB: "6aaa8367f8d029516eb453ea",
  casualC: "6aa94add0a9ace590c651a5a",
  casualD: "6aa94adc0a9ace590c651a58",
  subA: "6aaa8127f8d029516eb451e9",
  subB: "6aaa8114f8d029516eb451e5",
  subC: "6aaa8114f8d029516eb451e3",
  subD: "6aa91ec9b3abe7446baf22a5",
  subE: "6aa91eafb3abe7446baf22a1",
  subF: "6aa91eaeb3abe7446baf229f",
};

const colors = [
  {
    slug: "midnight-black",
    name: text("مشکی نیمه‌شب", "Midnight Black", "أسود منتصف الليل"),
    family: text("مشکی", "Black", "أسود"),
    hex: "#111111",
    sortOrder: 1,
  },
  {
    slug: "navy-blue",
    name: text("سرمه‌ای کلاسیک", "Classic Navy", "كحلي كلاسيكي"),
    family: text("آبی", "Blue", "أزرق"),
    hex: "#162033",
    sortOrder: 2,
  },
  {
    slug: "charcoal-gray",
    name: text("ذغالی", "Charcoal Gray", "رمادي فحمي"),
    family: text("خاکستری", "Gray", "رمادي"),
    hex: "#343434",
    sortOrder: 3,
  },
  {
    slug: "soft-white",
    name: text("سفید نرم", "Soft White", "أبيض ناعم"),
    family: text("سفید", "White", "أبيض"),
    hex: "#F5F1E8",
    sortOrder: 4,
  },
  {
    slug: "warm-beige",
    name: text("بژ گرم", "Warm Beige", "بيج دافئ"),
    family: text("بژ", "Beige", "بيج"),
    hex: "#BBA88E",
    sortOrder: 5,
  },
  {
    slug: "olive-green",
    name: text("سبز زیتونی", "Olive Green", "أخضر زيتوني"),
    family: text("سبز", "Green", "أخضر"),
    hex: "#55624A",
    sortOrder: 6,
  },
];

const sizeGroup = {
  code: "MENS-READY-TO-WEAR",
  name: text("پوشاک مردانه", "Men’s Ready-to-Wear", "ملابس رجالية جاهزة"),
};

const sizes = [
  { code: "S", name: text("کوچک", "Small", "صغير"), sortOrder: 1 },
  { code: "M", name: text("متوسط", "Medium", "متوسط"), sortOrder: 2 },
  { code: "L", name: text("بزرگ", "Large", "كبير"), sortOrder: 3 },
  { code: "XL", name: text("خیلی بزرگ", "Extra Large", "كبير جداً"), sortOrder: 4 },
];

const subcategories = [
  {
    categorySlug: "formalwear",
    slug: "suits",
    sortOrder: 1,
    thumbnailImageId: imageIds.subA,
    name: text("کت‌وشلوار", "Suits", "بدلات"),
    description: text(
      "کت‌وشلوارهای مردانه برای مراسم رسمی، جلسات و استایل‌های دقیق.",
      "Men’s suits for ceremonies, meetings, and polished formal styling.",
      "بدلات رجالية للمناسبات والاجتماعات والإطلالات الرسمية المصقولة.",
    ),
    hero: {
      eyebrow: text("خط رسمی", "Formal Line", "خط رسمي"),
      heading: text("کت‌وشلوارهایی با فرم مطمئن", "Suits with confident structure", "بدلات ببنية واثقة"),
      body: text(
        "برای موقعیت‌هایی که فرم، پارچه و تناسب باید بی‌نقص کنار هم قرار بگیرند.",
        "For occasions where structure, fabric, and proportion need to work perfectly together.",
        "للمناسبات التي يجب أن تجتمع فيها البنية والقماش والتناسب بشكل مثالي.",
      ),
    },
  },
  {
    categorySlug: "formalwear",
    slug: "tuxedos",
    sortOrder: 2,
    thumbnailImageId: imageIds.subB,
    name: text("تاکسیدو و مراسم", "Tuxedos & Ceremony", "توكسيدو ومناسبات"),
    description: text(
      "انتخاب‌های رسمی‌تر برای مهمانی شب، مراسم و لحظه‌های تشریفاتی.",
      "Sharper evening options for ceremonies, events, and black-tie moments.",
      "خيارات مسائية أكثر رسمية للمناسبات واللحظات الاحتفالية.",
    ),
    hero: {
      eyebrow: text("مراسم شب", "Evening Ceremony", "مراسم مسائية"),
      heading: text("لباس‌هایی برای حضور تشریفاتی", "Pieces for ceremonial presence", "قطع لحضور احتفالي"),
      body: text(
        "تمرکز روی رنگ‌های عمیق، یقه‌های دقیق و جزئیاتی است که زیر نور شب خوانا می‌مانند.",
        "Deep tones, precise lapels, and details that remain legible under evening light.",
        "درجات عميقة وياقات دقيقة وتفاصيل تبقى واضحة تحت إضاءة المساء.",
      ),
    },
  },
  {
    categorySlug: "mens-shirts",
    slug: "dress-shirts",
    sortOrder: 1,
    thumbnailImageId: imageIds.subC,
    name: text("پیراهن رسمی", "Dress Shirts", "قمصان رسمية"),
    description: text(
      "پیراهن‌های رسمی با یقه دقیق، پارچه خوش‌فرم و رنگ‌های قابل ترکیب.",
      "Formal shirts with precise collars, composed fabrics, and versatile colors.",
      "قمصان رسمية بياقات دقيقة وأقمشة ثابتة وألوان سهلة التنسيق.",
    ),
    hero: {
      eyebrow: text("پایه رسمی", "Formal Foundation", "أساس رسمي"),
      heading: text("پیراهنی که کت را کامل می‌کند", "The shirt that completes tailoring", "القميص الذي يكمل البدلة"),
      body: text(
        "برای زیر کت رسمی یا کنار شلوار پارچه‌ای، فرم یقه و تمیزی دوخت تعیین‌کننده است.",
        "Under a jacket or with tailored trousers, collar shape and clean stitching make the difference.",
        "تحت السترة أو مع بنطال رسمي، يصنع شكل الياقة ونظافة الخياطة الفرق.",
      ),
    },
  },
  {
    categorySlug: "mens-shirts",
    slug: "casual-shirts",
    sortOrder: 2,
    thumbnailImageId: imageIds.subD,
    name: text("پیراهن روزمره", "Casual Shirts", "قمصان يومية"),
    description: text(
      "پیراهن‌هایی سبک‌تر برای استفاده روزانه، سفر و استایل نیمه‌رسمی.",
      "Lighter shirts for daily wear, travel, and relaxed smart styling.",
      "قمصان أخف للاستخدام اليومي والسفر والإطلالات شبه الرسمية.",
    ),
    hero: {
      eyebrow: text("روزمره خوش‌فرم", "Refined Daily Wear", "يومي مصقول"),
      heading: text("آزادتر، اما همچنان مرتب", "More relaxed, still composed", "أكثر راحة مع أناقة ثابتة"),
      body: text(
        "پارچه‌های نرم، رنگ‌های آرام و فرم‌هایی که روی بدن سبک می‌نشینند.",
        "Soft fabrics, calm colors, and silhouettes that sit lightly on the body.",
        "أقمشة ناعمة وألوان هادئة وقصات تجلس بخفة على الجسم.",
      ),
    },
  },
  {
    categorySlug: "smart-casual",
    slug: "blazers",
    sortOrder: 1,
    thumbnailImageId: imageIds.subE,
    name: text("کت تک", "Blazers", "سترات بليزر"),
    description: text(
      "کت‌های تک برای ساختن استایل نیمه‌رسمی، روزمره و قابل اعتماد.",
      "Blazers for reliable smart-casual and everyday polished styling.",
      "سترات بليزر لإطلالات يومية وشبه رسمية موثوقة.",
    ),
    hero: {
      eyebrow: text("فرم منعطف", "Flexible Structure", "بنية مرنة"),
      heading: text("کت تک برای چند موقعیت", "A blazer for several settings", "بليزر لعدة مناسبات"),
      body: text(
        "با شلوار رسمی جدی‌تر می‌شود و با پیراهن یا تی‌شرت تمیز، آرام‌تر دیده می‌شود.",
        "It sharpens with tailored trousers and relaxes with a clean shirt or tee.",
        "يبدو أكثر رسمية مع بنطال مفصل وأكثر هدوءاً مع قميص أو تي شيرت نظيف.",
      ),
    },
  },
  {
    categorySlug: "smart-casual",
    slug: "knitwear",
    sortOrder: 2,
    thumbnailImageId: imageIds.subF,
    name: text("بافت و لایه‌ها", "Knitwear & Layers", "تريكو وطبقات"),
    description: text(
      "بافت‌ها و لایه‌های سبک برای تکمیل استایل روزمره با عمق و بافت.",
      "Knitwear and light layers that add texture and depth to daily looks.",
      "تريكو وطبقات خفيفة تضيف ملمساً وعمقاً للإطلالات اليومية.",
    ),
    hero: {
      eyebrow: text("لایه‌سازی", "Layering", "طبقات"),
      heading: text("گرما، بافت و عمق بصری", "Warmth, texture, and visual depth", "دفء وملمس وعمق بصري"),
      body: text(
        "برای روزهایی که استایل باید راحت بماند اما تخت و ساده دیده نشود.",
        "For days when the look should stay comfortable without feeling flat or plain.",
        "للأيام التي يجب أن تبقى فيها الإطلالة مريحة دون أن تبدو مسطحة أو بسيطة.",
      ),
    },
  },
];

function pageContentFor(subcategory) {
  return {
    primaryBanner: {
      imageId: id(subcategory.thumbnailImageId),
      objectFit: "cover",
      objectPosition: "center",
      eyebrow: subcategory.hero.eyebrow,
      heading: subcategory.hero.heading,
      body: subcategory.hero.body,
      ctaLabel: text("مشاهده محصولات", "View products", "تصفح المنتجات"),
      ctaHref: `/shop?subcategory=${subcategory.slug}`,
    },
    primaryDescription: {
      heading: text(
        "انتخاب‌های دقیق برای کمد مردانه",
        "Considered choices for a man’s wardrobe",
        "اختيارات مدروسة لخزانة الرجل",
      ),
      body: subcategory.description,
    },
    secondaryBanner: {
      imageId: id(subcategory.thumbnailImageId),
      objectFit: "cover",
      objectPosition: "center",
      eyebrow: text("جزئیات کاربردی", "Practical Details", "تفاصيل عملية"),
      heading: text(
        "فرم، جنس و استفاده روزانه",
        "Shape, fabric, and everyday use",
        "الشكل والقماش والاستخدام اليومي",
      ),
      body: text(
        "هر آیتم باید در ترکیب‌های مختلف قابل استفاده باشد و همچنان شخصیت برند را حفظ کند.",
        "Each piece should work across combinations while keeping the brand’s composed character.",
        "يجب أن تعمل كل قطعة ضمن تنسيقات متعددة مع الحفاظ على شخصية العلامة الهادئة.",
      ),
      ctaLabel: text("ورود به فروشگاه", "Enter the shop", "ادخل المتجر"),
      ctaHref: `/shop?subcategory=${subcategory.slug}`,
    },
    secondaryDescription: {
      heading: text("چطور انتخاب کنیم؟", "How to choose", "كيف تختار؟"),
      body: text(
        "با رنگ‌های پایه شروع کنید، بعد بافت و تناسب را بر اساس موقعیت روز انتخاب کنید.",
        "Start with foundational colors, then choose texture and fit around the day’s setting.",
        "ابدأ بالألوان الأساسية، ثم اختر الملمس والقصة حسب مناسبة اليوم.",
      ),
    },
    seoTitle: subcategory.name,
    seoDescription: subcategory.description,
  };
}

const productSpecs = [
  {
    slug: "midnight-wool-suit",
    categorySlug: "formalwear",
    subcategorySlug: "suits",
    name: text("کت‌وشلوار پشمی نیمه‌شب", "Midnight Wool Suit", "بدلة صوفية بلون منتصف الليل"),
    description: text(
      "کت‌وشلوار پشمی با فرم کلاسیک، خط شانه تمیز و رنگی عمیق برای جلسات و مراسم رسمی.",
      "A wool suit with classic structure, a clean shoulder line, and a deep tone for meetings and ceremonies.",
      "بدلة صوفية ببنية كلاسيكية وخط كتف نظيف ولون عميق للاجتماعات والمناسبات.",
    ),
    image: imageIds.suitA,
    colorSlugs: ["midnight-black", "navy-blue"],
    priceMinor: 2480000000,
    fit: text("فیت کلاسیک", "Classic fit", "قصة كلاسيكية"),
    silhouette: text("دو دکمه", "Two-button", "زرّان"),
    pattern: text("ساده", "Solid", "سادة"),
  },
  {
    slug: "charcoal-tailored-suit",
    categorySlug: "formalwear",
    subcategorySlug: "suits",
    name: text("کت‌وشلوار ذغالی رسمی", "Charcoal Tailored Suit", "بدلة رسمية فحمية"),
    description: text(
      "انتخابی متعادل برای مراسم روز و شب با رنگ ذغالی، فرم خوش‌ساخت و پارچه خوش‌افت.",
      "A balanced day-to-evening suit in charcoal with a composed cut and reliable drape.",
      "اختيار متوازن للنهار والمساء بلون فحمي وقصة متقنة وانسياب موثوق.",
    ),
    image: imageIds.suitB,
    colorSlugs: ["charcoal-gray", "midnight-black"],
    priceMinor: 2320000000,
    fit: text("فیت نیمه‌اسلیم", "Semi-slim fit", "قصة شبه ضيقة"),
    silhouette: text("کت ساختارمند", "Structured jacket", "سترة ببنية واضحة"),
    pattern: text("میکرو بافت", "Micro texture", "ملمس دقيق"),
  },
  {
    slug: "black-evening-tuxedo",
    categorySlug: "formalwear",
    subcategorySlug: "tuxedos",
    name: text("تاکسیدوی مشکی شب", "Black Evening Tuxedo", "توكسيدو أسود مسائي"),
    description: text(
      "تاکسیدوی رسمی با یقه براق و فرم کشیده برای مهمانی‌های شب و مناسبت‌های تشریفاتی.",
      "A formal tuxedo with a satin lapel and elongated shape for evening events and ceremonies.",
      "توكسيدو رسمي بياقة ساتان وشكل ممدود للمناسبات المسائية والاحتفالية.",
    ),
    image: imageIds.suitC,
    colorSlugs: ["midnight-black"],
    priceMinor: 2860000000,
    fit: text("فیت رسمی", "Formal fit", "قصة رسمية"),
    silhouette: text("یقه شال", "Shawl lapel", "ياقة شال"),
    pattern: text("ساده براق", "Clean satin detail", "تفصيل ساتان نظيف"),
  },
  {
    slug: "ceremony-navy-dinner-jacket",
    categorySlug: "formalwear",
    subcategorySlug: "tuxedos",
    name: text("کت شام سرمه‌ای مراسم", "Navy Ceremony Dinner Jacket", "سترة سهرة كحلية"),
    description: text(
      "کت شام با رنگ سرمه‌ای عمیق و جزئیات رسمی برای استایل متفاوت در مراسم شب.",
      "A deep navy dinner jacket with formal details for a distinctive evening presence.",
      "سترة سهرة كحلية عميقة بتفاصيل رسمية لحضور مسائي مختلف.",
    ),
    image: imageIds.suitA,
    colorSlugs: ["navy-blue"],
    priceMinor: 1980000000,
    fit: text("فیت دقیق", "Precise fit", "قصة دقيقة"),
    silhouette: text("تک دکمه", "Single-button", "زر واحد"),
    pattern: text("ساده", "Solid", "سادة"),
  },
  {
    slug: "white-poplin-dress-shirt",
    categorySlug: "mens-shirts",
    subcategorySlug: "dress-shirts",
    name: text("پیراهن رسمی پوپلین سفید", "White Poplin Dress Shirt", "قميص بوبلين أبيض رسمي"),
    description: text(
      "پیراهن سفید با پارچه پوپلین، یقه ایستاده و دوخت تمیز برای زیر کت رسمی.",
      "A white poplin shirt with a crisp collar and clean stitching for formal tailoring.",
      "قميص بوبلين أبيض بياقة واضحة وخياطة نظيفة تحت البدلة الرسمية.",
    ),
    image: imageIds.shirtA,
    colorSlugs: ["soft-white"],
    priceMinor: 690000000,
    fit: text("فیت استاندارد", "Regular fit", "قصة عادية"),
    silhouette: text("یقه رسمی", "Dress collar", "ياقة رسمية"),
    pattern: text("ساده", "Solid", "سادة"),
  },
  {
    slug: "blue-oxford-dress-shirt",
    categorySlug: "mens-shirts",
    subcategorySlug: "dress-shirts",
    name: text("پیراهن آکسفورد آبی", "Blue Oxford Dress Shirt", "قميص أكسفورد أزرق"),
    description: text(
      "پیراهن آکسفورد آبی روشن با بافت ملایم برای استایل رسمی و نیمه‌رسمی.",
      "A pale blue Oxford shirt with subtle texture for formal and smart-casual styling.",
      "قميص أكسفورد أزرق فاتح بملمس ناعم للإطلالات الرسمية وشبه الرسمية.",
    ),
    image: imageIds.shirtB,
    colorSlugs: ["navy-blue", "soft-white"],
    priceMinor: 740000000,
    fit: text("فیت راحت", "Comfort fit", "قصة مريحة"),
    silhouette: text("یقه دکمه‌دار", "Button-down collar", "ياقة بأزرار"),
    pattern: text("آکسفورد", "Oxford weave", "نسيج أكسفورد"),
  },
  {
    slug: "sand-linen-casual-shirt",
    categorySlug: "mens-shirts",
    subcategorySlug: "casual-shirts",
    name: text("پیراهن لینن شنی", "Sand Linen Casual Shirt", "قميص كتان رملي"),
    description: text(
      "پیراهن لینن سبک با رنگ بژ گرم برای روزهای روشن، سفر و استایل آرام.",
      "A lightweight linen shirt in warm beige for bright days, travel, and relaxed styling.",
      "قميص كتان خفيف بلون بيج دافئ للأيام المشرقة والسفر والإطلالات الهادئة.",
    ),
    image: imageIds.shirtC,
    colorSlugs: ["warm-beige", "soft-white"],
    priceMinor: 620000000,
    fit: text("فیت آزاد", "Relaxed fit", "قصة فضفاضة"),
    silhouette: text("آستین بلند سبک", "Light long sleeve", "كم طويل خفيف"),
    pattern: text("بافت طبیعی", "Natural weave", "نسيج طبيعي"),
  },
  {
    slug: "olive-knit-collar-shirt",
    categorySlug: "mens-shirts",
    subcategorySlug: "casual-shirts",
    name: text("پیراهن یقه‌بافت زیتونی", "Olive Knit-Collar Shirt", "قميص زيتوني بياقة محاكة"),
    description: text(
      "پیراهن روزمره با حس نرم و یقه‌بافت برای ترکیب با کت تک و شلوار کتان.",
      "A soft daily shirt with a knit collar, made to pair with blazers and cotton trousers.",
      "قميص يومي ناعم بياقة محاكة للتنسيق مع البليزر والبنطال القطني.",
    ),
    image: imageIds.casualA,
    colorSlugs: ["olive-green"],
    priceMinor: 780000000,
    fit: text("فیت نیمه‌آزاد", "Easy regular fit", "قصة عادية مريحة"),
    silhouette: text("یقه بافت", "Knit collar", "ياقة محاكة"),
    pattern: text("ساده", "Solid", "سادة"),
  },
  {
    slug: "unstructured-olive-blazer",
    categorySlug: "smart-casual",
    subcategorySlug: "blazers",
    name: text("کت تک زیتونی بدون آستر", "Unstructured Olive Blazer", "بليزر زيتوني غير مبطن"),
    description: text(
      "کت تک سبک با فرم نرم برای استایل نیمه‌رسمی، مناسب پیراهن روشن و کفش ساده.",
      "A lightweight blazer with soft construction, ideal with pale shirts and restrained shoes.",
      "بليزر خفيف ببنية ناعمة يناسب القمصان الفاتحة والأحذية الهادئة.",
    ),
    image: imageIds.casualB,
    colorSlugs: ["olive-green", "charcoal-gray"],
    priceMinor: 1680000000,
    fit: text("فیت نرم", "Soft fit", "قصة ناعمة"),
    silhouette: text("بدون آستر سنگین", "Unstructured", "غير مبطن"),
    pattern: text("بافت ریز", "Fine texture", "ملمس ناعم"),
  },
  {
    slug: "charcoal-merino-layer",
    categorySlug: "smart-casual",
    subcategorySlug: "knitwear",
    name: text("لایه مرینو ذغالی", "Charcoal Merino Layer", "طبقة ميرينو فحمية"),
    description: text(
      "بافت مرینو سبک برای لایه‌سازی زیر کت تک یا روی پیراهن، با حس گرم و ظاهر مرتب.",
      "A light merino layer for wearing under blazers or over shirts with warmth and polish.",
      "طبقة ميرينو خفيفة تلبس تحت البليزر أو فوق القميص مع دفء وأناقة.",
    ),
    image: imageIds.casualC,
    colorSlugs: ["charcoal-gray", "midnight-black"],
    priceMinor: 980000000,
    fit: text("فیت نزدیک بدن", "Close regular fit", "قصة قريبة من الجسم"),
    silhouette: text("یقه گرد", "Crew neck", "ياقة دائرية"),
    pattern: text("بافت ساده", "Plain knit", "تريكو سادة"),
  },
];

const imageAlts = {
  [imageIds.suitA]: text("کت‌وشلوار مردانه سرمه‌ای", "Men’s navy suit", "بدلة رجالية كحلية"),
  [imageIds.suitB]: text("کت‌وشلوار مردانه ذغالی", "Men’s charcoal suit", "بدلة رجالية فحمية"),
  [imageIds.suitC]: text("تاکسیدوی مشکی مردانه", "Men’s black tuxedo", "توكسيدو رجالي أسود"),
  [imageIds.shirtA]: text("پیراهن رسمی سفید مردانه", "Men’s white dress shirt", "قميص رجالي أبيض رسمي"),
  [imageIds.shirtB]: text("پیراهن آکسفورد آبی مردانه", "Men’s blue Oxford shirt", "قميص أكسفورد أزرق رجالي"),
  [imageIds.shirtC]: text("پیراهن روزمره مردانه", "Men’s casual shirt", "قميص يومي رجالي"),
  [imageIds.casualA]: text("پیراهن روزمره زیتونی", "Olive casual shirt", "قميص زيتوني يومي"),
  [imageIds.casualB]: text("کت تک مردانه زیتونی", "Men’s olive blazer", "بليزر رجالي زيتوني"),
  [imageIds.casualC]: text("بافت مردانه ذغالی", "Men’s charcoal knitwear", "تريكو رجالي فحمي"),
  [imageIds.casualD]: text("استایل روزمره مردانه", "Men’s smart casual look", "إطلالة رجالية يومية"),
};

function productPayload(product, categoryMap, subcategoryMap, colorMap, sizeIds) {
  const productImageId = id(product.image);
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    categoryId: categoryMap.get(product.categorySlug),
    subcategoryId: subcategoryMap.get(`${product.categorySlug}/${product.subcategorySlug}`),
    collectionIds: [],
    colorIds: product.colorSlugs.map((slug) => colorMap.get(slug)).filter(Boolean),
    sizeIds,
    basePriceMinor: product.priceMinor,
    currency: "IRR",
    status: "active",
    material: list(
      ["پارچه ممتاز", "دوخت تمیز"],
      ["Premium fabric", "Clean construction"],
      ["قماش فاخر", "خياطة نظيفة"],
    ),
    fit: product.fit,
    silhouette: product.silhouette,
    pattern: product.pattern,
    seasons: list(
      ["بهار", "پاییز", "زمستان"],
      ["Spring", "Autumn", "Winter"],
      ["الربيع", "الخريف", "الشتاء"],
    ),
    occasions: list(
      ["جلسه", "مراسم", "روزمره شیک"],
      ["Meeting", "Ceremony", "Polished daily wear"],
      ["اجتماع", "مناسبة", "أناقة يومية"],
    ),
    styleTags: list(
      ["مینیمال", "لوکس", "مردانه"],
      ["Minimal", "Luxury", "Menswear"],
      ["بسيط", "فاخر", "رجالي"],
    ),
    primaryImageId: productImageId,
    primaryImageObjectFit: "cover",
    primaryImageObjectPosition: "center",
    imageIds: [productImageId],
    updatedAt: now,
  };
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || "najib",
    serverSelectionTimeoutMS: 5000,
  });

  const db = mongoose.connection.db;
  const categoryCollection = db.collection("categories");
  const subcategoryCollection = db.collection("subcategories");
  const colorCollection = db.collection("colors");
  const sizeGroupCollection = db.collection("sizegroups");
  const sizeCollection = db.collection("sizes");
  const imageCollection = db.collection("imageassets");
  const productCollection = db.collection("products");

  const categoryDocs = await categoryCollection.find({}).toArray();
  const categoryMap = new Map(categoryDocs.map((category) => [category.slug, category._id]));

  for (const color of colors) {
    await colorCollection.updateOne(
      { slug: color.slug },
      {
        $set: { ...color, isActive: true, updatedAt: now },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
  }

  await sizeGroupCollection.updateOne(
    { code: sizeGroup.code },
    {
      $set: { ...sizeGroup, isActive: true, updatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );
  const sizeGroupDoc = await sizeGroupCollection.findOne({ code: sizeGroup.code });

  for (const size of sizes) {
    await sizeCollection.updateOne(
      { sizeGroupId: sizeGroupDoc._id, code: size.code },
      {
        $set: {
          ...size,
          sizeGroupId: sizeGroupDoc._id,
          isActive: true,
          updatedAt: now,
        },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
  }

  for (const subcategory of subcategories) {
    const categoryId = categoryMap.get(subcategory.categorySlug);
    if (!categoryId) throw new Error(`Missing category: ${subcategory.categorySlug}`);

    await subcategoryCollection.updateOne(
      { categoryId, slug: subcategory.slug },
      {
        $set: {
          categoryId,
          name: subcategory.name,
          slug: subcategory.slug,
          description: subcategory.description,
          thumbnailImageId: id(subcategory.thumbnailImageId),
          thumbnailObjectFit: "cover",
          thumbnailObjectPosition: "center",
          pageContent: pageContentFor(subcategory),
          sortOrder: subcategory.sortOrder,
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
      { $set: { alt, kind: "product", isActive: true, updatedAt: now } },
    );
  }

  const [colorDocs, sizeDocs, subcategoryDocs] = await Promise.all([
    colorCollection.find({ slug: { $in: colors.map((color) => color.slug) } }).toArray(),
    sizeCollection.find({ sizeGroupId: sizeGroupDoc._id }).sort({ sortOrder: 1 }).toArray(),
    subcategoryCollection.find({}).toArray(),
  ]);

  const colorMap = new Map(colorDocs.map((color) => [color.slug, color._id]));
  const sizeIds = sizeDocs.map((size) => size._id);
  const subcategoryMap = new Map();
  for (const subcategory of subcategoryDocs) {
    const categorySlug = categoryDocs.find((category) => String(category._id) === String(subcategory.categoryId))?.slug;
    if (categorySlug) subcategoryMap.set(`${categorySlug}/${subcategory.slug}`, subcategory._id);
  }

  for (const product of productSpecs) {
    const payload = productPayload(product, categoryMap, subcategoryMap, colorMap, sizeIds);
    if (!payload.subcategoryId) {
      throw new Error(`Missing subcategory: ${product.categorySlug}/${product.subcategorySlug}`);
    }
    if (!payload.colorIds.length || !payload.sizeIds.length) {
      throw new Error(`Missing color or size references for product: ${product.slug}`);
    }

    await productCollection.updateOne(
      { slug: product.slug },
      {
        $set: payload,
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
  }

  const seededSubcategories = await subcategoryCollection
    .find(
      { slug: { $in: subcategories.map((subcategory) => subcategory.slug) } },
      { projection: { slug: 1, name: 1, categoryId: 1, isActive: 1, sortOrder: 1 } },
    )
    .sort({ sortOrder: 1 })
    .toArray();

  const seededProducts = await productCollection
    .find(
      { slug: { $in: productSpecs.map((product) => product.slug) } },
      { projection: { slug: 1, name: 1, status: 1, categoryId: 1, subcategoryId: 1 } },
    )
    .sort({ createdAt: 1 })
    .toArray();

  console.log(
    JSON.stringify(
      {
        subcategories: seededSubcategories.map((subcategory) => ({
          slug: subcategory.slug,
          name: subcategory.name,
          active: subcategory.isActive,
        })),
        products: seededProducts.map((product) => ({
          slug: product.slug,
          name: product.name,
          status: product.status,
        })),
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
