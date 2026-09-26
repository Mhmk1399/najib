"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  ExternalLink,
  ImageIcon,
  Layers3,
  Package,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { fa, type LocalizedText } from "@/lib/admin/localization";

type Summary = {
  counts: {
    products: {
      total: number;
      active: number;
      draft: number;
      archived: number;
    };
    categories: { total: number; active: number };
    subcategories: { total: number; active: number };
    collections: { total: number; active: number };
    images: { total: number; active: number };
    variants: { total: number; active: number };
    users: { total: number; staff: number };
  };
  attention: {
    draftProducts: number;
    productsWithoutImage: number;
    inactiveTaxonomy: number;
    inactiveReferences: number;
  };
  recentlyEditedProducts: Array<{
    _id: string;
    name: LocalizedText;
    slug: string;
    status: "draft" | "active" | "archived";
    updatedAt?: string;
  }>;
  generatedAt: string;
};

const number = new Intl.NumberFormat("fa-IR");
const date = new Intl.DateTimeFormat("fa-IR", {
  dateStyle: "medium",
  timeStyle: "short",
});

async function fetchSummary(): Promise<Summary> {
  const response = await fetch("/api/admin/dashboard-summary", {
    credentials: "same-origin",
    cache: "no-store",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
    };

    throw new Error(body.error || "دریافت خلاصه کاتالوگ انجام نشد.");
  }

  return response.json() as Promise<Summary>;
}

export function Dashboard() {
  const query = useQuery({
    queryKey: ["admin", "dashboard-summary"],
    queryFn: fetchSummary,
    staleTime: 30_000,
  });

  if (query.isPending) return <DashboardLoading />;

  if (query.isError) {
    return (
      <main className="mx-auto w-full max-w-[1700px] p-3 sm:p-5 xl:p-6">
        <section
          role="alert"
          className="relative isolate overflow-hidden rounded-[24px] border border-[#A7554C]/30 bg-[var(--admin-shell-panel)] p-6 text-right text-[var(--admin-shell-text)] shadow-[0_30px_90px_-58px_rgba(0,0,0,0.9)] sm:p-8"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_86%_0%,rgba(167,85,76,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent_42%)]"
          />

          <span className="grid size-12 place-items-center rounded-[16px] border border-[#A7554C]/30 bg-[#A7554C]/10 text-[#E1847B] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <AlertTriangle size={20} strokeWidth={1.6} aria-hidden="true" />
          </span>

          <h1 className="mt-5 text-[20px] font-bold tracking-[-0.02em]">
            خلاصه کاتالوگ در دسترس نیست
          </h1>

          <p className="mt-2 max-w-[620px] text-[11px] leading-7 text-[var(--admin-shell-muted)] sm:text-[12px]">
            {query.error.message}
          </p>

          <Button
            className="mt-6 !tracking-normal"
            type="button"
            variant="outline"
            onClick={() => void query.refetch()}
            icon={<RefreshCw size={16} />}
          >
            تلاش دوباره
          </Button>
        </section>
      </main>
    );
  }

  const data = query.data;

  const summaryCards = [
    {
      label: "محصولات",
      value: data.counts.products.total,
      detail: `${number.format(data.counts.products.active)} فعال`,
      href: "/admin/catalog/products",
      icon: Package,
    },
    {
      label: "دسته‌ها",
      value: data.counts.categories.total,
      detail: `${number.format(data.counts.subcategories.total)} زیردسته`,
      href: "/admin/categories",
      icon: Boxes,
    },
    {
      label: "مجموعه‌ها",
      value: data.counts.collections.total,
      detail: `${number.format(data.counts.collections.active)} فعال`,
      href: "/admin/catalog/references",
      icon: Layers3,
    },
    {
      label: "تصاویر",
      value: data.counts.images.total,
      detail: `${number.format(data.counts.images.active)} فعال`,
      href: "/admin/catalog/images",
      icon: ImageIcon,
    },
    {
      label: "تنوع‌ها",
      value: data.counts.variants.total,
      detail: `${number.format(data.counts.variants.active)} فعال`,
      href: "/admin/catalog/references",
      icon: SlidersHorizontal,
    },
    {
      label: "کاربران",
      value: data.counts.users.total,
      detail: `${number.format(data.counts.users.staff)} همکار`,
      href: "/admin/users",
      icon: Users,
    },
  ];

  const quickActions = [
    {
      label: "محصولات",
      detail: "مدیریت و ویرایش",
      href: "/admin/catalog/products",
      icon: Package,
      external: false,
    },
    {
      label: "دسته‌بندی‌ها",
      detail: "ساختار کاتالوگ",
      href: "/admin/categories",
      icon: Boxes,
      external: false,
    },
    {
      label: "تصاویر",
      detail: "مدیریت رسانه",
      href: "/admin/catalog/images",
      icon: ImageIcon,
      external: false,
    },
    {
      label: "اطلاعات پایه",
      detail: "مجموعه و مرجع",
      href: "/admin/catalog/references",
      icon: Layers3,
      external: false,
    },
    {
      label: "تنوع‌ها",
      detail: "ویژگی و Variant",
      href: "/admin/catalog/references",
      icon: SlidersHorizontal,
      external: false,
    },
    {
      label: "مشاهده فروشگاه",
      detail: "باز کردن سایت",
      href: "/shop",
      icon: ExternalLink,
      external: true,
    },
  ] as const;

  const attention = [
    {
      label: "محصول پیش‌نویس",
      value: data.attention.draftProducts,
      href: "/admin/catalog/products",
      hint: "نیازمند تکمیل اطلاعات یا انتشار",
    },
    {
      label: "محصول بدون تصویر اصلی",
      value: data.attention.productsWithoutImage,
      href: "/admin/catalog/products",
      hint: "تصویر اصلی برای نمایش فروشگاهی ثبت نشده",
    },
    {
      label: "دسته یا زیردسته غیرفعال",
      value: data.attention.inactiveTaxonomy,
      href: "/admin/categories",
      hint: "ساختار غیرفعال کاتالوگ را بررسی کنید",
    },
    {
      label: "مجموعه یا تنوع غیرفعال",
      value: data.attention.inactiveReferences,
      href: "/admin/catalog/references",
      hint: "مرجع یا تنوع غیرفعال وجود دارد",
    },
  ];

  const attentionTotal = attention.reduce((sum, item) => sum + item.value, 0);

  const productTotal = Math.max(data.counts.products.total, 1);
  const activePercent = Math.min(
    100,
    Math.round((data.counts.products.active / productTotal) * 100),
  );
  const draftPercent = Math.min(
    100,
    Math.round((data.counts.products.draft / productTotal) * 100),
  );
  const archivedPercent = Math.min(
    100,
    Math.round((data.counts.products.archived / productTotal) * 100),
  );

  return (
    <main className="mx-auto w-full max-w-[1700px] p-3 sm:p-5 xl:p-6">
      {/* ==================================================================
          HERO / COMMAND OVERVIEW
      ================================================================== */}
      <section
        aria-labelledby="dashboard-title"
        className="relative isolate min-h-[250px] overflow-hidden rounded-[26px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] shadow-[0_34px_100px_-66px_rgba(0,0,0,0.96)] sm:min-h-[282px]"
      >
        <Image
          src="/assets/images/suit.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 1279px) 100vw, 1500px"
          className="-z-30 object-cover object-[44%_28%] grayscale-[0.08]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(7,6,5,0.985)_0%,rgba(8,7,6,0.95)_34%,rgba(8,7,6,0.60)_64%,rgba(8,7,6,0.90)_100%)]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_14%,rgba(197,140,91,0.19),transparent_27%),radial-gradient(circle_at_10%_105%,rgba(255,255,255,0.055),transparent_25%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent_25%)]"
        />

        <div
          aria-hidden="true"
          className="absolute inset-x-[9%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.23),rgba(197,140,91,0.7),rgba(255,255,255,0.15),transparent)]"
        />

        <div className="relative flex min-h-[250px] flex-col justify-between gap-8 p-5 sm:min-h-[282px] sm:p-7 lg:flex-row lg:items-end lg:p-8 xl:p-9">
          <div className="max-w-[760px] text-right">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex min-h-7 items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 text-[8px] font-semibold text-[#E2B687] backdrop-blur-[8px]">
                <Sparkles size={12} strokeWidth={1.5} aria-hidden="true" />
                مرکز کنترل نجیب‌زاده
              </span>

              <span
                className={`inline-flex min-h-7 items-center rounded-full border px-3 text-[8px] font-semibold ${
                  attentionTotal > 0
                    ? "border-[#DDA15F]/25 bg-[#DDA15F]/10 text-[#F0B875]"
                    : "border-[#70B48D]/25 bg-[#70B48D]/10 text-[#8ED2A9]"
                }`}
              >
                {attentionTotal > 0
                  ? `${number.format(attentionTotal)} مورد نیازمند پیگیری`
                  : "وضعیت کاتالوگ مناسب است"}
              </span>
            </div>

            <h1
              id="dashboard-title"
              className="mt-5 max-w-[760px] text-balance text-[clamp(1.9rem,5vw,3.65rem)] font-bold leading-[1.18] tracking-[-0.045em] text-white"
            >
              همه‌چیز برای مدیریت سریع‌تر، در یک نگاه.
            </h1>

            <p className="mt-4 max-w-[650px] text-[11px] leading-7 text-white/60 sm:text-[12px]">
              وضعیت محصولات، ساختار کاتالوگ، رسانه‌ها و موارد نیازمند اقدام را
              بدون جابه‌جایی بین چند صفحه مدیریت کنید.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link
                href="/admin/catalog/products"
                className="group inline-flex min-h-11 items-center gap-2 rounded-[13px] border border-[var(--admin-shell-accent)]/70 bg-[var(--admin-shell-accent)] px-4 text-[10px] font-bold text-[#15100C] shadow-[0_14px_38px_-20px_rgba(197,140,91,0.88)] outline-none transition-[transform,filter,box-shadow] duration-300 hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_18px_46px_-20px_rgba(197,140,91,0.92)] focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent-soft)]/75 active:translate-y-0 motion-reduce:transition-none"
              >
                مدیریت محصولات
                <ArrowLeft
                  size={14}
                  className="transition-transform duration-300 group-hover:-translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>

              <Link
                href="/shop"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-[13px] border border-white/14 bg-black/24 px-4 text-[10px] font-semibold text-white/82 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[10px] outline-none transition-[border-color,background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:border-white/28 hover:bg-white/8 hover:text-white focus-visible:ring-2 focus-visible:ring-white/45 active:translate-y-0 motion-reduce:transition-none"
              >
                مشاهده فروشگاه
                <ExternalLink size={13} strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-1.5 rounded-[16px] border border-white/10 bg-black/20 px-4 py-3 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-[10px] lg:items-end">
            <span className="text-[7.5px] font-medium text-white/38">
              آخرین بروزرسانی
            </span>
            <strong className="text-[9.5px] font-semibold text-white/74">
              {date.format(new Date(data.generatedAt))}
            </strong>
          </div>
        </div>
      </section>

      {/* ==================================================================
          QUICK ACCESS
      ================================================================== */}
      <section
        aria-labelledby="quick-access-title"
        className="mt-3 overflow-hidden rounded-[22px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] shadow-[0_24px_70px_-56px_rgba(0,0,0,0.92)]"
      >
        <header className="flex items-center justify-between gap-4 border-b border-[var(--admin-shell-border)] px-4 py-3.5 sm:px-5">
          <div className="text-right">
            <p className="text-[7.5px] font-semibold text-[var(--admin-shell-accent-soft)]">
              مسیرهای پرتکرار
            </p>
            <h2
              id="quick-access-title"
              className="mt-1 text-[13px] font-bold tracking-[-0.01em]"
            >
              دسترسی سریع
            </h2>
          </div>

          <span className="hidden text-[8px] text-[var(--admin-shell-subtle)] sm:block">
            یک کلیک تا بخش موردنظر
          </span>
        </header>

        <div className="grid grid-cols-2 gap-px bg-[var(--admin-shell-border)] sm:grid-cols-3 xl:grid-cols-6">
          {quickActions.map(({ label, detail, href, icon: Icon, external }) => (
            <Link
              key={`${label}-${href}`}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="group relative min-h-[104px] bg-[var(--admin-shell-panel)] p-3.5 text-right outline-none transition-[background-color,color] duration-250 hover:bg-[var(--admin-shell-raised)] focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--admin-shell-accent)]/45 sm:min-h-[112px] sm:p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-9 place-items-center rounded-[11px] border border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-control)] text-[var(--admin-shell-accent-soft)] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] transition-[border-color,transform,background-color] duration-300 group-hover:-translate-y-0.5 group-hover:border-[var(--admin-shell-accent)]/38 group-hover:bg-[var(--admin-shell-active)]">
                  <Icon size={16} strokeWidth={1.55} aria-hidden="true" />
                </span>

                <ArrowLeft
                  size={13}
                  aria-hidden="true"
                  className="mt-1 text-[var(--admin-shell-subtle)] transition-[transform,color] duration-300 group-hover:-translate-x-1 group-hover:text-[var(--admin-shell-accent-soft)]"
                />
              </div>

              <strong className="mt-3 block text-[10px] font-bold text-[var(--admin-shell-text)]">
                {label}
              </strong>
              <span className="mt-1 block text-[8px] leading-5 text-[var(--admin-shell-subtle)]">
                {detail}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ==================================================================
          SUMMARY
      ================================================================== */}
      <section
        aria-label="آمار کاتالوگ"
        className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-3 2xl:grid-cols-6"
      >
        {summaryCards.map(({ label, value, detail, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="group relative min-h-[136px] overflow-hidden rounded-[18px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] p-4 text-right text-[var(--admin-shell-text)] shadow-[0_22px_64px_-52px_rgba(0,0,0,0.94)] outline-none transition-[border-color,background-color,transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-[var(--admin-shell-accent)]/34 hover:bg-[var(--admin-shell-raised)] hover:shadow-[0_28px_70px_-50px_rgba(0,0,0,0.96)] focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/45 active:translate-y-0 motion-reduce:transition-none"
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--admin-shell-accent),transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-70"
            />

            <div className="flex items-start justify-between gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-[11px] border border-[var(--admin-shell-accent)]/22 bg-[var(--admin-shell-accent)]/10 text-[var(--admin-shell-accent-soft)]">
                <Icon size={17} strokeWidth={1.6} aria-hidden="true" />
              </span>

              <ArrowLeft
                size={14}
                aria-hidden="true"
                className="mt-1 text-[var(--admin-shell-subtle)] transition-[transform,color] duration-300 group-hover:-translate-x-1 group-hover:text-[var(--admin-shell-accent-soft)]"
              />
            </div>

            <span className="mt-4 block text-[9.5px] text-[var(--admin-shell-muted)]">
              {label}
            </span>

            <div className="mt-1.5 flex items-end justify-between gap-2">
              <strong className="text-[28px] font-bold leading-none tabular-nums tracking-[-0.03em]">
                {number.format(value)}
              </strong>

              <span className="max-w-[72px] text-left text-[8px] font-medium leading-4 text-[var(--admin-shell-accent-soft)]">
                {detail}
              </span>
            </div>
          </Link>
        ))}
      </section>

      {/* ==================================================================
          PRODUCT HEALTH + ATTENTION
      ================================================================== */}
      <div className="mt-3 grid gap-3 xl:grid-cols-[0.92fr_1.08fr]">
        <section className="overflow-hidden rounded-[20px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] text-[var(--admin-shell-text)] shadow-[0_24px_74px_-56px_rgba(0,0,0,0.92)]">
          <header className="flex items-start justify-between gap-4 border-b border-[var(--admin-shell-border)] px-5 py-4 sm:px-6">
            <div className="text-right">
              <p className="text-[7.5px] font-semibold text-[var(--admin-shell-accent-soft)]">
                سلامت محصولات
              </p>
              <h2 className="mt-1 text-[14px] font-bold">وضعیت انتشار</h2>
            </div>

            <Package
              size={17}
              strokeWidth={1.5}
              className="text-[var(--admin-shell-accent-soft)]"
              aria-hidden="true"
            />
          </header>

          <div className="space-y-5 px-5 py-5 sm:px-6">
            <ProductStateRow
              label="فعال"
              value={data.counts.products.active}
              percent={activePercent}
              tone="success"
            />
            <ProductStateRow
              label="پیش‌نویس"
              value={data.counts.products.draft}
              percent={draftPercent}
              tone="warning"
            />
            <ProductStateRow
              label="آرشیو"
              value={data.counts.products.archived}
              percent={archivedPercent}
              tone="muted"
            />
          </div>

          <div className="border-t border-[var(--admin-shell-border)] px-5 py-3.5 sm:px-6">
            <Link
              href="/admin/catalog/products"
              className="group inline-flex min-h-9 items-center gap-1.5 text-[9px] font-semibold text-[var(--admin-shell-accent-soft)] outline-none transition-colors hover:text-[var(--admin-shell-text)] focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/40"
            >
              مدیریت وضعیت محصولات
              <ArrowLeft
                size={13}
                className="transition-transform group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </section>

        <section className="overflow-hidden rounded-[20px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] text-[var(--admin-shell-text)] shadow-[0_24px_74px_-56px_rgba(0,0,0,0.92)]">
          <header className="flex items-start justify-between gap-4 border-b border-[var(--admin-shell-border)] px-5 py-4 sm:px-6">
            <div className="text-right">
              <p className="text-[7.5px] font-semibold text-[var(--admin-shell-accent-soft)]">
                پایش کاتالوگ
              </p>
              <h2 className="mt-1 text-[14px] font-bold">نیازمند توجه</h2>
            </div>

            <div
              className={`inline-flex min-h-8 items-center gap-2 rounded-full border px-3 text-[8px] font-semibold ${
                attentionTotal > 0
                  ? "border-[#DDA15F]/25 bg-[#DDA15F]/8 text-[#DDA15F]"
                  : "border-[#70B48D]/25 bg-[#70B48D]/8 text-[#70B48D]"
              }`}
            >
              <AlertTriangle size={13} strokeWidth={1.6} aria-hidden="true" />
              {number.format(attentionTotal)}
            </div>
          </header>

          <div className="grid gap-2 p-3 sm:grid-cols-2 sm:p-4">
            {attention.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className="group relative min-h-[94px] rounded-[15px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-control)] p-3.5 text-right outline-none transition-[border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-[var(--admin-shell-accent)]/28 hover:bg-[var(--admin-shell-control-hover)] focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/42 active:translate-y-0 motion-reduce:transition-none"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="grid size-7 place-items-center rounded-full border border-[var(--admin-shell-border-strong)] text-[8px] text-[var(--admin-shell-subtle)]">
                    {number.format(index + 1)}
                  </span>

                  <strong
                    className={`text-[18px] font-bold tabular-nums ${
                      item.value ? "text-[#DDA15F]" : "text-[#70B48D]"
                    }`}
                  >
                    {number.format(item.value)}
                  </strong>
                </div>

                <strong className="mt-3 block truncate text-[10px] font-semibold">
                  {item.label}
                </strong>
                <span className="mt-1 block truncate text-[7.5px] text-[var(--admin-shell-subtle)]">
                  {item.hint}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ==================================================================
          RECENT ACTIVITY
      ================================================================== */}
      <section className="mt-3 overflow-hidden rounded-[20px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] text-[var(--admin-shell-text)] shadow-[0_24px_74px_-56px_rgba(0,0,0,0.92)]">
        <header className="flex items-center justify-between gap-4 border-b border-[var(--admin-shell-border)] px-5 py-4 sm:px-6">
          <div className="text-right">
            <p className="text-[7.5px] font-semibold text-[var(--admin-shell-accent-soft)]">
              فعالیت اخیر
            </p>
            <h2 className="mt-1 text-[14px] font-bold">
              آخرین محصولات ویرایش‌شده
            </h2>
          </div>

          <Link
            href="/admin/catalog/products"
            className="group inline-flex min-h-9 items-center gap-1.5 rounded-[10px] px-2 text-[8.5px] font-semibold text-[var(--admin-shell-accent-soft)] outline-none transition-colors hover:text-[var(--admin-shell-text)] focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/40"
          >
            همه محصولات
            <ArrowLeft
              size={13}
              className="transition-transform group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </header>

        {data.recentlyEditedProducts.length ? (
          <div className="divide-y divide-[var(--admin-shell-border)]">
            {data.recentlyEditedProducts.map((product) => (
              <Link
                key={product._id}
                href="/admin/catalog/products"
                className="group grid min-h-[70px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3 outline-none transition-[background-color,color] duration-200 hover:bg-[var(--admin-shell-control)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--admin-shell-accent)]/42 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto_auto]"
              >
                <span className="min-w-0 text-right">
                  <strong className="block truncate text-[10.5px] font-semibold transition-colors group-hover:text-[var(--admin-shell-accent-soft)] sm:text-[11px]">
                    {fa(product.name)}
                  </strong>

                  <span
                    dir="ltr"
                    className="mt-1 block truncate text-left text-[8px] text-[var(--admin-shell-subtle)]"
                  >
                    {product.slug}
                  </span>
                </span>

                <StatusBadge status={product.status} />

                <span className="hidden min-w-[150px] text-left text-[8px] text-[var(--admin-shell-muted)] md:block">
                  {product.updatedAt
                    ? date.format(new Date(product.updatedAt))
                    : "—"}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="m-5 rounded-[16px] border border-dashed border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-control)]/40 px-4 py-10 text-center text-[10px] text-[var(--admin-shell-muted)]">
            هنوز محصولی ثبت نشده است.
          </div>
        )}
      </section>
    </main>
  );
}

function ProductStateRow({
  label,
  value,
  percent,
  tone,
}: {
  label: string;
  value: number;
  percent: number;
  tone: "success" | "warning" | "muted";
}) {
  const barClass =
    tone === "success"
      ? "bg-[#70B48D]"
      : tone === "warning"
        ? "bg-[#DDA15F]"
        : "bg-[var(--admin-shell-subtle)]";

  const valueClass =
    tone === "success"
      ? "text-[#70B48D]"
      : tone === "warning"
        ? "text-[#DDA15F]"
        : "text-[var(--admin-shell-muted)]";

  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-[9px]">
        <span className="font-semibold text-[var(--admin-shell-muted)]">
          {label}
        </span>

        <span className={`font-bold tabular-nums ${valueClass}`}>
          {number.format(value)}
          <span className="mr-2 text-[7px] font-medium text-[var(--admin-shell-subtle)]">
            {number.format(percent)}٪
          </span>
        </span>
      </div>

      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[var(--admin-shell-control)]">
        <span
          className={`block h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${barClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "draft" | "active" | "archived" }) {
  const config =
    status === "active"
      ? {
          label: "فعال",
          className: "border-[#70B48D]/25 bg-[#70B48D]/8 text-[#70B48D]",
        }
      : status === "draft"
        ? {
            label: "پیش‌نویس",
            className: "border-[#DDA15F]/25 bg-[#DDA15F]/8 text-[#DDA15F]",
          }
        : {
            label: "آرشیو",
            className:
              "border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-control)] text-[var(--admin-shell-muted)]",
          };

  return (
    <span
      className={`inline-flex min-h-7 min-w-[64px] items-center justify-center rounded-full border px-2.5 text-[7.5px] font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function DashboardLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="در حال دریافت خلاصه کاتالوگ"
      className="mx-auto w-full max-w-[1700px] p-3 sm:p-5 xl:p-6"
    >
      <div className="h-[282px] animate-pulse rounded-[26px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] motion-reduce:animate-none" />

      <div className="mt-3 h-[160px] animate-pulse rounded-[22px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] motion-reduce:animate-none sm:h-[128px]" />

      <div className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-[136px] animate-pulse rounded-[18px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] motion-reduce:animate-none"
          />
        ))}
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        <div className="h-[310px] animate-pulse rounded-[20px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] motion-reduce:animate-none" />
        <div className="h-[310px] animate-pulse rounded-[20px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] motion-reduce:animate-none" />
      </div>

      <div className="mt-3 h-[340px] animate-pulse rounded-[20px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] motion-reduce:animate-none" />
    </main>
  );
}
