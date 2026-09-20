"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock3, MapPin, ShieldCheck, ShoppingBag, X } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/CustomToast";
import {
  type AccountCart,
  type Checkout,
  type Payment,
  cartQueryKey,
  CommerceApiError,
  commerceFetch,
  fetchAccountCart,
  formatMinor,
  localized,
  loginHref,
} from "@/lib/commerce/client";

type LocalizedText = { fa?: string; en?: string; ar?: string };
type Destinations = {
  cities: Array<{ id: string; code: string; name: LocalizedText }>;
  stores: Array<{
    id: string;
    code: string;
    cityId: string;
    name: LocalizedText;
    address?: LocalizedText | null;
  }>;
};
type ConfirmResult = {
  payment: Payment;
  order: { _id?: string; id?: string; orderNumber?: string } | null;
  sms: { status: string } | null;
};

export function CheckoutPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [cityId, setCityId] = useState("");
  const [storeId, setStoreId] = useState("");
  const [createdCheckoutId, setCreatedCheckoutId] = useState<string | null>(null);
  const [createdPaymentId, setCreatedPaymentId] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<ConfirmResult["order"]>(null);
  const [now, setNow] = useState(() => Date.now());
  const checkoutKey = useRef<string | null>(null);
  const paymentKey = useRef<string | null>(null);
  const confirmKey = useRef<string | null>(null);

  const cartQuery = useQuery({
    queryKey: cartQueryKey,
    queryFn: ({ signal }) => fetchAccountCart(signal),
    retry: (count, error) =>
      !(error instanceof CommerceApiError && error.status === 401) && count < 1,
  });
  const destinationsQuery = useQuery({
    queryKey: ["storefront", "checkout-destinations"],
    queryFn: ({ signal }) =>
      commerceFetch<Destinations>("/api/storefront/checkout-destinations", { signal }),
  });

  const checkoutId = createdCheckoutId ?? cartQuery.data?.checkout?.id ?? null;

  const checkoutQuery = useQuery({
    queryKey: ["account", "checkout", checkoutId],
    queryFn: ({ signal }) =>
      commerceFetch<Checkout>(`/api/account/checkouts/${checkoutId}`, { signal }),
    enabled: Boolean(checkoutId),
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
  });
  const payment = paymentQuery.data;

  const reportMutationError = (title: string, error: unknown) => {
    if (error instanceof CommerceApiError && error.status === 401) {
      toast.info("نشست شما پایان یافته است", {
        description: "برای ادامه Checkout دوباره وارد حساب شوید.",
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
          cityId,
          storeId,
        }),
      });
    },
    onSuccess: async (value) => {
      setCreatedCheckoutId(value.id);
      queryClient.setQueryData(["account", "checkout", value.id], value);
      await queryClient.invalidateQueries({ queryKey: cartQueryKey });
      toast.success("موجودی برای شما رزرو شد", {
        description: "این رزرو تا ۱۵ دقیقه برای تکمیل پرداخت معتبر است.",
      });
    },
    onError: (error) => reportMutationError("رزرو موجودی انجام نشد", error),
  });

  const paymentMutation = useMutation({
    mutationFn: async () => {
      if (!checkoutId) throw new Error("Checkout هنوز ساخته نشده است.");
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
      if (!checkoutId) throw new Error("Checkout پیدا نشد.");
      return commerceFetch<Checkout>(`/api/account/checkouts/${checkoutId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "cancel" }),
      });
    },
    onSuccess: async () => {
      setCreatedCheckoutId(null);
      setCreatedPaymentId(null);
      queryClient.setQueryData<AccountCart | null>(cartQueryKey, (current) =>
        current ? { ...current, status: "active", checkout: null } : current,
      );
      checkoutKey.current = null;
      paymentKey.current = null;
      confirmKey.current = null;
      await queryClient.invalidateQueries({ queryKey: cartQueryKey });
      toast.info("رزرو لغو و موجودی آزاد شد");
    },
    onError: (error) => reportMutationError("لغو Checkout انجام نشد", error),
  });

  const stores = useMemo(
    () => destinationsQuery.data?.stores.filter((store) => store.cityId === cityId) ?? [],
    [cityId, destinationsQuery.data?.stores],
  );
  const expiresAt = checkout ? new Date(checkout.expiresAt).getTime() : 0;
  const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
  const expired = Boolean(checkout && remaining === 0 && checkout.status !== "completed");
  const signedOut = cartQuery.error instanceof CommerceApiError && cartQuery.error.status === 401;
  const cart = cartQuery.data;

  if (completedOrder || payment?.status === "succeeded") {
    return <Success order={completedOrder} />;
  }

  return (
    <main dir="rtl" lang="fa" className="min-h-dvh bg-[#F6F2EB] pb-24 pt-28 text-[#0B0B0B] md:pt-32">
      <div className="mx-auto w-full max-w-[1450px] px-5 sm:px-8 lg:px-12">
        <header className="border-b border-black/15 pb-7">
          <p className="text-[10px] font-semibold tracking-[0.12em] text-[#C15427]">تکمیل خرید</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
            <h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Checkout</h1>
            <ol className="flex items-center gap-2 text-[10px] text-black/45" aria-label="مراحل خرید">
              <Step active={!checkout} done={Boolean(checkout)} number="۱" label="انتخاب تحویل" />
              <span className="h-px w-5 bg-black/20" />
              <Step active={Boolean(checkout && !paymentId)} done={Boolean(paymentId)} number="۲" label="رزرو" />
              <span className="h-px w-5 bg-black/20" />
              <Step active={Boolean(paymentId)} done={false} number="۳" label="پرداخت" />
            </ol>
          </div>
        </header>

        {(cartQuery.isPending || destinationsQuery.isPending) ? <CheckoutLoading /> : null}

        {signedOut ? (
          <CheckoutState title="برای ادامه خرید وارد حساب شوید" description="پس از ورود، دوباره به همین صفحه برمی‌گردید.">
            <Button href={loginHref("/checkout")} variant="black" size="lg">ورود به حساب</Button>
          </CheckoutState>
        ) : null}

        {(cartQuery.isError && !signedOut) || destinationsQuery.isError ? (
          <CheckoutState title="اطلاعات Checkout دریافت نشد" description={messageFor(cartQuery.error || destinationsQuery.error)}>
            <Button type="button" variant="outline" size="lg" onClick={() => { void cartQuery.refetch(); void destinationsQuery.refetch(); }}>تلاش دوباره</Button>
          </CheckoutState>
        ) : null}

        {!cartQuery.isPending && !cartQuery.isError && (!cart || !cart.items.length) ? (
          <CheckoutState title="سبد خرید خالی است" description="برای شروع Checkout ابتدا محصولی را به سبد اضافه کنید.">
            <Button href="/shop" variant="black" size="lg">بازگشت به فروشگاه</Button>
          </CheckoutState>
        ) : null}

        {cart?.items.length ? (
          <div className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-16">
            <section className="space-y-8">
              {checkoutId && checkoutQuery.isPending ? (
                <div className="h-48 animate-pulse bg-white" aria-label="در حال بازیابی Checkout" />
              ) : checkout ? (
                <ReservationRail remaining={remaining} expired={expired} />
              ) : (
                <section className="border-t-2 border-black bg-white p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <MapPin className="mt-1 size-5 text-[#C15427]" />
                    <div>
                      <h2 className="text-xl font-semibold">محل تحویل و رزرو</h2>
                      <p className="mt-2 text-xs leading-6 text-black/50">شهر و فروشگاهی را انتخاب کنید که موجودی فعال آن برای سفارش بررسی شود.</p>
                    </div>
                  </div>
                  <div className="mt-8 grid gap-6 sm:grid-cols-2">
                    <Field label="شهر">
                      <select value={cityId} onChange={(event) => { setCityId(event.target.value); setStoreId(""); checkoutKey.current = null; }} className="h-12 w-full border border-black/20 bg-[#F6F2EB] px-4 text-sm outline-none transition focus:border-[#C15427]">
                        <option value="">انتخاب شهر</option>
                        {destinationsQuery.data?.cities.map((city) => <option key={city.id} value={city.id}>{localized(city.name, city.code)}</option>)}
                      </select>
                    </Field>
                    <Field label="فروشگاه">
                      <select value={storeId} disabled={!cityId} onChange={(event) => { setStoreId(event.target.value); checkoutKey.current = null; }} className="h-12 w-full border border-black/20 bg-[#F6F2EB] px-4 text-sm outline-none transition focus:border-[#C15427] disabled:opacity-40">
                        <option value="">انتخاب فروشگاه</option>
                        {stores.map((store) => <option key={store.id} value={store.id}>{localized(store.name, store.code)}</option>)}
                      </select>
                    </Field>
                  </div>
                  {cityId && stores.length === 0 ? <p className="mt-4 text-xs text-[#A33A32]">برای این شهر فروشگاه دارای محل موجودی فعال پیدا نشد.</p> : null}
                  <div className="mt-8 flex justify-end">
                    <Button type="button" variant="black" size="lg" disabled={!cityId || !storeId} loading={startMutation.isPending} onClick={() => startMutation.mutate()}>
                      بررسی و رزرو موجودی
                    </Button>
                  </div>
                </section>
              )}

              {checkout && !expired ? (
                <section className="border-t-2 border-black bg-white p-6 sm:p-8">
                  <div className="flex items-start gap-4">
                    <ShieldCheck className="mt-1 size-5 text-[#C15427]" />
                    <div>
                      <h2 className="text-xl font-semibold">پرداخت آزمایشی</h2>
                      <p className="mt-2 text-xs leading-6 text-black/50">تا زمان اتصال درگاه واقعی، این کنترل‌ها فقط نتیجه Provider آزمایشی را شبیه‌سازی می‌کنند. هیچ اطلاعات بانکی وارد نکنید.</p>
                    </div>
                  </div>

                  {!paymentId ? (
                    <div className="mt-8">
                      <Button type="button" variant="black" size="lg" loading={paymentMutation.isPending} onClick={() => paymentMutation.mutate()}>آماده‌سازی پرداخت</Button>
                    </div>
                  ) : (
                    <div className="mt-8 border border-dashed border-[#C15427]/55 bg-[#F6F2EB] p-5">
                      <p className="text-[10px] font-semibold text-[#C15427]">محیط آزمایشی / MOCK</p>
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
                  )}
                </section>
              ) : null}

              {checkout ? (
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-black/15 pt-5">
                  <p className="text-xs leading-6 text-black/50">لغو Checkout رزرو موجودی را فوراً آزاد می‌کند.</p>
                  <button type="button" disabled={cancelMutation.isPending} onClick={() => cancelMutation.mutate()} className="inline-flex min-h-11 items-center gap-2 text-xs text-[#A33A32] underline underline-offset-4 disabled:opacity-35">
                    <X className="size-3.5" /> {cancelMutation.isPending ? "در حال لغو…" : "لغو Checkout"}
                  </button>
                </div>
              ) : null}
            </section>

            <OrderSummary cart={cart} />
          </div>
        ) : null}
      </div>
    </main>
  );
}

function ReservationRail({ remaining, expired }: { remaining: number; expired: boolean }) {
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const progress = Math.max(0, Math.min(100, (remaining / (15 * 60)) * 100));
  return (
    <section className="border-t-2 border-[#C15427] bg-[#111] p-6 text-white sm:p-8" aria-live="polite">
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3"><Clock3 className="size-5 text-[#C15427]" /><div><p className="text-sm font-semibold">رزرو اختصاصی موجودی</p><p className="mt-1 text-[10px] text-white/55">رنگ و سایز انتخابی برای شما نگه داشته شده است.</p></div></div>
        <strong className="text-2xl tabular-nums" dir="ltr">{expired ? "۰۰:۰۰" : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}</strong>
      </div>
      <div className="mt-6 h-px bg-white/15"><div className="h-px bg-[#C15427] transition-[width] duration-1000" style={{ width: `${progress}%` }} /></div>
      {expired ? <p className="mt-4 text-xs text-[#F0A483]">زمان رزرو تمام شده است. به سبد برگردید و Checkout را دوباره شروع کنید.</p> : null}
    </section>
  );
}

function OrderSummary({ cart }: { cart: NonNullable<Awaited<ReturnType<typeof fetchAccountCart>>> }) {
  return (
    <aside className="h-fit border-t-2 border-black bg-white p-6 lg:sticky lg:top-28 lg:p-8">
      <div className="flex items-center justify-between"><h2 className="font-semibold">مرور سفارش</h2><ShoppingBag className="size-4 text-black/45" /></div>
      <div className="mt-6 divide-y divide-black/10 border-y border-black/10">
        {cart.items.map((item) => (
          <div key={item.id} className="flex justify-between gap-5 py-4 text-xs leading-6">
            <div><p className="font-semibold">{item.productName}</p><p className="text-black/45">{item.colorName} · {item.sizeName} · تعداد {new Intl.NumberFormat("fa-IR").format(item.quantity)}</p></div>
            <span className="shrink-0 tabular-nums">{formatMinor(item.lineTotalMinor, cart.currency)}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-6"><span className="font-semibold">مبلغ کالاها</span><strong className="text-lg tabular-nums">{formatMinor(cart.subtotalMinor, cart.currency)}</strong></div>
      <p className="mt-4 text-[10px] leading-5 text-black/45">هزینه ارسال در این نسخه محاسبه نمی‌شود و تخفیف یا مالیات ساختگی اعمال نشده است.</p>
    </aside>
  );
}

function Step({ active, done, number, label }: { active: boolean; done: boolean; number: string; label: string }) {
  return <li className={`flex items-center gap-2 ${active || done ? "text-black" : ""}`}><span className={`grid size-6 place-items-center border ${active || done ? "border-[#C15427]" : "border-black/20"}`}>{done ? <Check className="size-3 text-[#C15427]" /> : number}</span><span className="hidden sm:inline">{label}</span></li>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold">{label}</span>{children}</label>;
}

function CheckoutLoading() {
  return <div className="grid gap-10 pt-10 lg:grid-cols-[minmax(0,1fr)_390px]"><div className="h-80 animate-pulse bg-white" /><div className="h-72 animate-pulse bg-white" /></div>;
}

function CheckoutState({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="mx-auto max-w-xl py-24 text-center"><h2 className="text-2xl font-semibold">{title}</h2><p className="mt-4 text-sm leading-7 text-black/55">{description}</p><div className="mt-8">{children}</div></section>;
}

function Success({ order }: { order: ConfirmResult["order"] }) {
  return (
    <main dir="rtl" lang="fa" className="grid min-h-dvh place-items-center bg-[#F6F2EB] px-5 py-28 text-[#0B0B0B]">
      <section className="w-full max-w-2xl border-t-2 border-[#C15427] bg-white p-8 text-center sm:p-14">
        <div className="mx-auto grid size-14 place-items-center border border-[#C15427] text-[#C15427]"><Check className="size-6" /></div>
        <p className="mt-7 text-[10px] font-semibold tracking-[0.12em] text-[#C15427]">سفارش ثبت شد</p>
        <h1 className="mt-3 text-3xl font-semibold">از انتخاب شما سپاسگزاریم</h1>
        <p className="mt-5 text-sm leading-7 text-black/55">پرداخت آزمایشی موفق بود و موجودی سفارش قطعی شد.</p>
        {order?.orderNumber ? <p className="mt-5 border-y border-black/10 py-4 text-sm">شماره سفارش: <strong dir="ltr">{order.orderNumber}</strong></p> : null}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Button href="/customer-dashboard" variant="black" size="lg">مشاهده سفارش‌ها</Button><Button href="/shop" variant="outline" size="lg">ادامه خرید</Button></div>
      </section>
    </main>
  );
}

function messageFor(error: unknown) {
  return error instanceof Error ? error.message : "لطفاً دوباره تلاش کنید.";
}
