import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock3, MapPin, Package, UserRound } from "lucide-react";

import { AccountLogoutButton } from "@/components/account/account-logout-button";
import { requireCustomerAccount } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "حساب من | نجیب‌زاده",
  description: "فضای شخصی مشتری نجیب‌زاده",
  robots: { index: false, follow: false, nocache: true },
};

export default async function CustomerDashboardPage() {
  const account = await requireCustomerAccount();
  const fullName = `${account.firstName} ${account.lastName}`.trim();

  return (
    <main dir="rtl" className="min-h-dvh bg-[#eee9e1] text-[#181512]">
      <header className="border-b border-black/10 bg-[#11100f] text-[#f5f0e8]">
        <div className="mx-auto flex min-h-20 max-w-[1500px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-12">
          <Link href="/" className="text-[13px] font-semibold tracking-[0.18em]">NAJIBZADEH</Link>
          <nav className="flex items-center gap-5 text-[10px] text-white/55" aria-label="حساب کاربری">
            <Link href="/shop" className="transition hover:text-white">فروشگاه</Link>
            <AccountLogoutButton />
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-10 sm:px-8 lg:px-12 lg:py-16">
        <header className="grid gap-8 border-b border-black/12 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="flex items-center gap-3 text-[10px] font-semibold text-[#9a7354]"><span className="h-px w-8 bg-current" />حساب شخصی</p>
            <h1 className="mt-4 text-[clamp(2.35rem,6vw,5.8rem)] font-semibold leading-[1.2] tracking-[-0.05em]">سلام، {account.firstName}</h1>
            <p className="mt-4 max-w-[650px] text-[12px] leading-7 text-black/55">فضای شخصی شما برای مدیریت اطلاعات حساب و دسترسی به خدمات نجیب‌زاده آماده است.</p>
          </div>
          <Link href="/shop" className="flex min-h-11 w-fit items-center gap-3 border-b border-black px-1 text-[11px] font-semibold transition hover:text-[#9a7354]">
            مشاهده فروشگاه <ArrowLeft size={15} />
          </Link>
        </header>

        <section className="grid border-b border-black/12 lg:grid-cols-[minmax(300px,.72fr)_minmax(0,1.28fr)]">
          <article className="border-black/12 py-9 lg:border-l lg:pl-10">
            <div className="flex items-center gap-3 text-[#9a7354]"><UserRound size={19} /><span className="text-[9px] font-semibold">مشخصات حساب</span></div>
            <dl className="mt-7 space-y-5">
              <ProfileRow label="نام و نام خانوادگی" value={fullName} />
              <ProfileRow label="ایمیل" value={account.email} ltr />
              <ProfileRow label="نوع حساب" value="مشتری نجیب‌زاده" />
            </dl>
          </article>

          <div className="grid sm:grid-cols-3">
            <FutureModule icon={<Package size={20} />} index="۰۱" title="سفارش‌ها" text="پیگیری سفارش‌ها پس از فعال‌شدن بخش فروش" />
            <FutureModule icon={<MapPin size={20} />} index="۰۲" title="نشانی‌ها" text="مدیریت نشانی‌های ارسال در مرحله بعد" divided />
            <FutureModule icon={<Clock3 size={20} />} index="۰۳" title="تاریخچه" text="مرور تعامل‌ها برای پیشنهادهای شخصی‌تر" divided />
          </div>
        </section>

        <aside className="mt-8 flex flex-col justify-between gap-6 border border-black/12 bg-[#e7e0d6] p-6 sm:flex-row sm:items-center lg:p-8">
          <div>
            <p className="text-[9px] font-semibold text-[#9a7354]">در حال توسعه</p>
            <h2 className="mt-2 text-[20px] font-semibold">قابلیت‌های بیشتر حساب به‌زودی اضافه می‌شوند.</h2>
            <p className="mt-2 text-[11px] leading-6 text-black/50">این صفحه فقط اطلاعات واقعی حساب شما را نمایش می‌دهد؛ سفارش یا آماری به‌صورت آزمایشی ساخته نشده است.</p>
          </div>
          <Link href="/contact-us" className="shrink-0 text-[10px] font-semibold underline decoration-black/30 underline-offset-8">ارتباط با پشتیبانی</Link>
        </aside>
      </div>
    </main>
  );
}

function ProfileRow({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return <div><dt className="text-[9px] text-black/42">{label}</dt><dd dir={ltr ? "ltr" : "rtl"} className={`mt-1.5 text-[13px] font-semibold ${ltr ? "text-right" : ""}`}>{value}</dd></div>;
}

function FutureModule({ icon, index, title, text, divided = false }: { icon: React.ReactNode; index: string; title: string; text: string; divided?: boolean }) {
  return (
    <article className={`flex min-h-52 flex-col justify-between py-9 sm:px-7 lg:min-h-72 lg:px-8 ${divided ? "border-t border-black/12 sm:border-r sm:border-t-0" : ""}`}>
      <div className="flex items-center justify-between text-[#9a7354]">{icon}<span className="text-[9px]">{index}</span></div>
      <div><h2 className="text-[18px] font-semibold">{title}</h2><p className="mt-3 text-[10px] leading-6 text-black/48">{text}</p></div>
    </article>
  );
}
