"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AlertTriangle, Boxes, ImageIcon, Layers3, Package, RefreshCw, SlidersHorizontal, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { fa, type LocalizedText } from "@/lib/admin/localization";

type Summary = {
  counts: {
    products: { total: number; active: number; draft: number; archived: number };
    categories: { total: number; active: number };
    subcategories: { total: number; active: number };
    collections: { total: number; active: number };
    images: { total: number; active: number };
    variants: { total: number; active: number };
    users: { total: number; staff: number };
  };
  attention: { draftProducts: number; productsWithoutImage: number; inactiveTaxonomy: number; inactiveReferences: number };
  recentlyEditedProducts: Array<{ _id: string; name: LocalizedText; slug: string; status: "draft" | "active" | "archived"; updatedAt?: string }>;
  generatedAt: string;
};

const number = new Intl.NumberFormat("fa-IR");
const date = new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" });

async function fetchSummary(): Promise<Summary> {
  const response = await fetch("/api/admin/dashboard-summary", { credentials: "same-origin", cache: "no-store" });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || "دریافت خلاصه کاتالوگ انجام نشد.");
  }
  return response.json() as Promise<Summary>;
}

export function Dashboard() {
  const query = useQuery({ queryKey: ["admin", "dashboard-summary"], queryFn: fetchSummary, staleTime: 30_000 });
  if (query.isPending) return <DashboardLoading />;
  if (query.isError) {
    return (
      <main className="mx-auto w-full max-w-[1700px] p-4 sm:p-6">
        <section className="border border-[#a7554c]/35 bg-[#a7554c]/[0.06] p-6 text-right">
          <AlertTriangle className="text-[#df8178]" size={24} />
          <h1 className="mt-4 text-[18px] font-bold">خلاصه کاتالوگ در دسترس نیست</h1>
          <p className="mt-2 text-[12px] leading-7 text-white/55 group-data-[theme=light]/admin:text-black/60">{query.error.message}</p>
          <Button className="mt-5" type="button" variant="outline" onClick={() => void query.refetch()} icon={<RefreshCw size={16} />}>تلاش دوباره</Button>
        </section>
      </main>
    );
  }

  const data = query.data;
  const summaryCards = [
    { label: "محصولات", value: data.counts.products.total, detail: `${number.format(data.counts.products.active)} فعال`, href: "/admin/catalog/products", icon: Package },
    { label: "دسته‌ها", value: data.counts.categories.total, detail: `${number.format(data.counts.subcategories.total)} زیردسته`, href: "/admin/categories", icon: Boxes },
    { label: "مجموعه‌ها", value: data.counts.collections.total, detail: `${number.format(data.counts.collections.active)} فعال`, href: "/admin/catalog/references", icon: Layers3 },
    { label: "تصاویر", value: data.counts.images.total, detail: `${number.format(data.counts.images.active)} فعال`, href: "/admin/catalog/images", icon: ImageIcon },
    { label: "تنوع‌ها", value: data.counts.variants.total, detail: `${number.format(data.counts.variants.active)} فعال`, href: "/admin/catalog/references", icon: SlidersHorizontal },
    { label: "کاربران", value: data.counts.users.total, detail: `${number.format(data.counts.users.staff)} همکار`, href: "/admin/users", icon: Users },
  ];
  const attention = [
    { label: "محصول پیش‌نویس", value: data.attention.draftProducts, href: "/admin/catalog/products" },
    { label: "محصول بدون تصویر اصلی", value: data.attention.productsWithoutImage, href: "/admin/catalog/products" },
    { label: "دسته یا زیردسته غیرفعال", value: data.attention.inactiveTaxonomy, href: "/admin/categories" },
    { label: "مجموعه یا تنوع غیرفعال", value: data.attention.inactiveReferences, href: "/admin/catalog/references" },
  ];

  return (
    <main className="mx-auto w-full max-w-[1700px] p-3 sm:p-5 lg:p-6">
      <header className="border border-white/[0.08] bg-[#0d1319] px-5 py-7 text-right shadow-[0_24px_80px_-54px_rgba(0,0,0,0.95)] group-data-[theme=light]/admin:border-black/[0.09] group-data-[theme=light]/admin:bg-[#eeeae3] sm:px-7">
        <p className="text-[11px] font-semibold text-[#b58a6c]">مرکز کنترل کاتالوگ</p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><h1 className="text-[clamp(1.6rem,4vw,2.6rem)] font-bold leading-[1.5]">وضعیت واقعی فروشگاه، در یک نگاه</h1><p className="mt-2 text-[12px] leading-7 text-white/52 group-data-[theme=light]/admin:text-black/58">اعداد این صفحه مستقیماً از کاتالوگ و حساب‌های ثبت‌شده خوانده می‌شوند.</p></div>
          <p className="text-[11px] text-white/38 group-data-[theme=light]/admin:text-black/48">بروزرسانی: {date.format(new Date(data.generatedAt))}</p>
        </div>
      </header>

      <section aria-label="آمار کاتالوگ" className="mt-3 grid grid-cols-1 border-r border-t border-white/[0.08] group-data-[theme=light]/admin:border-black/[0.09] sm:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map(({ label, value, detail, href, icon: Icon }) => (
          <Link key={label} href={href} className="group flex min-h-28 items-center gap-4 border-b border-l border-white/[0.08] bg-[#0d1319] p-5 text-right outline-none transition-colors hover:bg-[#121a22] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#b08061] group-data-[theme=light]/admin:border-black/[0.09] group-data-[theme=light]/admin:bg-[#eeeae3] group-data-[theme=light]/admin:hover:bg-[#f5f1ea]">
            <span className="grid size-11 shrink-0 place-items-center border border-[#a87959]/25 bg-[#a87959]/10 text-[#c59676]"><Icon size={19} /></span>
            <span className="min-w-0"><span className="block text-[12px] text-white/55 group-data-[theme=light]/admin:text-black/58">{label}</span><strong className="mt-1 block text-[28px] leading-none">{number.format(value)}</strong><span className="mt-2 block text-[11px] text-[#b58a6c]">{detail}</span></span>
          </Link>
        ))}
      </section>

      <div className="mt-3 grid gap-3 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="border border-white/[0.08] bg-[#0d1319] p-5 group-data-[theme=light]/admin:border-black/[0.09] group-data-[theme=light]/admin:bg-[#eeeae3]">
          <h2 className="text-[15px] font-bold">نیازمند توجه</h2><p className="mt-1 text-[11px] leading-6 text-white/42 group-data-[theme=light]/admin:text-black/50">موارد قابل پیگیری در داده‌های فعلی کاتالوگ</p>
          <div className="mt-4 divide-y divide-white/[0.07] group-data-[theme=light]/admin:divide-black/[0.08]">{attention.map((item) => <Link key={item.label} href={item.href} className="flex min-h-12 items-center justify-between gap-4 py-3 text-[12px] outline-none hover:text-[#c59676] focus-visible:ring-2 focus-visible:ring-[#b08061]"><span>{item.label}</span><strong className={item.value ? "text-[#dda15f]" : "text-[#70b48d]"}>{number.format(item.value)}</strong></Link>)}</div>
        </section>
        <section className="border border-white/[0.08] bg-[#0d1319] p-5 group-data-[theme=light]/admin:border-black/[0.09] group-data-[theme=light]/admin:bg-[#eeeae3]">
          <h2 className="text-[15px] font-bold">آخرین محصولات ویرایش‌شده</h2><p className="mt-1 text-[11px] leading-6 text-white/42 group-data-[theme=light]/admin:text-black/50">آخرین تغییرات ثبت‌شده در محصول‌ها</p>
          {data.recentlyEditedProducts.length ? <div className="mt-4 divide-y divide-white/[0.07] group-data-[theme=light]/admin:divide-black/[0.08]">{data.recentlyEditedProducts.map((product) => <Link key={product._id} href="/admin/catalog/products" className="grid min-h-14 grid-cols-[1fr_auto] items-center gap-4 py-3 outline-none hover:text-[#c59676] focus-visible:ring-2 focus-visible:ring-[#b08061]"><span className="min-w-0"><strong className="block truncate text-[12px]">{fa(product.name)}</strong><span dir="ltr" className="mt-1 block truncate text-left text-[10px] text-white/35 group-data-[theme=light]/admin:text-black/45">{product.slug}</span></span><span className="text-left text-[10px] text-white/42 group-data-[theme=light]/admin:text-black/50">{product.updatedAt ? date.format(new Date(product.updatedAt)) : "—"}</span></Link>)}</div> : <div className="mt-5 border border-dashed border-white/[0.12] px-4 py-8 text-center text-[12px] text-white/44 group-data-[theme=light]/admin:border-black/[0.14] group-data-[theme=light]/admin:text-black/52">هنوز محصولی ثبت نشده است.</div>}
        </section>
      </div>
    </main>
  );
}

function DashboardLoading() {
  return <main aria-busy="true" aria-label="در حال دریافت خلاصه کاتالوگ" className="mx-auto w-full max-w-[1700px] p-4 sm:p-6"><div className="h-36 animate-pulse bg-white/[0.04] motion-reduce:animate-none group-data-[theme=light]/admin:bg-black/[0.05]" /><div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-28 animate-pulse bg-white/[0.04] motion-reduce:animate-none group-data-[theme=light]/admin:bg-black/[0.05]" />)}</div></main>;
}
