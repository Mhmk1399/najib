import type { Locale } from "@/lib/i18n/config";
import { amountForCurrencyDisplay } from "@/lib/catalog/currency";

export type ImageStoryText = {
  fa?: string;
  en?: string;
  ar?: string;
};

export const imageStoryCopy: Record<
  Locale,
  {
    island: {
      aria: string;
      open: string;
      close: string;
      closePanel: string;
      assistantTitle: string;
      imageChoices: string;
      relatedKicker: string;
      searchKicker: string;
      imageDescription: string;
      searchDescription: string;
      relatedProducts: string;
      choosePreview: string;
      selectionCount: (count: string) => string;
      productCount: (count: string) => string;
      quickView: (title: string) => string;
      emptyProducts: string;
      searchLabel: string;
      searchPlaceholder: string;
      clearSearch: string;
      submitSearch: string;
      allProducts: string;
      quickPrompts: string[];
    };
    reveal: {
      previewAlt: string;
      loadError: string;
      exit: string;
      exitPreview: string;
      productPage: string;
      colors: string;
      loadingImages: string;
      imagesUnavailable: string;
      viewFullImage: (index: string, title: string) => string;
      originalImage: string;
      closeImageModal: string;
      close: string;
      previousImage: string;
      nextImage: string;
      showImage: (index: string) => string;
      back: string;
    };
  }
> = {
  fa: {
    island: {
      aria: "دستیار انتخاب و پیشنهادهای تصویر",
      open: "باز کردن دستیار انتخاب",
      close: "بستن دستیار انتخاب",
      closePanel: "بستن پنل پیشنهادها",
      assistantTitle: "دستیار انتخاب نجیب‌زاده",
      imageChoices: "انتخاب‌های این تصویر",
      relatedKicker: "انتخاب‌های مرتبط",
      searchKicker: "جست‌وجوی سریع فروشگاه",
      imageDescription: "محصولات این تصویر را یک‌جا ببینید.",
      searchDescription: "آنچه می‌خواهید بپوشید را جست‌وجو کنید.",
      relatedProducts: "محصولات مرتبط",
      choosePreview: "انتخاب برای پیش‌نمایش",
      selectionCount: (count) => `${count} انتخاب مرتبط`,
      productCount: (count) => `${count} محصول`,
      quickView: (title) => `نمایش سریع ${title}`,
      emptyProducts: "برای این تصویر هنوز محصولی ثبت نشده است.",
      searchLabel: "جست‌وجوی محصولات",
      searchPlaceholder: "جست‌وجوی محصولات مرتبط...",
      clearSearch: "پاک کردن جست‌وجو",
      submitSearch: "جست‌وجو در فروشگاه",
      allProducts: "همه محصولات",
      quickPrompts: ["کت رسمی", "استایل مهمانی", "عطر مردانه"],
    },
    reveal: {
      previewAlt: "پیش‌نمایش محصول",
      loadError: "دریافت محصول ناموفق بود.",
      exit: "خروج",
      exitPreview: "خروج از پیش‌نمایش محصول",
      productPage: "صفحه محصول",
      colors: "رنگ",
      loadingImages: "در حال دریافت تصاویر محصول",
      imagesUnavailable: "نمایش تصاویر در حال حاضر ممکن نیست.",
      viewFullImage: (index, title) => `مشاهده کامل تصویر ${index} از ${title}`,
      originalImage: "تصویر اصلی",
      closeImageModal: "بستن نمایش تصویر",
      close: "بستن",
      previousImage: "تصویر قبلی",
      nextImage: "تصویر بعدی",
      showImage: (index) => `نمایش تصویر ${index}`,
      back: "بازگشت",
    },
  },
  en: {
    island: {
      aria: "Image shopping assistant",
      open: "Open selection assistant",
      close: "Close selection assistant",
      closePanel: "Close suggestions panel",
      assistantTitle: "Najibzadeh selection assistant",
      imageChoices: "Choices in this image",
      relatedKicker: "Related choices",
      searchKicker: "Quick store search",
      imageDescription: "View the products connected to this image.",
      searchDescription: "Search for the piece you want to wear.",
      relatedProducts: "Related products",
      choosePreview: "Select to preview",
      selectionCount: (count) => `${count} related choices`,
      productCount: (count) => `${count} products`,
      quickView: (title) => `Quick view ${title}`,
      emptyProducts: "No products are connected to this image yet.",
      searchLabel: "Search products",
      searchPlaceholder: "Search related products...",
      clearSearch: "Clear search",
      submitSearch: "Search the store",
      allProducts: "All products",
      quickPrompts: ["Formal jacket", "Evening style", "Men's fragrance"],
    },
    reveal: {
      previewAlt: "Product preview",
      loadError: "Product could not be loaded.",
      exit: "Exit",
      exitPreview: "Exit product preview",
      productPage: "Product page",
      colors: "Color",
      loadingImages: "Loading product images",
      imagesUnavailable: "Images are not available right now.",
      viewFullImage: (index, title) => `View image ${index} of ${title}`,
      originalImage: "Original image",
      closeImageModal: "Close image viewer",
      close: "Close",
      previousImage: "Previous image",
      nextImage: "Next image",
      showImage: (index) => `Show image ${index}`,
      back: "Back",
    },
  },
  ar: {
    island: {
      aria: "مساعد اختيار الصور",
      open: "فتح مساعد الاختيار",
      close: "إغلاق مساعد الاختيار",
      closePanel: "إغلاق لوحة الاقتراحات",
      assistantTitle: "مساعد اختيار نجيب زاده",
      imageChoices: "اختيارات هذه الصورة",
      relatedKicker: "اختيارات مرتبطة",
      searchKicker: "بحث سريع في المتجر",
      imageDescription: "شاهد المنتجات المرتبطة بهذه الصورة.",
      searchDescription: "ابحث عمّا تريد ارتداءه.",
      relatedProducts: "منتجات مرتبطة",
      choosePreview: "اختر للمعاينة",
      selectionCount: (count) => `${count} اختيارات مرتبطة`,
      productCount: (count) => `${count} منتجات`,
      quickView: (title) => `معاينة سريعة ${title}`,
      emptyProducts: "لم يتم ربط أي منتج بهذه الصورة بعد.",
      searchLabel: "بحث عن المنتجات",
      searchPlaceholder: "ابحث عن منتجات مرتبطة...",
      clearSearch: "مسح البحث",
      submitSearch: "بحث في المتجر",
      allProducts: "كل المنتجات",
      quickPrompts: ["جاكيت رسمي", "إطلالة مسائية", "عطر رجالي"],
    },
    reveal: {
      previewAlt: "معاينة المنتج",
      loadError: "تعذر تحميل المنتج.",
      exit: "خروج",
      exitPreview: "الخروج من معاينة المنتج",
      productPage: "صفحة المنتج",
      colors: "اللون",
      loadingImages: "جار تحميل صور المنتج",
      imagesUnavailable: "الصور غير متاحة حالياً.",
      viewFullImage: (index, title) => `عرض الصورة ${index} من ${title}`,
      originalImage: "الصورة الأصلية",
      closeImageModal: "إغلاق عارض الصورة",
      close: "إغلاق",
      previousImage: "الصورة السابقة",
      nextImage: "الصورة التالية",
      showImage: (index) => `عرض الصورة ${index}`,
      back: "عودة",
    },
  },
};

export function localizedStoryText(
  value: ImageStoryText | null | undefined,
  locale: Locale,
  fallback = "",
) {
  const priorities: Record<Locale, Array<keyof ImageStoryText>> = {
    fa: ["fa", "en", "ar"],
    en: ["en", "fa", "ar"],
    ar: ["ar", "fa", "en"],
  };

  for (const key of priorities[locale]) {
    const candidate = value?.[key]?.trim();
    if (candidate) return candidate;
  }

  return fallback;
}

export function formatStoryNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale).format(value);
}

export function formatStoryMoney(
  minor: number | undefined,
  currency: string | undefined,
  locale: Locale,
) {
  if (typeof minor !== "number") return "";

  try {
    return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale, {
      style: "currency",
      currency: currency || "IRR",
      maximumFractionDigits: 0,
    }).format(amountForCurrencyDisplay(minor, currency || "IRR"));
  } catch {
    return `${formatStoryNumber(amountForCurrencyDisplay(minor, currency || "IRR"), locale)} ${currency ?? ""}`.trim();
  }
}
