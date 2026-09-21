import type { Locale } from "@/lib/i18n/config";

export type CatalogPageCopy = {
  brandEyebrow: string;
  categoryAboutEyebrow: string;
  categoryFallbackDescription: string;
  categoryFeatureEyebrow: string;
  categoryFeatureDescription: string;
  categoryFinalEyebrow: string;
  categoryFinalTitle: (name: string) => string;
  categoryFinalDescription: string;
  subcategoryFallbackTitle: string;
  subcategoryFallbackDescription: string;
  subcategoryIntroFallbackDescription: string;
  subcategoryFeatureEyebrow: string;
  subcategoryFeatureDescription: string;
  subcategoryFinalEyebrow: string;
  subcategoryFinalTitle: (name: string) => string;
  subcategoryFinalDescription: string;
  viewProducts: string;
  enterShop: string;
  viewShop: string;
  subcategoriesHeading: string;
  productsHeading: string;
  viewAll: string;
  viewAllNamed: (name: string) => string;
  viewCollection: string;
  productCount: (count: string) => string;
  emptyProductsTitle: string;
  emptyProductsDescription: string;
  loadingCategory: string;
  loadingSubcategory: string;
  categoryErrorTitle: string;
  subcategoryErrorTitle: string;
  errorDescription: string;
  retry: string;
  categoryNotFoundTitle: string;
  subcategoryNotFoundTitle: string;
  notFoundDescription: string;
  backToShop: string;
  catalogStateEyebrow: string;
  metadata: {
    categoryDescription: (name: string) => string;
    subcategoryDescription: (name: string, categoryName: string) => string;
  };
};

export const catalogPageCopy: Record<Locale, CatalogPageCopy> = {
  fa: {
    brandEyebrow: "نجیب زاده",
    categoryAboutEyebrow: "درباره دسته",
    categoryFallbackDescription:
      "کالکشن های منتخب نجیب زاده را مرور کنید.",
    categoryFeatureEyebrow: "انتخاب ویژه",
    categoryFeatureDescription:
      "جزئیات انتخاب ویژه این دسته به زودی تکمیل می شود.",
    categoryFinalEyebrow: "ادامه مسیر",
    categoryFinalTitle: (name) => `خرید ${name}`,
    categoryFinalDescription:
      "برای دیدن محصولات این دسته وارد فروشگاه شوید.",
    subcategoryFallbackTitle: "زیردسته",
    subcategoryFallbackDescription:
      "محصولات منتخب این زیردسته را مرور کنید.",
    subcategoryIntroFallbackDescription:
      "جزئیات این زیردسته به زودی تکمیل می شود.",
    subcategoryFeatureEyebrow: "جزئیات کالکشن",
    subcategoryFeatureDescription:
      "جزئیات انتخاب ویژه این زیردسته به زودی تکمیل می شود.",
    subcategoryFinalEyebrow: "خرید انتخاب شده",
    subcategoryFinalTitle: (name) => `خرید ${name}`,
    subcategoryFinalDescription:
      "همه محصولات این زیردسته را در فروشگاه ببینید.",
    viewProducts: "مشاهده محصولات",
    enterShop: "ورود به فروشگاه",
    viewShop: "مشاهده فروشگاه",
    subcategoriesHeading: "زیردسته ها",
    productsHeading: "محصولات",
    viewAll: "مشاهده همه",
    viewAllNamed: (name) => `مشاهده همه ${name}`,
    viewCollection: "مشاهده مجموعه",
    productCount: (count) => `${count} محصول`,
    emptyProductsTitle:
      "هنوز محصولی برای این زیردسته ثبت نشده است.",
    emptyProductsDescription:
      "محصول فعال بسازید و این زیردسته را انتخاب کنید تا همین جا نمایش داده شود.",
    loadingCategory: "در حال دریافت دسته بندی",
    loadingSubcategory: "در حال دریافت زیردسته",
    categoryErrorTitle: "دریافت دسته بندی ناموفق بود",
    subcategoryErrorTitle: "دریافت زیردسته ناموفق بود",
    errorDescription:
      "اتصال به دیتابیس یا سرویس کاتالوگ را بررسی کنید.",
    retry: "تلاش دوباره",
    categoryNotFoundTitle: "دسته بندی پیدا نشد",
    subcategoryNotFoundTitle: "زیردسته پیدا نشد",
    notFoundDescription:
      "این صفحه هنوز فعال نشده یا آدرس آن تغییر کرده است.",
    backToShop: "بازگشت به فروشگاه",
    catalogStateEyebrow: "کاتالوگ نجیب زاده",
    metadata: {
      categoryDescription: (name) =>
        `دسته ${name} در فروشگاه نجیب زاده؛ مشاهده کالکشن ها، زیردسته ها و محصولات منتخب مردانه.`,
      subcategoryDescription: (name, categoryName) =>
        `${name} از دسته ${categoryName} در فروشگاه نجیب زاده؛ مشاهده محصولات منتخب و تصاویر کالکشن.`,
    },
  },
  en: {
    brandEyebrow: "Najibzadeh",
    categoryAboutEyebrow: "About the category",
    categoryFallbackDescription:
      "Explore selected Najibzadeh collections.",
    categoryFeatureEyebrow: "Featured selection",
    categoryFeatureDescription:
      "The featured story for this category will be completed soon.",
    categoryFinalEyebrow: "Continue the edit",
    categoryFinalTitle: (name) => `Shop ${name}`,
    categoryFinalDescription:
      "Enter the store to view products in this category.",
    subcategoryFallbackTitle: "Subcategory",
    subcategoryFallbackDescription:
      "Explore selected products in this subcategory.",
    subcategoryIntroFallbackDescription:
      "Details for this subcategory will be completed soon.",
    subcategoryFeatureEyebrow: "Collection detail",
    subcategoryFeatureDescription:
      "The featured story for this subcategory will be completed soon.",
    subcategoryFinalEyebrow: "Curated shopping",
    subcategoryFinalTitle: (name) => `Shop ${name}`,
    subcategoryFinalDescription:
      "View every product from this subcategory in the store.",
    viewProducts: "View products",
    enterShop: "Enter store",
    viewShop: "View store",
    subcategoriesHeading: "Subcategories",
    productsHeading: "Products",
    viewAll: "View all",
    viewAllNamed: (name) => `View all ${name}`,
    viewCollection: "View collection",
    productCount: (count) => `${count} products`,
    emptyProductsTitle: "No products are published for this subcategory yet.",
    emptyProductsDescription:
      "Create an active product and assign this subcategory to show it here.",
    loadingCategory: "Loading category",
    loadingSubcategory: "Loading subcategory",
    categoryErrorTitle: "Category could not be loaded",
    subcategoryErrorTitle: "Subcategory could not be loaded",
    errorDescription:
      "Check the database connection or catalog service.",
    retry: "Try again",
    categoryNotFoundTitle: "Category not found",
    subcategoryNotFoundTitle: "Subcategory not found",
    notFoundDescription:
      "This page is not active yet or its address has changed.",
    backToShop: "Back to shop",
    catalogStateEyebrow: "Najibzadeh Catalog",
    metadata: {
      categoryDescription: (name) =>
        `${name} at Najibzadeh; discover luxury menswear collections, subcategories, and selected products.`,
      subcategoryDescription: (name, categoryName) =>
        `${name} in ${categoryName} at Najibzadeh; explore selected products and editorial imagery.`,
    },
  },
  ar: {
    brandEyebrow: "نجيب زاده",
    categoryAboutEyebrow: "عن التصنيف",
    categoryFallbackDescription:
      "تصفح مجموعات مختارة من نجيب زاده.",
    categoryFeatureEyebrow: "اختيار مميز",
    categoryFeatureDescription:
      "سيتم إكمال قصة هذا التصنيف المميزة قريبا.",
    categoryFinalEyebrow: "تابع الاختيار",
    categoryFinalTitle: (name) => `تسوق ${name}`,
    categoryFinalDescription:
      "ادخل المتجر لمشاهدة منتجات هذا التصنيف.",
    subcategoryFallbackTitle: "تصنيف فرعي",
    subcategoryFallbackDescription:
      "تصفح المنتجات المختارة في هذا التصنيف الفرعي.",
    subcategoryIntroFallbackDescription:
      "سيتم إكمال تفاصيل هذا التصنيف الفرعي قريبا.",
    subcategoryFeatureEyebrow: "تفاصيل المجموعة",
    subcategoryFeatureDescription:
      "سيتم إكمال قصة هذا التصنيف الفرعي المميزة قريبا.",
    subcategoryFinalEyebrow: "تسوق مختار",
    subcategoryFinalTitle: (name) => `تسوق ${name}`,
    subcategoryFinalDescription:
      "شاهد كل منتجات هذا التصنيف الفرعي في المتجر.",
    viewProducts: "مشاهدة المنتجات",
    enterShop: "دخول المتجر",
    viewShop: "مشاهدة المتجر",
    subcategoriesHeading: "التصنيفات الفرعية",
    productsHeading: "المنتجات",
    viewAll: "مشاهدة الكل",
    viewAllNamed: (name) => `مشاهدة كل ${name}`,
    viewCollection: "مشاهدة المجموعة",
    productCount: (count) => `${count} منتج`,
    emptyProductsTitle: "لم يتم نشر منتجات لهذا التصنيف الفرعي بعد.",
    emptyProductsDescription:
      "أنشئ منتجا فعالا واختر هذا التصنيف الفرعي ليظهر هنا.",
    loadingCategory: "جار تحميل التصنيف",
    loadingSubcategory: "جار تحميل التصنيف الفرعي",
    categoryErrorTitle: "تعذر تحميل التصنيف",
    subcategoryErrorTitle: "تعذر تحميل التصنيف الفرعي",
    errorDescription:
      "تحقق من الاتصال بقاعدة البيانات أو خدمة الكتالوج.",
    retry: "إعادة المحاولة",
    categoryNotFoundTitle: "التصنيف غير موجود",
    subcategoryNotFoundTitle: "التصنيف الفرعي غير موجود",
    notFoundDescription:
      "هذه الصفحة غير مفعلة بعد أو تم تغيير عنوانها.",
    backToShop: "العودة إلى المتجر",
    catalogStateEyebrow: "كتالوج نجيب زاده",
    metadata: {
      categoryDescription: (name) =>
        `${name} في متجر نجيب زاده؛ اكتشف مجموعات الملابس الرجالية الفاخرة والتصنيفات الفرعية والمنتجات المختارة.`,
      subcategoryDescription: (name, categoryName) =>
        `${name} ضمن ${categoryName} في نجيب زاده؛ تصفح المنتجات المختارة والصور التحريرية.`,
    },
  },
};

export function catalogNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale).format(
    value,
  );
}
