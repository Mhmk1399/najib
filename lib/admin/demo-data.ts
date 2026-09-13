export const kpis = [
  { label: "فروش خالص", value: "$86,420", change: "+12.8%", detail: "نسبت به دوره قبل", tone: "positive" },
  { label: "سفارش‌ها", value: "1,248", change: "+8.4%", detail: "۱۰۴ سفارش در انتظار آماده‌سازی", tone: "positive" },
  { label: "نرخ تبدیل", value: "3.82%", change: "+0.31", detail: "واحد درصد", tone: "positive" },
  { label: "تنوع کم‌موجودی", value: "18", change: "۶ مورد فوری", detail: "در ۱۱ محصول", tone: "warning" },
] as const;

export const chartRanges = {
  "7D": { revenue: "$21,480", orders: "۳۰۶ سفارش", delta: "+9.2%", values: [42, 56, 48, 70, 63, 87, 78], labels: ["ش", "ی", "د", "س", "چ", "پ", "ج"] },
  "30D": { revenue: "$86,420", orders: "۱٬۲۴۸ سفارش", delta: "+12.8%", values: [24, 31, 29, 42, 38, 51, 47, 63, 58, 72, 66, 84, 79, 91], labels: ["۱۳ مرداد", "۲۰ مرداد", "۲۷ مرداد", "۳ شهریور", "۱۲ شهریور"] },
  "90D": { revenue: "$242,760", orders: "۳٬۵۱۶ سفارش", delta: "+18.1%", values: [31, 38, 34, 47, 43, 55, 51, 62, 58, 69, 65, 74, 71, 82, 78, 88], labels: ["خرداد", "تیر", "مرداد", "شهریور"] },
} as const;

export type ChartRange = keyof typeof chartRanges;

export const recentOrders = [
  { id: "NZ-2847", customer: "امیر رحیمی", item: "کت‌وشلوار پشمی نیمه‌شب", amount: "$1,840", time: "11:42", status: "پرداخت‌شده" },
  { id: "NZ-2846", customer: "کیان مرادی", item: "پالتوی کشمیر", amount: "$1,260", time: "10:18", status: "در حال بسته‌بندی" },
  { id: "NZ-2845", customer: "داریوش کمالی", item: "پیراهن شب ابریشمی", amount: "$420", time: "09:54", status: "نیازمند بررسی" },
  { id: "NZ-2844", customer: "نوید آزادی", item: "کفش مانک دوبل", amount: "$680", time: "دیروز", status: "ارسال‌شده" },
  { id: "NZ-2843", customer: "رضا دانش", item: "شلوار دست‌دوز", amount: "$390", time: "دیروز", status: "پرداخت‌شده" },
] as const;

export const lowStock = [
  { product: "کت‌وشلوار پشمی نیمه‌شب", variant: "۵۲ / جوهری", sku: "NJS-INK-52", units: 2 },
  { product: "پالتوی کشمیر", variant: "L / شتری", sku: "NCO-CAM-L", units: 3 },
  { product: "پیراهن شب ابریشمی", variant: "M / عاجی", sku: "NES-IVR-M", units: 4 },
  { product: "کفش مانک دوبل", variant: "۴۳ / اسپرسو", sku: "NDO-ESP-43", units: 5 },
] as const;

export const activity = [
  { time: "11:47", title: "موجودی اصلاح شد", detail: "۲ عدد برای NZ-2847 رزرو شد" },
  { time: "11:31", title: "پرداخت ثبت شد", detail: "$1,840 · ویزا با پایان 1240" },
  { time: "10:52", title: "کالکشن منتشر شد", detail: "پوشاک رسمی پاییز · ۱۸ محصول" },
  { time: "09:16", title: "یادداشت مشتری افزوده شد", detail: "درخواست پرو اولویت‌دار برای امیر ر." },
] as const;
