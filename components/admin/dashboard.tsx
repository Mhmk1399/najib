import Image from "next/image";
import type { ReactNode } from "react";
import {
  BellRing,
  Box,
  Boxes,
  Clock3,
  DollarSign,
  Package,
  ShoppingCart,
  Tag,
  TrendingUp,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

type KpiItem = {
  label: string;
  value: string;
  suffix: string;
  trend: string;
  detail: string;
  icon: LucideIcon;
  spark: number[];
  warm?: boolean;
};

const KPI_ITEMS: KpiItem[] = [
  {
    label: "کل فروش",
    value: "۳,۴۳۰,۵۰۰,۰۰۰",
    suffix: "تومان",
    trend: "+۱۸.۴٪",
    detail: "نسبت به ماه قبل",
    icon: DollarSign,
    spark: [22, 30, 27, 38, 33, 48, 43, 55, 50, 66, 60, 76],
    warm: true,
  },
  {
    label: "سفارشات",
    value: "۲,۴۸۶",
    suffix: "سفارش",
    trend: "+۴.۶٪",
    detail: "نسبت به ماه قبل",
    icon: ShoppingCart,
    spark: [18, 20, 24, 21, 28, 34, 31, 42, 38, 49, 47, 58],
  },
  {
    label: "محصولات",
    value: "۱,۲۴۸",
    suffix: "محصول",
    trend: "+۹.۲٪",
    detail: "نسبت به ماه قبل",
    icon: Package,
    spark: [16, 19, 23, 20, 25, 29, 27, 35, 34, 42, 40, 49],
    warm: true,
  },
  {
    label: "مشتریان",
    value: "۱۸,۴۶۰",
    suffix: "نفر",
    trend: "+۱۰.۳٪",
    detail: "نسبت به ماه قبل",
    icon: Users,
    spark: [12, 16, 14, 20, 23, 21, 29, 33, 31, 39, 44, 50],
  },
];

const INVENTORY_ITEMS = [
  {
    name: "کت رسمی مردانه",
    sku: "SKU: CV-101",
    count: "۱۲ عدد",
    image: "/assets/images/p1.webp",
    bar: "w-[82%]",
    tone: "success",
  },
  {
    name: "پیراهن کلاسیک",
    sku: "SKU: SH-220",
    count: "۸ عدد",
    image: "/assets/images/p2.webp",
    bar: "w-[55%]",
    tone: "warning",
  },
  {
    name: "شلوار پارچه‌ای",
    sku: "SKU: PT-305",
    count: "موجودی کم",
    image: "/assets/images/p3.webp",
    bar: "w-[28%]",
    tone: "danger",
  },
  {
    name: "کت تک لینن",
    sku: "SKU: BL-412",
    count: "موجودی کم",
    image: "/assets/images/p6.webp",
    bar: "w-[20%]",
    tone: "danger",
  },
] as const;

const RECENT_ORDERS = [
  {
    id: "#10248",
    time: "امروز ۱۴:۳۵",
    amount: "۲,۸۵۰,۰۰۰ تومان",
    status: "در حال پردازش",
    tone: "warning",
    image: "/assets/images/p8.webp",
  },
  {
    id: "#10247",
    time: "امروز ۱۳:۱۰",
    amount: "۴,۳۲۰,۰۰۰ تومان",
    status: "تحویل شده",
    tone: "success",
    image: "/assets/images/p2.webp",
  },
  {
    id: "#10246",
    time: "امروز ۱۲:۰۵",
    amount: "۱,۹۵۰,۰۰۰ تومان",
    status: "در انتظار پرداخت",
    tone: "warning",
    image: "/assets/images/p1.webp",
  },
  {
    id: "#10245",
    time: "امروز ۱۱:۳۰",
    amount: "۶,۶۵۰,۰۰۰ تومان",
    status: "تحویل شده",
    tone: "success",
    image: "/assets/images/p6.webp",
  },
] as const;

const TOP_CATEGORIES = [
  {
    name: "کت و بلیزر",
    share: "۳۲٪",
    image: "/assets/images/p1.webp",
    bar: "w-[72%]",
  },
  {
    name: "پیراهن",
    share: "۲۸٪",
    image: "/assets/images/p2.webp",
    bar: "w-[61%]",
  },
  {
    name: "شلوار",
    share: "۱۸٪",
    image: "/assets/images/p3.webp",
    bar: "w-[46%]",
  },
  {
    name: "پولوشرت",
    share: "۱۲٪",
    image: "/assets/images/p6.webp",
    bar: "w-[32%]",
  },
  {
    name: "اکسسوری",
    share: "۱۰٪",
    image: "/assets/images/p8.webp",
    bar: "w-[26%]",
  },
] as const;

const ALERTS = [
  {
    title: "شلوار پارچه‌ای خاکستری",
    detail: "فقط ۳ عدد در انبار",
    image: "/assets/images/p3.webp",
    tone: "danger",
  },
  {
    title: "پیراهن سفید کلاسیک",
    detail: "فقط ۵ عدد در انبار",
    image: "/assets/images/p2.webp",
    tone: "danger",
  },
  {
    title: "کت تک سرمه‌ای",
    detail: "فقط ۷ عدد در انبار",
    image: "/assets/images/p1.webp",
    tone: "warning",
  },
  {
    title: "کمربند چرم مشکی",
    detail: "فقط ۲ عدد در انبار",
    image: "/assets/images/p8.webp",
    tone: "danger",
  },
] as const;

const SALES_CURRENT = [
  58, 88, 82, 122, 148, 158, 102, 145, 147, 150, 138, 145, 170, 172, 205,
];
const SALES_PREVIOUS = [
  34, 62, 78, 48, 62, 83, 98, 118, 104, 88, 74, 70, 112, 130, 152,
];

export function Dashboard() {
  return (
    <div className="mx-auto w-full max-w-[1900px] px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5 2xl:px-6">
      <WelcomeBanner />

      <section
        aria-label="شاخص‌های کلیدی"
        className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4"
      >
        {KPI_ITEMS.map((item) => (
          <KpiCard key={item.label} item={item} />
        ))}
      </section>

      <section
        dir="ltr"
        className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.85fr)_minmax(320px,0.95fr)]"
      >
        <div dir="rtl" className="min-w-0">
          <SalesChartPanel />
        </div>
        <div dir="rtl">
          <InventoryPanel />
        </div>
      </section>

      <section
        dir="ltr"
        className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-4"
      >
        <div dir="rtl">
          <RecentOrdersPanel />
        </div>
        <div dir="rtl">
          <TopCategoriesPanel />
        </div>
        <div dir="rtl">
          <AlertsPanel />
        </div>
        <div dir="rtl">
          <QuickAccessPanel />
        </div>
      </section>
    </div>
  );
}

function WelcomeBanner() {
  return (
    <section className="group/banner relative min-h-[138px] overflow-hidden rounded-[4px] border border-white/[0.075] bg-[#0b1117] shadow-[0_22px_75px_-45px_rgba(0,0,0,0.9)] group-data-[theme=light]/admin:border-black/[0.08] group-data-[theme=light]/admin:bg-[#e6e2db]">
      <Image
        src="/assets/images/banner.webp"
        alt=""
        fill
        priority
        sizes="(max-width: 1280px) 100vw, 80vw"
        className="object-cover object-[22%_42%] opacity-[0.62] grayscale-[0.18] transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/banner:scale-[1.012] group-data-[theme=light]/admin:opacity-[0.34]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,12,16,0.02)_0%,rgba(8,12,16,0.22)_32%,rgba(8,12,16,0.88)_62%,rgba(8,12,16,0.98)_100%)] group-data-[theme=light]/admin:bg-[linear-gradient(90deg,rgba(230,226,219,0.02)_0%,rgba(230,226,219,0.18)_32%,rgba(230,226,219,0.88)_65%,rgba(230,226,219,0.98)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.22))] group-data-[theme=light]/admin:bg-[linear-gradient(180deg,transparent,rgba(224,220,213,0.35))]" />

      <div className="relative z-10 flex min-h-[138px] items-center justify-between gap-8 px-5 py-5 sm:px-7 lg:px-9">
        <div className="hidden w-[230px] shrink-0 border-r border-[#9d7357]/55 pr-5 text-right lg:block">
          <p className="text-[20px] font-semibold leading-8 text-[#c09a7f]">
            استایل،
            <br />
            یک سرمایه است.
          </p>
          <p className="mt-2 text-[7px] leading-5 text-white/38 group-data-[theme=light]/admin:text-black/42">
            مدیریت هوشمند، رشد ماندگار
          </p>
          <span className="mt-3 block h-px w-8 bg-[#9d7357]" />
        </div>

        <div className="mr-auto max-w-[760px] text-right">
          <p className="text-[7px] font-semibold uppercase tracking-[0.21em] text-[#ad8062]">
            Najibzadeh Commerce Console
          </p>
          <h1 className="mt-2 text-[clamp(1.25rem,3.2vw,2rem)] font-extrabold leading-[1.65] tracking-[-0.035em] text-white group-data-[theme=light]/admin:text-[#201e1b]">
            به پنل مدیریت نجیب‌زاده خوش آمدید 👋
          </h1>
          <p className="mt-1.5 max-w-[640px] text-[9px] leading-6 text-white/48 group-data-[theme=light]/admin:text-black/52 sm:text-[10px]">
            مروری بر عملکرد فروش، سفارشات و وضعیت کلی کسب‌وکار شما
          </p>
        </div>
      </div>
    </section>
  );
}

function KpiCard({ item }: { item: KpiItem }) {
  const Icon = item.icon;
  return (
    <article className="group/kpi relative min-h-[122px] overflow-hidden rounded-[4px] border border-white/[0.075] bg-[linear-gradient(145deg,#10171e_0%,#0c1218_100%)] p-4 shadow-[0_18px_60px_-42px_rgba(0,0,0,0.95)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-white/[0.13] hover:shadow-[0_26px_65px_-40px_rgba(0,0,0,0.98)] group-data-[theme=light]/admin:border-black/[0.08] group-data-[theme=light]/admin:bg-[linear-gradient(145deg,#f1eee8_0%,#e9e5de_100%)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/kpi:opacity-100 bg-[radial-gradient(circle_at_12%_18%,rgba(157,115,87,0.10),transparent_34%)]"
      />

      <div className="relative flex items-start justify-between gap-4">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-[3px] border transition-transform duration-300 group-hover/kpi:scale-[1.04] ${item.warm ? "border-[#9d7357]/25 bg-[#9d7357]/10 text-[#c49a7e]" : "border-white/[0.085] bg-white/[0.03] text-white/55 group-data-[theme=light]/admin:border-black/[0.09] group-data-[theme=light]/admin:bg-black/[0.03] group-data-[theme=light]/admin:text-black/52"}`}
        >
          <Icon size={17} strokeWidth={1.45} />
        </span>

        <div className="min-w-0 text-right">
          <p className="text-[8px] font-medium text-white/42 group-data-[theme=light]/admin:text-black/46">
            {item.label}
          </p>
          <strong className="mt-2 block whitespace-nowrap text-[25px] font-bold leading-none tracking-[-0.04em] text-white group-data-[theme=light]/admin:text-[#1f1d1a] xl:text-[27px] 2xl:text-[29px]">
            {item.value}
          </strong>
          <span className="mt-1 block text-[7px] text-white/30 group-data-[theme=light]/admin:text-black/38">
            {item.suffix}
          </span>
        </div>
      </div>

      <div className="relative mt-3 flex items-end justify-between gap-3">
        <MiniSparkline values={item.spark} />
        <div className="text-right">
          <span className="block text-[7px] font-semibold text-[#58c68b] group-data-[theme=light]/admin:text-[#2f8055]">
            ▲ {item.trend}
          </span>
          <small className="mt-1 block text-[6px] text-white/26 group-data-[theme=light]/admin:text-black/36">
            {item.detail}
          </small>
        </div>
      </div>
    </article>
  );
}

function MiniSparkline({ values }: { values: readonly number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values
    .map((value, index) => {
      const x = index * (82 / Math.max(1, values.length - 1));
      const y = 24 - ((value - min) / Math.max(1, max - min)) * 17;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 82 26"
      className="h-[26px] w-[82px] overflow-visible text-[#a87552]"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SalesChartPanel() {
  return (
    <article className="overflow-hidden rounded-[4px] border border-white/[0.075] bg-[#0d141b] shadow-[0_20px_70px_-48px_rgba(0,0,0,0.95)] transition-colors hover:border-white/[0.11] group-data-[theme=light]/admin:border-black/[0.08] group-data-[theme=light]/admin:bg-[#ece8e1]">
      <header className="flex items-center justify-between gap-4 border-b border-white/[0.055] px-4 py-3 group-data-[theme=light]/admin:border-black/[0.07] sm:px-5">
        <div>
          <h2 className="text-[14px] font-bold text-white group-data-[theme=light]/admin:text-[#211f1c]">
            روند فروش
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-[6.5px] text-white/36 group-data-[theme=light]/admin:text-black/40">
            <Legend color="bg-[#a87552]" label="فروش این ماه" />
            <Legend color="bg-[#69737d]" label="فروش ارسال شده" />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          uppercase={false}
          className="!min-h-8 !gap-2 !border-white/[0.075] !bg-white/[0.02] !px-3 !text-[7px] !tracking-normal !text-white/46 hover:!bg-white/[0.045] hover:!text-white/72 group-data-[theme=light]/admin:!border-black/[0.08] group-data-[theme=light]/admin:!bg-black/[0.02] group-data-[theme=light]/admin:!text-black/48"
        >
          <span>۶ ماه گذشته</span>
          <span aria-hidden="true">⌄</span>
        </Button>
      </header>

      <div className="px-3 pb-3 pt-2 sm:px-4">
        <SalesLineChart />
      </div>
    </article>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`size-1.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function SalesLineChart() {
  const width = 720;
  const height = 205;
  const padX = 38;
  const padTop = 24;
  const padBottom = 32;
  const maxValue = 240;
  const labels = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];

  function points(values: readonly number[]) {
    return values.map((value, index) => {
      const x = padX + (index / (values.length - 1)) * (width - padX * 2);
      const y = padTop + (1 - value / maxValue) * (height - padTop - padBottom);
      return { x, y, value };
    });
  }

  const current = points(SALES_CURRENT);
  const previous = points(SALES_PREVIOUS);
  const currentPolyline = current
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  const previousPolyline = previous
    .map((point) => `${point.x},${point.y}`)
    .join(" ");
  const hoverPoint = current[7];

  return (
    <div className="relative h-[250px] w-full overflow-hidden sm:h-[270px] xl:h-[285px]">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 size-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="نمودار نمایشی روند فروش"
      >
        <defs>
          <linearGradient id="salesGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a87552" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#a87552" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3, 4].map((line) => {
          const y = padTop + line * ((height - padTop - padBottom) / 4);
          return (
            <line
              key={line}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              className="stroke-white/[0.055] group-data-[theme=light]/admin:stroke-black/[0.06]"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}

        <path
          d={`M ${current.map((point) => `${point.x} ${point.y}`).join(" L ")} L ${width - padX} ${height - padBottom} L ${padX} ${height - padBottom} Z`}
          fill="url(#salesGlow)"
        />

        <polyline
          points={previousPolyline}
          fill="none"
          stroke="#66717b"
          strokeWidth="1.35"
          strokeDasharray="6 5"
          opacity="0.62"
          vectorEffect="non-scaling-stroke"
        />
        <polyline
          points={currentPolyline}
          fill="none"
          stroke="#b37f5d"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {current.map((point, index) => (
          <circle
            key={`${point.x}-${point.y}`}
            cx={point.x}
            cy={point.y}
            r={index === 7 ? 3.5 : 2.2}
            fill={index === 7 ? "#f3eee7" : "#b37f5d"}
            stroke="#b37f5d"
            strokeWidth={index === 7 ? 1.6 : 0}
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <line
          x1={hoverPoint.x}
          x2={hoverPoint.x}
          y1={padTop}
          y2={height - padBottom}
          stroke="#a87552"
          strokeWidth="1"
          strokeDasharray="3 5"
          opacity="0.35"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="pointer-events-none absolute left-[54%] top-[28%] rounded-[3px] border border-white/[0.085] bg-[#111820]/95 px-2.5 py-2 text-right shadow-[0_15px_40px_-25px_rgba(0,0,0,0.9)] group-data-[theme=light]/admin:border-black/[0.09] group-data-[theme=light]/admin:bg-[#f0ede7]/95">
        <p className="text-[6px] text-white/36 group-data-[theme=light]/admin:text-black/42">
          مهر
        </p>
        <p className="mt-1 text-[7px] font-semibold text-white/82 group-data-[theme=light]/admin:text-black/82">
          فروش این ماه: ۲۰۶,۰۰۰,۰۰۰ تومان
        </p>
        <p className="mt-0.5 text-[6.5px] text-white/42 group-data-[theme=light]/admin:text-black/48">
          فروش ارسال شده: ۱۴۵,۰۰۰,۰۰۰ تومان
        </p>
      </div>

      <div className="absolute inset-x-9 bottom-1 hidden justify-between text-[5.5px] text-white/24 group-data-[theme=light]/admin:text-black/34 sm:flex">
        {labels.slice(0, 12).map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}

function InventoryPanel() {
  return (
    <article className="h-full overflow-hidden rounded-[4px] border border-white/[0.075] bg-[#0d141b] shadow-[0_20px_70px_-48px_rgba(0,0,0,0.95)] transition-colors hover:border-white/[0.11] group-data-[theme=light]/admin:border-black/[0.08] group-data-[theme=light]/admin:bg-[#ece8e1]">
      <header className="flex items-center justify-between border-b border-white/[0.055] px-4 py-3 group-data-[theme=light]/admin:border-black/[0.07]">
        <Button
          type="button"
          variant="outline"
          size="sm"
          uppercase={false}
          className="!min-h-7 !border-transparent !bg-transparent !px-1.5 !text-[6.5px] !tracking-normal !text-[#a87552] hover:!border-transparent hover:!bg-white/[0.025] hover:!text-[#c39a7e] group-data-[theme=light]/admin:hover:!bg-black/[0.025]"
        >
          مشاهده همه
        </Button>
        <div className="flex items-center gap-2">
          <h2 className="text-[13px] font-bold text-white group-data-[theme=light]/admin:text-[#211f1c]">
            وضعیت موجودی انبار
          </h2>
          <Box size={15} strokeWidth={1.4} className="text-[#a87552]" />
        </div>
      </header>

      <div className="divide-y divide-white/[0.045] group-data-[theme=light]/admin:divide-black/[0.055]">
        {INVENTORY_ITEMS.map((item) => (
          <div
            key={item.sku}
            className="group/inventory grid grid-cols-[56px_minmax(0,1fr)] items-center gap-3 px-3 py-2 transition-colors hover:bg-white/[0.025] group-data-[theme=light]/admin:hover:bg-black/[0.025]"
          >
            <div className="relative size-14 overflow-hidden rounded-[3px] border border-white/[0.075] bg-white/[0.02] group-data-[theme=light]/admin:border-black/[0.08] group-data-[theme=light]/admin:bg-black/[0.02]">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="56px"
                className="object-cover transition-transform duration-500 group-hover/inventory:scale-[1.04]"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`shrink-0 text-[6.5px] font-semibold ${item.tone === "danger" ? "text-[#f06464]" : "text-white/48 group-data-[theme=light]/admin:text-black/48"}`}
                >
                  {item.count}
                </span>
                <strong className="truncate text-[8.5px] font-semibold text-white/82 group-data-[theme=light]/admin:text-black/82">
                  {item.name}
                </strong>
              </div>
              <div className="mt-1 flex items-center justify-between gap-3">
                <span className="text-[5.5px] text-white/24 group-data-[theme=light]/admin:text-black/34">
                  {item.sku}
                </span>
              </div>
              <div className="mt-2 h-[4px] overflow-hidden rounded-[1px] bg-white/[0.055] group-data-[theme=light]/admin:bg-black/[0.07]">
                <div
                  className={`h-full rounded-[1px] ${item.bar} ${item.tone === "success" ? "bg-[#64c695]" : item.tone === "warning" ? "bg-[#c39469]" : "bg-[#ff5e67]"}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function RecentOrdersPanel() {
  return (
    <SmallPanel
      title="سفارشات اخیر"
      icon={<Clock3 size={14} />}
      action="مشاهده همه"
    >
      <div className="space-y-1.5">
        {RECENT_ORDERS.map((order) => (
          <div
            key={order.id}
            className="group/order grid grid-cols-[42px_minmax(0,1fr)] items-center gap-2 rounded-[3px] border border-transparent px-1.5 py-1.5 transition-colors hover:border-white/[0.06] hover:bg-white/[0.02] group-data-[theme=light]/admin:hover:border-black/[0.06] group-data-[theme=light]/admin:hover:bg-black/[0.02]"
          >
            <div className="relative size-10 overflow-hidden rounded-[2px] border border-white/[0.07] group-data-[theme=light]/admin:border-black/[0.08]">
              <Image
                src={order.image}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`shrink-0 text-[5.5px] font-semibold ${order.tone === "success" ? "text-[#5cc68c]" : "text-[#d49a62]"}`}
                >
                  {order.status}
                </span>
                <strong className="text-[7px] font-semibold text-white/80 group-data-[theme=light]/admin:text-black/80">
                  {order.id}
                </strong>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2 text-[5.5px] text-white/28 group-data-[theme=light]/admin:text-black/36">
                <span>{order.amount}</span>
                <span>{order.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SmallPanel>
  );
}

function TopCategoriesPanel() {
  return (
    <SmallPanel
      title="دسته‌بندی‌های پرفروش"
      icon={<Boxes size={14} />}
      action="مشاهده همه"
    >
      <div className="space-y-1.5">
        {TOP_CATEGORIES.map((item) => (
          <div
            key={item.name}
            className="group/category grid grid-cols-[42px_minmax(0,1fr)] items-center gap-2 rounded-[3px] px-1.5 py-1.5 transition-colors hover:bg-white/[0.02] group-data-[theme=light]/admin:hover:bg-black/[0.02]"
          >
            <div className="relative size-10 overflow-hidden rounded-[2px] border border-white/[0.07] group-data-[theme=light]/admin:border-black/[0.08]">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="40px"
                className="object-cover transition-transform duration-500 group-hover/category:scale-[1.04]"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[5.5px] font-semibold text-white/36 group-data-[theme=light]/admin:text-black/42">
                  {item.share}
                </span>
                <strong className="truncate text-[7px] font-semibold text-white/76 group-data-[theme=light]/admin:text-black/78">
                  {item.name}
                </strong>
              </div>
              <div className="mt-2 h-[4px] rounded-[1px] bg-white/[0.055] group-data-[theme=light]/admin:bg-black/[0.07]">
                <div
                  className={`h-full rounded-[1px] bg-[#a87552] ${item.bar}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SmallPanel>
  );
}

function AlertsPanel() {
  return (
    <SmallPanel
      title="هشدارهای مهم"
      icon={<BellRing size={14} />}
      action="مشاهده همه"
    >
      <div className="space-y-1.5">
        {ALERTS.map((item) => (
          <div
            key={item.title}
            className="group/alert grid grid-cols-[42px_minmax(0,1fr)] items-center gap-2 rounded-[3px] border border-transparent px-1.5 py-1.5 transition-colors hover:border-white/[0.06] hover:bg-white/[0.02] group-data-[theme=light]/admin:hover:border-black/[0.06] group-data-[theme=light]/admin:hover:bg-black/[0.02]"
          >
            <div className="relative size-10 overflow-hidden rounded-[2px] border border-white/[0.07] group-data-[theme=light]/admin:border-black/[0.08]">
              <Image
                src={item.image}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <strong className="block truncate text-[7px] font-semibold text-white/78 group-data-[theme=light]/admin:text-black/78">
                {item.title}
              </strong>
              <span
                className={`mt-1 block text-[5.5px] font-medium ${item.tone === "danger" ? "text-[#ff636b]" : "text-[#d29b65]"}`}
              >
                ● {item.detail}
              </span>
            </div>
          </div>
        ))}
      </div>
    </SmallPanel>
  );
}

function QuickAccessPanel() {
  const actions = [
    { label: "افزودن محصول", icon: Package },
    { label: "ثبت سفارش", icon: ShoppingCart },
    { label: "گزارش فروش", icon: TrendingUp },
    { label: "مدیریت تخفیف‌ها", icon: Tag },
  ];

  return (
    <SmallPanel title="دسترسی سریع" icon={<Zap size={14} />}>
      <div className="grid grid-cols-2 gap-2 pt-1">
        {actions.map(({ label, icon: Icon }) => (
          <Button
            key={label}
            type="button"
            variant="outline"
            size="sm"
            fullWidth
            uppercase={false}
            icon={<Icon size={15} strokeWidth={1.35} />}
            iconPosition="left"
            className="!min-h-[62px] !flex-col !justify-center !gap-2 !border-[#9d7357]/25 !bg-[#9d7357]/[0.035] !px-2 !text-[7px] !tracking-normal !text-white/58 hover:!-translate-y-0.5 hover:!border-[#9d7357]/48 hover:!bg-[#9d7357]/[0.075] hover:!text-white hover:!shadow-[0_14px_30px_-22px_rgba(157,115,87,0.7)] group-data-[theme=light]/admin:!text-black/60 group-data-[theme=light]/admin:hover:!text-black/82"
          >
            {label}
          </Button>
        ))}
      </div>
    </SmallPanel>
  );
}

function SmallPanel({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon: ReactNode;
  action?: string;
  children: ReactNode;
}) {
  return (
    <article className="h-full overflow-hidden rounded-[4px] border border-white/[0.075] bg-[#0d141b] p-3 shadow-[0_18px_62px_-46px_rgba(0,0,0,0.95)] transition-colors hover:border-white/[0.11] group-data-[theme=light]/admin:border-black/[0.08] group-data-[theme=light]/admin:bg-[#ece8e1]">
      <header className="mb-2.5 flex items-center justify-between gap-3">
        {action ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            uppercase={false}
            className="!min-h-7 !border-transparent !bg-transparent !px-1.5 !text-[5.5px] !tracking-normal !text-[#a87552] hover:!border-transparent hover:!bg-white/[0.02] hover:!text-[#c39a7e] group-data-[theme=light]/admin:hover:!bg-black/[0.02]"
          >
            {action}
          </Button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2 text-white/84 group-data-[theme=light]/admin:text-black/80">
          <h2 className="text-[8.5px] font-bold">{title}</h2>
          <span className="text-[#b08466]">{icon}</span>
        </div>
      </header>
      {children}
    </article>
  );
}
