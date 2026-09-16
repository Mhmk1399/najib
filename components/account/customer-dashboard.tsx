"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  CircleUserRound,
  Clock3,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { AccountLogoutButton } from "@/components/account/account-logout-button";

type Tab = "overview" | "orders" | "profile";

type Profile = {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  preferredLocale?: "fa" | "en" | "ar";
  addressCount?: number;
  addresses?: Address[];
};

type Address = {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: string;
  isDefault: boolean;
};

type OrderSummary = {
  id: string;
  orderNumber: string;
  status: string;
  currency: string;
  subtotalMinor: number;
  taxMinor: number;
  discountMinor: number;
  shippingMinor: number;
  totalMinor: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
};

type OrderDetail = OrderSummary & {
  contact?: { firstName?: string; lastName?: string; email?: string; phone?: string };
  items: Array<{
    id: string;
    productName: string;
    sku: string;
    colorName?: string;
    sizeName?: string;
    unitPriceMinor: number;
    discountMinor: number;
    quantity: number;
    lineTotalMinor: number;
  }>;
};

type Summary = {
  profile: Profile;
  orders: { total: number; active: number; fulfilled: number; cancelled: number };
  spending: Array<{ currency: string; totalMinor: number }>;
  cart: null | {
    id: string;
    status: string;
    itemCount: number;
    subtotalMinor: number;
    currency: string;
  };
  recentOrders: OrderSummary[];
};

type Cart = null | {
  id: string;
  status: string;
  currency: string;
  itemCount: number;
  subtotalMinor: number;
  items: Array<{
    id: string;
    quantity: number;
    unitPriceMinor: number;
    lineTotalMinor: number;
    productName: string;
    productSlug: string | null;
    sku: string;
    colorName: string;
    colorHex: string | null;
    sizeName: string;
  }>;
};

type OrderPage = {
  items: OrderSummary[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

const statusMeta: Record<string, { label: string; tone: string }> = {
  pending_inventory: { label: "در انتظار موجودی", tone: "border-amber-700/25 bg-amber-50 text-amber-900" },
  pending_payment: { label: "در انتظار پرداخت", tone: "border-amber-700/25 bg-amber-50 text-amber-900" },
  payment_failed: { label: "پرداخت ناموفق", tone: "border-red-700/25 bg-red-50 text-red-800" },
  confirmed: { label: "تأیید شده", tone: "border-blue-700/20 bg-blue-50 text-blue-800" },
  fulfilled: { label: "تحویل شده", tone: "border-emerald-700/20 bg-emerald-50 text-emerald-800" },
  cancelled: { label: "لغو شده", tone: "border-neutral-400/40 bg-neutral-100 text-neutral-700" },
  expired: { label: "منقضی شده", tone: "border-neutral-400/40 bg-neutral-100 text-neutral-700" },
  refunded: { label: "بازپرداخت شده", tone: "border-violet-700/20 bg-violet-50 text-violet-800" },
  compensation_required: { label: "در حال بررسی", tone: "border-orange-700/20 bg-orange-50 text-orange-800" },
};

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: "same-origin", cache: "no-store", ...init });
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(body.error || "دریافت اطلاعات انجام نشد.");
  return body;
}

function money(value: number, currency = "IRR") {
  const amount = currency === "IRR" ? Math.round(value / 10) : value / 100;
  return `${new Intl.NumberFormat("fa-IR").format(amount)} ${currency === "IRR" ? "تومان" : currency}`;
}

function date(value: string) {
  return new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(new Date(value));
}

function StatusBadge({ status }: { status: string }) {
  const meta = statusMeta[status] ?? { label: status, tone: "border-neutral-300 bg-neutral-50 text-neutral-700" };
  return <span className={`inline-flex border px-2.5 py-1 text-[11px] font-semibold ${meta.tone}`}>{meta.label}</span>;
}

function SectionError({ message, retry }: { message: string; retry: () => void }) {
  return (
    <div role="alert" className="border border-red-900/20 bg-red-50 p-5 text-sm text-red-900">
      <p>{message}</p>
      <button type="button" onClick={retry} className="mt-4 inline-flex min-h-11 items-center gap-2 border-b border-current font-semibold">
        <RefreshCw size={15} /> تلاش دوباره
      </button>
    </div>
  );
}

function Skeleton() {
  return <div aria-label="در حال بارگذاری" className="space-y-4"><div className="h-28 animate-pulse bg-[#e7dfd2]" /><div className="h-48 animate-pulse bg-[#e7dfd2]" /></div>;
}

export function CustomerDashboard({ initialAccount }: { initialAccount: Pick<Profile, "firstName" | "lastName" | "email"> }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [cart, setCart] = useState<Cart>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");

  const loadOverview = useCallback(async (signal?: AbortSignal) => {
    setOverviewLoading(true);
    setOverviewError("");
    try {
      const [summaryResult, cartResult] = await Promise.all([
        api<Summary>("/api/account/summary", { signal }),
        api<Cart>("/api/account/cart", { signal }),
      ]);
      setSummary(summaryResult);
      setCart(cartResult);
    } catch (error) {
      if ((error as Error).name !== "AbortError") setOverviewError((error as Error).message);
    } finally {
      if (!signal?.aborted) setOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // Data fetching is intentionally started when this protected client workspace mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadOverview(controller.signal);
    return () => controller.abort();
  }, [loadOverview]);

  const profile = summary?.profile ?? initialAccount;
  const tabs = [
    ["overview", "خلاصه حساب", CircleUserRound],
    ["orders", "سفارش‌ها", ShoppingBag],
    ["profile", "مشخصات من", UserRound],
  ] as const;

  return (
    <main dir="rtl" className="min-h-dvh bg-[#f3eee5] text-[#191613] [font-family:inherit]">
      <header className="border-b border-black/10 bg-[#171512] text-[#f4eee4]">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-5 px-5 py-5 sm:px-8 lg:px-12">
          <div className="flex min-w-0 items-center gap-4 sm:gap-7">
            <Link href="/" className="shrink-0 text-[13px] font-bold tracking-[0.2em] text-white" dir="ltr">NAJIBZADEH</Link>
            <span className="hidden h-7 w-px bg-white/15 sm:block" />
            <div className="min-w-0">
              <p className="text-[10px] text-[#bda78f]">فضای شخصی شما</p>
              <p className="truncate text-sm font-semibold">{profile.firstName} {profile.lastName}</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-xs text-white/70">
            <Link href="/" className="hidden transition hover:text-white sm:block">بازگشت به فروشگاه</Link>
            <AccountLogoutButton />
          </div>
        </div>
      </header>

      <div className="border-b border-black/10 bg-[#1f1c18] text-white">
        <div className="mx-auto max-w-[1480px] overflow-x-auto px-5 sm:px-8 lg:px-12">
          <nav role="tablist" aria-label="بخش‌های حساب" className="flex min-w-max gap-8">
            {tabs.map(([value, label, Icon], index) => (
              <button
                key={value}
                id={`account-tab-${value}`}
                role="tab"
                type="button"
                aria-selected={tab === value}
                aria-controls={`account-panel-${value}`}
                tabIndex={tab === value ? 0 : -1}
                onClick={() => setTab(value)}
                onKeyDown={(event) => {
                  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                  event.preventDefault();
                  const direction = event.key === "ArrowLeft" ? 1 : -1;
                  const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + direction + tabs.length) % tabs.length;
                  const nextTab = tabs[nextIndex][0];
                  setTab(nextTab);
                  requestAnimationFrame(() => document.getElementById(`account-tab-${nextTab}`)?.focus());
                }}
                className={`flex min-h-14 items-center gap-2 border-b-2 px-1 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c69b70] ${tab === value ? "border-[#c69b70] text-white" : "border-transparent text-white/55 hover:text-white"}`}
              >
                <Icon size={17} /> {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-[1480px] px-5 py-8 sm:px-8 sm:py-12 lg:px-12">
        {tab === "overview" && <div id="account-panel-overview" role="tabpanel" aria-labelledby="account-tab-overview" tabIndex={0}><Overview summary={summary} authenticatedFirstName={initialAccount.firstName} cart={cart} loading={overviewLoading} error={overviewError} retry={() => void loadOverview()} openOrders={() => setTab("orders")} /></div>}
        {tab === "orders" && <div id="account-panel-orders" role="tabpanel" aria-labelledby="account-tab-orders" tabIndex={0}><Orders /></div>}
        {tab === "profile" && <div id="account-panel-profile" role="tabpanel" aria-labelledby="account-tab-profile" tabIndex={0}><ProfilePanel initialProfile={summary?.profile ?? null} onSaved={(next) => setSummary((current) => current ? { ...current, profile: { ...current.profile, ...next } } : current)} /></div>}
      </div>
    </main>
  );
}

function JourneyRail() {
  const steps = [
    { icon: ShoppingCart, title: "انتخاب", text: "افزودن کالا به سبد" },
    { icon: CheckCircle2, title: "ثبت سفارش", text: "تأیید اطلاعات و پرداخت" },
    { icon: Package, title: "آماده‌سازی", text: "بررسی و بسته‌بندی" },
    { icon: Truck, title: "تحویل", text: "ارسال به نشانی شما" },
  ];
  return (
    <section aria-label="مسیر سفارش" className="border-y border-black/10 py-6">
      <p className="mb-5 text-[10px] font-bold tracking-[0.12em] text-[#846a50]">مسیر هر خرید در نجیب‌زاده</p>
      <div className="grid grid-cols-4">
        {steps.map(({ icon: Icon, title, text }, index) => (
          <div key={title} className="relative min-w-0 pl-2">
            {index < steps.length - 1 && <span className="absolute right-7 top-3 h-px w-[calc(100%-1.75rem)] bg-black/15" />}
            <span className="relative z-10 flex size-6 items-center justify-center bg-[#f3eee5] text-[#9b7552]"><Icon size={16} /></span>
            <p className="mt-3 text-xs font-bold sm:text-sm">{title}</p>
            <p className="mt-1 hidden text-[11px] leading-5 text-black/55 sm:block">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Overview({ summary, authenticatedFirstName, cart, loading, error, retry, openOrders }: { summary: Summary | null; authenticatedFirstName: string; cart: Cart; loading: boolean; error: string; retry: () => void; openOrders: () => void }) {
  if (loading) return <Skeleton />;
  if (error || !summary) return <SectionError message={error || "اطلاعات حساب در دسترس نیست."} retry={retry} />;
  return (
    <div className="space-y-10">
      <header className="grid gap-6 border-b border-black/10 pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-semibold text-[#9b7552]">خوش آمدید</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{summary.profile.firstName || authenticatedFirstName} عزیز، حساب شما آماده است.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60">سفارش‌ها، سبد خرید و اطلاعات حساب را از یک فضای امن پیگیری کنید.</p>
        </div>
        <p className="text-xs text-black/50" dir="ltr">{summary.profile.email}</p>
      </header>

      <JourneyRail />

      <section aria-label="آمار حساب" className="grid border-y border-black/10 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["همه سفارش‌ها", summary.orders.total],
          ["سفارش فعال", summary.orders.active],
          ["تحویل‌شده", summary.orders.fulfilled],
          ["نشانی ذخیره‌شده", summary.profile.addressCount ?? 0],
        ].map(([label, value], index) => (
          <div key={String(label)} className={`px-1 py-6 sm:px-6 ${index > 0 ? "sm:border-r sm:border-black/10" : ""}`}>
            <p className="text-3xl font-semibold tabular-nums">{new Intl.NumberFormat("fa-IR").format(Number(value))}</p>
            <p className="mt-2 text-xs text-black/55">{label}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(290px,.65fr)]">
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div><p className="text-xs text-[#9b7552]">آخرین فعالیت</p><h2 className="mt-1 text-xl font-semibold">سفارش‌های اخیر</h2></div>
            {summary.orders.total > 0 && <button type="button" onClick={openOrders} className="flex min-h-11 items-center gap-1 text-xs font-semibold hover:text-[#8d6746]">مشاهده همه <ChevronLeft size={15} /></button>}
          </div>
          {summary.recentOrders.length ? (
            <div className="divide-y divide-black/10 border-y border-black/10">
              {summary.recentOrders.map((order) => <OrderRow key={order.id} order={order} onClick={openOrders} />)}
            </div>
          ) : (
            <div className="border border-dashed border-black/20 p-8 text-center">
              <ShoppingBag className="mx-auto text-[#9b7552]" size={28} />
              <p className="mt-4 font-semibold">هنوز سفارشی ثبت نکرده‌اید</p>
              <p className="mt-2 text-sm text-black/55">اولین انتخاب شما می‌تواند شروع یک استایل ماندگار باشد.</p>
              <Link href="/shop" className="mt-5 inline-flex min-h-11 items-center gap-2 border-b border-black text-sm font-semibold">مشاهده محصولات <ArrowLeft size={15} /></Link>
            </div>
          )}
        </section>

        <aside className="bg-[#1d1a17] p-6 text-[#f5efe6] sm:p-8">
          <p className="text-[10px] font-bold tracking-[0.12em] text-[#c39a72]">سبد خرید جاری</p>
          {cart ? (
            <>
              <p className="mt-4 text-3xl font-semibold">{new Intl.NumberFormat("fa-IR").format(cart.itemCount)} <span className="text-base font-normal text-white/55">کالا</span></p>
              <p className="mt-2 text-sm text-white/65">جمع سبد: <span dir="ltr" className="font-semibold text-white">{money(cart.subtotalMinor, cart.currency)}</span></p>
              <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
                {cart.items.slice(0, 3).map((item) => <div key={item.id} className="flex justify-between gap-4 text-xs"><span className="truncate text-white/65">{item.productName} × {item.quantity}</span><span className="shrink-0" dir="ltr">{money(item.lineTotalMinor, cart.currency)}</span></div>)}
              </div>
              <Link href="/cart" className="mt-7 flex min-h-12 items-center justify-center gap-2 bg-[#c19a73] px-5 text-sm font-bold text-[#17130f] transition hover:bg-[#d2ae89]">ادامه خرید <ArrowLeft size={16} /></Link>
            </>
          ) : (
            <div className="pt-8">
              <ShoppingCart size={30} className="text-white/35" />
              <p className="mt-5 font-semibold">سبد شما خالی است</p>
              <p className="mt-2 text-xs leading-6 text-white/50">محصولات انتخاب‌شده شما اینجا نمایش داده می‌شوند.</p>
              <Link href="/shop" className="mt-6 inline-flex min-h-11 items-center gap-2 border-b border-[#c19a73] text-sm">شروع خرید <ArrowLeft size={15} /></Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function OrderRow({ order, onClick }: { order: OrderSummary; onClick?: () => void }) {
  return (
    <button type="button" onClick={onClick} className="grid min-h-20 w-full grid-cols-[1fr_auto] items-center gap-4 py-4 text-right transition hover:bg-black/[0.025] focus-visible:outline-2 focus-visible:outline-[#9b7552] sm:grid-cols-[1fr_1fr_auto] sm:px-3">
      <div><p className="font-semibold" dir="ltr">#{order.orderNumber}</p><p className="mt-1 text-[11px] text-black/50">{date(order.createdAt)} · {order.itemCount} کالا</p></div>
      <p className="hidden text-sm font-semibold sm:block" dir="ltr">{money(order.totalMinor, order.currency)}</p>
      <StatusBadge status={order.status} />
    </button>
  );
}

function Orders() {
  const [data, setData] = useState<OrderPage | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try {
      const query = new URLSearchParams({ page: String(page), limit: "8" });
      if (status) query.set("status", status);
      setData(await api<OrderPage>(`/api/account/orders?${query}`, { signal }));
    } catch (reason) { if ((reason as Error).name !== "AbortError") setError((reason as Error).message); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [page, status]);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const openOrder = async (id: string) => {
    setDetailLoading(true); setError("");
    try { setSelected(await api<OrderDetail>(`/api/account/orders/${id}`)); }
    catch (reason) { setError((reason as Error).message); }
    finally { setDetailLoading(false); }
  };

  return (
    <section aria-labelledby="orders-title">
      <header className="flex flex-col gap-5 border-b border-black/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-semibold text-[#9b7552]">تاریخچه خرید</p><h1 id="orders-title" className="mt-2 text-3xl font-semibold">سفارش‌های من</h1></div>
        <label className="flex items-center gap-3 text-xs text-black/55">وضعیت
          <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="min-h-11 border border-black/15 bg-transparent px-3 text-sm text-black outline-none focus:border-[#9b7552]">
            <option value="">همه سفارش‌ها</option>
            {Object.entries(statusMeta).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
          </select>
        </label>
      </header>
      <div aria-live="polite" className="mt-7">
        {loading ? <Skeleton /> : error ? <SectionError message={error} retry={() => void load()} /> : !data?.items.length ? (
          <div className="border border-dashed border-black/20 py-16 text-center"><Package className="mx-auto text-[#9b7552]" /><h2 className="mt-4 font-semibold">سفارشی در این بخش نیست</h2><p className="mt-2 text-sm text-black/50">با تغییر فیلتر یا دیدن محصولات دوباره بررسی کنید.</p></div>
        ) : (
          <div className="divide-y divide-black/10 border-y border-black/10">
            {data.items.map((order) => <OrderRow key={order.id} order={order} onClick={() => void openOrder(order.id)} />)}
          </div>
        )}
      </div>
      {data && data.pagination.pages > 1 && <div className="mt-6 flex items-center justify-between text-xs"><button type="button" disabled={page <= 1} onClick={() => setPage((v) => v - 1)} className="min-h-11 px-2 disabled:opacity-35">صفحه قبل</button><span>صفحه {new Intl.NumberFormat("fa-IR").format(page)} از {new Intl.NumberFormat("fa-IR").format(data.pagination.pages)}</span><button type="button" disabled={page >= data.pagination.pages} onClick={() => setPage((v) => v + 1)} className="min-h-11 px-2 disabled:opacity-35">صفحه بعد</button></div>}
      {detailLoading && <div className="fixed inset-0 z-50 grid place-items-center bg-black/45" role="status"><div className="bg-[#f3eee5] p-7"><RefreshCw className="animate-spin" /> <span className="sr-only">در حال دریافت سفارش</span></div></div>}
      {selected && <OrderDrawer order={selected} close={() => setSelected(null)} />}
    </section>
  );
}

function OrderDrawer({ order, close }: { order: OrderDetail; close: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [close]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
      <aside role="dialog" aria-modal="true" aria-labelledby="order-detail-title" className="mr-auto h-full w-full max-w-xl overflow-y-auto bg-[#f3eee5] p-6 shadow-2xl sm:p-9">
        <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-6">
          <div><p className="text-xs text-[#9b7552]">جزئیات سفارش</p><h2 id="order-detail-title" className="mt-1 text-2xl font-semibold" dir="ltr">#{order.orderNumber}</h2><p className="mt-2 text-xs text-black/50">{date(order.createdAt)}</p></div>
          <button ref={closeButtonRef} type="button" onClick={close} aria-label="بستن جزئیات" className="grid size-11 place-items-center border border-black/15 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b7552]"><X size={18} /></button>
        </div>
        <div className="mt-6 flex items-center justify-between"><StatusBadge status={order.status} /><span className="text-sm">{order.itemCount} کالا</span></div>
        <div className="mt-7 divide-y divide-black/10 border-y border-black/10">
          {order.items.map((item) => <div key={item.id} className="py-5"><div className="flex justify-between gap-4"><div><p className="font-semibold">{item.productName}</p><p className="mt-1 text-[11px] text-black/50" dir="ltr">SKU: {item.sku}</p></div><p className="shrink-0 text-sm font-semibold" dir="ltr">{money(item.lineTotalMinor, order.currency)}</p></div><p className="mt-2 text-xs text-black/55">تعداد {item.quantity}{item.colorName ? ` · رنگ ${item.colorName}` : ""}{item.sizeName ? ` · سایز ${item.sizeName}` : ""}</p></div>)}
        </div>
        <dl className="mt-7 space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-black/55">جمع کالاها</dt><dd dir="ltr">{money(order.subtotalMinor, order.currency)}</dd></div>
          <div className="flex justify-between"><dt className="text-black/55">ارسال</dt><dd dir="ltr">{money(order.shippingMinor, order.currency)}</dd></div>
          {order.discountMinor > 0 && <div className="flex justify-between text-emerald-800"><dt>تخفیف</dt><dd dir="ltr">− {money(order.discountMinor, order.currency)}</dd></div>}
          <div className="flex justify-between border-t border-black/15 pt-4 text-base font-bold"><dt>مبلغ نهایی</dt><dd dir="ltr">{money(order.totalMinor, order.currency)}</dd></div>
        </dl>
      </aside>
    </div>
  );
}

function ProfilePanel({ initialProfile, onSaved }: { initialProfile: Profile | null; onSaved: (profile: Profile) => void }) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [loading, setLoading] = useState(!initialProfile);
  const [refreshing, setRefreshing] = useState(Boolean(initialProfile));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    setError("");
    try { setProfile(await api<Profile>("/api/account/profile")); }
    catch (reason) { setError((reason as Error).message); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useEffect(() => {
    // Summary intentionally contains only an address count. Always load the complete
    // profile here so the address list is never represented by partial summary data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(!initialProfile);
  }, [initialProfile, load]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    const form = new FormData(event.currentTarget);
    try {
      const next = await api<Profile>("/api/account/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ firstName: String(form.get("firstName") || "").trim(), lastName: String(form.get("lastName") || "").trim(), phone: String(form.get("phone") || "").trim(), preferredLocale: form.get("preferredLocale") }) });
      setProfile(next); onSaved(next); setNotice("تغییرات با موفقیت ذخیره شد.");
    } catch (reason) { setError((reason as Error).message); }
    finally { setSaving(false); }
  };

  if (loading) return <Skeleton />;
  if (!profile) return <SectionError message={error || "مشخصات حساب در دسترس نیست."} retry={() => void load(true)} />;
  return (
    <section aria-labelledby="profile-title" className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.7fr)]">
      <div>
        <header className="border-b border-black/10 pb-7"><p className="text-xs font-semibold text-[#9b7552]">اطلاعات حساب</p><div className="flex items-center gap-3"><h1 id="profile-title" className="mt-2 text-3xl font-semibold">مشخصات من</h1>{refreshing && <RefreshCw aria-label="در حال به‌روزرسانی مشخصات" size={15} className="mt-2 animate-spin text-[#9b7552]" />}</div><p className="mt-3 text-sm leading-7 text-black/55">اطلاعات تماس خود را دقیق نگه دارید تا هماهنگی سفارش‌ها آسان‌تر باشد.</p></header>
        <form onSubmit={submit} className="mt-8 grid gap-6 sm:grid-cols-2">
          <Field label="نام" name="firstName" defaultValue={profile.firstName} required />
          <Field label="نام خانوادگی" name="lastName" defaultValue={profile.lastName} required />
          <Field label="شماره تماس" name="phone" defaultValue={profile.phone ?? ""} dir="ltr" />
          <label className="grid gap-2 text-xs font-semibold">زبان ترجیحی<select name="preferredLocale" defaultValue={profile.preferredLocale ?? "fa"} className="min-h-12 border border-black/20 bg-transparent px-3 text-sm outline-none focus:border-[#9b7552]"><option value="fa">فارسی</option><option value="en">English</option><option value="ar">العربية</option></select></label>
          <label className="grid gap-2 text-xs font-semibold sm:col-span-2">ایمیل<span dir="ltr" className="flex min-h-12 items-center border border-black/10 bg-black/[0.035] px-3 text-left text-sm text-black/55">{profile.email}</span><span className="font-normal text-black/45">ایمیل ورود از این بخش قابل تغییر نیست.</span></label>
          <div aria-live="polite" className="sm:col-span-2">{error && <p className="text-sm text-red-800">{error}</p>}{notice && <p className="flex items-center gap-2 text-sm text-emerald-800"><CheckCircle2 size={16} />{notice}</p>}</div>
          <div className="sm:col-span-2"><button type="submit" disabled={saving} className="min-h-12 bg-[#1d1a17] px-7 text-sm font-semibold text-white transition hover:bg-[#352d26] disabled:opacity-50">{saving ? "در حال ذخیره…" : "ذخیره تغییرات"}</button></div>
        </form>
      </div>
      <aside className="border-t border-black/10 pt-8 lg:border-r lg:border-t-0 lg:pr-9 lg:pt-0">
        <div className="flex items-center gap-3"><MapPin className="text-[#9b7552]" size={20} /><div><p className="text-xs text-black/50">دفترچه نشانی</p><h2 className="font-semibold">نشانی‌های ذخیره‌شده</h2></div></div>
        {profile.addresses?.length ? <div className="mt-6 space-y-4">{profile.addresses.map((address) => <article key={address.id} className="border border-black/15 p-5"><div className="flex justify-between gap-3"><p className="font-semibold">{address.label}</p>{address.isDefault && <span className="text-[10px] text-[#8d6746]">پیش‌فرض</span>}</div><p className="mt-3 text-sm leading-7 text-black/60">{address.line1}{address.line2 ? `، ${address.line2}` : ""}<br />{address.city}{address.region ? `، ${address.region}` : ""}<br />کد پستی: <span dir="ltr">{address.postalCode}</span></p></article>)}</div> : <div className="mt-6 border border-dashed border-black/20 p-7 text-center"><MapPin className="mx-auto text-black/30" /><p className="mt-3 text-sm font-semibold">نشانی‌ای ذخیره نشده است</p><p className="mt-2 text-xs leading-6 text-black/50">نشانی ارسال هنگام ثبت سفارش قابل افزودن است.</p></div>}
        <div className="mt-8 border-t border-black/10 pt-6"><p className="flex items-center gap-2 text-xs font-semibold"><Clock3 size={15} className="text-[#9b7552]" /> امنیت حساب</p><p className="mt-2 text-xs leading-6 text-black/50">اطلاعات این صفحه فقط پس از تأیید نشست امن شما دریافت می‌شود.</p></div>
      </aside>
    </section>
  );
}

function Field({ label, name, defaultValue, required, dir }: { label: string; name: string; defaultValue: string; required?: boolean; dir?: "ltr" | "rtl" }) {
  return <label className="grid gap-2 text-xs font-semibold">{label}<input name={name} defaultValue={defaultValue} required={required} dir={dir} className="min-h-12 border border-black/20 bg-transparent px-3 text-sm outline-none transition focus:border-[#9b7552] focus:ring-1 focus:ring-[#9b7552]" /></label>;
}
