"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock3, MapPin, RefreshCw, ShieldCheck, ShoppingBag, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/CustomToast";
import { StoreSelectionModal, type FulfillmentPlan } from "@/components/static/Checkout/StoreSelectionModal";
import {
  type AccountCart,
  type Checkout,
  type Payment,
  cartQueryKey,
  CommerceApiError,
  commerceFetch,
  fetchAccountCart,
  formatMinor,
  loginHref,
} from "@/lib/commerce/client";
import { getCheckoutCopy } from "@/lib/i18n/checkout-copy";
import { type Locale } from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/routes";

type ConfirmResult = {
  payment: Payment;
  order: { _id?: string; id?: string; orderNumber?: string } | null;
  sms: { status: string } | null;
};

export function CheckoutPage({ locale = "fa" }: { locale?: Locale }) {
  const toast = useToast();
  const copy = getCheckoutCopy(locale);
  const queryClient = useQueryClient();
  const [createdCheckoutId, setCreatedCheckoutId] = useState<string | null>(null);
  const [createdPaymentId, setCreatedPaymentId] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<ConfirmResult["order"]>(null);
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const storeTriggerRef = useRef<HTMLButtonElement>(null);
  const checkoutKey = useRef<string | null>(null);
  const paymentKey = useRef<string | null>(null);
  const confirmKey = useRef<string | null>(null);
  const localizedCartQueryKey = [...cartQueryKey, locale] as const;

  const cartQuery = useQuery({
    queryKey: localizedCartQueryKey,
    queryFn: ({ signal }) => fetchAccountCart(signal, locale),
    retry: (count, error) =>
      !(error instanceof CommerceApiError && error.status === 401) && count < 1,
  });
  const currency: "IRR" | "USD" = cartQuery.data?.currency === "USD" ? "USD" : "IRR";
  const cartAvailabilityKey = cartQuery.data?.items
    .map((item) => `${item.variantId}:${item.quantity}`)
    .sort()
    .join("|") ?? "empty";
  const availabilityNeeded = Boolean(cartQuery.data?.items.length && !cartQuery.data.checkout);
  const destinationsQuery = useQuery({
    queryKey: ["account", "checkout-destinations", cartAvailabilityKey, currency],
    queryFn: ({ signal }) =>
      commerceFetch<FulfillmentPlan>(`/api/account/checkouts?currency=${currency}`, { signal }),
    enabled: availabilityNeeded,
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (count, error) =>
      !(error instanceof CommerceApiError && error.status === 401) && count < 1,
  });

  const checkoutId = createdCheckoutId ?? cartQuery.data?.checkout?.id ?? null;

  const checkoutQuery = useQuery({
    queryKey: ["account", "checkout", checkoutId],
    queryFn: ({ signal }) =>
      commerceFetch<Checkout>(`/api/account/checkouts/${checkoutId}`, { signal }),
    enabled: Boolean(checkoutId),
    retry: (count, error) =>
      !(error instanceof CommerceApiError && error.status === 401) && count < 1,
  });
  const checkout = checkoutQuery.data;
  const paymentId =
    createdPaymentId ??
    checkout?.paymentId ??
    cartQuery.data?.checkout?.paymentId ??
    null;

  const paymentQuery = useQuery({
    queryKey: ["account", "payment", paymentId],
    queryFn: ({ signal }) =>
      commerceFetch<Payment>(`/api/account/payments/${paymentId}`, { signal }),
    enabled: Boolean(paymentId),
    retry: (count, error) =>
      !(error instanceof CommerceApiError && error.status === 401) && count < 1,
  });
  const payment = paymentQuery.data;

  const reportMutationError = (title: string, error: unknown) => {
    if (error instanceof CommerceApiError && error.status === 401) {
      toast.info("نشست شما پایان یافته است", {
        description: "برای ادامه تکمیل خرید دوباره وارد حساب شوید.",
      });
      window.location.assign(loginHref("/checkout"));
      return;
    }
    toast.error(title, { description: messageFor(error) });
  };

  useEffect(() => {
    if (!checkout || ["completed", "cancelled", "failed", "expired"].includes(checkout.status)) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [checkout]);

  const startMutation = useMutation({
    mutationFn: async () => {
      checkoutKey.current ??= crypto.randomUUID();
      return commerceFetch<Checkout>("/api/account/checkouts", {
        method: "POST",
        body: JSON.stringify({
          idempotencyKey: checkoutKey.current,
          currency,
          fulfillmentPlanHash: destinationsQuery.data?.fulfillmentPlanHash,
        }),
      });
    },
    onSuccess: async (value) => {
      setStoreModalOpen(false);
      setCreatedCheckoutId(value.id);
      queryClient.setQueryData(["account", "checkout", value.id], value);
      await queryClient.invalidateQueries({ queryKey: cartQueryKey });
      toast.success("موجودی برای شما رزرو شد", {
        description: "این رزرو تا ۱۵ دقیقه برای تکمیل پرداخت معتبر است.",
      });
    },
    onError: async (error) => {
      if (error instanceof CommerceApiError && error.status === 409) {
        checkoutKey.current = null;
        await queryClient.invalidateQueries({ queryKey: ["account", "checkout-destinations"] });
        setStoreModalOpen(true);
        toast.error(copy.stockChanged);
        return;
      }
      // A checkout transaction may have committed even if its HTTP response was lost.
      // Recover the server-owned checkout before allowing another attempt with the same key.
      const recoveredCart = await cartQuery.refetch();
      const recoveredCheckout = recoveredCart.data?.checkout;
      if (recoveredCheckout) {
        setCreatedCheckoutId(recoveredCheckout.id);
        setStoreModalOpen(false);
        await queryClient.invalidateQueries({ queryKey: ["account", "checkout", recoveredCheckout.id] });
        toast.info(locale === "en" ? "Your reservation was recovered" : locale === "ar" ? "تمت استعادة حجزك" : "رزرو شما بازیابی شد");
        return;
      }
      void queryClient.invalidateQueries({ queryKey: ["account", "checkout-destinations"] });
      reportMutationError("رزرو موجودی انجام نشد", error);
    },
  });

  const currencyMutation = useMutation({
    mutationFn: (next: "IRR" | "USD") => commerceFetch<AccountCart>(`/api/account/cart?locale=${locale}`, { method: "PATCH", body: JSON.stringify({ currency: next }) }),
    onSuccess: async (value) => { checkoutKey.current = null; queryClient.setQueryData(localizedCartQueryKey, value); await queryClient.invalidateQueries({ queryKey: ["account", "checkout-destinations"] }); },
    onError: (error) => reportMutationError(locale === "en" ? "Currency could not be changed" : locale === "ar" ? "تعذر تغيير العملة" : "تغییر ارز انجام نشد", error),
  });

  const paymentMutation = useMutation({
    mutationFn: async () => {
      if (!checkoutId) throw new Error("رزرو خرید هنوز ساخته نشده است.");
      paymentKey.current ??= crypto.randomUUID();
      return commerceFetch<Payment>(`/api/account/checkouts/${checkoutId}/payment-intents`, {
        method: "POST",
        body: JSON.stringify({ idempotencyKey: paymentKey.current }),
      });
    },
    onSuccess: (value) => {
      setCreatedPaymentId(value.id);
      queryClient.setQueryData(["account", "payment", value.id], value);
      void checkoutQuery.refetch();
    },
    onError: (error) => reportMutationError("آماده‌سازی پرداخت انجام نشد", error),
  });

  const confirmMutation = useMutation({
    mutationFn: async (outcome: "succeeded" | "failed") => {
      if (!paymentId) throw new Error("پرداخت هنوز آماده نشده است.");
      confirmKey.current ??= crypto.randomUUID();
      return commerceFetch<ConfirmResult>(`/api/account/payments/${paymentId}/confirm`, {
        method: "POST",
        body: JSON.stringify({ idempotencyKey: confirmKey.current, outcome }),
      });
    },
    onSuccess: async (value) => {
      confirmKey.current = null;
      queryClient.setQueryData(["account", "payment", value.payment.id], value.payment);
      if (value.payment.status === "succeeded" && value.order) {
        setCompletedOrder(value.order);
        await queryClient.invalidateQueries({ queryKey: ["account"] });
        toast.success("سفارش شما با موفقیت ثبت شد");
      } else {
        toast.error("پرداخت آزمایشی ناموفق بود", {
          description: "رزرو شما هنوز معتبر است و می‌توانید دوباره تلاش کنید.",
        });
      }
    },
    onError: (error) => reportMutationError("تأیید پرداخت انجام نشد", error),
  });

  const cancelMutation = useMutation({
    mutationFn: () => {
      if (!checkoutId) throw new Error("رزرو خرید پیدا نشد.");
      return commerceFetch<Checkout>(`/api/account/checkouts/${checkoutId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "cancel" }),
      });
    },
    onSuccess: async () => {
      setCreatedCheckoutId(null);
      setCreatedPaymentId(null);
      queryClient.setQueryData<AccountCart | null>(localizedCartQueryKey, (current) =>
        current ? { ...current, status: "active", checkout: null } : current,
      );
      checkoutKey.current = null;
      paymentKey.current = null;
      confirmKey.current = null;
      await queryClient.invalidateQueries({ queryKey: cartQueryKey });
      await queryClient.invalidateQueries({ queryKey: ["account", "checkout-destinations"] });
      toast.info("رزرو لغو و موجودی آزاد شد");
    },
    onError: (error) => reportMutationError("لغو رزرو انجام نشد", error),
  });

  const closeStoreModal = useCallback(() => {
    setStoreModalOpen(false);
    window.setTimeout(() => storeTriggerRef.current?.focus(), 0);
  }, []);
  const expiresAt = checkout ? new Date(checkout.expiresAt).getTime() : 0;
  const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
  const expired = Boolean(
    checkout &&
      (checkout.status === "expired" ||
        (remaining === 0 && ["reserved", "payment_pending"].includes(checkout.status))),
  );
  const terminalCheckout = Boolean(
    checkout && (expired || ["cancelled", "failed", "expired"].includes(checkout.status)),
  );
  const activeCheckout = Boolean(
    checkout && ["reserved", "payment_pending"].includes(checkout.status) && !expired,
  );
  const signedOut = cartQuery.error instanceof CommerceApiError && cartQuery.error.status === 401;
  const availabilitySignedOut =
    destinationsQuery.error instanceof CommerceApiError && destinationsQuery.error.status === 401;
  const checkoutSignedOut =
    checkoutQuery.error instanceof CommerceApiError && checkoutQuery.error.status === 401;
  const paymentSignedOut =
    paymentQuery.error instanceof CommerceApiError && paymentQuery.error.status === 401;
  const cart = cartQuery.data;
  const activePlan: FulfillmentPlan | undefined = checkout?.shipments?.length ? {
    fulfillable: true,
    fulfillmentPlanHash: checkout.fulfillmentPlanHash,
    currency: checkout.currency,
    subtotalMinor: checkout.subtotalMinor,
    shippingMinor: checkout.shippingMinor,
    totalMinor: checkout.totalMinor,
    shipmentCount: checkout.shipments.length,
    shipments: checkout.shipments,
  } : destinationsQuery.data;

  if (completedOrder || payment?.status === "succeeded") {
    return <Success order={completedOrder} locale={locale} />;
  }

  return (
    <main dir={locale === "en" ? "ltr" : "rtl"} lang={locale} className="min-h-dvh bg-[#F6F2EB] pb-24 pt-28 text-[#0B0B0B] md:pt-32">
      <div className="mx-auto w-full max-w-[1450px] px-5 sm:px-8 lg:px-12">
        <header className="border-b border-black/15 pb-7">
          <p className="text-xs font-semibold tracking-[0.08em] text-[#C15427]">مسیر سفارش</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">تکمیل خرید</h1>
            <ol className="flex items-center gap-2 text-[11px] text-black/60" aria-label="مراحل خرید">
              <Step active={!checkout} done={Boolean(checkout)} number="۱" label="انتخاب تحویل" />
              <span className="h-px w-5 bg-black/20" />
              <Step active={Boolean(checkout && !paymentId)} done={Boolean(paymentId)} number="۲" label="رزرو" />
              <span className="h-px w-5 bg-black/20" />
              <Step active={Boolean(paymentId)} done={false} number="۳" label="پرداخت" />
            </ol>
          </div>
        </header>

        {cartQuery.isPending ? <CheckoutLoading /> : null}

        {signedOut || availabilitySignedOut ? (
          <CheckoutState title="برای ادامه خرید وارد حساب شوید" description="پس از ورود، دوباره به همین صفحه برمی‌گردید.">
            <Button href={loginHref("/checkout")} variant="black" size="lg">ورود به حساب</Button>
          </CheckoutState>
        ) : null}

        {cartQuery.isError && !signedOut ? (
          <CheckoutState title="اطلاعات تکمیل خرید دریافت نشد" description={messageFor(cartQuery.error)}>
            <Button type="button" variant="outline" size="lg" onClick={() => void cartQuery.refetch()}>تلاش دوباره</Button>
          </CheckoutState>
        ) : null}

        {!cartQuery.isPending && !cartQuery.isError && (!cart || !cart.items.length) ? (
          <CheckoutState title="سبد خرید خالی است" description="برای شروع تکمیل خرید ابتدا محصولی را به سبد اضافه کنید.">
            <Button href={localizedHref("/shop", locale)} variant="black" size="lg">بازگشت به فروشگاه</Button>
          </CheckoutState>
        ) : null}

        {cart?.items.length && !availabilitySignedOut ? (
          <div className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-16">
            <section className="space-y-8">
              {checkoutId && checkoutQuery.isPending ? (
                <FlowLoading label="در حال بازیابی رزرو خرید" />
              ) : checkoutId && checkoutQuery.isError ? (
                <FlowState
                  title={checkoutSignedOut ? "برای ادامه دوباره وارد حساب شوید" : "وضعیت رزرو دریافت نشد"}
                  description={
                    checkoutSignedOut
                      ? "شناسه رزرو شما حفظ شده است و پس از ورود می‌توانید ادامه دهید."
                      : "رزرو قبلی حذف نشده است. ارتباط را دوباره بررسی می‌کنیم تا سفارش تکراری ساخته نشود."
                  }
                >
                  {checkoutSignedOut ? (
                    <Button href={loginHref("/checkout")} variant="black" size="lg">ورود به حساب</Button>
                  ) : (
                    <Button type="button" variant="outline" size="lg" onClick={() => void checkoutQuery.refetch()}>دریافت دوباره وضعیت رزرو</Button>
                  )}
                </FlowState>
              ) : terminalCheckout && checkout ? (
                <FlowState
                  title={checkout.status === "cancelled" ? "رزرو لغو شده است" : expired ? "زمان رزرو پایان یافته است" : "رزرو قابل ادامه نیست"}
                  description="برای بررسی دوباره کالاها و شروع یک رزرو تازه به سبد خرید برگردید."
                >
                  <Button href="/cart" variant="black" size="lg">بازگشت به سبد خرید</Button>
                </FlowState>
              ) : checkout ? (
                <><ReservationRail remaining={remaining} expired={expired} locale={locale} /><div className="flex justify-end bg-white px-6 pb-6"><button ref={storeTriggerRef} type="button" onClick={() => setStoreModalOpen(true)} className="min-h-11 border border-black px-5 text-xs font-semibold transition hover:bg-black hover:text-white">{copy.viewPlan}</button></div></>
              ) : (
                <><section className="border-t-2 border-black bg-white p-6 sm:p-8">
                  <p className="text-[11px] font-semibold text-[#C15427]">{locale === "en" ? "PAYMENT CURRENCY" : locale === "ar" ? "عملة الدفع" : "ارز پرداخت"}</p>
                  <h2 className="mt-2 text-xl font-semibold">{locale === "en" ? "How would you like to pay?" : locale === "ar" ? "كيف تريد الدفع؟" : "پرداخت با کدام ارز انجام شود؟"}</h2>
                  <div className="mt-5 grid grid-cols-2 gap-2" role="radiogroup">{(["IRR", "USD"] as const).map((option) => <button key={option} type="button" role="radio" aria-checked={currency === option} disabled={currencyMutation.isPending} onClick={() => { if (currency !== option) currencyMutation.mutate(option); }} className={`min-h-16 border px-4 text-start transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C15427] ${currency === option ? "border-black bg-black text-white" : "border-black/20 bg-[#F6F2EB] hover:border-black"}`}><strong className="block text-sm">{option === "IRR" ? (locale === "en" ? "Pay in rials" : locale === "ar" ? "الدفع بالريال" : "پرداخت ریالی") : (locale === "en" ? "Pay in US dollars" : locale === "ar" ? "الدفع بالدولار" : "پرداخت دلاری")}</strong><small className={`mt-1 block ${currency === option ? "text-white/65" : "text-black/55"}`}>{option === "IRR" ? "IRR" : "USD"}</small></button>)}</div>
                </section><section className="border-t-2 border-black bg-white p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <MapPin className="mt-1 size-5 text-[#C15427]" aria-hidden />
                    <div>
                      <h2 className="text-xl font-semibold">{copy.deliveryPlan}</h2>
                      <p className="mt-2 text-xs leading-6 text-black/65">{copy.modalDescription}</p>
                    </div>
                  </div>
                  <div className="mt-7 border border-black/15 bg-[#F6F2EB] p-5">
                    {destinationsQuery.isError ? (
                      <p className="text-xs text-[#A33A32]" role="alert">{copy.loadError}</p>
                    ) : destinationsQuery.isFetching ? (
                      <p className="text-xs text-black/55" role="status">{copy.loading}</p>
                    ) : !destinationsQuery.data?.fulfillable || !destinationsQuery.data.shipments.length ? (
                      <p className="text-xs leading-6 text-[#A33A32]" role="status">{copy.noStoreAnywhere}</p>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold">{copy.ready}</p><p className="mt-1 text-xs text-black/60">{destinationsQuery.data.shipmentCount} {copy.shipments} · {formatMinor(destinationsQuery.data.shippingMinor, destinationsQuery.data.currency, locale)}</p></div><button ref={storeTriggerRef} type="button" onClick={() => setStoreModalOpen(true)} className="min-h-11 border border-black px-5 text-xs font-semibold transition hover:bg-black hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C15427]">{copy.viewPlan}</button></div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      disabled={destinationsQuery.isFetching}
                      onClick={() => { checkoutKey.current = null; void destinationsQuery.refetch(); }}
                      className="inline-flex min-h-9 items-center gap-1.5 text-xs font-semibold text-[#C15427] underline decoration-[#C15427]/35 underline-offset-4 transition hover:decoration-[#C15427] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C15427] disabled:opacity-40"
                    >
                      <RefreshCw className={`size-3.5 ${destinationsQuery.isFetching ? "animate-spin" : ""}`} aria-hidden />
                      {copy.refresh}
                    </button>
                  </div>
                </section></>
              )}

              <StoreSelectionModal
                open={storeModalOpen}
                locale={locale}
                copy={copy}
                plan={activePlan}
                loading={destinationsQuery.isFetching}
                error={destinationsQuery.isError}
                confirming={startMutation.isPending}
                onClose={closeStoreModal}
                onConfirm={() => { if (checkout) closeStoreModal(); else startMutation.mutate(); }}
                onRetry={() => void destinationsQuery.refetch()}
              />

              {activeCheckout ? (
                <section className="border-t-2 border-black bg-white p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <ShieldCheck className="mt-1 size-5 text-[#C15427]" />
                    <div>
                      <h2 className="text-xl font-semibold">پرداخت آزمایشی</h2>
                      <p className="mt-2 text-xs leading-6 text-black/65">تا زمان اتصال درگاه واقعی، این بخش فقط نتیجه پرداخت را برای آزمایش فرایند سفارش شبیه‌سازی می‌کند. هیچ اطلاعات بانکی وارد نکنید.</p>
                    </div>
                  </div>

                  {!paymentId ? (
                    <div className="mt-8">
                      <Button type="button" variant="black" size="lg" loading={paymentMutation.isPending} onClick={() => paymentMutation.mutate()}>آماده‌سازی پرداخت</Button>
                    </div>
                  ) : paymentQuery.isPending ? (
                    <FlowLoading label="در حال دریافت وضعیت پرداخت" compact />
                  ) : paymentQuery.isError ? (
                    <FlowState
                      title={paymentSignedOut ? "برای ادامه پرداخت وارد حساب شوید" : "وضعیت پرداخت دریافت نشد"}
                      description="تا مشخص‌شدن وضعیت فعلی، امکان ارسال درخواست پرداخت تازه وجود ندارد."
                      compact
                    >
                      {paymentSignedOut ? (
                        <Button href={loginHref("/checkout")} variant="black" size="lg">ورود به حساب</Button>
                      ) : (
                        <Button type="button" variant="outline" size="lg" onClick={() => void paymentQuery.refetch()}>دریافت دوباره وضعیت پرداخت</Button>
                      )}
                    </FlowState>
                  ) : paymentQuery.isSuccess ? (
                    <div className="mt-8 border border-dashed border-[#C15427]/55 bg-[#F6F2EB] p-5">
                      <p className="text-xs font-semibold text-[#C15427]">محیط پرداخت آزمایشی</p>
                      <p className="mt-2 text-sm">یکی از نتیجه‌های زیر را برای تست جریان سفارش انتخاب کنید.</p>
                      {payment?.status === "failed" ? <p className="mt-3 text-xs text-[#A33A32]">تلاش قبلی ناموفق بود؛ در صورت اعتبار رزرو می‌توانید دوباره امتحان کنید.</p> : null}
                      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <Button type="button" variant="black" size="lg" loading={confirmMutation.isPending && confirmMutation.variables === "succeeded"} disabled={confirmMutation.isPending} onClick={() => confirmMutation.mutate("succeeded")}>
                          شبیه‌سازی پرداخت موفق
                        </Button>
                        <Button type="button" variant="outline" size="lg" loading={confirmMutation.isPending && confirmMutation.variables === "failed"} disabled={confirmMutation.isPending} onClick={() => confirmMutation.mutate("failed")}>
                          شبیه‌سازی پرداخت ناموفق
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </section>
              ) : null}

              {activeCheckout ? (
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/15 pt-5">
                  <p className="text-xs leading-6 text-black/65">لغو رزرو، موجودی نگه‌داشته‌شده را فوراً آزاد می‌کند.</p>
                  <button type="button" disabled={cancelMutation.isPending} onClick={() => cancelMutation.mutate()} className="inline-flex min-h-11 items-center gap-2 text-xs text-[#A33A32] underline underline-offset-4 disabled:opacity-35">
                    <X className="size-3.5" /> {cancelMutation.isPending ? "در حال لغو…" : "لغو رزرو"}
                  </button>
                </div>
              ) : null}
            </section>

            <OrderSummary cart={cart} shippingMinor={checkout?.shippingMinor ?? destinationsQuery.data?.shippingMinor ?? 0} locale={locale} />
          </div>
        ) : null}
      </div>
    </main>
  );
}

function ReservationRail({ remaining, expired, locale }: { remaining: number; expired: boolean; locale: Locale }) {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = Math.max(0, Math.min(100, (remaining / (15 * 60)) * 100));
  const timer = `${formatLocaleInteger(minutes, locale, 2)}:${formatLocaleInteger(seconds, locale, 2)}`;
  const announcement = reservationAnnouncement(remaining, expired, locale);
  return (
    <section className="border-t-2 border-[#C15427] bg-[#111] p-6 text-white sm:p-8">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3"><Clock3 className="size-5 text-[#C15427]" /><div><p className="text-sm font-semibold">رزرو اختصاصی موجودی</p><p className="mt-1 text-xs leading-5 text-white/75">رنگ و سایز انتخابی برای شما نگه داشته شده است.</p></div></div>
        <strong className="text-2xl tabular-nums" dir="ltr" role="timer">{expired ? `${formatLocaleInteger(0, locale, 2)}:${formatLocaleInteger(0, locale, 2)}` : timer}</strong>
      </div>
      <div className="mt-6 h-px bg-white/15"><div className="h-px bg-[#C15427] transition-[width] duration-1000" style={{ width: `${progress}%` }} /></div>
      <span className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</span>
    </section>
  );
}

function OrderSummary({ cart, shippingMinor, locale }: { cart: NonNullable<Awaited<ReturnType<typeof fetchAccountCart>>>; shippingMinor: number; locale: Locale }) {
  const copy = getCheckoutCopy(locale);
  return (
    <aside className="h-fit border-t-2 border-black bg-white p-6 lg:sticky lg:top-28 lg:p-8">
      <div className="flex items-center justify-between"><h2 className="font-semibold">{copy.orderSummary}</h2><ShoppingBag className="size-4 text-black/45" /></div>
      <div className="mt-6 divide-y divide-black/10 border-y border-black/10">
        {cart.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-5 py-4 text-xs leading-6">
            <div><p className="font-semibold">{item.productName}</p><p className="text-black/65">{item.colorName} · {item.sizeName} · {copy.quantityLabel} {formatLocaleInteger(item.quantity, locale)}</p></div>
            <span className="shrink-0 tabular-nums">{formatMinor(item.lineTotalMinor, cart.currency, locale)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-6"><span className="font-semibold">{copy.itemsAmount}</span><strong className="text-lg tabular-nums">{formatMinor(cart.subtotalMinor, cart.currency, locale)}</strong></div>
      <div className="mt-3 flex items-center justify-between text-xs"><span>{getCheckoutCopy(locale).shippingTotal}</span><strong>{formatMinor(shippingMinor, cart.currency, locale)}</strong></div>
      <div className="mt-4 flex items-center justify-between border-t border-black/15 pt-4"><span className="font-semibold">{getCheckoutCopy(locale).grandTotal}</span><strong className="text-lg tabular-nums">{formatMinor(cart.subtotalMinor + shippingMinor, cart.currency, locale)}</strong></div>
    </aside>
  );
}

function Step({ active, done, number, label }: { active: boolean; done: boolean; number: string; label: string }) {
  return <li aria-current={active ? "step" : undefined} className={`flex items-center gap-1.5 ${active || done ? "text-black" : ""}`}><span className={`grid size-6 shrink-0 place-items-center border ${active || done ? "border-[#C15427]" : "border-black/20"}`}>{done ? <Check className="size-3 text-[#C15427]" aria-hidden /> : number}</span><span className="text-[10px] sm:text-[11px]">{label}</span></li>;
}

function CheckoutLoading() {
  return <div className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_390px]" role="status" aria-label="در حال دریافت اطلاعات تکمیل خرید"><div className="h-80 animate-pulse bg-white" /><div className="h-72 animate-pulse bg-white" /></div>;
}

function FlowLoading({ label, compact = false }: { label: string; compact?: boolean }) {
  return <div className={`${compact ? "mt-8 h-24" : "h-48"} animate-pulse bg-white`} role="status" aria-label={label}><span className="sr-only">{label}</span></div>;
}

function FlowState({ title, description, children, compact = false }: { title: string; description: string; children: React.ReactNode; compact?: boolean }) {
  return <section className={`${compact ? "mt-8" : ""} border-r-2 border-[#C15427] bg-white p-6 sm:p-8`} role="status"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-3 text-sm leading-7 text-black/65">{description}</p><div className="mt-6">{children}</div></section>;
}

function CheckoutState({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="mx-auto max-w-xl py-24 text-center"><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-4 text-sm leading-7 text-black/65">{description}</p><div className="mt-8">{children}</div></section>;
}

function Success({ order, locale }: { order: ConfirmResult["order"]; locale: Locale }) {
  return (
    <main dir={locale === "en" ? "ltr" : "rtl"} lang={locale} className="grid min-h-dvh place-items-center bg-[#F6F2EB] px-5 py-28 text-[#0B0B0B]">
      <section className="w-full max-w-2xl border-t-2 border-[#C15427] bg-white p-8 text-center sm:p-14">
        <div className="mx-auto grid size-14 place-items-center border border-[#C15427] text-[#C15427]"><Check className="size-6" /></div>
        <p className="mt-7 text-xs font-semibold tracking-[0.08em] text-[#C15427]">سفارش ثبت شد</p>
        <h1 className="mt-3 text-3xl font-semibold">از انتخاب شما سپاسگزاریم</h1>
        <p className="mt-5 text-sm leading-7 text-black/65">پرداخت آزمایشی موفق بود و موجودی سفارش قطعی شد.</p>
        {order?.orderNumber ? <p className="mt-5 border-y border-black/10 py-4 text-sm">شماره سفارش: <strong dir="ltr">{order.orderNumber}</strong></p> : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button href={localizedHref("/customer-dashboard", locale)} variant="black" size="lg">مشاهده سفارش‌ها</Button><Button href={localizedHref("/shop", locale)} variant="outline" size="lg">ادامه خرید</Button></div>
      </section>
    </main>
  );
}

function messageFor(error: unknown) {
  return error instanceof Error ? error.message : "لطفاً دوباره تلاش کنید.";
}

function formatLocaleInteger(value: number, locale: Locale, minimumIntegerDigits = 1) {
  return new Intl.NumberFormat(locale === "fa" ? "fa-IR" : locale === "ar" ? "ar" : "en", {
    minimumIntegerDigits,
    useGrouping: false,
  }).format(value);
}

function reservationAnnouncement(remaining: number, expired: boolean, locale: Locale) {
  if (expired) return locale === "en" ? "The reservation has expired." : locale === "ar" ? "انتهت مدة الحجز." : "زمان رزرو موجودی پایان یافته است.";
  if ([600, 300, 60].includes(remaining)) return locale === "en" ? `${Math.floor(remaining / 60)} minutes remain.` : locale === "ar" ? `تبقى ${Math.floor(remaining / 60)} دقيقة.` : `${Math.floor(remaining / 60)} دقیقه از زمان رزرو باقی مانده است.`;
  return "";
}
