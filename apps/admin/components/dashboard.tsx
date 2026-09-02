"use client";

import { ArrowRight, Box, Ellipsis, ExternalLink, PackagePlus, RefreshCw, TrendingUp } from "lucide-react";
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
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Revenue trend for ${range}: ${data.revenue}, ${data.orders}, ${data.delta}`} preserveAspectRatio="none">
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
      <div><p>Operations <span>/</span> Overview</p><h1>The atelier, at a glance.</h1><small>Wednesday, September 2 · All systems and selling channels</small></div>
      <div className="intro-actions"><span className="demo-label">Demo data</span><button className="primary-button" onClick={() => announce("Product editor will arrive in the Catalog phase.")}><PackagePlus size={17} />Add product</button></div>
    </section>

    <section className="kpi-grid" aria-label="Key performance indicators">
      {kpis.map((item, index) => <article className="kpi" key={item.label}>
        <div className="kpi-index">0{index + 1}</div><p>{item.label}</p><strong>{item.value}</strong>
        <footer><span className={item.tone}><TrendingUp size={13} />{item.change}</span><small>{item.detail}</small></footer>
      </article>)}
    </section>

    <section className="main-grid">
      <article className="panel revenue-panel">
        <header className="panel-head"><div><p className="eyebrow">Commercial rhythm</p><h2>Revenue &amp; orders</h2></div><div className="range-selector" aria-label="Chart date range">{(Object.keys(chartRanges) as ChartRange[]).map((item) => <button key={item} onClick={() => setRange(item)} className={range === item ? "active" : ""} aria-pressed={range === item}>{item}</button>)}</div></header>
        <div className="chart-summary"><strong>{current.revenue}</strong><span><TrendingUp size={14} />{current.delta}</span><small>{current.orders}</small></div>
        <Chart range={range} />
      </article>

      <aside className="panel stock-panel">
        <header className="panel-head"><div><p className="eyebrow">Attention required</p><h2>Low stock</h2></div><span className="stock-count">18</span></header>
        <div className="stock-list">{lowStock.map((item) => <div className="stock-item" key={item.sku}><div className="stock-icon"><Box size={17} /></div><div><strong>{item.product}</strong><span>{item.variant} · {item.sku}</span></div><em>{item.units}</em></div>)}</div>
        <button className="text-action" onClick={() => announce("Inventory review is ready for its API phase.")}>Review inventory <ArrowRight size={15} /></button>
      </aside>
    </section>

    <section className="panel orders-panel">
      <header className="panel-head"><div><p className="eyebrow">Today’s order room</p><h2>Recent orders</h2></div><button className="quiet-button" onClick={() => announce("Order list refreshed.")}><RefreshCw size={15} />Refresh</button></header>
      <div className="table-scroll"><table><thead><tr><th>Order</th><th>Customer</th><th>Item</th><th>Status</th><th>Amount</th><th>Placed</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{recentOrders.map((order) => <tr key={order.id}><td><strong>{order.id}</strong></td><td>{order.customer}</td><td className="muted-cell">{order.item}</td><td><span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span></td><td><strong>{order.amount}</strong></td><td className="muted-cell">{order.time}</td><td><button className="row-action" aria-label={`Actions for ${order.id}`}><Ellipsis size={18} /></button></td></tr>)}</tbody></table></div>
      <button className="mobile-table-action" onClick={() => announce("All orders will open in the Orders phase.")}>View all orders <ArrowRight size={15} /></button>
    </section>

    <section className="bottom-grid">
      <article className="panel health-panel"><header className="panel-head"><div><p className="eyebrow">Platform pulse</p><h2>Service health</h2></div><small>Live check</small></header><div className="health-grid">{services.map((service) => <div key={service.name}><i className={service.status === "Operational" ? "online" : "offline"} /><strong>{service.name}</strong><span>{service.status}</span><small>{service.latency ? `${service.latency} ms` : "Check service"}</small></div>)}</div></article>
      <article className="panel activity-panel"><header className="panel-head"><div><p className="eyebrow">Live journal</p><h2>Recent activity</h2></div></header><div className="activity-list">{activity.map((item) => <div key={item.time}><time>{item.time}</time><i /><p><strong>{item.title}</strong><span>{item.detail}</span></p></div>)}</div></article>
      <article className="quick-panel"><p className="eyebrow">Quick actions</p><h2>Keep the floor moving.</h2><div><button onClick={() => announce("Product editor will arrive in the Catalog phase.")}>Create product <PackagePlus size={16} /></button><button onClick={() => announce("Inventory adjustment will arrive in the Inventory phase.")}>Adjust inventory <Box size={16} /></button><button onClick={() => announce("Reports will arrive in the Insights phase.")}>Export report <ExternalLink size={16} /></button></div><small>Common actions, one step away.</small></article>
    </section>
  </div>;
}
