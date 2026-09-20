import type { Locale } from "@/lib/i18n/config";

export type ShopCopy = {
  hero: {
    imageAlt: string;
    title: string;
    description: string;
    highlights: [string, string, string];
  };

  filters: {
    all: string;
    filters: string;
    productFiltersAriaLabel: string;
    category: string;
    size: string;
    color: string;
    price: string;
    material: string;
    collection: string;
    clear: string;
    clearShort: string;
    closeAriaLabel: string;
    refineSelection: string;
    activeFiltersTemplate: string;
    pinned: string;
    preview: string;
    clickToPin: string;
    clickToUnpin: string;
    resultTemplate: string;
    viewResultsTemplate: string;
    collections: {
      all: string;
      newSeason: string;
    };
  };

  sort: {
    label: string;
    ariaLabel: string;
    menuTitle: string;
    mobileDescription: string;
    options: {
      newArrivals: { label: string; shortLabel: string };
      featured: { label: string; shortLabel: string };
      priceLow: { label: string; shortLabel: string };
      priceHigh: { label: string; shortLabel: string };
    };
  };

  products: {
    productCountTemplate: string;
    desktopSelectionLabel: string;
    mobileSelectionLabel: string;
    loading: string;
    errorTitle: string;
    errorDescription: string;
    waitDescription: string;
    fallbackCategory: string;
    viewAriaTemplate: string;
    quickOptions: string;
    openQuickOptions: string;
    closeQuickOptions: string;
    previousImage: string;
    nextImage: string;
    color: string;
    size: string;
    selectColorTemplate: string;
    selectSizeTemplate: string;
    addToCartAria: string;
    added: string;
    buyTemplate: string;
    previousOptionsTemplate: string;
    nextOptionsTemplate: string;
  };

  wishlist: {
    added: string;
    removed: string;
    addAriaTemplate: string;
    removeAriaTemplate: string;
  };

  cart: {
    selectSizeTitle: string;
    selectSizeDescription: string;
    unavailableTitle: string;
    unavailableDescription: string;
    addedTitle: string;
    sizeTemplate: string;
    loginTitle: string;
    loginDescription: string;
    errorTitle: string;
    errorFallback: string;
  };

  empty: {
    title: string;
    description: string;
    clearFilters: string;
  };

  price: {
    maxAriaLabel: string;
  };

  banner: {
    title: string;
    subtitle: string;
    description: string;
    ctaText: string;
    badge: string;
  };

  fetchError: string;
};

export const shopCopy: Record<Locale, ShopCopy> = {
  fa: {
    hero: {
      imageAlt: "مجموعه پوشاک مردانه نجیب‌زاده",
      title: "فروشگاه",
      description: "پرفروش‌ترین محصولات برند نجیب‌زاده",
      highlights: ["کیفیت", "دست‌دوز", "شخصیت"],
    },
    filters: {
      all: "همه",
      filters: "فیلترها",
      productFiltersAriaLabel: "فیلترهای محصول",
      category: "دسته‌بندی",
      size: "سایز",
      color: "رنگ",
      price: "قیمت",
      material: "جنس",
      collection: "کالکشن",
      clear: "پاک‌کردن",
      clearShort: "پاک",
      closeAriaLabel: "بستن فیلترها",
      refineSelection: "انتخاب‌ها را دقیق‌تر کنید",
      activeFiltersTemplate: "{count} فیلتر فعال",
      pinned: "ثابت شده",
      preview: "پیش‌نمایش",
      clickToPin: "کلیک برای ثابت کردن",
      clickToUnpin: "کلیک برای آزاد کردن",
      resultTemplate: "{count} نتیجه",
      viewResultsTemplate: "مشاهده {count} محصول",
      collections: {
        all: "همه کالکشن‌ها",
        newSeason: "فصل جدید",
      },
    },
    sort: {
      label: "مرتب‌سازی",
      ariaLabel: "مرتب‌سازی محصولات",
      menuTitle: "ترتیب نمایش",
      mobileDescription: "ترتیب نمایش محصولات",
      options: {
        newArrivals: { label: "جدیدترین", shortLabel: "جدیدترین" },
        featured: { label: "ویژه", shortLabel: "ویژه" },
        priceLow: { label: "قیمت: کم به زیاد", shortLabel: "ارزان‌تر" },
        priceHigh: { label: "قیمت: زیاد به کم", shortLabel: "گران‌تر" },
      },
    },
    products: {
      productCountTemplate: "{count} محصول",
      desktopSelectionLabel: "انتخاب‌های دقیق نجیب‌زاده",
      mobileSelectionLabel: "انتخاب نجیب‌زاده",
      loading: "در حال دریافت محصولات",
      errorTitle: "دریافت محصولات ناموفق بود",
      errorDescription: "اتصال دیتابیس یا سرویس فروشگاه را بررسی کنید.",
      waitDescription: "چند لحظه صبر کنید.",
      fallbackCategory: "محصول",
      viewAriaTemplate: "مشاهده {product}",
      quickOptions: "گزینه‌های سریع",
      openQuickOptions: "باز کردن گزینه‌های سریع محصول",
      closeQuickOptions: "بستن گزینه‌های سریع محصول",
      previousImage: "تصویر قبلی",
      nextImage: "تصویر بعدی",
      color: "رنگ",
      size: "سایز",
      selectColorTemplate: "انتخاب رنگ {color}",
      selectSizeTemplate: "انتخاب سایز {size}",
      addToCartAria: "افزودن به سبد خرید",
      added: "اضافه شد",
      buyTemplate: "{price} خرید",
      previousOptionsTemplate: "گزینه‌های قبلی {label}",
      nextOptionsTemplate: "گزینه‌های بعدی {label}",
    },
    wishlist: {
      added: "به علاقه‌مندی‌ها اضافه شد",
      removed: "از علاقه‌مندی‌ها حذف شد",
      addAriaTemplate: "افزودن {product} به علاقه‌مندی‌ها",
      removeAriaTemplate: "حذف {product} از علاقه‌مندی‌ها",
    },
    cart: {
      selectSizeTitle: "سایز را انتخاب کنید",
      selectSizeDescription: "قبل از افزودن محصول به سبد، یک سایز انتخاب کنید.",
      unavailableTitle: "این انتخاب موجود نیست",
      unavailableDescription: "ترکیب دیگری از رنگ و سایز را انتخاب کنید.",
      addedTitle: "به سبد خرید اضافه شد",
      sizeTemplate: "سایز {size}",
      loginTitle: "ابتدا وارد حساب شوید",
      loginDescription: "پس از ورود می‌توانید محصول را به سبد اضافه کنید.",
      errorTitle: "افزودن محصول ناموفق بود",
      errorFallback: "دوباره برای افزودن محصول تلاش کنید.",
    },
    empty: {
      title: "محصولی پیدا نشد",
      description: "فیلترها را تغییر دهید تا محصولات بیشتری از فروشگاه نمایش داده شود.",
      clearFilters: "پاک‌کردن فیلترها",
    },
    price: {
      maxAriaLabel: "حداکثر قیمت",
    },
    banner: {
      title: "کالکشن پاییز/زمستان",
      subtitle: "اکنون در دسترس",
      description: "قطعاتی با ساخت دقیق که حال‌وهوای فصل را تعریف می‌کنند؛ سیلوئت‌های خیاطی‌شده را در پارچه‌های ممتاز کشف کنید.",
      ctaText: "مشاهده کالکشن",
      badge: "فصل جدید",
    },
    fetchError: "دریافت محصولات ناموفق بود.",
  },

  en: {
    hero: {
      imageAlt: "Najibzadeh menswear collection",
      title: "Shop",
      description: "Najibzadeh best-selling pieces",
      highlights: ["Quality", "Handcrafted", "Character"],
    },
    filters: {
      all: "All",
      filters: "Filters",
      productFiltersAriaLabel: "Product filters",
      category: "Category",
      size: "Size",
      color: "Color",
      price: "Price",
      material: "Material",
      collection: "Collection",
      clear: "Clear",
      clearShort: "Clear",
      closeAriaLabel: "Close filters",
      refineSelection: "Refine your selection",
      activeFiltersTemplate: "{count} active filters",
      pinned: "Pinned",
      preview: "Preview",
      clickToPin: "Click to pin",
      clickToUnpin: "Click to unpin",
      resultTemplate: "{count} results",
      viewResultsTemplate: "View {count} products",
      collections: {
        all: "All collections",
        newSeason: "New season",
      },
    },
    sort: {
      label: "Sort",
      ariaLabel: "Sort products",
      menuTitle: "Sort collection",
      mobileDescription: "Product display order",
      options: {
        newArrivals: { label: "New arrivals", shortLabel: "Newest" },
        featured: { label: "Featured", shortLabel: "Featured" },
        priceLow: { label: "Price: Low to high", shortLabel: "Lower price" },
        priceHigh: { label: "Price: High to low", shortLabel: "Higher price" },
      },
    },
    products: {
      productCountTemplate: "{count} products",
      desktopSelectionLabel: "The Najibzadeh edit",
      mobileSelectionLabel: "Najibzadeh selection",
      loading: "Loading products",
      errorTitle: "Unable to load products",
      errorDescription: "Check the database connection or storefront service.",
      waitDescription: "Please wait a moment.",
      fallbackCategory: "Product",
      viewAriaTemplate: "View {product}",
      quickOptions: "Quick options",
      openQuickOptions: "Open quick product options",
      closeQuickOptions: "Close quick product options",
      previousImage: "Previous image",
      nextImage: "Next image",
      color: "Color",
      size: "Size",
      selectColorTemplate: "Select color {color}",
      selectSizeTemplate: "Select size {size}",
      addToCartAria: "Add to cart",
      added: "Added",
      buyTemplate: "Buy {price}",
      previousOptionsTemplate: "Previous {label} options",
      nextOptionsTemplate: "Next {label} options",
    },
    wishlist: {
      added: "Added to wishlist",
      removed: "Removed from wishlist",
      addAriaTemplate: "Add {product} to wishlist",
      removeAriaTemplate: "Remove {product} from wishlist",
    },
    cart: {
      selectSizeTitle: "Select a size",
      selectSizeDescription: "Choose a size before adding this product to your bag.",
      unavailableTitle: "This selection is unavailable",
      unavailableDescription: "Choose another color and size combination.",
      addedTitle: "Added to bag",
      sizeTemplate: "Size {size}",
      loginTitle: "Sign in first",
      loginDescription: "After signing in, you can add this product to your bag.",
      errorTitle: "Could not add product",
      errorFallback: "Try adding the product again.",
    },
    empty: {
      title: "No products found",
      description: "Adjust your filters to discover more products in the store.",
      clearFilters: "Clear filters",
    },
    price: {
      maxAriaLabel: "Maximum price",
    },
    banner: {
      title: "The Autumn/Winter\nCollection",
      subtitle: "Now Available",
      description: "Meticulously crafted pieces that define the season. Explore tailored silhouettes in the finest fabrics.",
      ctaText: "Explore the Collection",
      badge: "New Season",
    },
    fetchError: "Unable to load products.",
  },

  ar: {
    hero: {
      imageAlt: "مجموعة نجيب زاده للأزياء الرجالية",
      title: "المتجر",
      description: "القطع الأكثر مبيعاً من نجيب زاده",
      highlights: ["الجودة", "حرفية يدوية", "الشخصية"],
    },
    filters: {
      all: "الكل",
      filters: "الفلاتر",
      productFiltersAriaLabel: "فلاتر المنتجات",
      category: "الفئة",
      size: "المقاس",
      color: "اللون",
      price: "السعر",
      material: "الخامة",
      collection: "المجموعة",
      clear: "مسح",
      clearShort: "مسح",
      closeAriaLabel: "إغلاق الفلاتر",
      refineSelection: "حدّد اختياراتك بدقة أكبر",
      activeFiltersTemplate: "{count} فلاتر مفعّلة",
      pinned: "مثبّت",
      preview: "معاينة",
      clickToPin: "انقر للتثبيت",
      clickToUnpin: "انقر لإلغاء التثبيت",
      resultTemplate: "{count} نتيجة",
      viewResultsTemplate: "عرض {count} منتج",
      collections: {
        all: "كل المجموعات",
        newSeason: "الموسم الجديد",
      },
    },
    sort: {
      label: "الترتيب",
      ariaLabel: "ترتيب المنتجات",
      menuTitle: "ترتيب المجموعة",
      mobileDescription: "ترتيب عرض المنتجات",
      options: {
        newArrivals: { label: "الأحدث", shortLabel: "الأحدث" },
        featured: { label: "المميزة", shortLabel: "المميزة" },
        priceLow: { label: "السعر: من الأقل إلى الأعلى", shortLabel: "الأقل سعراً" },
        priceHigh: { label: "السعر: من الأعلى إلى الأقل", shortLabel: "الأعلى سعراً" },
      },
    },
    products: {
      productCountTemplate: "{count} منتج",
      desktopSelectionLabel: "مختارات نجيب زاده",
      mobileSelectionLabel: "اختيارات نجيب زاده",
      loading: "جارٍ تحميل المنتجات",
      errorTitle: "تعذر تحميل المنتجات",
      errorDescription: "تحقق من اتصال قاعدة البيانات أو خدمة المتجر.",
      waitDescription: "يرجى الانتظار لحظات.",
      fallbackCategory: "منتج",
      viewAriaTemplate: "عرض {product}",
      quickOptions: "خيارات سريعة",
      openQuickOptions: "فتح خيارات المنتج السريعة",
      closeQuickOptions: "إغلاق خيارات المنتج السريعة",
      previousImage: "الصورة السابقة",
      nextImage: "الصورة التالية",
      color: "اللون",
      size: "المقاس",
      selectColorTemplate: "اختيار اللون {color}",
      selectSizeTemplate: "اختيار المقاس {size}",
      addToCartAria: "إضافة إلى السلة",
      added: "تمت الإضافة",
      buyTemplate: "شراء {price}",
      previousOptionsTemplate: "خيارات {label} السابقة",
      nextOptionsTemplate: "خيارات {label} التالية",
    },
    wishlist: {
      added: "تمت الإضافة إلى المفضلة",
      removed: "تمت الإزالة من المفضلة",
      addAriaTemplate: "إضافة {product} إلى المفضلة",
      removeAriaTemplate: "إزالة {product} من المفضلة",
    },
    cart: {
      selectSizeTitle: "اختر المقاس",
      selectSizeDescription: "اختر مقاساً قبل إضافة المنتج إلى السلة.",
      unavailableTitle: "هذا الاختيار غير متاح",
      unavailableDescription: "اختر تركيبة أخرى من اللون والمقاس.",
      addedTitle: "تمت الإضافة إلى السلة",
      sizeTemplate: "المقاس {size}",
      loginTitle: "سجّل الدخول أولاً",
      loginDescription: "بعد تسجيل الدخول يمكنك إضافة المنتج إلى السلة.",
      errorTitle: "تعذرت إضافة المنتج",
      errorFallback: "حاول إضافة المنتج مرة أخرى.",
    },
    empty: {
      title: "لم يتم العثور على منتجات",
      description: "غيّر الفلاتر لعرض المزيد من المنتجات في المتجر.",
      clearFilters: "مسح الفلاتر",
    },
    price: {
      maxAriaLabel: "الحد الأقصى للسعر",
    },
    banner: {
      title: "مجموعة الخريف/الشتاء",
      subtitle: "متاحة الآن",
      description: "قطع مصنوعة بعناية لتعبّر عن روح الموسم. اكتشف قصّات مصممة بخامات مختارة بعناية.",
      ctaText: "استكشف المجموعة",
      badge: "الموسم الجديد",
    },
    fetchError: "تعذر تحميل المنتجات.",
  },
};
