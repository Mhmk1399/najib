"use client";

import Image from "next/image";
import Link from "next/link";
import { amountForCurrencyDisplay } from "@/lib/catalog/currency";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Heart,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Truck,
  UserRound,
  X,
} from "lucide-react";
import {
  createContext,
  type FormEvent,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { AccountLogoutButton } from "@/components/account/account-logout-button";
import type { WishlistItem } from "@/components/account/use-wishlist";

import type { CustomerDashboardCopy } from "@/lib/i18n/customer-dashboard-copy";
import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/routes";

type Tab = "overview" | "orders" | "wishlist" | "profile";

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
  contact?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
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
  orders: {
    total: number;
    active: number;
    fulfilled: number;
    cancelled: number;
  };
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

const statusTones: Record<string, string> = {
  pending_inventory: "border-amber-700/25 bg-amber-50 text-amber-900",
  pending_payment: "border-amber-700/25 bg-amber-50 text-amber-900",
  payment_failed: "border-red-700/25 bg-red-50 text-red-800",
  confirmed: "border-blue-700/20 bg-blue-50 text-blue-800",
  fulfilled: "border-emerald-700/20 bg-emerald-50 text-emerald-800",
  cancelled: "border-neutral-400/40 bg-neutral-100 text-neutral-700",
  expired: "border-neutral-400/40 bg-neutral-100 text-neutral-700",
  refunded: "border-violet-700/20 bg-violet-50 text-violet-800",
  compensation_required: "border-orange-700/20 bg-orange-50 text-orange-800",
};

type CustomerDashboardI18nValue = {
  locale: Locale;
  copy: CustomerDashboardCopy;
};

const CustomerDashboardI18nContext =
  createContext<CustomerDashboardI18nValue | null>(null);

function useCustomerDashboardI18n() {
  const value = useContext(CustomerDashboardI18nContext);

  if (!value) {
    throw new Error("Customer dashboard i18n context is unavailable.");
  }

  return value;
}

function formatTemplate(
  template: string,
  values: Record<string, string | number>,
) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(getHtmlLang(locale)).format(value);
}

async function api<T>(
  url: string,
  init?: RequestInit,
  fallbackError = "",
): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
    ...init,
  });

  const body = (await response.json().catch(() => ({}))) as T & {
    error?: string;
  };

  if (!response.ok) throw new Error(body.error || fallbackError);
  return body;
}

function money(
  value: number,
  currency: string,
  locale: Locale,
) {
  const amount = amountForCurrencyDisplay(value, currency);

  return `${formatNumber(amount, locale)} ${
    currency === "IRR" ? (locale === "en" ? "rial" : locale === "ar" ? "ريال" : "ریال") : currency
  }`;
}

function date(value: string, locale: Locale) {
  return new Intl.DateTimeFormat(getHtmlLang(locale), {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: string }) {
  const { copy } = useCustomerDashboardI18n();

  const label =
    copy.statuses[status as keyof CustomerDashboardCopy["statuses"]] ?? status;

  const tone =
    statusTones[status] ?? "border-neutral-300 bg-neutral-50 text-neutral-700";

  return (
    <span
      className={`inline-flex border px-2.5 py-1 text-[11px] font-semibold ${tone}`}
    >
      {label}
    </span>
  );
}

function SectionError({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  const { copy } = useCustomerDashboardI18n();

  return (
    <div
      role="alert"
      className="border border-red-900/20 bg-red-50 p-5 text-sm text-red-900"
    >
      <p>{message}</p>

      <button
        type="button"
        onClick={retry}
        className="mt-4 inline-flex min-h-11 items-center gap-2 border-b border-current font-semibold"
      >
        <RefreshCw size={15} aria-hidden="true" />
        {copy.common.retry}
      </button>
    </div>
  );
}

function Skeleton() {
  const { copy } = useCustomerDashboardI18n();

  return (
    <div aria-label={copy.common.loading} className="space-y-4">
      <div className="h-28 animate-pulse bg-[#e7dfd2]" />
      <div className="h-48 animate-pulse bg-[#e7dfd2]" />
    </div>
  );
}

export function CustomerDashboard({
  initialAccount,
  locale,
  copy,
}: {
  initialAccount: Pick<Profile, "firstName" | "lastName" | "email">;
  locale: Locale;
  copy: CustomerDashboardCopy;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [summary, setSummary] = useState<Summary | null>(null);
  const [cart, setCart] = useState<Cart>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [removingWishlistId, setRemovingWishlistId] = useState<string | null>(null);
  const [wishlistError, setWishlistError] = useState("");

  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);

  const loadOverview = useCallback(
    async (signal?: AbortSignal) => {
      setOverviewLoading(true);
      setOverviewError("");

      try {
        const [summaryResult, cartResult, wishlistResult] = await Promise.all([
          api<Summary>(
            "/api/account/summary",
            { signal },
            copy.common.fetchError,
          ),
          api<Cart>("/api/account/cart", { signal }, copy.common.fetchError),
          api<{ items: WishlistItem[] }>(
            `/api/account/wishlist?locale=${locale}`,
            { signal },
            copy.common.fetchError,
          ),
        ]);

        setSummary(summaryResult);
        setCart(cartResult);
        setWishlist(wishlistResult.items);
      } catch (error) {
        if ((error as Error).name !== "AbortError")
          setOverviewError((error as Error).message);
      } finally {
        if (!signal?.aborted) setOverviewLoading(false);
      }
    },
    [copy.common.fetchError, locale],
  );

  useEffect(() => {
    const controller = new AbortController();

    // Data fetching is intentionally started when this protected client workspace mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadOverview(controller.signal);

    return () => controller.abort();
  }, [loadOverview]);

  const profile = summary?.profile ?? initialAccount;

  const tabs = [
    ["overview", copy.tabs.overview, CircleUserRound],
    ["orders", copy.tabs.orders, ShoppingBag],
    ["wishlist", copy.tabs.wishlist, Heart],
    ["profile", copy.tabs.profile, UserRound],
  ] as const;

  return (
    <CustomerDashboardI18nContext.Provider value={{ locale, copy }}>
      <main
        dir={direction}
        lang={htmlLang}
        className="min-h-dvh bg-[#f3eee5] text-[#191613] [font-family:inherit]"
      >
        <header className="border-b border-black/10 bg-[#171512] text-[#f4eee4]">
          <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-5 px-5 py-5 sm:px-8 lg:px-12">
            <div className="flex min-w-0 items-center gap-4 sm:gap-7">
              <Link
                href={localizedHref("/", locale)}
                className="shrink-0 text-[13px] font-bold tracking-[0.2em] text-white"
                dir="ltr"
              >
                {copy.brand.name}
              </Link>

              <span className="hidden h-7 w-px bg-white/15 sm:block" />

              <div className="min-w-0">
                <p className="text-[10px] text-[#bda78f]">
                  {copy.brand.personalSpace}
                </p>

                <p className="truncate text-sm font-semibold">
                  {profile.firstName} {profile.lastName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5 text-xs text-white/70">
              <Link
                href={localizedHref("/", locale)}
                className="hidden transition hover:text-white sm:block"
              >
                {copy.brand.backToStore}
              </Link>

              <AccountLogoutButton />
            </div>
          </div>
        </header>

        <div className="border-b border-black/10 bg-[#1f1c18] text-white">
          <div className="mx-auto max-w-[1480px] overflow-x-auto px-5 sm:px-8 lg:px-12">
            <nav
              role="tablist"
              aria-label={copy.tabs.ariaLabel}
              className="flex min-w-max gap-8"
            >
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
                    if (
                      !["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                        event.key,
                      )
                    )
                      return;

                    event.preventDefault();

                    const tabDirection = event.key === "ArrowLeft" ? 1 : -1;

                    const nextIndex =
                      event.key === "Home"
                        ? 0
                        : event.key === "End"
                          ? tabs.length - 1
                          : (index + tabDirection + tabs.length) % tabs.length;

                    const nextTab = tabs[nextIndex][0];

                    setTab(nextTab);

                    requestAnimationFrame(() =>
                      document
                        .getElementById(`account-tab-${nextTab}`)
                        ?.focus(),
                    );
                  }}
                  className={`flex min-h-14 items-center gap-2 border-b-2 px-1 text-sm transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c69b70] ${
                    tab === value
                      ? "border-[#c69b70] text-white"
                      : "border-transparent text-white/55 hover:text-white"
                  }`}
                >
                  <Icon size={17} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-[1480px] px-5 py-8 sm:px-8 sm:py-12 lg:px-12">
          {tab === "overview" && (
            <div
              id="account-panel-overview"
              role="tabpanel"
              aria-labelledby="account-tab-overview"
              tabIndex={0}
            >
              <Overview
                summary={summary}
                authenticatedFirstName={initialAccount.firstName}
                cart={cart}
                loading={overviewLoading}
                error={overviewError}
                retry={() => void loadOverview()}
                openOrders={() => setTab("orders")}
              />
            </div>
          )}

          {tab === "orders" && (
            <div
              id="account-panel-orders"
              role="tabpanel"
              aria-labelledby="account-tab-orders"
              tabIndex={0}
            >
              <Orders />
            </div>
          )}

          {tab === "wishlist" && (
            <div
              id="account-panel-wishlist"
              role="tabpanel"
              aria-labelledby="account-tab-wishlist"
              tabIndex={0}
            >
              <WishlistPanel
                items={wishlist}
                error={wishlistError}
                removingId={removingWishlistId}
                onRemove={async (productId) => {
                  setRemovingWishlistId(productId);
                  setWishlistError("");
                  try {
                    await api(
                      `/api/account/wishlist/${productId}`,
                      { method: "DELETE" },
                      copy.common.fetchError,
                    );
                    setWishlist((current) =>
                      current.filter((item) => item.id !== productId),
                    );
                  } catch (reason) {
                    setWishlistError((reason as Error).message);
                  } finally {
                    setRemovingWishlistId(null);
                  }
                }}
              />
            </div>
          )}

          {tab === "profile" && (
            <div
              id="account-panel-profile"
              role="tabpanel"
              aria-labelledby="account-tab-profile"
              tabIndex={0}
            >
              <ProfilePanel
                initialProfile={summary?.profile ?? null}
                onSaved={(next) =>
                  setSummary((current) =>
                    current
                      ? {
                          ...current,
                          profile: {
                            ...current.profile,
                            ...next,
                          },
                        }
                      : current,
                  )
                }
              />
            </div>
          )}
        </div>
      </main>
    </CustomerDashboardI18nContext.Provider>
  );
}

function JourneyRail() {
  const { copy, locale } = useCustomerDashboardI18n();
  const isRtl = getLocaleDirection(locale) === "rtl";

  const steps = [
    {
      icon: ShoppingCart,
      title: copy.journey.steps.select.title,
      text: copy.journey.steps.select.text,
    },
    {
      icon: CheckCircle2,
      title: copy.journey.steps.order.title,
      text: copy.journey.steps.order.text,
    },
    {
      icon: Package,
      title: copy.journey.steps.preparing.title,
      text: copy.journey.steps.preparing.text,
    },
    {
      icon: Truck,
      title: copy.journey.steps.delivery.title,
      text: copy.journey.steps.delivery.text,
    },
  ];

  return (
    <section
      aria-label={copy.journey.ariaLabel}
      className="border-y border-black/10 py-6"
    >
      <p className="mb-5 text-[10px] font-bold tracking-[0.12em] text-[#846a50]">
        {copy.journey.title}
      </p>

      <div className="grid grid-cols-4">
        {steps.map(({ icon: Icon, title, text }, index) => (
          <div
            key={title}
            className={`relative min-w-0 ${isRtl ? "pl-2" : "pr-2"}`}
          >
            {index < steps.length - 1 && (
              <span
                className={`absolute top-3 h-px w-[calc(100%-1.75rem)] bg-black/15 ${
                  isRtl ? "right-7" : "left-7"
                }`}
              />
            )}

            <span className="relative z-10 flex size-6 items-center justify-center bg-[#f3eee5] text-[#9b7552]">
              <Icon size={16} aria-hidden="true" />
            </span>

            <p className="mt-3 text-xs font-bold sm:text-sm">{title}</p>

            <p className="mt-1 hidden text-[11px] leading-5 text-black/55 sm:block">
              {text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Overview({
  summary,
  authenticatedFirstName,
  cart,
  loading,
  error,
  retry,
  openOrders,
}: {
  summary: Summary | null;
  authenticatedFirstName: string;
  cart: Cart;
  loading: boolean;
  error: string;
  retry: () => void;
  openOrders: () => void;
}) {
  const { copy, locale } = useCustomerDashboardI18n();
  const isRtl = getLocaleDirection(locale) === "rtl";

  const ForwardArrow = isRtl ? ArrowLeft : ArrowRight;
  const ForwardChevron = isRtl ? ChevronLeft : ChevronRight;

  if (loading) return <Skeleton />;

  if (error || !summary)
    return (
      <SectionError
        message={error || copy.overview.unavailable}
        retry={retry}
      />
    );

  const stats = [
    [copy.overview.stats.allOrders, summary.orders.total],
    [copy.overview.stats.activeOrders, summary.orders.active],
    [copy.overview.stats.fulfilledOrders, summary.orders.fulfilled],
    [copy.overview.stats.savedAddresses, summary.profile.addressCount ?? 0],
  ] as const;

  return (
    <div className="space-y-10">
      <header className="grid gap-6 border-b border-black/10 pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-semibold text-[#9b7552]">
            {copy.overview.eyebrow}
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {formatTemplate(copy.overview.titleTemplate, {
              name: summary.profile.firstName || authenticatedFirstName,
            })}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60">
            {copy.overview.description}
          </p>
        </div>

        <p className="text-xs text-black/50" dir="ltr">
          {summary.profile.email}
        </p>
      </header>

      <JourneyRail />

      <section
        aria-label={copy.overview.statsAriaLabel}
        className="grid border-y border-black/10 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map(([label, value], index) => (
          <div
            key={label}
            className={`px-1 py-6 sm:px-6 ${
              index > 0
                ? isRtl
                  ? "sm:border-r sm:border-black/10"
                  : "sm:border-l sm:border-black/10"
                : ""
            }`}
          >
            <p className="text-3xl font-semibold tabular-nums">
              {formatNumber(Number(value), locale)}
            </p>

            <p className="mt-2 text-xs text-black/55">{label}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(290px,.65fr)]">
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-[#9b7552]">
                {copy.overview.recentEyebrow}
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                {copy.overview.recentTitle}
              </h2>
            </div>

            {summary.orders.total > 0 && (
              <button
                type="button"
                onClick={openOrders}
                className="flex min-h-11 items-center gap-1 text-xs font-semibold hover:text-[#8d6746]"
              >
                {copy.overview.viewAll}
                <ForwardChevron size={15} aria-hidden="true" />
              </button>
            )}
          </div>

          {summary.recentOrders.length ? (
            <div className="divide-y divide-black/10 border-y border-black/10">
              {summary.recentOrders.map((order) => (
                <OrderRow key={order.id} order={order} onClick={openOrders} />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-black/20 p-8 text-center">
              <ShoppingBag
                className="mx-auto text-[#9b7552]"
                size={28}
                aria-hidden="true"
              />

              <p className="mt-4 font-semibold">
                {copy.overview.noOrdersTitle}
              </p>

              <p className="mt-2 text-sm text-black/55">
                {copy.overview.noOrdersDescription}
              </p>

              <Link
                href={localizedHref("/shop", locale)}
                className="mt-5 inline-flex min-h-11 items-center gap-2 border-b border-black text-sm font-semibold"
              >
                {copy.overview.viewProducts}
                <ForwardArrow size={15} aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>

        <aside className="bg-[#1d1a17] p-6 text-[#f5efe6] sm:p-8">
          <p className="text-[10px] font-bold tracking-[0.12em] text-[#c39a72]">
            {copy.overview.cartEyebrow}
          </p>

          {cart ? (
            <>
              <p className="mt-4 text-3xl font-semibold">
                {formatTemplate(copy.overview.cartItemCountTemplate, {
                  count: formatNumber(cart.itemCount, locale),
                })}
              </p>

              <p className="mt-2 text-sm text-white/65">
                {copy.overview.cartSubtotalLabel}{" "}
                <span dir="ltr" className="font-semibold text-white">
                  {money(cart.subtotalMinor, cart.currency, locale)}
                </span>
              </p>

              <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
                {cart.items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4 text-xs"
                  >
                    <span className="truncate text-white/65">
                      {item.productName} × {formatNumber(item.quantity, locale)}
                    </span>

                    <span className="shrink-0" dir="ltr">
                      {money(item.lineTotalMinor, cart.currency, locale)}
                    </span>
                  </div>
                ))}
              </div>

              <Link
                href={localizedHref("/cart", locale)}
                className="mt-7 flex min-h-12 items-center justify-center gap-2 bg-[#c19a73] px-5 text-sm font-bold text-[#17130f] transition hover:bg-[#d2ae89]"
              >
                {copy.overview.continueShopping}
                <ForwardArrow size={16} aria-hidden="true" />
              </Link>
            </>
          ) : (
            <div className="pt-8">
              <ShoppingCart
                size={30}
                className="text-white/35"
                aria-hidden="true"
              />

              <p className="mt-5 font-semibold">
                {copy.overview.emptyCartTitle}
              </p>

              <p className="mt-2 text-xs leading-6 text-white/50">
                {copy.overview.emptyCartDescription}
              </p>

              <Link
                href={localizedHref("/shop", locale)}
                className="mt-6 inline-flex min-h-11 items-center gap-2 border-b border-[#c19a73] text-sm"
              >
                {copy.overview.startShopping}
                <ForwardArrow size={15} aria-hidden="true" />
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function OrderRow({
  order,
  onClick,
}: {
  order: OrderSummary;
  onClick?: () => void;
}) {
  const { copy, locale } = useCustomerDashboardI18n();

  return (
    <button
      type="button"
      onClick={onClick}
      className="grid min-h-20 w-full grid-cols-[1fr_auto] items-center gap-4 py-4 text-start transition hover:bg-black/[0.025] focus-visible:outline-2 focus-visible:outline-[#9b7552] sm:grid-cols-[1fr_1fr_auto] sm:px-3"
    >
      <div>
        <p className="font-semibold" dir="ltr">
          #{order.orderNumber}
        </p>

        <p className="mt-1 text-[11px] text-black/50">
          {date(order.createdAt, locale)} ·{" "}
          {formatTemplate(copy.common.itemCountTemplate, {
            count: formatNumber(order.itemCount, locale),
          })}
        </p>
      </div>

      <p className="hidden text-sm font-semibold sm:block" dir="ltr">
        {money(order.totalMinor, order.currency, locale)}
      </p>

      <StatusBadge status={order.status} />
    </button>
  );
}

function WishlistPanel({
  items,
  error,
  removingId,
  onRemove,
}: {
  items: WishlistItem[];
  error: string;
  removingId: string | null;
  onRemove: (productId: string) => Promise<void>;
}) {
  const { copy, locale } = useCustomerDashboardI18n();
  const ForwardArrow = getLocaleDirection(locale) === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <section aria-labelledby="wishlist-title">
      <header className="border-b border-black/10 pb-7">
        <p className="text-xs font-semibold text-[#9b7552]">
          {copy.wishlist.eyebrow}
        </p>
        <h1 id="wishlist-title" className="mt-2 text-3xl font-semibold">
          {copy.wishlist.title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-black/60">
          {copy.wishlist.description}
        </p>
      </header>

      {error ? (
        <div className="mt-7 border border-red-900/20 bg-red-50 p-4 text-sm text-red-900" role="alert">
          {error}
        </div>
      ) : null}

      {items.length ? (
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.id} className="group border border-black/10 bg-white/35">
              <Link
                href={localizedHref(`/shop/${item.slug}`, locale)}
                className="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b7552]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#e7dfd2]">
                  {item.image?.url ? (
                    <Image
                      src={item.image.url}
                      alt={item.image.alt || item.displayName}
                      fill
                      sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                      style={{ objectPosition: item.image.objectPosition }}
                    />
                  ) : null}
                </div>
              </Link>

              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Link
                      href={localizedHref(`/shop/${item.slug}`, locale)}
                      className="line-clamp-2 font-semibold hover:text-[#8d6746]"
                    >
                      {item.displayName}
                    </Link>
                    <p className="mt-2 text-sm text-black/60" dir="ltr">
                      {item.priceMinor > 0
                        ? money(item.priceMinor, item.currency, locale, copy)
                        : copy.wishlist.priceUnavailable}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void onRemove(item.id)}
                    disabled={removingId === item.id}
                    aria-label={copy.wishlist.remove}
                    className="grid size-10 shrink-0 place-items-center border border-black/15 text-[#9b7552] transition hover:border-red-700/35 hover:text-red-700 disabled:cursor-wait disabled:opacity-50"
                  >
                    <Heart size={17} fill="currentColor" aria-hidden="true" />
                  </button>
                </div>

                {removingId === item.id ? (
                  <p className="mt-3 text-[11px] text-black/50" role="status">
                    {copy.wishlist.removing}…
                  </p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-7 border border-dashed border-black/20 py-16 text-center">
          <Heart className="mx-auto text-[#9b7552]" size={30} aria-hidden="true" />
          <h2 className="mt-4 font-semibold">{copy.wishlist.emptyTitle}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-black/50">
            {copy.wishlist.emptyDescription}
          </p>
          <Link
            href={localizedHref("/shop", locale)}
            className="mt-6 inline-flex min-h-11 items-center gap-2 border-b border-black text-sm font-semibold"
          >
            {copy.wishlist.browseProducts}
            <ForwardArrow size={15} aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
}

function Orders() {
  const { copy, locale } = useCustomerDashboardI18n();

  const [data, setData] = useState<OrderPage | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<OrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError("");

      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: "8",
        });

        if (status) query.set("status", status);

        setData(
          await api<OrderPage>(
            `/api/account/orders?${query}`,
            { signal },
            copy.common.fetchError,
          ),
        );
      } catch (reason) {
        if ((reason as Error).name !== "AbortError")
          setError((reason as Error).message);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [copy.common.fetchError, page, status],
  );

  useEffect(() => {
    const controller = new AbortController();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(controller.signal);

    return () => controller.abort();
  }, [load]);

  const openOrder = async (id: string) => {
    setDetailLoading(true);
    setError("");

    try {
      setSelected(
        await api<OrderDetail>(
          `/api/account/orders/${id}`,
          undefined,
          copy.common.fetchError,
        ),
      );
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <section aria-labelledby="orders-title">
      <header className="flex flex-col gap-5 border-b border-black/10 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold text-[#9b7552]">
            {copy.orders.eyebrow}
          </p>

          <h1 id="orders-title" className="mt-2 text-3xl font-semibold">
            {copy.orders.title}
          </h1>
        </div>

        <label className="flex items-center gap-3 text-xs text-black/55">
          {copy.orders.statusLabel}

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="min-h-11 border border-black/15 bg-transparent px-3 text-sm text-black outline-none focus:border-[#9b7552]"
          >
            <option value="">{copy.orders.allOrders}</option>

            {Object.keys(statusTones).map((value) => (
              <option key={value} value={value}>
                {copy.statuses[
                  value as keyof CustomerDashboardCopy["statuses"]
                ] ?? value}
              </option>
            ))}
          </select>
        </label>
      </header>

      <div aria-live="polite" className="mt-7">
        {loading ? (
          <Skeleton />
        ) : error ? (
          <SectionError message={error} retry={() => void load()} />
        ) : !data?.items.length ? (
          <div className="border border-dashed border-black/20 py-16 text-center">
            <Package className="mx-auto text-[#9b7552]" aria-hidden="true" />

            <h2 className="mt-4 font-semibold">{copy.orders.emptyTitle}</h2>

            <p className="mt-2 text-sm text-black/50">
              {copy.orders.emptyDescription}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-black/10 border-y border-black/10">
            {data.items.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onClick={() => void openOrder(order.id)}
              />
            ))}
          </div>
        )}
      </div>

      {data && data.pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-between text-xs">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((v) => v - 1)}
            className="min-h-11 px-2 disabled:opacity-35"
          >
            {copy.orders.previousPage}
          </button>

          <span>
            {formatTemplate(copy.orders.pageTemplate, {
              page: formatNumber(page, locale),
              pages: formatNumber(data.pagination.pages, locale),
            })}
          </span>

          <button
            type="button"
            disabled={page >= data.pagination.pages}
            onClick={() => setPage((v) => v + 1)}
            className="min-h-11 px-2 disabled:opacity-35"
          >
            {copy.orders.nextPage}
          </button>
        </div>
      )}

      {detailLoading && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/45"
          role="status"
        >
          <div className="bg-[#f3eee5] p-7">
            <RefreshCw className="animate-spin" aria-hidden="true" />
            <span className="sr-only">{copy.orders.loadingOrder}</span>
          </div>
        </div>
      )}

      {selected && (
        <OrderDrawer order={selected} close={() => setSelected(null)} />
      )}
    </section>
  );
}

function OrderDrawer({
  order,
  close,
}: {
  order: OrderDetail;
  close: () => void;
}) {
  const { copy, locale } = useCustomerDashboardI18n();
  const isRtl = getLocaleDirection(locale) === "rtl";

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

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
    <div
      className="fixed inset-0 z-50 bg-black/50"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-detail-title"
        className={`h-full w-full max-w-xl overflow-y-auto bg-[#f3eee5] p-6 shadow-2xl sm:p-9 ${
          isRtl ? "mr-auto" : "ml-auto"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-black/10 pb-6">
          <div>
            <p className="text-xs text-[#9b7552]">{copy.orderDetail.eyebrow}</p>

            <h2
              id="order-detail-title"
              className="mt-1 text-2xl font-semibold"
              dir="ltr"
            >
              #{order.orderNumber}
            </h2>

            <p className="mt-2 text-xs text-black/50">
              {date(order.createdAt, locale)}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={close}
            aria-label={copy.orderDetail.closeAriaLabel}
            className="grid size-11 place-items-center border border-black/15 hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b7552]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <StatusBadge status={order.status} />

          <span className="text-sm">
            {formatTemplate(copy.orderDetail.itemCountTemplate, {
              count: formatNumber(order.itemCount, locale),
            })}
          </span>
        </div>

        <div className="mt-7 divide-y divide-black/10 border-y border-black/10">
          {order.items.map((item) => (
            <div key={item.id} className="py-5">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-semibold">{item.productName}</p>

                  <p className="mt-1 text-[11px] text-black/50" dir="ltr">
                    {copy.orderDetail.skuLabel}: {item.sku}
                  </p>
                </div>

                <p className="shrink-0 text-sm font-semibold" dir="ltr">
                  {money(item.lineTotalMinor, order.currency, locale)}
                </p>
              </div>

              <p className="mt-2 text-xs text-black/55">
                {copy.orderDetail.quantityLabel}{" "}
                {formatNumber(item.quantity, locale)}
                {item.colorName
                  ? ` · ${copy.orderDetail.colorLabel} ${item.colorName}`
                  : ""}
                {item.sizeName
                  ? ` · ${copy.orderDetail.sizeLabel} ${item.sizeName}`
                  : ""}
              </p>
            </div>
          ))}
        </div>

        <dl className="mt-7 space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-black/55">{copy.orderDetail.subtotalLabel}</dt>

            <dd dir="ltr">
              {money(order.subtotalMinor, order.currency, locale)}
            </dd>
          </div>

          <div className="flex justify-between">
            <dt className="text-black/55">{copy.orderDetail.shippingLabel}</dt>

            <dd dir="ltr">
              {money(order.shippingMinor, order.currency, locale)}
            </dd>
          </div>

          {order.discountMinor > 0 && (
            <div className="flex justify-between text-emerald-800">
              <dt>{copy.orderDetail.discountLabel}</dt>

              <dd dir="ltr">
                − {money(order.discountMinor, order.currency, locale)}
              </dd>
            </div>
          )}

          <div className="flex justify-between border-t border-black/15 pt-4 text-base font-bold">
            <dt>{copy.orderDetail.totalLabel}</dt>

            <dd dir="ltr">
              {money(order.totalMinor, order.currency, locale)}
            </dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}

function ProfilePanel({
  initialProfile,
  onSaved,
}: {
  initialProfile: Profile | null;
  onSaved: (profile: Profile) => void;
}) {
  const { copy, locale } = useCustomerDashboardI18n();
  const direction = getLocaleDirection(locale);
  const isRtl = direction === "rtl";

  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [loading, setLoading] = useState(!initialProfile);
  const [refreshing, setRefreshing] = useState(Boolean(initialProfile));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(
    async (showLoading = true) => {
      if (showLoading) setLoading(true);
      else setRefreshing(true);

      setError("");

      try {
        setProfile(
          await api<Profile>(
            "/api/account/profile",
            undefined,
            copy.common.fetchError,
          ),
        );
      } catch (reason) {
        setError((reason as Error).message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [copy.common.fetchError],
  );

  useEffect(() => {
    // Summary intentionally contains only an address count. Always load the complete
    // profile here so the address list is never represented by partial summary data.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(!initialProfile);
  }, [initialProfile, load]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    const form = new FormData(event.currentTarget);

    try {
      const next = await api<Profile>(
        "/api/account/profile",
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: String(form.get("firstName") || "").trim(),
            lastName: String(form.get("lastName") || "").trim(),
            phone: String(form.get("phone") || "").trim(),
            preferredLocale: form.get("preferredLocale"),
          }),
        },
        copy.common.fetchError,
      );

      setProfile(next);
      onSaved(next);
      setNotice(copy.profile.savedNotice);
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Skeleton />;

  if (!profile)
    return (
      <SectionError
        message={error || copy.profile.unavailable}
        retry={() => void load(true)}
      />
    );

  return (
    <section
      aria-labelledby="profile-title"
      className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,.7fr)]"
    >
      <div>
        <header className="border-b border-black/10 pb-7">
          <p className="text-xs font-semibold text-[#9b7552]">
            {copy.profile.eyebrow}
          </p>

          <div className="flex items-center gap-3">
            <h1 id="profile-title" className="mt-2 text-3xl font-semibold">
              {copy.profile.title}
            </h1>

            {refreshing && (
              <RefreshCw
                aria-label={copy.profile.refreshingAriaLabel}
                size={15}
                className="mt-2 animate-spin text-[#9b7552]"
              />
            )}
          </div>

          <p className="mt-3 text-sm leading-7 text-black/55">
            {copy.profile.description}
          </p>
        </header>

        <form onSubmit={submit} className="mt-8 grid gap-6 sm:grid-cols-2">
          <Field
            label={copy.profile.firstName}
            name="firstName"
            defaultValue={profile.firstName}
            dir={direction}
            required
          />

          <Field
            label={copy.profile.lastName}
            name="lastName"
            defaultValue={profile.lastName}
            dir={direction}
            required
          />

          <Field
            label={copy.profile.phone}
            name="phone"
            defaultValue={profile.phone ?? ""}
            dir="ltr"
          />

          <label className="grid gap-2 text-xs font-semibold">
            {copy.profile.preferredLanguage}

            <select
              name="preferredLocale"
              defaultValue={profile.preferredLocale ?? "fa"}
              className="min-h-12 border border-black/20 bg-transparent px-3 text-sm outline-none focus:border-[#9b7552]"
            >
              <option value="fa">{copy.localeNames.fa}</option>
              <option value="en">{copy.localeNames.en}</option>
              <option value="ar">{copy.localeNames.ar}</option>
            </select>
          </label>

          <label className="grid gap-2 text-xs font-semibold sm:col-span-2">
            {copy.profile.email}

            <span
              dir="ltr"
              className="flex min-h-12 items-center border border-black/10 bg-black/[0.035] px-3 text-left text-sm text-black/55"
            >
              {profile.email}
            </span>

            <span className="font-normal text-black/45">
              {copy.profile.emailLocked}
            </span>
          </label>

          <div aria-live="polite" className="sm:col-span-2">
            {error && <p className="text-sm text-red-800">{error}</p>}

            {notice && (
              <p className="flex items-center gap-2 text-sm text-emerald-800">
                <CheckCircle2 size={16} aria-hidden="true" />
                {notice}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="min-h-12 bg-[#1d1a17] px-7 text-sm font-semibold text-white transition hover:bg-[#352d26] disabled:opacity-50"
            >
              {saving ? copy.profile.saving : copy.profile.save}
            </button>
          </div>
        </form>
      </div>

      <aside
        className={`border-t border-black/10 pt-8 lg:border-t-0 lg:pt-0 ${
          isRtl ? "lg:border-r lg:pr-9" : "lg:border-l lg:pl-9"
        }`}
      >
        <div className="flex items-center gap-3">
          <MapPin className="text-[#9b7552]" size={20} aria-hidden="true" />

          <div>
            <p className="text-xs text-black/50">
              {copy.profile.addressEyebrow}
            </p>

            <h2 className="font-semibold">{copy.profile.addressTitle}</h2>
          </div>
        </div>

        {profile.addresses?.length ? (
          <div className="mt-6 space-y-4">
            {profile.addresses.map((address) => (
              <article key={address.id} className="border border-black/15 p-5">
                <div className="flex justify-between gap-3">
                  <p className="font-semibold">{address.label}</p>

                  {address.isDefault && (
                    <span className="text-[10px] text-[#8d6746]">
                      {copy.profile.defaultAddress}
                    </span>
                  )}
                </div>

                <p className="mt-3 text-sm leading-7 text-black/60">
                  {address.line1}
                  {address.line2
                    ? `${copy.common.listSeparator}${address.line2}`
                    : ""}
                  <br />
                  {address.city}
                  {address.region
                    ? `${copy.common.listSeparator}${address.region}`
                    : ""}
                  <br />
                  {copy.profile.postalCodeLabel}{" "}
                  <span dir="ltr">{address.postalCode}</span>
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 border border-dashed border-black/20 p-7 text-center">
            <MapPin className="mx-auto text-black/30" aria-hidden="true" />

            <p className="mt-3 text-sm font-semibold">
              {copy.profile.noAddressTitle}
            </p>

            <p className="mt-2 text-xs leading-6 text-black/50">
              {copy.profile.noAddressDescription}
            </p>
          </div>
        )}

        <div className="mt-8 border-t border-black/10 pt-6">
          <p className="flex items-center gap-2 text-xs font-semibold">
            <Clock3 size={15} className="text-[#9b7552]" aria-hidden="true" />
            {copy.profile.securityTitle}
          </p>

          <p className="mt-2 text-xs leading-6 text-black/50">
            {copy.profile.securityDescription}
          </p>
        </div>
      </aside>
    </section>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
  dir,
}: {
  label: string;
  name: string;
  defaultValue: string;
  required?: boolean;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className="grid gap-2 text-xs font-semibold">
      {label}
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        dir={dir}
        className="min-h-12 border border-black/20 bg-transparent px-3 text-sm outline-none transition focus:border-[#9b7552] focus:ring-1 focus:ring-[#9b7552]"
      />
    </label>
  );
}
