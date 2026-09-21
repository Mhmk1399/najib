import type { Locale } from "@/lib/i18n/config";

export type ProductDetailCopy = {
  loading: string;
  loadErrorTitle: string;
  loadErrorDescription: string;
  retry: string;
  notFoundTitle: string;
  notFoundDescription: string;
  backToShop: string;
  stateEyebrow: string;
  metadataDescription: (name: string) => string;
  sectionFallbackDescription: string;
  sectionDescription: string;
  sectionMaterials: string;
  sectionOccasion: string;
  sectionShipping: string;
  materialLabel: string;
  materialFallback: string;
  fitLabel: string;
  silhouetteLabel: string;
  patternLabel: string;
  specsFallback: string;
  seasonsLabel: string;
  seasonsFallback: string;
  occasionsLabel: string;
  occasionsFallback: string;
  shippingParagraphs: [string, string];
  shippingNote: string;
  collectionFallback: string;
  defaultColor: string;
  productCode: string;
  shareProduct: string;
  favoriteAdd: string;
  favoriteRemove: string;
  color: string;
  chooseColor: (color: string) => string;
  chooseSize: string;
  sizeGuide: string;
  sizePlaceholder: string;
  addToBag: string;
  boutiqueAvailability: string;
  customerSupport: string;
  sizeRequired: string;
  sizeRequiredTitle: string;
  sizeRequiredDescription: string;
  unavailableCombination: string;
  unavailableTitle: string;
  unavailableDescription: string;
  addSuccessTitle: string;
  addSuccessSize: (size: string) => string;
  loginTitle: string;
  loginDescription: string;
  addErrorTitle: string;
  tryAgain: string;
  favoriteAdded: string;
  favoriteRemoved: string;
  linkCopied: string;
  mobileClose: string;
  mobileOpen: string;
  productNotesEyebrow: string;
  productNotesTitleTop: string;
  productNotesTitleBottom: string;
  relatedEyebrow: string;
  relatedTitle: string;
  viewCollection: string;
  zoomDialogLabel: string;
  closeZoom: string;
  previousImage: string;
  nextImage: string;
  productImage: string;
  viewImage: (index: string, productName: string) => string;
};

export const productDetailCopy: Record<Locale, ProductDetailCopy> = {
  fa: {
    loading: "در حال دریافت محصول",
    loadErrorTitle: "دریافت محصول ناموفق بود",
    loadErrorDescription: "اتصال دیتابیس یا وضعیت محصول را بررسی کنید.",
    retry: "تلاش دوباره",
    notFoundTitle: "محصول پیدا نشد",
    notFoundDescription: "این محصول هنوز فعال نشده یا آدرس آن تغییر کرده است.",
    backToShop: "بازگشت به فروشگاه",
    stateEyebrow: "جزئیات محصول",
    metadataDescription: (name) => `مشاهده جزئیات، تصاویر، رنگ‌ها و سایزهای ${name} در فروشگاه نجیب‌زاده.`,
    sectionFallbackDescription: "توضیحات این محصول به‌زودی تکمیل می‌شود.",
    sectionDescription: "توضیحات",
    sectionMaterials: "متریال و ساخت",
    sectionOccasion: "فصل و موقعیت",
    sectionShipping: "ارسال و مرجوعی",
    materialLabel: "متریال",
    materialFallback: "اطلاعات متریال ثبت نشده است.",
    fitLabel: "فرم",
    silhouetteLabel: "سیلوئت",
    patternLabel: "طرح",
    specsFallback: "جزئیات فرم و ساخت این محصول به‌زودی تکمیل می‌شود.",
    seasonsLabel: "فصل‌ها",
    seasonsFallback: "برای فصل‌های منتخب.",
    occasionsLabel: "موقعیت‌ها",
    occasionsFallback: "استایل رسمی و روزمره.",
    shippingParagraphs: [
      "ارسال و هماهنگی تحویل طبق شرایط فروشگاه انجام می‌شود.",
      "برای راهنمایی درباره سایز، موجودی یا نگهداری محصول با پشتیبانی تماس بگیرید.",
    ],
    shippingNote: "ارسال و پشتیبانی خرید طبق شرایط فروشگاه نجیب‌زاده انجام می‌شود.",
    collectionFallback: "کالکشن",
    defaultColor: "اصلی",
    productCode: "کد محصول",
    shareProduct: "اشتراک‌گذاری محصول",
    favoriteAdd: "افزودن به علاقه‌مندی‌ها",
    favoriteRemove: "حذف از علاقه‌مندی‌ها",
    color: "رنگ",
    chooseColor: (color) => `انتخاب ${color}`,
    chooseSize: "انتخاب سایز",
    sizeGuide: "راهنمای سایز",
    sizePlaceholder: "سایز را انتخاب کنید",
    addToBag: "افزودن به سبد خرید",
    boutiqueAvailability: "موجودی بوتیک",
    customerSupport: "پشتیبانی مشتریان",
    sizeRequired: "لطفاً سایز را انتخاب کنید.",
    sizeRequiredTitle: "سایز را انتخاب کنید",
    sizeRequiredDescription: "قبل از افزودن محصول به سبد خرید، یک سایز انتخاب کنید.",
    unavailableCombination: "این ترکیب رنگ و سایز قابل فروش نیست.",
    unavailableTitle: "این انتخاب موجود نیست",
    unavailableDescription: "ترکیب دیگری از رنگ و سایز را انتخاب کنید.",
    addSuccessTitle: "به سبد خرید اضافه شد",
    addSuccessSize: (size) => `سایز ${size}`,
    loginTitle: "ابتدا وارد حساب شوید",
    loginDescription: "پس از ورود، این انتخاب خودکار به سبد اضافه می‌شود.",
    addErrorTitle: "افزودن محصول ناموفق بود",
    tryAgain: "دوباره تلاش کنید.",
    favoriteAdded: "به علاقه‌مندی‌ها اضافه شد",
    favoriteRemoved: "از علاقه‌مندی‌ها حذف شد",
    linkCopied: "لینک کپی شد",
    mobileClose: "بستن اطلاعات محصول",
    mobileOpen: "باز کردن اطلاعات محصول",
    productNotesEyebrow: "یادداشت‌های محصول",
    productNotesTitleTop: "جزئیات است که",
    productNotesTitleBottom: "تفاوت می‌سازد.",
    relatedEyebrow: "انتخاب‌شده برای شما",
    relatedTitle: "شاید بپسندید.",
    viewCollection: "مشاهده کالکشن",
    zoomDialogLabel: "نمایشگر تصویر محصول",
    closeZoom: "بستن نمایشگر تصویر",
    previousImage: "تصویر قبلی",
    nextImage: "تصویر بعدی",
    productImage: "تصویر محصول",
    viewImage: (index, productName) => `مشاهده تصویر ${index} ${productName}`,
  },
  en: {
    loading: "Loading product",
    loadErrorTitle: "Product could not be loaded",
    loadErrorDescription: "Check the product status or database connection.",
    retry: "Try again",
    notFoundTitle: "Product not found",
    notFoundDescription: "This product is not active yet or its address has changed.",
    backToShop: "Back to shop",
    stateEyebrow: "Product detail",
    metadataDescription: (name) => `View details, images, colors, and sizes for ${name} at Najibzadeh.`,
    sectionFallbackDescription: "This product description will be completed soon.",
    sectionDescription: "Description",
    sectionMaterials: "Material and make",
    sectionOccasion: "Season and occasion",
    sectionShipping: "Shipping and returns",
    materialLabel: "Material",
    materialFallback: "Material information has not been added yet.",
    fitLabel: "Fit",
    silhouetteLabel: "Silhouette",
    patternLabel: "Pattern",
    specsFallback: "Fit and construction details will be completed soon.",
    seasonsLabel: "Seasons",
    seasonsFallback: "For selected seasons.",
    occasionsLabel: "Occasions",
    occasionsFallback: "Formal and everyday styling.",
    shippingParagraphs: [
      "Delivery coordination follows store terms.",
      "For sizing, availability, or care guidance, contact support.",
    ],
    shippingNote: "Delivery and purchase support follow Najibzadeh store terms.",
    collectionFallback: "Collection",
    defaultColor: "Main",
    productCode: "Product code",
    shareProduct: "Share product",
    favoriteAdd: "Add to wishlist",
    favoriteRemove: "Remove from wishlist",
    color: "Color",
    chooseColor: (color) => `Choose ${color}`,
    chooseSize: "Choose size",
    sizeGuide: "Size guide",
    sizePlaceholder: "Choose a size",
    addToBag: "Add to bag",
    boutiqueAvailability: "Boutique availability",
    customerSupport: "Customer support",
    sizeRequired: "Please choose a size.",
    sizeRequiredTitle: "Choose a size",
    sizeRequiredDescription: "Select a size before adding this product to your bag.",
    unavailableCombination: "This color and size combination is not available.",
    unavailableTitle: "This option is unavailable",
    unavailableDescription: "Choose another color and size combination.",
    addSuccessTitle: "Added to bag",
    addSuccessSize: (size) => `Size ${size}`,
    loginTitle: "Sign in first",
    loginDescription: "After signing in, this selection will be added to your bag automatically.",
    addErrorTitle: "Could not add product",
    tryAgain: "Try again.",
    favoriteAdded: "Added to wishlist",
    favoriteRemoved: "Removed from wishlist",
    linkCopied: "Link copied",
    mobileClose: "Close product information",
    mobileOpen: "Open product information",
    productNotesEyebrow: "Product notes",
    productNotesTitleTop: "Details make",
    productNotesTitleBottom: "the difference.",
    relatedEyebrow: "Selected for you",
    relatedTitle: "You may also like.",
    viewCollection: "View collection",
    zoomDialogLabel: "Product image viewer",
    closeZoom: "Close image viewer",
    previousImage: "Previous image",
    nextImage: "Next image",
    productImage: "Product image",
    viewImage: (index, productName) => `View image ${index} of ${productName}`,
  },
  ar: {
    loading: "جارٍ تحميل المنتج",
    loadErrorTitle: "تعذر تحميل المنتج",
    loadErrorDescription: "تحقق من حالة المنتج أو اتصال قاعدة البيانات.",
    retry: "حاول مرة أخرى",
    notFoundTitle: "لم يتم العثور على المنتج",
    notFoundDescription: "هذا المنتج غير فعال بعد أو تغيّر رابطه.",
    backToShop: "العودة إلى المتجر",
    stateEyebrow: "تفاصيل المنتج",
    metadataDescription: (name) => `شاهد تفاصيل وصور وألوان ومقاسات ${name} في نجيب زاده.`,
    sectionFallbackDescription: "سيتم استكمال وصف هذا المنتج قريباً.",
    sectionDescription: "الوصف",
    sectionMaterials: "الخامة والتنفيذ",
    sectionOccasion: "الموسم والمناسبة",
    sectionShipping: "الشحن والإرجاع",
    materialLabel: "الخامة",
    materialFallback: "لم تتم إضافة معلومات الخامة بعد.",
    fitLabel: "القصة",
    silhouetteLabel: "الشكل",
    patternLabel: "النقشة",
    specsFallback: "سيتم استكمال تفاصيل القصة والتنفيذ قريباً.",
    seasonsLabel: "المواسم",
    seasonsFallback: "للمواسم المختارة.",
    occasionsLabel: "المناسبات",
    occasionsFallback: "للإطلالات الرسمية واليومية.",
    shippingParagraphs: [
      "يتم تنسيق التوصيل وفق شروط المتجر.",
      "للمساعدة بشأن المقاس أو التوفر أو العناية بالمنتج، تواصل مع الدعم.",
    ],
    shippingNote: "يتم الشحن ودعم الشراء وفق شروط متجر نجيب زاده.",
    collectionFallback: "مجموعة",
    defaultColor: "أساسي",
    productCode: "رمز المنتج",
    shareProduct: "مشاركة المنتج",
    favoriteAdd: "إضافة إلى المفضلة",
    favoriteRemove: "إزالة من المفضلة",
    color: "اللون",
    chooseColor: (color) => `اختر ${color}`,
    chooseSize: "اختر المقاس",
    sizeGuide: "دليل المقاسات",
    sizePlaceholder: "اختر مقاساً",
    addToBag: "إضافة إلى السلة",
    boutiqueAvailability: "توفره في البوتيك",
    customerSupport: "دعم العملاء",
    sizeRequired: "يرجى اختيار المقاس.",
    sizeRequiredTitle: "اختر المقاس",
    sizeRequiredDescription: "اختر مقاساً قبل إضافة المنتج إلى السلة.",
    unavailableCombination: "هذا المزيج من اللون والمقاس غير متاح للبيع.",
    unavailableTitle: "هذا الخيار غير متاح",
    unavailableDescription: "اختر مزيجاً آخر من اللون والمقاس.",
    addSuccessTitle: "تمت الإضافة إلى السلة",
    addSuccessSize: (size) => `المقاس ${size}`,
    loginTitle: "سجّل الدخول أولاً",
    loginDescription: "بعد تسجيل الدخول، ستتم إضافة هذا الاختيار تلقائياً إلى السلة.",
    addErrorTitle: "تعذرت إضافة المنتج",
    tryAgain: "حاول مرة أخرى.",
    favoriteAdded: "تمت الإضافة إلى المفضلة",
    favoriteRemoved: "تمت الإزالة من المفضلة",
    linkCopied: "تم نسخ الرابط",
    mobileClose: "إغلاق معلومات المنتج",
    mobileOpen: "فتح معلومات المنتج",
    productNotesEyebrow: "ملاحظات المنتج",
    productNotesTitleTop: "التفاصيل تصنع",
    productNotesTitleBottom: "الفارق.",
    relatedEyebrow: "مختار لك",
    relatedTitle: "قد يعجبك أيضاً.",
    viewCollection: "عرض المجموعة",
    zoomDialogLabel: "عارض صور المنتج",
    closeZoom: "إغلاق عارض الصور",
    previousImage: "الصورة السابقة",
    nextImage: "الصورة التالية",
    productImage: "صورة المنتج",
    viewImage: (index, productName) => `عرض الصورة ${index} من ${productName}`,
  },
};

export function formatProductNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale).format(value);
}

export function formatProductMoney(
  value: number,
  currency: string | undefined,
  locale: Locale,
) {
  return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale, {
    style: "currency",
    currency: currency || "IRR",
    maximumFractionDigits: 0,
  }).format(value);
}
