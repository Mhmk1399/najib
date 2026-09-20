"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Boxes,
  ImageIcon,
  Layers3,
  Package,
  RefreshCw,
  SlidersHorizontal,
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
      <main className="mx-auto w-full max-w-[1660px] p-3 sm:p-5 xl:p-6">
        <section
          role="alert"
          className="rounded-[18px] border border-[#A7554C]/35 bg-[#A7554C]/[0.07] p-6 text-right text-[var(--admin-shell-text)] shadow-[0_22px_70px_-45px_rgba(0,0,0,0.78)]"
        >
          <span className="grid size-11 place-items-center rounded-[12px] border border-[#A7554C]/35 bg-[#A7554C]/10 text-[#DF8178]">
            <AlertTriangle size={20} strokeWidth={1.6} aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-[18px] font-bold">
            خلاصه کاتالوگ در دسترس نیست
          </h1>
          <p className="mt-2 max-w-[620px] text-[12px] leading-7 text-[var(--admin-shell-muted)]">
            {query.error.message}
          </p>
          <Button
            className="mt-5 !tracking-normal"
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

  const attention = [
    {
      label: "محصول پیش‌نویس",
      value: data.attention.draftProducts,
      href: "/admin/catalog/products",
    },
    {
      label: "محصول بدون تصویر اصلی",
      value: data.attention.productsWithoutImage,
      href: "/admin/catalog/products",
    },
    {
      label: "دسته یا زیردسته غیرفعال",
      value: data.attention.inactiveTaxonomy,
      href: "/admin/categories",
    },
    {
      label: "مجموعه یا تنوع غیرفعال",
      value: data.attention.inactiveReferences,
      href: "/admin/catalog/references",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-[1660px] p-3 sm:p-5 xl:p-6">
      <section
        aria-labelledby="dashboard-title"
        className="relative isolate min-h-[210px] overflow-hidden rounded-[20px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] shadow-[0_28px_90px_-58px_rgba(0,0,0,0.95)] sm:min-h-[238px]"
      >
        <Image
          src="/assets/images/suit.webp"
          alt=""
          fill
          priority
          sizes="(max-width: 1279px) 100vw, 1200px"
          className="-z-30 object-cover object-[44%_28%] grayscale-[0.1]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(10,8,6,0.98)_0%,rgba(10,8,6,0.88)_35%,rgba(10,8,6,0.48)_62%,rgba(10,8,6,0.86)_100%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_72%_22%,rgba(194,137,88,0.13),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_40%)]"
        />

        <div className="relative flex min-h-[210px] flex-col justify-between gap-8 p-5 sm:min-h-[238px] sm:p-7 lg:flex-row lg:items-end lg:p-8">
          <div className="max-w-[700px] text-right">
            <div className="flex items-center gap-3 text-[var(--admin-shell-accent-soft)]">
              <span className="h-px w-8 bg-current/80" aria-hidden="true" />
              <p className="text-[9px] font-semibold">پنل مدیریت نجیب‌زاده</p>
            </div>
            <h1
              id="dashboard-title"
              className="mt-4 text-balance text-[clamp(1.75rem,5vw,3.2rem)] font-bold leading-[1.25] tracking-[-0.035em] text-white"
            >
              کنترل کامل، تصمیم‌گیری سریع‌تر
            </h1>
            <p className="mt-3 max-w-[620px] text-[11px] leading-7 text-white/62 sm:text-[12px]">
              وضعیت کاتالوگ، محتوای فروشگاه و موارد نیازمند پیگیری را در یک نمای
              متمرکز ببینید.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                href="/admin/catalog/products"
                className="inline-flex min-h-11 items-center gap-2 rounded-[12px] border border-[var(--admin-shell-accent)]/65 bg-[var(--admin-shell-accent)] px-4 text-[10px] font-bold text-[#15100C] shadow-[0_12px_34px_-18px_rgba(194,137,88,0.82)] outline-none transition-[transform,filter,box-shadow] hover:-translate-y-0.5 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent-soft)]/75 active:translate-y-0"
              >
                مدیریت محصولات
                <ArrowLeft size={14} aria-hidden="true" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex min-h-11 items-center gap-2 rounded-[12px] border border-white/14 bg-black/22 px-4 text-[10px] font-semibold text-white/82 backdrop-blur-xl outline-none transition-[border-color,background-color,color] hover:border-white/30 hover:bg-white/8 hover:text-white focus-visible:ring-2 focus-visible:ring-white/50"
              >
                مشاهده فروشگاه
                <ArrowLeft size={14} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-1 text-right lg:items-end">
            <span className="text-[8px] text-white/40">آخرین بروزرسانی</span>
            <strong className="text-[10px] font-semibold text-white/74">
              {date.format(new Date(data.generatedAt))}
            </strong>
          </div>
        </div>
      </section>

      <section
        aria-label="آمار کاتالوگ"
        className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-3 2xl:grid-cols-6"
      >
        {summaryCards.map(({ label, value, detail, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="group relative min-h-[126px] overflow-hidden rounded-[16px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] p-4 text-right text-[var(--admin-shell-text)] shadow-[0_20px_54px_-46px_rgba(0,0,0,0.92)] outline-none transition-[border-color,background-color,transform,box-shadow] hover:-translate-y-0.5 hover:border-[var(--admin-shell-accent)]/34 hover:bg-[var(--admin-shell-raised)] hover:shadow-[0_24px_60px_-42px_rgba(0,0,0,0.94)] focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/45 active:translate-y-0"
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--admin-shell-accent),transparent)] opacity-0 transition-opacity group-hover:opacity-60"
            />
            <div className="flex items-start justify-between gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-[10px] border border-[var(--admin-shell-accent)]/22 bg-[var(--admin-shell-accent)]/10 text-[var(--admin-shell-accent-soft)]">
                <Icon size={17} strokeWidth={1.6} aria-hidden="true" />
              </span>
              <ArrowLeft
                size={14}
                aria-hidden="true"
                className="mt-1 text-[var(--admin-shell-subtle)] transition-transform group-hover:-translate-x-1 group-hover:text-[var(--admin-shell-accent-soft)]"
              />
            </div>
            <span className="mt-4 block text-[10px] text-[var(--admin-shell-muted)]">
              {label}
            </span>
            <div className="mt-1 flex items-end justify-between gap-2">
              <strong className="text-[26px] font-bold leading-none tabular-nums">
                {number.format(value)}
              </strong>
              <span className="text-[8.5px] font-medium text-[var(--admin-shell-accent-soft)]">
                {detail}
              </span>
            </div>
          </Link>
        ))}
      </section>

      <div className="mt-3 grid gap-3 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="overflow-hidden rounded-[18px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] text-[var(--admin-shell-text)] shadow-[0_22px_70px_-52px_rgba(0,0,0,0.9)]">
          <header className="flex items-start justify-between gap-4 border-b border-[var(--admin-shell-border)] px-5 py-4 sm:px-6">
            <div className="text-right">
              <p className="text-[8px] font-semibold text-[var(--admin-shell-accent-soft)]">
                پایش کاتالوگ
              </p>
              <h2 className="mt-1 text-[14px] font-bold">نیازمند توجه</h2>
            </div>
            <AlertTriangle
              size={17}
              className="text-[#DDA15F]"
              aria-hidden="true"
            />
          </header>

          <div className="divide-y divide-[var(--admin-shell-border)] px-5 sm:px-6">
            {attention.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className="group flex min-h-[62px] items-center justify-between gap-4 py-3 text-[11px] outline-none transition-colors hover:text-[var(--admin-shell-accent-soft)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--admin-shell-accent)]/42"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="grid size-7 shrink-0 place-items-center rounded-full border border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-control)] text-[9px] text-[var(--admin-shell-subtle)]"
                  >
                    {number.format(index + 1)}
                  </span>
                  <span className="truncate">{item.label}</span>
                </span>
                <strong
                  className={item.value ? "text-[#DDA15F]" : "text-[#70B48D]"}
                >
                  {number.format(item.value)}
                </strong>
              </Link>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-[18px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] text-[var(--admin-shell-text)] shadow-[0_22px_70px_-52px_rgba(0,0,0,0.9)]">
          <header className="flex items-center justify-between gap-4 border-b border-[var(--admin-shell-border)] px-5 py-4 sm:px-6">
            <div className="text-right">
              <p className="text-[8px] font-semibold text-[var(--admin-shell-accent-soft)]">
                فعالیت اخیر
              </p>
              <h2 className="mt-1 text-[14px] font-bold">
                آخرین محصولات ویرایش‌شده
              </h2>
            </div>
            <Link
              href="/admin/catalog/products"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-[10px] px-2 text-[9px] font-semibold text-[var(--admin-shell-accent-soft)] outline-none transition-colors hover:text-[var(--admin-shell-text)] focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/40"
            >
              همه محصولات
              <ArrowLeft size={13} aria-hidden="true" />
            </Link>
          </header>

          {data.recentlyEditedProducts.length ? (
            <div className="divide-y divide-[var(--admin-shell-border)] px-5 sm:px-6">
              {data.recentlyEditedProducts.map((product) => (
                <Link
                  key={product._id}
                  href="/admin/catalog/products"
                  className="group grid min-h-[62px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3 outline-none transition-colors hover:text-[var(--admin-shell-accent-soft)] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--admin-shell-accent)]/42"
                >
                  <span className="min-w-0 text-right">
                    <strong className="block truncate text-[11px]">
                      {fa(product.name)}
                    </strong>
                    <span
                      dir="ltr"
                      className="mt-1 block truncate text-left text-[8.5px] text-[var(--admin-shell-subtle)]"
                    >
                      {product.slug}
                    </span>
                  </span>
                  <span className="text-left text-[8.5px] text-[var(--admin-shell-muted)]">
                    {product.updatedAt
                      ? date.format(new Date(product.updatedAt))
                      : "—"}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="m-5 rounded-[14px] border border-dashed border-[var(--admin-shell-border-strong)] px-4 py-8 text-center text-[11px] text-[var(--admin-shell-muted)]">
              هنوز محصولی ثبت نشده است.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function DashboardLoading() {
  return (
    <main
      aria-busy="true"
      aria-label="در حال دریافت خلاصه کاتالوگ"
      className="mx-auto w-full max-w-[1660px] p-3 sm:p-5 xl:p-6"
    >
      <div className="h-[238px] animate-pulse rounded-[20px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] motion-reduce:animate-none" />
      <div className="mt-3 grid grid-cols-2 gap-2.5 md:grid-cols-3 2xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-[126px] animate-pulse rounded-[16px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] motion-reduce:animate-none"
          />
        ))}
      </div>
      <div className="mt-3 grid gap-3 xl:grid-cols-2">
        <div className="h-[300px] animate-pulse rounded-[18px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] motion-reduce:animate-none" />
        <div className="h-[300px] animate-pulse rounded-[18px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] motion-reduce:animate-none" />
      </div>
    </main>
  );
}
