"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, LockKeyhole, RefreshCw, ShoppingBag } from "lucide-react";
import { type CSSProperties, useEffect } from "react";

import { Button } from "@/components/ui/Button";
import { CommerceApiError, commerceFetch, formatMinor } from "@/lib/commerce/client";
import { getHtmlLang, getLocaleDirection, type Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/routes";
import { lightTokens, themeClasses } from "@/theme/theme-colors";

type LocalizedText = { fa?: string; en?: string; ar?: string };
type RecoveryItem = {
  variantId: string;
  productName: LocalizedText;
  colorName: LocalizedText;
  sizeName: LocalizedText;
  requestedQuantity: number;
  existingQuantity: number;
  availableQuantity: number;
  restorableQuantity: number;
  previousUnitPriceMinor: number;
  currentUnitPriceMinor: number | null;
  priceChanged: boolean;
  available: boolean;
  skipReason: LocalizedText | null;
};
type RecoveryPreview = {
  abandonedCheckoutId: string;
  currency: string;
  tokenExpiresAt: string;
  restored: boolean;
  idempotent: boolean;
  recoveryCartId: string | null;
  items: RecoveryItem[];
  requestedItemCount: number;
  restorableItemCount: number;
  currentSubtotalMinor: number;
};

const copy = {
  fa: {
    eyebrow: "بازیابی امن خرید", checking: "در حال بررسی لینک…", title: "انتخاب‌هایتان هنوز اینجا هستند",
    intro: "موجودی و قیمت امروز را بررسی می‌کنیم و فقط کالاهای قابل فروش را به سبد فعال شما برمی‌گردانیم.",
    security: "این لینک به حساب شما متصل است؛ اطلاعات شخصی بدون ورود نمایش داده نمی‌شود.",
    steps: ["لینک امن", "بررسی موجودی", "بازگشت به سبد"], previous: "قیمت پیشین", current: "قیمت امروز",
    requested: "درخواست", restoredQty: "قابل بازگشت", existing: "اکنون در سبد", summary: "خلاصه بازیابی",
    available: "آماده بازگشت", unavailable: "قابل بازگشت نیست", restore: "بازگرداندن به سبد", restoring: "در حال بازگرداندن…",
    success: "انتخاب‌ها به سبد شما برگشت", successBody: "قیمت و موجودی دوباره روی سرور بررسی شد. برای ادامه خرید وارد سبد شوید.",
    repeated: "این لینک قبلاً استفاده شده است", repeatedBody: "کالاها دوباره اضافه نشدند؛ همان سبد بازیابی‌شده آماده ادامه است.",
    cart: "مشاهده سبد", shop: "بازگشت به فروشگاه", retry: "تلاش دوباره", unavailableAll: "در حال حاضر کالایی برای بازگرداندن موجود نیست.",
    invalidTitle: "این لینک کامل یا معتبر نیست", invalidBody: "لینک بازیابی ناقص، منقضی یا با لینک تازه‌تری جایگزین شده است.",
    wrongOwnerTitle: "این لینک برای حساب دیگری است", wrongOwnerBody: "با همان حسابی وارد شوید که خرید را آغاز کرده بود.",
    expiredTitle: "مهلت این لینک تمام شده است", expiredBody: "برای دریافت لینک تازه با پشتیبانی یا فروشگاه تماس بگیرید.",
    unavailableTitle: "این خرید دیگر قابل بازیابی نیست", unavailableBody: "ممکن است خرید قبلاً تکمیل یا پرونده بسته شده باشد.",
    currencyTitle: "سبد فعلی با این خرید هماهنگ نیست", currencyBody: "ابتدا سبد فعلی را تکمیل یا خالی کنید و سپس دوباره به این لینک برگردید.",
    errorTitle: "بررسی لینک انجام نشد", errorBody: "ارتباط برقرار نشد. دوباره تلاش کنید یا به فروشگاه برگردید.",
  },
  en: {
    eyebrow: "Secure checkout recovery", checking: "Checking your link…", title: "Your selections are still here",
    intro: "We check today’s price and availability, then return only sellable items to your active cart.",
    security: "This link is tied to your account. Personal details are never shown before sign-in.",
    steps: ["Secure link", "Stock check", "Return to cart"], previous: "Previous price", current: "Today’s price",
    requested: "Requested", restoredQty: "Can restore", existing: "Already in cart", summary: "Recovery summary",
    available: "Ready to restore", unavailable: "Cannot restore", restore: "Restore to cart", restoring: "Restoring…",
    success: "Your selections are back in the cart", successBody: "Price and stock were checked again on the server. Continue from your cart.",
    repeated: "This link was already used", repeatedBody: "Nothing was duplicated. Your original recovered cart is ready.",
    cart: "View cart", shop: "Return to shop", retry: "Try again", unavailableAll: "No items are currently available to restore.",
    invalidTitle: "This link is incomplete or invalid", invalidBody: "The recovery link is incomplete, expired, or was replaced by a newer link.",
    wrongOwnerTitle: "This link belongs to another account", wrongOwnerBody: "Sign in with the same account that started the checkout.",
    expiredTitle: "This link has expired", expiredBody: "Contact support or the store for a fresh recovery link.",
    unavailableTitle: "This checkout can no longer be recovered", unavailableBody: "The purchase may already be complete or the recovery case may be closed.",
    currencyTitle: "Your current cart uses another currency", currencyBody: "Complete or clear the current cart, then return to this link.",
    errorTitle: "We could not verify this link", errorBody: "The connection failed. Try again or return to the shop.",
  },
  ar: {
    eyebrow: "استعادة آمنة للشراء", checking: "جارٍ التحقق من الرابط…", title: "اختياراتك ما زالت هنا",
    intro: "نتحقق من سعر اليوم والمخزون، ثم نعيد العناصر المتاحة فقط إلى سلتك النشطة.",
    security: "هذا الرابط مرتبط بحسابك، ولا تظهر البيانات الشخصية قبل تسجيل الدخول.",
    steps: ["رابط آمن", "فحص المخزون", "العودة إلى السلة"], previous: "السعر السابق", current: "سعر اليوم",
    requested: "المطلوب", restoredQty: "قابل للاستعادة", existing: "في السلة الآن", summary: "ملخص الاستعادة",
    available: "جاهز للاستعادة", unavailable: "غير قابل للاستعادة", restore: "إعادة إلى السلة", restoring: "جارٍ الاستعادة…",
    success: "عادت اختياراتك إلى السلة", successBody: "تم التحقق من السعر والمخزون على الخادم. تابع الشراء من السلة.",
    repeated: "تم استخدام هذا الرابط سابقاً", repeatedBody: "لم نكرر العناصر. سلة الاستعادة الأصلية جاهزة.",
    cart: "عرض السلة", shop: "العودة إلى المتجر", retry: "المحاولة مجدداً", unavailableAll: "لا توجد عناصر متاحة للاستعادة حالياً.",
    invalidTitle: "هذا الرابط غير مكتمل أو غير صالح", invalidBody: "رابط الاستعادة ناقص أو منتهي الصلاحية أو تم استبداله برابط أحدث.",
    wrongOwnerTitle: "هذا الرابط يخص حساباً آخر", wrongOwnerBody: "سجّل الدخول بالحساب نفسه الذي بدأ عملية الشراء.",
    expiredTitle: "انتهت صلاحية هذا الرابط", expiredBody: "تواصل مع الدعم أو المتجر للحصول على رابط جديد.",
    unavailableTitle: "لم يعد بالإمكان استعادة هذا الشراء", unavailableBody: "ربما اكتمل الشراء أو تم إغلاق ملف الاستعادة.",
    currencyTitle: "عملة سلتك الحالية مختلفة", currencyBody: "أكمل السلة الحالية أو أفرغها، ثم عد إلى هذا الرابط.",
    errorTitle: "تعذر التحقق من الرابط", errorBody: "فشل الاتصال. حاول مرة أخرى أو عد إلى المتجر.",
  },
} as const;

function localeText(value: LocalizedText | null, locale: Locale, fallback = "—") {
  return value?.[locale]?.trim() || value?.fa?.trim() || value?.en?.trim() || value?.ar?.trim() || fallback;
}

function formatMoney(value: number, currency: string, locale: Locale) {
  return formatMinor(value, currency, locale);
}

type RecoveryCopy = (typeof copy)[Locale];

function recoveryError(error: unknown, t: RecoveryCopy) {
  if (!(error instanceof CommerceApiError)) return { title: t.errorTitle, body: t.errorBody };
  const code = typeof error.details === "object" && error.details && "code" in error.details
    ? String((error.details as { code?: unknown }).code)
    : "";
  if (error.status === 400 || error.status === 404 || code === "RECOVERY_INVALID") {
    return { title: t.invalidTitle, body: t.invalidBody };
  }
  if (error.status === 403 || code === "RECOVERY_WRONG_OWNER") {
    return { title: t.wrongOwnerTitle, body: t.wrongOwnerBody };
  }
  if (code === "RECOVERY_EXPIRED") return { title: t.expiredTitle, body: t.expiredBody };
  if (code === "RECOVERY_CURRENCY_MISMATCH") return { title: t.currencyTitle, body: t.currencyBody };
  if (["RECOVERY_COMPLETED", "RECOVERY_UNAVAILABLE"].includes(code)) {
    return { title: t.unavailableTitle, body: t.unavailableBody };
  }
  return { title: t.errorTitle, body: t.errorBody };
}

export function CheckoutRecoveryPage({ locale, token }: { locale: Locale; token: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const t = copy[locale];
  const direction = getLocaleDirection(locale);
  const number = new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale);
  const validToken = /^[A-Za-z0-9_-]{43}$/.test(token);
  const recoveryPath = `${localizedHref("/recover-checkout", locale)}?token=${encodeURIComponent(token)}`;
  const query = useQuery({
    queryKey: ["account", "abandoned-checkout-recovery", token],
    queryFn: ({ signal }) => commerceFetch<RecoveryPreview>(`/api/account/abandoned-checkouts/recovery?token=${encodeURIComponent(token)}`, { signal }),
    enabled: validToken, retry: false,
  });
  useEffect(() => {
    if (query.error instanceof CommerceApiError && query.error.status === 401) {
      router.replace(`${localizedHref("/auth", locale)}?mode=login&next=${encodeURIComponent(recoveryPath)}`);
    }
  }, [locale, query.error, recoveryPath, router]);
  const restore = useMutation({
    mutationFn: () => commerceFetch<RecoveryPreview>("/api/account/abandoned-checkouts/recovery", {
      method: "POST", body: JSON.stringify({ token }),
    }),
    onSuccess: (data) => {
      queryClient.setQueryData(["account", "abandoned-checkout-recovery", token], data);
      void queryClient.invalidateQueries({ queryKey: ["account", "cart"] });
    },
  });
  const data = restore.data ?? query.data;
  const error = restore.error ?? query.error;
  const isRtl = direction === "rtl";
  const Arrow = isRtl ? ArrowLeft : ArrowRight;
  const isRedirecting = error instanceof CommerceApiError && error.status === 401;
  const checking = validToken && query.isPending;
  const invalidWithoutRequest = !validToken;
  const displayedError = invalidWithoutRequest
    ? { title: t.invalidTitle, body: t.invalidBody }
    : error && !isRedirecting
      ? recoveryError(error, t)
      : null;
  const completedStages = data?.restored ? 3 : data ? 2 : 0;
  const heading = displayedError?.title
    ?? (checking || isRedirecting ? t.checking : data?.restored ? (data.idempotent ? t.repeated : t.success) : restore.isPending ? t.restoring : t.title);
  const introduction = displayedError?.body
    ?? (data?.restored ? (data.idempotent ? t.repeatedBody : t.successBody) : t.intro);
  const themeStyle = {
    "--recovery-canvas": lightTokens.surfaceBrand,
    "--recovery-surface": lightTokens.surface,
    "--recovery-text": lightTokens.text,
    "--recovery-muted": lightTokens.textMuted,
    "--recovery-border": lightTokens.borderStrong,
    "--recovery-accent": lightTokens.accent,
    "--recovery-danger": lightTokens.destructive,
    "--recovery-success": lightTokens.success,
  } as CSSProperties;

  return <main dir={direction} lang={getHtmlLang(locale)} style={themeStyle} className="min-h-dvh bg-[var(--recovery-canvas)] pb-24 pt-28 text-[var(--recovery-text)] md:pt-36">
    <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8 lg:px-12">
      <header className="grid gap-8 border-b border-[var(--recovery-border)] pb-9 md:grid-cols-[minmax(0,1fr)_280px] md:items-end">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--recovery-accent)]">{t.eyebrow}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.15] tracking-[-0.045em] sm:text-5xl">{heading}</h1>
          <p className="mt-5 max-w-2xl text-sm leading-8 text-[var(--recovery-muted)]">{introduction}</p>
        </div>
        <div className="border-s-2 border-[var(--recovery-accent)] ps-4 text-xs leading-6 text-[var(--recovery-muted)]"><LockKeyhole className="mb-2 size-4 text-[var(--recovery-accent)]" aria-hidden/><p>{t.security}</p></div>
      </header>

      <ol className="relative my-9 w-full max-w-sm border-y border-[var(--recovery-border)] bg-[var(--recovery-surface)] px-5 py-3" aria-label={t.eyebrow}>
        {t.steps.map((step, index) => <li key={step} className="relative flex min-h-14 items-center gap-4 ps-1">
          {index < t.steps.length - 1 ? <span aria-hidden className="absolute start-[18px] top-[39px] h-[31px] border-s border-[var(--recovery-border)]"/> : null}
          <span className={`relative z-10 grid size-7 shrink-0 place-items-center border bg-[var(--recovery-surface)] text-[10px] ${index < completedStages ? "border-[var(--recovery-success)] text-[var(--recovery-success)]" : "border-[var(--recovery-border)] text-[var(--recovery-muted)]"}`}>{index < completedStages ? <Check className="size-3.5"/> : number.format(index + 1)}</span>
          <span className={`text-xs font-semibold ${index < completedStages ? "text-[var(--recovery-text)]" : "text-[var(--recovery-muted)]"}`}>{step}</span>
        </li>)}
      </ol>

      {checking || isRedirecting ? <div role="status" aria-live="polite" className="grid min-h-64 place-items-center border border-[var(--recovery-border)] bg-[var(--recovery-surface)]"><RefreshCw className="size-6 animate-spin text-[var(--recovery-accent)]"/><span className="sr-only">{t.checking}</span></div> : null}
      {displayedError ? <section role="alert" className="border-t-2 border-[var(--recovery-danger)] bg-[var(--recovery-surface)] p-7 sm:p-9"><AlertTriangle className="size-6 text-[var(--recovery-danger)]"/><h2 className="mt-5 text-2xl font-semibold">{displayedError.title}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--recovery-muted)]">{displayedError.body}</p><div className="mt-7 flex flex-wrap gap-3">{validToken ? <Button type="button" variant="black" onClick={() => { restore.reset(); void query.refetch(); }}>{t.retry}</Button> : null}<Button href={localizedHref("/shop", locale)} variant="outline">{t.shop}</Button><Button href={localizedHref("/cart", locale)} variant="outline">{t.cart}</Button></div></section> : null}

      {data ? <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-14">
        <section aria-label={t.summary} className="divide-y divide-[var(--recovery-border)] border-y border-[var(--recovery-border)]">
          {data.items.map((item) => <article key={item.variantId} className="py-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><h2 className="text-lg font-semibold">{localeText(item.productName, locale)}</h2><p className="mt-2 text-xs text-[var(--recovery-muted)]">{localeText(item.colorName, locale)} · {localeText(item.sizeName, locale)}</p></div>
              <span className={`inline-flex min-h-7 items-center border px-3 text-[10px] font-semibold ${item.available ? "border-[var(--recovery-success)] text-[var(--recovery-success)]" : "border-[var(--recovery-danger)] text-[var(--recovery-danger)]"}`}>{item.available ? t.available : t.unavailable}</span>
            </div>
            <div className="mt-6 grid gap-px border border-[var(--recovery-border)] bg-[var(--recovery-border)] sm:grid-cols-2">
              <div className="bg-[var(--recovery-surface)] p-4"><span className="text-[10px] text-[var(--recovery-muted)]">{t.previous}</span><strong className={`mt-1 block text-sm tabular-nums ${item.priceChanged ? "text-[var(--recovery-muted)] line-through" : ""}`}>{formatMoney(item.previousUnitPriceMinor, data.currency, locale)}</strong></div>
              <div className="bg-[var(--recovery-surface)] p-4"><span className="text-[10px] text-[var(--recovery-muted)]">{t.current}</span><strong className="mt-1 block text-sm tabular-nums">{item.currentUnitPriceMinor === null ? "—" : formatMoney(item.currentUnitPriceMinor, data.currency, locale)}</strong></div>
            </div>
            <dl className="mt-4 flex flex-wrap gap-x-7 gap-y-2 text-xs text-[var(--recovery-muted)]"><div><dt className="inline">{t.requested}: </dt><dd className="inline font-semibold text-[var(--recovery-text)]">{number.format(item.requestedQuantity)}</dd></div><div><dt className="inline">{t.restoredQty}: </dt><dd className="inline font-semibold text-[var(--recovery-text)]">{number.format(item.restorableQuantity)}</dd></div>{item.existingQuantity ? <div><dt className="inline">{t.existing}: </dt><dd className="inline font-semibold text-[var(--recovery-text)]">{number.format(item.existingQuantity)}</dd></div> : null}</dl>
            {item.skipReason ? <p className="mt-4 border-s-2 border-[var(--recovery-danger)] ps-3 text-xs leading-6 text-[var(--recovery-danger)]">{localeText(item.skipReason, locale)}</p> : null}
          </article>)}
        </section>
        <aside className="h-fit border-t-2 border-[var(--recovery-text)] bg-[var(--recovery-surface)] p-6 lg:sticky lg:top-28 lg:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--recovery-accent)]">{t.summary}</p>
          <div className="mt-6 flex items-end justify-between gap-4 border-b border-[var(--recovery-border)] pb-5"><span className="text-xs text-[var(--recovery-muted)]">{t.restoredQty}</span><strong className="text-2xl">{number.format(data.restorableItemCount)}</strong></div>
          <div className="flex items-center justify-between gap-4 py-6"><span className="text-sm">{t.current}</span><strong className="text-sm tabular-nums">{formatMoney(data.currentSubtotalMinor, data.currency, locale)}</strong></div>
          {data.restored ? <Button href={localizedHref("/cart", locale)} variant="black" size="xl" fullWidth icon={<Arrow className="size-4"/>}>{t.cart}</Button> : <Button type="button" variant="black" size="xl" fullWidth loading={restore.isPending} disabled={!data.restorableItemCount} onClick={() => restore.mutate()} icon={<ShoppingBag className="size-4"/>}>{restore.isPending ? t.restoring : t.restore}</Button>}
          {!data.restorableItemCount && !data.restored ? <p className="mt-4 text-xs leading-6 text-[var(--recovery-danger)]">{t.unavailableAll}</p> : null}
          <Link href={localizedHref("/shop", locale)} className={`mt-5 flex min-h-11 items-center justify-center gap-2 text-[10px] font-semibold underline-offset-4 hover:underline ${themeClasses.focusRing}`}>{t.shop}</Link>
        </aside>
      </div> : null}
    </div>
  </main>;
}
