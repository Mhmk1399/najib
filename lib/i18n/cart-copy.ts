import type { Locale } from "@/lib/i18n/config";

export type CartCopy = {
  eyebrow: string; title: string; itemCount: string;
  loading: string; signedOutTitle: string; signedOutDescription: string; login: string;
  fetchError: string; retry: string; genericError: string;
  emptyTitle: string; emptyDescription: string; shop: string;
  itemsLabel: string; lockedNotice: string; color: string; size: string;
  decrease: string; increase: string;
  remove: string; removing: string; clear: string; clearing: string;
  sessionEnded: string; sessionEndedDescription: string;
  quantityError: string; removeError: string; clearError: string;
  removedSuccess: string; clearedSuccess: string;
  summary: string; subtotal: string; shipping: string; shippingPending: string;
  discountTax: string; discountTaxNone: string; merchandiseTotal: string;
  continuePayment: string; continueCheckout: string; reservationNote: string;
  notFoundError: string; conflictError: string; validationError: string; serverError: string;
};

export const cartCopy: Record<Locale, CartCopy> = {
  fa: {
    eyebrow: "انتخاب‌های شما", title: "سبد خرید", itemCount: "{count} کالا",
    loading: "در حال دریافت سبد خرید", signedOutTitle: "برای دیدن سبد وارد حساب شوید", signedOutDescription: "سبد خرید و رزرو موجودی به حساب شما متصل است تا انتخاب‌هایتان محفوظ بماند.", login: "ورود به حساب",
    fetchError: "سبد خرید دریافت نشد", retry: "تلاش دوباره", genericError: "لطفاً دوباره تلاش کنید.",
    emptyTitle: "سبد شما هنوز خالی است", emptyDescription: "از میان محصولات نجیب‌زاده، ترکیب دقیق رنگ و سایز خود را انتخاب کنید.", shop: "مشاهده فروشگاه",
    itemsLabel: "کالاهای سبد خرید", lockedNotice: "موجودی این انتخاب‌ها در مرحله پرداخت رزرو شده است. برای تغییر سبد، ابتدا رزرو خرید را لغو کنید.", color: "رنگ", size: "سایز",
    decrease: "کم کردن تعداد {name}", increase: "زیاد کردن تعداد {name}",
    remove: "حذف", removing: "در حال حذف…", clear: "خالی‌کردن سبد", clearing: "در حال خالی‌کردن…",
    sessionEnded: "نشست شما پایان یافته است", sessionEndedDescription: "برای ادامه مدیریت سبد دوباره وارد حساب شوید.",
    quantityError: "تغییر تعداد انجام نشد", removeError: "حذف کالا انجام نشد", clearError: "خالی‌کردن سبد انجام نشد", removedSuccess: "کالا از سبد حذف شد", clearedSuccess: "سبد خرید خالی شد",
    summary: "خلاصه سفارش", subtotal: "جمع کالاها", shipping: "هزینه ارسال", shippingPending: "در مرحله تحویل مشخص می‌شود", discountTax: "تخفیف و مالیات", discountTaxNone: "فعلاً اعمال نمی‌شود", merchandiseTotal: "مبلغ کالاها",
    continuePayment: "ادامه پرداخت", continueCheckout: "ادامه فرایند خرید", reservationNote: "موجودی تنها پس از ورود به مرحله تکمیل خرید برای ۱۵ دقیقه رزرو می‌شود.",
    notFoundError: "این کالا دیگر در سبد شما پیدا نشد.", conflictError: "سبد در وضعیت فعلی قابل تغییر نیست.", validationError: "اطلاعات ارسال‌شده معتبر نیست.", serverError: "ارتباط با فروشگاه ناموفق بود.",
  },
  en: {
    eyebrow: "Your selection", title: "Shopping bag", itemCount: "{count} items",
    loading: "Loading your shopping bag", signedOutTitle: "Sign in to view your bag", signedOutDescription: "Your bag and inventory reservations are linked to your account, so your selections stay protected.", login: "Sign in",
    fetchError: "We couldn’t load your bag", retry: "Try again", genericError: "Please try again.",
    emptyTitle: "Your bag is empty", emptyDescription: "Explore Najibzadeh and choose the exact colour and size for you.", shop: "Explore the shop",
    itemsLabel: "Items in your shopping bag", lockedNotice: "Inventory for these selections is reserved at checkout. Cancel the checkout reservation before editing your bag.", color: "Colour", size: "Size",
    decrease: "Decrease quantity of {name}", increase: "Increase quantity of {name}",
    remove: "Remove", removing: "Removing…", clear: "Clear bag", clearing: "Clearing…",
    sessionEnded: "Your session has ended", sessionEndedDescription: "Sign in again to continue managing your bag.",
    quantityError: "Quantity could not be updated", removeError: "Item could not be removed", clearError: "Bag could not be cleared", removedSuccess: "Item removed from your bag", clearedSuccess: "Your bag is now empty",
    summary: "Order summary", subtotal: "Items subtotal", shipping: "Shipping", shippingPending: "Calculated at delivery", discountTax: "Discounts and tax", discountTaxNone: "None applied yet", merchandiseTotal: "Merchandise total",
    continuePayment: "Continue payment", continueCheckout: "Continue to checkout", reservationNote: "Inventory is reserved for 15 minutes only after you enter checkout.",
    notFoundError: "This item is no longer in your bag.", conflictError: "Your bag cannot be changed in its current state.", validationError: "The submitted information is not valid.", serverError: "We couldn’t connect to the shop.",
  },
  ar: {
    eyebrow: "اختياراتك", title: "سلة التسوق", itemCount: "{count} قطعة",
    loading: "جارٍ تحميل سلة التسوق", signedOutTitle: "سجّل الدخول لعرض سلتك", signedOutDescription: "ترتبط سلة التسوق وحجوزات المخزون بحسابك للحفاظ على اختياراتك.", login: "تسجيل الدخول",
    fetchError: "تعذّر تحميل سلة التسوق", retry: "المحاولة مجددًا", genericError: "يرجى المحاولة مرة أخرى.",
    emptyTitle: "سلتك فارغة", emptyDescription: "استكشف منتجات نجيب زاده واختر اللون والمقاس المناسبين لك.", shop: "استكشاف المتجر",
    itemsLabel: "منتجات سلة التسوق", lockedNotice: "تم حجز مخزون هذه الاختيارات في مرحلة الدفع. ألغِ حجز الشراء قبل تعديل السلة.", color: "اللون", size: "المقاس",
    decrease: "تقليل كمية {name}", increase: "زيادة كمية {name}",
    remove: "إزالة", removing: "جارٍ الإزالة…", clear: "إفراغ السلة", clearing: "جارٍ الإفراغ…",
    sessionEnded: "انتهت جلستك", sessionEndedDescription: "سجّل الدخول مجددًا لمتابعة إدارة سلتك.",
    quantityError: "تعذّر تغيير الكمية", removeError: "تعذّرت إزالة المنتج", clearError: "تعذّر إفراغ السلة", removedSuccess: "تمت إزالة المنتج من السلة", clearedSuccess: "تم إفراغ سلة التسوق",
    summary: "ملخص الطلب", subtotal: "مجموع المنتجات", shipping: "الشحن", shippingPending: "يُحدّد عند التسليم", discountTax: "الخصم والضريبة", discountTaxNone: "لم يُطبّق بعد", merchandiseTotal: "إجمالي المنتجات",
    continuePayment: "متابعة الدفع", continueCheckout: "متابعة إتمام الشراء", reservationNote: "يُحجز المخزون لمدة ١٥ دقيقة فقط بعد الدخول إلى مرحلة إتمام الشراء.",
    notFoundError: "لم يعد هذا المنتج موجودًا في سلتك.", conflictError: "لا يمكن تعديل السلة في حالتها الحالية.", validationError: "المعلومات المرسلة غير صالحة.", serverError: "تعذّر الاتصال بالمتجر.",
  },
};
