import { type Locale } from "@/lib/i18n/config";

type ShellLink = {
  label: string;
  href: string;
  description?: string;
};

type ShellFooterGroup = {
  id: string;
  title: string;
  links: ShellLink[];
};

export const shellCopy: Record<
  Locale,
  {
    brandName: string;
    navbar: {
      openMenu: string;
      closeMenu: string;
      homeAria: string;
      profile: string;
      cart: string;
      breadcrumbAria: string;
      home: string;
      mainMenuAria: string;
      closeNavigation: string;
      collections: string;
      customerCare: string;
      bookAppointment: string;
      findStore: string;
      customerSupport: string;
      collectionDetails: string;
      viewCollection: string;
      quickAccess: string;
      mobileMenuTitle: string;
      curated: string;
      editorialPick: string;
      languageSwitch: (nextLabel: string) => string;
      quickLinks: ShellLink[];
    };
    footer: {
      categoryGuideAria: string;
      catalogTitle: string;
      viewAllProducts: string;
      viewAllProductsDescription: string;
      allProducts: string;
      allProductsDescription: string;
      followUs: string;
      socialAria: string;
      socialPageAria: (label: string) => string;
      support: string;
      currentLanguage: (label: string) => string;
      copyright: (year: string) => string;
      legalAria: string;
      privacy: string;
      terms: string;
      cookies: string;
      backToTop: string;
      backToTopAria: string;
      homeAria: string;
      staticGroups: ShellFooterGroup[];
    };
  }
> = {
  fa: {
    brandName: "نجیب‌زاده",
    navbar: {
      openMenu: "باز کردن منو",
      closeMenu: "بستن منو",
      homeAria: "صفحه اصلی نجیب‌زاده",
      profile: "حساب کاربری",
      cart: "سبد خرید",
      breadcrumbAria: "مسیر صفحه",
      home: "خانه",
      mainMenuAria: "منوی اصلی فروشگاه",
      closeNavigation: "بستن منوی ناوبری",
      collections: "مجموعه‌ها",
      customerCare: "خدمات مشتریان",
      bookAppointment: "رزرو وقت اختصاصی",
      findStore: "یافتن فروشگاه",
      customerSupport: "پشتیبانی مشتریان",
      collectionDetails: "جزئیات مجموعه",
      viewCollection: "مشاهده مجموعه",
      quickAccess: "دسترسی سریع",
      mobileMenuTitle: "منوی نجیب‌زاده",
      curated: "منتخب",
      editorialPick: "انتخاب سردبیری",
      languageSwitch: (nextLabel) => `تغییر زبان به ${nextLabel}`,
      quickLinks: [
        { label: "وبلاگ", href: "/blog" },
        { label: "داستان ما", href: "/about-us" },
        { label: "درباره ما", href: "/about-us" },
        { label: "تماس با ما", href: "/contact-us" },
        { label: "فروشگاه", href: "/shop" },
        { label: "پروفایل", href: "/profile" },
      ],
    },
    footer: {
      categoryGuideAria: "راهنمای دسته‌بندی‌ها و پیوندهای سایت",
      catalogTitle: "دسته‌بندی‌ها",
      viewAllProducts: "مشاهده همه محصولات",
      viewAllProductsDescription: "ورود به فروشگاه نجیب‌زاده",
      allProducts: "همه محصولات",
      allProductsDescription:
        "مجموعه‌های فعال فروشگاه اینجا نمایش داده می‌شوند.",
      followUs: "همراه ما باشید",
      socialAria: "شبکه‌های اجتماعی نجیب‌زاده",
      socialPageAria: (label) => `صفحه ${label} نجیب‌زاده`,
      support: "خدمات مشتریان",
      currentLanguage: (label) => `زبان فعلی: ${label}`,
      copyright: (year) => `© ${year} نجیب‌زاده. همه حقوق محفوظ است.`,
      legalAria: "پیوندهای حقوقی",
      privacy: "حریم خصوصی",
      terms: "قوانین و مقررات",
      cookies: "سیاست کوکی‌ها",
      backToTop: "بازگشت به بالا",
      backToTopAria: "بازگشت به ابتدای صفحه",
      homeAria: "صفحه اصلی نجیب‌زاده",
      staticGroups: [
        {
          id: "services",
          title: "خدمات مشتریان",
          links: [
            { label: "مشاوره اختصاصی", href: "/contact-us#appointment" },
            { label: "یافتن فروشگاه", href: "/contact-us#location" },
            {
              label: "ارسال و مرجوعی",
              href: "/terms-conditions#shipping-delivery",
            },
            { label: "پشتیبانی مشتریان", href: "/contact-us#services" },
          ],
        },
        {
          id: "house",
          title: "خانه نجیب‌زاده",
          links: [
            { label: "داستان ما", href: "/about-us" },
            { label: "مجله", href: "/blog" },
            { label: "کمپین‌ها", href: "/shop?collection=new-season" },
          ],
        },
        {
          id: "information",
          title: "اطلاعات",
          links: [
            { label: "تماس با ما", href: "/contact-us" },
            { label: "حریم خصوصی", href: "/privacy" },
            { label: "قوانین و مقررات", href: "/terms-conditions" },
            { label: "سیاست کوکی‌ها", href: "/cookies" },
          ],
        },
      ],
    },
  },
  en: {
    brandName: "Najibzadeh",
    navbar: {
      openMenu: "Open menu",
      closeMenu: "Close menu",
      homeAria: "Najibzadeh home page",
      profile: "Account",
      cart: "Shopping bag",
      breadcrumbAria: "Breadcrumb",
      home: "Home",
      mainMenuAria: "Store main menu",
      closeNavigation: "Close navigation menu",
      collections: "Collections",
      customerCare: "Customer care",
      bookAppointment: "Book a private appointment",
      findStore: "Find a store",
      customerSupport: "Customer support",
      collectionDetails: "Collection details",
      viewCollection: "View collection",
      quickAccess: "Quick access",
      mobileMenuTitle: "Najibzadeh menu",
      curated: "Curated",
      editorialPick: "Editorial pick",
      languageSwitch: (nextLabel) => `Switch language to ${nextLabel}`,
      quickLinks: [
        { label: "Journal", href: "/blog" },
        { label: "Our story", href: "/about-us" },
        { label: "About us", href: "/about-us" },
        { label: "Contact us", href: "/contact-us" },
        { label: "Shop", href: "/shop" },
        { label: "Account", href: "/profile" },
      ],
    },
    footer: {
      categoryGuideAria: "Category guide and site links",
      catalogTitle: "Categories",
      viewAllProducts: "View all products",
      viewAllProductsDescription: "Enter the Najibzadeh store",
      allProducts: "All products",
      allProductsDescription: "Active store collections appear here.",
      followUs: "Follow us",
      socialAria: "Najibzadeh social links",
      socialPageAria: (label) => `${label} page for Najibzadeh`,
      support: "Customer care",
      currentLanguage: (label) => `Current language: ${label}`,
      copyright: (year) => `© ${year} Najibzadeh. All rights reserved.`,
      legalAria: "Legal links",
      privacy: "Privacy policy",
      terms: "Terms and conditions",
      cookies: "Cookie policy",
      backToTop: "Back to top",
      backToTopAria: "Back to top of page",
      homeAria: "Najibzadeh home page",
      staticGroups: [
        {
          id: "services",
          title: "Customer care",
          links: [
            { label: "Private consultation", href: "/contact-us#appointment" },
            { label: "Find a store", href: "/contact-us#location" },
            {
              label: "Shipping and returns",
              href: "/terms-conditions#shipping-delivery",
            },
            { label: "Customer support", href: "/contact-us#services" },
          ],
        },
        {
          id: "house",
          title: "The house",
          links: [
            { label: "Our story", href: "/about-us" },
            { label: "Journal", href: "/blog" },
            { label: "Campaigns", href: "/shop?collection=new-season" },
          ],
        },
        {
          id: "information",
          title: "Information",
          links: [
            { label: "Contact us", href: "/contact-us" },
            { label: "Privacy policy", href: "/privacy" },
            { label: "Terms and conditions", href: "/terms-conditions" },
            { label: "Cookie policy", href: "/cookies" },
          ],
        },
      ],
    },
  },
  ar: {
    brandName: "نجيب زاده",
    navbar: {
      openMenu: "فتح القائمة",
      closeMenu: "إغلاق القائمة",
      homeAria: "الصفحة الرئيسية لنجيب زاده",
      profile: "الحساب",
      cart: "سلة التسوق",
      breadcrumbAria: "مسار الصفحة",
      home: "الرئيسية",
      mainMenuAria: "القائمة الرئيسية للمتجر",
      closeNavigation: "إغلاق قائمة التنقل",
      collections: "المجموعات",
      customerCare: "خدمة العملاء",
      bookAppointment: "حجز موعد خاص",
      findStore: "العثور على المتجر",
      customerSupport: "دعم العملاء",
      collectionDetails: "تفاصيل المجموعة",
      viewCollection: "عرض المجموعة",
      quickAccess: "وصول سريع",
      mobileMenuTitle: "قائمة نجيب زاده",
      curated: "مختار",
      editorialPick: "اختيار التحرير",
      languageSwitch: (nextLabel) => `تغيير اللغة إلى ${nextLabel}`,
      quickLinks: [
        { label: "المدونة", href: "/blog" },
        { label: "قصتنا", href: "/about-us" },
        { label: "من نحن", href: "/about-us" },
        { label: "اتصل بنا", href: "/contact-us" },
        { label: "المتجر", href: "/shop" },
        { label: "الحساب", href: "/profile" },
      ],
    },
    footer: {
      categoryGuideAria: "دليل التصنيفات وروابط الموقع",
      catalogTitle: "التصنيفات",
      viewAllProducts: "عرض جميع المنتجات",
      viewAllProductsDescription: "الدخول إلى متجر نجيب زاده",
      allProducts: "كل المنتجات",
      allProductsDescription: "تظهر مجموعات المتجر النشطة هنا.",
      followUs: "تابعنا",
      socialAria: "روابط نجيب زاده الاجتماعية",
      socialPageAria: (label) => `صفحة ${label} لنجيب زاده`,
      support: "خدمة العملاء",
      currentLanguage: (label) => `اللغة الحالية: ${label}`,
      copyright: (year) => `© ${year} نجيب زاده. جميع الحقوق محفوظة.`,
      legalAria: "الروابط القانونية",
      privacy: "سياسة الخصوصية",
      terms: "الشروط والأحكام",
      cookies: "سياسة ملفات الارتباط",
      backToTop: "العودة إلى الأعلى",
      backToTopAria: "العودة إلى أعلى الصفحة",
      homeAria: "الصفحة الرئيسية لنجيب زاده",
      staticGroups: [
        {
          id: "services",
          title: "خدمة العملاء",
          links: [
            { label: "استشارة خاصة", href: "/contact-us#appointment" },
            { label: "العثور على المتجر", href: "/contact-us#location" },
            {
              label: "الشحن والإرجاع",
              href: "/terms-conditions#shipping-delivery",
            },
            { label: "دعم العملاء", href: "/contact-us#services" },
          ],
        },
        {
          id: "house",
          title: "دار نجيب زاده",
          links: [
            { label: "قصتنا", href: "/about-us" },
            { label: "المدونة", href: "/blog" },
            { label: "الحملات", href: "/shop?collection=new-season" },
          ],
        },
        {
          id: "information",
          title: "معلومات",
          links: [
            { label: "اتصل بنا", href: "/contact-us" },
            { label: "سياسة الخصوصية", href: "/privacy" },
            { label: "الشروط والأحكام", href: "/terms-conditions" },
            { label: "سياسة ملفات الارتباط", href: "/cookies" },
          ],
        },
      ],
    },
  },
};

export const shellTextTranslations: Record<Locale, Record<string, string>> = {
  fa: {},
  en: {
    "دسته‌بندی‌ها": "Categories",
    "فروشگاه": "Shop",
    "همه محصولات": "All products",
    "کتالوگ نجیب‌زاده": "Najibzadeh catalog",
    "جدید": "New",
    "جدید و منتخب": "New and featured",
    "تازه‌رسیده‌ها": "New arrivals",
    "جدیدترین مجموعه": "Latest collection",
    "پرفروش‌ها": "Best sellers",
    "نمادهای نجیب‌زاده": "Najibzadeh icons",
    "انتخاب‌شده": "Curated",
    "انتخاب شب": "Evening edit",
    "کمد رسمی": "Business wardrobe",
    "انتخاب آخر هفته": "Weekend selection",
    "ضروریات سفر": "Travel essentials",
    "کشف کنید": "Discover",
    "مجله": "Journal",
    "کمپین‌ها": "Campaigns",
    "لوک‌بوک": "Lookbook",
    "دنیای ما": "Our world",
    "پوشاک": "Clothing",
    "خیاطی مدرن": "Modern tailoring",
    "خیاطی": "Tailoring",
    "کت‌وشلوار": "Suits",
    "بلیزر": "Blazers",
    "تاکسیدو": "Tuxedos",
    "جلیقه": "Waistcoats",
    "ضروریات": "Essentials",
    "پیراهن": "Shirts",
    "پولوشرت": "Polos",
    "تی‌شرت": "T-shirts",
    "پوشاک بافت": "Knitwear",
    "شلوار": "Trousers",
    "لباس بیرونی": "Outerwear",
    "عطر": "Fragrance",
    "عطرها": "Fragrances",
    "اکسسوری": "Accessories",
    "جزئیات ماندگار": "Objects of character",
    "خانه نجیب‌زاده": "The house",
    "درون آتلیه": "Inside the atelier",
    "آتلیه": "Atelier",
    "هنر ساخت": "Craftsmanship",
    "متریال‌ها": "Materials",
    "قرار اختصاصی": "Private appointment",
    "داستان ما": "Our story",
    "میراث": "Heritage",
    "فروشگاه‌ها": "Stores",
    "دسترسی سریع": "Quick access",
    "زیردسته‌ها": "Subcategories",
    "زیردسته‌های بیشتر": "More subcategories",
  },
  ar: {
    "دسته‌بندی‌ها": "التصنيفات",
    "فروشگاه": "المتجر",
    "همه محصولات": "كل المنتجات",
    "کتالوگ نجیب‌زاده": "كتالوج نجيب زاده",
    "جدید": "جديد",
    "جدید و منتخب": "الجديد والمختار",
    "تازه‌رسیده‌ها": "وصل حديثا",
    "جدیدترین مجموعه": "أحدث مجموعة",
    "پرفروش‌ها": "الأكثر مبيعا",
    "نمادهای نجیب‌زاده": "أيقونات نجيب زاده",
    "انتخاب‌شده": "مختار",
    "انتخاب شب": "اختيار المساء",
    "کمد رسمی": "خزانة رسمية",
    "انتخاب آخر هفته": "اختيار نهاية الأسبوع",
    "ضروریات سفر": "أساسيات السفر",
    "کشف کنید": "اكتشف",
    "مجله": "المدونة",
    "کمپین‌ها": "الحملات",
    "لوک‌بوک": "لوك بوك",
    "دنیای ما": "عالمنا",
    "پوشاک": "الملابس",
    "خیاطی مدرن": "الخياطة الحديثة",
    "خیاطی": "الخياطة",
    "کت‌وشلوار": "البدلات",
    "بلیزر": "البليزر",
    "تاکسیدو": "التوكسيدو",
    "جلیقه": "الصدريات",
    "ضروریات": "الأساسيات",
    "پیراهن": "القمصان",
    "پولوشرت": "قمصان بولو",
    "تی‌شرت": "تي شيرت",
    "پوشاک بافت": "الملابس المحاكة",
    "شلوار": "البناطيل",
    "لباس بیرونی": "الملابس الخارجية",
    "عطر": "العطور",
    "عطرها": "العطور",
    "اکسسوری": "الإكسسوارات",
    "جزئیات ماندگار": "تفاصيل مميزة",
    "خانه نجیب‌زاده": "دار نجيب زاده",
    "درون آتلیه": "داخل الأتيليه",
    "آتلیه": "الأتيليه",
    "هنر ساخت": "الحرفية",
    "متریال‌ها": "المواد",
    "قرار اختصاصی": "موعد خاص",
    "داستان ما": "قصتنا",
    "میراث": "الإرث",
    "فروشگاه‌ها": "المتاجر",
    "دسترسی سریع": "وصول سريع",
    "زیردسته‌ها": "التصنيفات الفرعية",
    "زیردسته‌های بیشتر": "تصنيفات فرعية أخرى",
  },
};

export function translateShellText(value: string, locale: Locale) {
  if (locale === "fa") return value;
  return shellTextTranslations[locale][value] ?? value;
}

export function formatShellNumber(
  value: number | string,
  locale: Locale,
  minimumIntegerDigits = 1,
) {
  const numeric = Number(value);

  if (Number.isFinite(numeric)) {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale, {
      minimumIntegerDigits,
      useGrouping: false,
    }).format(numeric);
  }

  return String(value);
}
