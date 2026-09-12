"use client";

import { ArrowLeft, Box, Ellipsis, ExternalLink, PackagePlus, RefreshCw, TrendingUp } from "lucide-react";
import { useState } from "react";
import { activity, chartRanges, type ChartRange, kpis, lowStock, recentOrders } from "@/lib/demo-data";
import type { ServiceHealth } from "@/lib/service-health";

function Chart({ range }: { range: ChartRange }) {
  const data = chartRanges[range];
  const width = 720, height = 216, pad = 10;
  const points = data.values.map((value, i) => `${pad + i * ((width - pad * 2) / (data.values.length - 1))},${height - 20 - (value / 100) * (height - 46)}`).join(" ");
  const area = `${pad},${height - 20} ${points} ${width - pad},${height - 20}`;
  return <div className="chart-wrap">
    <div className="chart-grid" aria-hidden="true"><i /><i /><i /><i /></div>
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`روند فروش ${range}: ${data.revenue}، ${data.orders}، ${data.delta}`} preserveAspectRatio="none">
      <polygon points={area} className="chart-area" />
      <polyline points={points} className="chart-line" />
      {data.values.map((value, i) => <circle key={i} cx={pad + i * ((width - pad * 2) / (data.values.length - 1))} cy={height - 20 - (value / 100) * (height - 46)} r="3" className="chart-point" />)}
    </svg>
    <div className="chart-labels">{data.labels.map((label) => <span key={label}>{label}</span>)}</div>
  </div>;
}

export function Dashboard({ services }: { services: ServiceHealth[] }) {
  const [range, setRange] = useState<ChartRange>("30D");
  const [notice, setNotice] = useState<string | null>(null);
  const current = chartRanges[range];
  const announce = (message: string) => { setNotice(message); setTimeout(() => setNotice(null), 2400); };

  return <div className="dashboard">
    {notice && <div className="toast" role="status">{notice}</div>}
    <section className="page-intro">
      <div><p>عملیات <span>/</span> نمای کلی</p><h1>آتلیه در یک نگاه.</h1><small>چهارشنبه، ۱۲ شهریور · همه سامانه‌ها و کانال‌های فروش</small></div>
      <div className="intro-actions"><span className="demo-label">داده نمایشی</span><button className="primary-button" onClick={() => announce("ویرایشگر محصول در بخش کاتالوگ آماده است.")}><PackagePlus size={17} />افزودن محصول</button></div>
    </section>

    <section className="kpi-grid" aria-label="شاخص‌های کلیدی عملکرد">
      {kpis.map((item, index) => <article className="kpi" key={item.label}>
        <div className="kpi-index">0{index + 1}</div><p>{item.label}</p><strong>{item.value}</strong>
        <footer><span className={item.tone}><TrendingUp size={13} />{item.change}</span><small>{item.detail}</small></footer>
      </article>)}
    </section>

    <section className="main-grid">
      <article className="panel revenue-panel">
        <header className="panel-head"><div><p className="eyebrow">ریتم فروش</p><h2>درآمد و سفارش‌ها</h2></div><div className="range-selector" aria-label="بازه زمانی نمودار">{(Object.keys(chartRanges) as ChartRange[]).map((item) => <button key={item} onClick={() => setRange(item)} className={range === item ? "active" : ""} aria-pressed={range === item}>{({ "7D": "۷ روز", "30D": "۳۰ روز", "90D": "۹۰ روز" } as const)[item]}</button>)}</div></header>
        <div className="chart-summary"><strong>{current.revenue}</strong><span><TrendingUp size={14} />{current.delta}</span><small>{current.orders}</small></div>
        <Chart range={range} />
      </article>

      <aside className="panel stock-panel">
        <header className="panel-head"><div><p className="eyebrow">نیازمند توجه</p><h2>کمبود موجودی</h2></div><span className="stock-count">۱۸</span></header>
        <div className="stock-list">{lowStock.map((item) => <div className="stock-item" key={item.sku}><div className="stock-icon"><Box size={17} /></div><div><strong>{item.product}</strong><span>{item.variant} · {item.sku}</span></div><em>{item.units}</em></div>)}</div>
        <button className="text-action" onClick={() => announce("بررسی موجودی در مرحله بعد تکمیل می‌شود.")}>بررسی موجودی <ArrowLeft size={15} /></button>
      </aside>
    </section>

    <section className="panel orders-panel">
      <header className="panel-head"><div><p className="eyebrow">اتاق سفارش امروز</p><h2>سفارش‌های اخیر</h2></div><button className="quiet-button" onClick={() => announce("فهرست سفارش‌ها تازه شد.")}><RefreshCw size={15} />تازه‌سازی</button></header>
      <div className="table-scroll"><table><thead><tr><th>سفارش</th><th>مشتری</th><th>محصول</th><th>وضعیت</th><th>مبلغ</th><th>زمان</th><th><span className="sr-only">عملیات</span></th></tr></thead><tbody>{recentOrders.map((order) => <tr key={order.id}><td><strong>{order.id}</strong></td><td>{order.customer}</td><td className="muted-cell">{order.item}</td><td><span className="status">{order.status}</span></td><td><strong>{order.amount}</strong></td><td className="muted-cell">{order.time}</td><td><button className="row-action" aria-label={`عملیات سفارش ${order.id}`}><Ellipsis size={18} /></button></td></tr>)}</tbody></table></div>
      <button className="mobile-table-action" onClick={() => announce("همه سفارش‌ها در بخش سفارش‌ها نمایش داده می‌شوند.")}>مشاهده همه سفارش‌ها <ArrowLeft size={15} /></button>
    </section>

    <section className="bottom-grid">
      <article className="panel health-panel"><header className="panel-head"><div><p className="eyebrow">نبض پلتفرم</p><h2>سلامت سرویس‌ها</h2></div><small>بررسی زنده</small></header><div className="health-grid">{services.map((service) => <div key={service.name}><i className={service.status === "Operational" ? "online" : "offline"} /><strong>{({ Commerce: "فروش", Inventory: "موجودی", Payments: "پرداخت", "Customer Data": "اطلاعات مشتری" } as Record<string, string>)[service.name] || service.name}</strong><span>{service.status === "Operational" ? "فعال" : "در دسترس نیست"}</span><small>{service.latency ? `${service.latency} میلی‌ثانیه` : "بررسی سرویس"}</small></div>)}</div></article>
      <article className="panel activity-panel"><header className="panel-head"><div><p className="eyebrow">رویداد زنده</p><h2>فعالیت‌های اخیر</h2></div></header><div className="activity-list">{activity.map((item) => <div key={item.time}><time>{item.time}</time><i /><p><strong>{item.title}</strong><span>{item.detail}</span></p></div>)}</div></article>
      <article className="quick-panel"><p className="eyebrow">عملیات سریع</p><h2>کارها را پیش ببرید.</h2><div><button onClick={() => announce("ویرایشگر محصول در کاتالوگ آماده است.")}>ساخت محصول <PackagePlus size={16} /></button><button onClick={() => announce("تنظیم موجودی در مرحله موجودی تکمیل می‌شود.")}>تنظیم موجودی <Box size={16} /></button><button onClick={() => announce("گزارش‌ها در بخش گزارش‌ها آماده می‌شوند.")}>خروجی گزارش <ExternalLink size={16} /></button></div><small>کارهای پرکاربرد، تنها با یک قدم.</small></article>
    </section>
  </div>;
}
