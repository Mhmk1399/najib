const adminUrl = (process.env.ADMIN_URL || "http://127.0.0.1:3001").replace(/\/$/, "");
const assetBaseUrl = (process.env.SEED_ASSET_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const email = process.env.SEED_ADMIN_EMAIL || "admin@najib.local";
const password = process.env.SEED_ADMIN_PASSWORD;
const localized = (fa, en = fa, ar = en) => ({ fa, en, ar });
const localizedList = (fa, en = fa, ar = en) => ({ fa, en, ar });

if (!password) throw new Error("SEED_ADMIN_PASSWORD is required");

function log(message) {
  process.stdout.write(`[DEMO DATA] ${message}\n`);
}

function cookieHeader(response) {
  const values = typeof response.headers.getSetCookie === "function"
    ? response.headers.getSetCookie()
    : [response.headers.get("set-cookie") || ""];
  return values.map((value) => value.split(";", 1)[0]).filter(Boolean).join("; ");
}

async function request(path, options = {}) {
  const response = await fetch(`${adminUrl}${path}`, {
    ...options,
    headers: {
      accept: "application/json",
      ...(options.body ? { "content-type": "application/json" } : {}),
      ...options.headers,
    },
    redirect: "manual",
    signal: AbortSignal.timeout(10_000),
  });
  const text = await response.text();
  let body;
  try { body = text ? JSON.parse(text) : undefined; } catch { body = text; }
  if (!response.ok) {
    const detail = typeof body === "string" ? body : JSON.stringify(body);
    throw new Error(`${options.method || "GET"} ${path} returned ${response.status}: ${detail}`);
  }
  return { response, body };
}

const login = await request("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password }),
});
const cookie = cookieHeader(login.response);
if (!cookie.includes("najib_admin_access=")) throw new Error("Admin login did not return a session cookie");
log(`Signed in as ${email}`);

async function ensureBySlug(resource, payload) {
  const list = await request(`/api/catalog/${resource}?search=${encodeURIComponent(payload.slug)}&limit=100`, {
    headers: { cookie },
  });
  const existing = list.body.items.find((item) => item.slug === payload.slug);
  if (existing) {
    const updated = await request(`/api/catalog/${resource}/${existing._id}`, {
      method: "PATCH",
      headers: { cookie },
      body: JSON.stringify(payload),
    });
    log(`Updated ${resource}: ${payload.name.fa}`);
    return updated.body;
  }
  const created = await request(`/api/catalog/${resource}`, {
    method: "POST",
    headers: { cookie },
    body: JSON.stringify(payload),
  });
  log(`Created ${resource}: ${payload.name.fa}`);
  return created.body;
}

async function ensureImage(payload) {
  const list = await request(`/api/catalog/images?search=${encodeURIComponent(payload.alt.en)}&limit=100`, {
    headers: { cookie },
  });
  const existing = list.body.items.find((item) => item.alt?.en === payload.alt.en);
  if (existing) {
    const updated = await request(`/api/catalog/images/${existing._id}`, {
      method: "PATCH",
      headers: { cookie },
      body: JSON.stringify(payload),
    });
    log(`Updated image: ${payload.alt.fa}`);
    return updated.body;
  }
  const created = await request("/api/catalog/images", {
    method: "POST",
    headers: { cookie },
    body: JSON.stringify(payload),
  });
  log(`Created image: ${payload.alt.fa}`);
  return created.body;
}

const imageDefaults = { width: 1600, height: 2000, focalPointX: 50, focalPointY: 40, linkedProducts: [], isActive: true };
const categoryBanner = await ensureImage({
  ...imageDefaults,
  url: `${assetBaseUrl}/assets/images/hero.webp`,
  alt: localized("نمونه — کمپین خانه خیاطی", "Demo — The tailoring house campaign", "تجريبي — حملة دار الخياطة"),
  kind: "category_banner",
});
const editorialBanner = await ensureImage({
  ...imageDefaults,
  url: `${assetBaseUrl}/assets/images/hero4.webp`,
  alt: localized("نمونه — روایت تصویری مراسم شب", "Demo — Evening ceremony editorial", "تجريبي — قصة أزياء السهرة"),
  kind: "editorial",
  focalPointY: 34,
});
const subcategoryBanner = await ensureImage({
  ...imageDefaults,
  url: `${assetBaseUrl}/assets/images/hero3.webp`,
  alt: localized("نمونه — کمپین ضروریات مدرن", "Demo — Modern essentials campaign", "تجريبي — حملة الأساسيات العصرية"),
  kind: "subcategory_banner",
  focalPointY: 36,
});
const suitImage = await ensureImage({
  ...imageDefaults,
  url: `${assetBaseUrl}/assets/images/suit.webp`,
  alt: localized("نمونه — کت‌وشلوار مشکی دودکمه دوبل", "Demo — Noir double-breasted suit", "تجريبي — بدلة سوداء مزدوجة الصدر"),
  kind: "product",
});
const jacketImage = await ensureImage({
  ...imageDefaults,
  url: `${assetBaseUrl}/assets/images/p1.webp`,
  alt: localized("نمونه — تاکسیدوی عاجی", "Demo — Ivory dinner jacket", "تجريبي — سترة عشاء عاجية"),
  kind: "product",
});
const shoeImage = await ensureImage({
  ...imageDefaults,
  url: `${assetBaseUrl}/assets/images/kafsh.webp`,
  alt: localized("نمونه — کفش چرمی آکسفورد", "Demo — Oxford leather shoes", "تجريبي — حذاء أكسفورد جلدي"),
  kind: "product",
});
const accessoryImage = await ensureImage({
  ...imageDefaults,
  url: `${assetBaseUrl}/assets/images/accessory.webp`,
  alt: localized("نمونه — اکسسوری چرمی آتلیه", "Demo — Atelier leather accessories", "تجريبي — إكسسوارات جلدية من المشغل"),
  kind: "product",
});

function pageContent(title, primaryImageId, secondaryImageId) {
  return {
    primaryBanner: {
      imageId: primaryImageId,
      eyebrow: localized("آتلیه نجیب‌زاده", "Najibzadeh atelier", "مشغل نجيب زاده"),
      heading: title,
      body: localized("کمدی سنجیده بر پایه تناسب، بافت و اعتمادبه‌نفس آرام.", "A considered wardrobe built through proportion, texture, and quiet confidence.", "خزانة مدروسة تقوم على التناسق والملمس والثقة الهادئة."),
      ctaLabel: localized("مشاهده مجموعه", "Discover the edit", "اكتشف المجموعة"),
      ctaHref: "/shop",
    },
    primaryDescription: {
      heading: localized("خط طراحی خانه", "The house line", "خط الدار"),
      body: localized("ساختار دقیق با فرمی معاصر و روان در قطعاتی ماندگار همراه می‌شود.", "Sharp construction meets an easy, contemporary silhouette in pieces made for lasting relevance.", "تلتقي البنية الدقيقة بقصة عصرية انسيابية في قطع مصممة لتدوم."),
    },
    secondaryBanner: {
      imageId: secondaryImageId,
      eyebrow: localized("پس از غروب", "After dark", "بعد الغروب"),
      heading: localized("روایت را کامل کنید", "Complete the narrative", "أكمل الحكاية"),
      body: localized("پوشاک شب و جزئیات نهایی در یک بیان مطمئن کنار هم قرار گرفته‌اند.", "Evening pieces and finishing details composed as one assured expression.", "تجتمع قطع السهرة والتفاصيل النهائية في إطلالة واثقة واحدة."),
      ctaLabel: localized("مشاهده پوشاک شب", "View evening pieces", "شاهد قطع السهرة"),
      ctaHref: "/collections/evening-ceremony",
    },
    secondaryDescription: {
      heading: localized("برای زندگی طراحی شده", "Made to be lived in", "مصمم للحياة"),
      body: localized("مواد طبیعی، ساختار متعادل و جزئیات ظریف با نگاه نزدیک‌تر آشکار می‌شوند.", "Natural materials, balanced structure, and subtle details reward a closer look.", "تكشف المواد الطبيعية والبنية المتوازنة والتفاصيل الدقيقة جمالها عند التأمل."),
    },
    seoTitle: localized(`${title.fa} | نجیب‌زاده`, `${title.en} | Najibzadeh`, `${title.ar} | نجيب زاده`),
    seoDescription: localized(`مجموعه ${title.fa} از آتلیه نجیب‌زاده را ببینید.`, `Explore ${title.en.toLowerCase()} from the Najibzadeh atelier.`, `اكتشف ${title.ar} من مشغل نجيب زاده.`),
  };
}

const tailoring = await ensureBySlug("categories", {
  name: localized("خیاطی مردانه", "Men's Tailoring", "الخياطة الرجالية"),
  slug: "demo-mens-tailoring",
  description: localized("کت‌وشلوار، کت و پوشاک رسمی از آتلیه نجیب‌زاده.", "Suits, jackets, and formal separates from the Najibzadeh atelier.", "بدلات وسترات وقطع رسمية من مشغل نجيب زاده."),
  thumbnailImageId: suitImage._id,
  pageContent: pageContent(localized("دفتر خیاطی", "The tailoring register", "سجل الخياطة"), categoryBanner._id, editorialBanner._id),
  isActive: true,
  sortOrder: 10,
});
const accessories = await ensureBySlug("categories", {
  name: localized("اکسسوری", "Accessories", "الإكسسوارات"),
  slug: "demo-accessories",
  description: localized("چرم، ابریشم و جزئیات نهایی برای یک کمد کامل.", "Leather, silk, and finishing pieces for a complete wardrobe.", "قطع من الجلد والحرير ولمسات نهائية لخزانة متكاملة."),
  thumbnailImageId: accessoryImage._id,
  pageContent: pageContent(localized("لمس نهایی", "Finishing gestures", "اللمسات الأخيرة"), categoryBanner._id, editorialBanner._id),
  isActive: true,
  sortOrder: 20,
});

const suits = await ensureBySlug("subcategories", {
  categoryId: tailoring._id,
  name: localized("کت‌وشلوار و تاکسیدو", "Suits & Dinner Jackets", "البدلات وسترات العشاء"),
  slug: "demo-suits-dinner-jackets",
  description: localized("خیاطی ساختارمند برای مراسم و شب.", "Structured tailoring for ceremony and evening.", "خياطة منظمة للمناسبات والأمسيات."),
  thumbnailImageId: jacketImage._id,
  pageContent: pageContent(localized("معماری شب", "Evening architecture", "هندسة المساء"), subcategoryBanner._id, editorialBanner._id),
  isActive: true,
  sortOrder: 10,
});
const shoes = await ensureBySlug("subcategories", {
  categoryId: accessories._id,
  name: localized("کفش رسمی", "Formal Shoes", "الأحذية الرسمية"),
  slug: "demo-formal-shoes",
  description: localized("پایه‌ای چرمی و صیقلی برای پوشش رسمی.", "Polished leather foundations for formal dressing.", "أساس جلدي مصقول للإطلالات الرسمية."),
  thumbnailImageId: shoeImage._id,
  pageContent: pageContent(localized("فرم استوار", "Grounded form", "أناقة راسخة"), subcategoryBanner._id, editorialBanner._id),
  isActive: true,
  sortOrder: 10,
});
const leatherGoods = await ensureBySlug("subcategories", {
  categoryId: accessories._id,
  name: localized("محصولات چرمی", "Leather Goods", "المنتجات الجلدية"),
  slug: "demo-leather-goods",
  description: localized("کمربند و قطعات چرمی کوچک با جزئیاتی مینیمال.", "Belts and small leather pieces with restrained detailing.", "أحزمة وقطع جلدية صغيرة بتفاصيل هادئة."),
  thumbnailImageId: accessoryImage._id,
  pageContent: pageContent(localized("کارکرد آرام", "Quiet utility", "وظيفة هادئة"), subcategoryBanner._id, editorialBanner._id),
  isActive: true,
  sortOrder: 20,
});

const evening = await ensureBySlug("collections", {
  name: localized("مراسم شب", "Evening Ceremony", "مراسم المساء"),
  slug: "demo-evening-ceremony",
  description: localized("پوشاک رسمی و اکسسوری برای ساعت‌های پس از غروب.", "Formal tailoring and accessories for the hours after dark.", "خياطة رسمية وإكسسوارات لساعات ما بعد الغروب."),
  heroImageId: editorialBanner._id,
  isActive: true,
  sortOrder: 10,
});
const essentials = await ensureBySlug("collections", {
  name: localized("ضروریات مدرن", "Modern Essentials", "الأساسيات العصرية"),
  slug: "demo-modern-essentials",
  description: localized("قطعات پایه برای یک کمد روزمره دقیق.", "Foundational pieces selected for a precise everyday wardrobe.", "قطع أساسية مختارة لخزانة يومية دقيقة."),
  heroImageId: subcategoryBanner._id,
  isActive: true,
  sortOrder: 20,
});

async function ensureProduct(payload) {
  return ensureBySlug("products", payload);
}

const noirSuit = await ensureProduct({
  name: localized("کت‌وشلوار دوبل نوآر", "Noir Double-Breasted Suit", "بدلة نوار مزدوجة الصدر"),
  slug: "demo-noir-double-breasted-suit",
  description: localized("کت‌وشلوار شب شش‌دکمه از پشم مشکی خالص با یقه پیک دقیق.", "A six-button evening suit in pure black wool with a clean peak lapel.", "بدلة مسائية بستة أزرار من الصوف الأسود الخالص وياقة مدببة أنيقة."),
  categoryId: tailoring._id,
  subcategoryId: suits._id,
  collectionIds: [evening._id],
  basePriceMinor: 175000,
  currency: "EUR",
  status: "active",
  material: localizedList(["پشم خالص", "آستر کوپرو"], ["virgin wool", "cupro lining"], ["صوف بكر", "بطانة كوبرو"]),
  fit: localized("اندامی", "Tailored", "مفصل"),
  silhouette: localized("دوبل", "Double-breasted", "مزدوج الصدر"),
  pattern: localized("ساده", "Solid", "سادة"),
  seasons: localizedList(["پاییز", "زمستان"], ["autumn", "winter"], ["الخريف", "الشتاء"]),
  occasions: localizedList(["رسمی", "شب"], ["formal", "evening"], ["رسمي", "مسائي"]),
  styleTags: localizedList(["خیاطی‌شده", "مراسم", "بلک‌تای"], ["tailored", "ceremony", "black tie"], ["مفصل", "مراسم", "ربطة سوداء"]),
  primaryImageId: suitImage._id,
  imageIds: [suitImage._id, editorialBanner._id],
});
const ivoryJacket = await ensureProduct({
  name: localized("کت تاکسیدو عاجی", "Ivory Dinner Jacket", "سترة عشاء عاجية"),
  slug: "demo-ivory-dinner-jacket",
  description: localized("کت تاکسیدو عاجی با یقه شال مشکی و دکمه‌های روکش‌دار.", "An ivory dinner jacket balanced by a black shawl collar and covered buttons.", "سترة عشاء عاجية بياقة شال سوداء وأزرار مكسوة."),
  categoryId: tailoring._id,
  subcategoryId: suits._id,
  collectionIds: [evening._id],
  basePriceMinor: 129000,
  currency: "EUR",
  status: "active",
  material: localizedList(["پشم باراتیا", "ساتن ابریشم"], ["wool barathea", "silk satin"], ["صوف باراتيا", "ساتان حريري"]),
  fit: localized("معمولی", "Regular", "عادي"),
  silhouette: localized("تک‌دکمه", "Single-breasted", "أحادي الصدر"),
  pattern: localized("ساده", "Solid", "سادة"),
  seasons: localizedList(["بهار", "تابستان"], ["spring", "summer"], ["الربيع", "الصيف"]),
  occasions: localizedList(["عروسی", "شب"], ["wedding", "evening"], ["زفاف", "مسائي"]),
  styleTags: localizedList(["تاکسیدو", "مراسم"], ["dinner jacket", "ceremony"], ["سترة عشاء", "مراسم"]),
  primaryImageId: jacketImage._id,
  imageIds: [jacketImage._id, editorialBanner._id],
});
const oxfords = await ensureProduct({
  name: localized("کفش چرمی آکسفورد", "Oxford Leather Shoes", "حذاء أكسفورد جلدي"),
  slug: "demo-oxford-leather-shoes",
  description: localized("کفش آکسفورد از چرم گوساله مشکی با پنجه بادامی و زیره چرمی.", "Black calf-leather Oxfords with a refined almond toe and leather sole.", "حذاء أكسفورد من جلد العجل الأسود بمقدمة لوزية ونعل جلدي."),
  categoryId: accessories._id,
  subcategoryId: shoes._id,
  collectionIds: [evening._id, essentials._id],
  basePriceMinor: 62000,
  currency: "EUR",
  status: "active",
  material: localizedList(["چرم گوساله", "زیره چرمی"], ["calf leather", "leather sole"], ["جلد عجل", "نعل جلدي"]),
  fit: localized("استاندارد", "True to size", "مقاس مطابق"),
  silhouette: localized("آکسفورد", "Oxford", "أكسفورد"),
  pattern: localized("پنجه ساده", "Plain toe", "مقدمة سادة"),
  seasons: localizedList(["چهارفصل"], ["all season"], ["كل المواسم"]),
  occasions: localizedList(["کاری", "رسمی"], ["business", "formal"], ["عمل", "رسمي"]),
  styleTags: localizedList(["کفش", "کلاسیک"], ["footwear", "classic"], ["أحذية", "كلاسيكي"]),
  primaryImageId: shoeImage._id,
  imageIds: [shoeImage._id],
});
const belt = await ensureProduct({
  name: localized("کمربند چرمی آتلیه", "Atelier Leather Belt", "حزام جلدي من المشغل"),
  slug: "demo-atelier-leather-belt",
  description: localized("کمربند چرم گوساله مشکی با سگک برس‌خورده مینیمال.", "A smooth black calf-leather belt finished with a discreet brushed buckle.", "حزام من جلد العجل الأسود الناعم بإبزيم مصقول هادئ."),
  categoryId: accessories._id,
  subcategoryId: leatherGoods._id,
  collectionIds: [essentials._id],
  basePriceMinor: 28000,
  currency: "EUR",
  status: "active",
  material: localizedList(["چرم گوساله"], ["calf leather"], ["جلد عجل"]),
  fit: localized("قابل تنظیم", "Adjustable", "قابل للتعديل"),
  silhouette: localized("۳۰ میلی‌متر", "30 mm", "30 مم"),
  pattern: localized("ساده", "Solid", "سادة"),
  seasons: localizedList(["چهارفصل"], ["all season"], ["كل المواسم"]),
  occasions: localizedList(["کاری", "روزمره"], ["business", "everyday"], ["عمل", "يومي"]),
  styleTags: localizedList(["چرم", "مینیمال"], ["leather", "minimal"], ["جلد", "بسيط"]),
  primaryImageId: accessoryImage._id,
  imageIds: [accessoryImage._id],
});

await request(`/api/catalog/images/${editorialBanner._id}`, {
  method: "PATCH",
  headers: { cookie },
  body: JSON.stringify({
    linkedProducts: [
      { productId: noirSuit._id, label: localized("خرید کت‌وشلوار نوآر", "Shop the noir suit", "تسوق بدلة نوار"), hotspotX: 42, hotspotY: 38, sortOrder: 0 },
      { productId: ivoryJacket._id, label: localized("خرید کت تاکسیدو", "Shop the dinner jacket", "تسوق سترة العشاء"), hotspotX: 61, hotspotY: 45, sortOrder: 1 },
      { productId: oxfords._id, label: localized("خرید کفش آکسفورد", "Shop the Oxford shoes", "تسوق حذاء أكسفورد"), hotspotX: 48, hotspotY: 82, sortOrder: 2 },
      { productId: belt._id, label: localized("خرید کمربند چرمی", "Shop the leather belt", "تسوق الحزام الجلدي"), hotspotX: 53, hotspotY: 58, sortOrder: 3 },
    ],
  }),
});
log("Linked four products to the evening editorial image");
log("Ready: 2 categories, 3 subcategories, 2 collections, 4 products, and 7 images");
