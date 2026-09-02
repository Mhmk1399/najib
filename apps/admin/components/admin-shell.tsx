"use client";

import Image from "next/image";
import {
  BarChart3, Bell, ChevronLeft, ChevronRight, CircleDollarSign, Command, CreditCard,
  FolderKanban, Grid2X2, Menu, Package, Search, Settings, ShoppingBag, Sun, Moon,
  Users, X,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";

const navigation = [
  { label: "Overview", icon: Grid2X2, group: "Workspace" },
  { label: "Catalog", icon: ShoppingBag, group: "Commerce" },
  { label: "Inventory", icon: Package, group: "Commerce", count: 18 },
  { label: "Orders", icon: FolderKanban, group: "Commerce", count: 6 },
  { label: "Customers", icon: Users, group: "Relations" },
  { label: "Payments", icon: CreditCard, group: "Relations" },
  { label: "Collections", icon: CircleDollarSign, group: "Editorial" },
  { label: "Insights", icon: BarChart3, group: "Editorial" },
  { label: "Settings", icon: Settings, group: "System" },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`}>
      <Image src="/brand/logo.png" alt="Najibzadeh" width={42} height={42} priority />
      {!compact && <div><strong>NAJIBZADEH</strong><span>Atelier operations</span></div>}
    </div>
  );
}

function Navigation({ collapsed, active, onNavigate }: { collapsed: boolean; active: string; onNavigate: (label: string) => void }) {
  const groups = [...new Set(navigation.map((item) => item.group))];
  return <nav aria-label="Primary navigation" className="sidebar-nav">
    {groups.map((group) => <div className="nav-group" key={group}>
      {!collapsed && <p>{group}</p>}
      {navigation.filter((item) => item.group === group).map(({ label, icon: Icon, count }) => (
        <button key={label} className={active === label ? "nav-item active" : "nav-item"} onClick={() => onNavigate(label)} title={collapsed ? label : undefined} aria-current={active === label ? "page" : undefined}>
          <Icon size={18} strokeWidth={1.6} />
          {!collapsed && <><span>{label}</span>{count && <em>{count}</em>}</>}
        </button>
      ))}
    </div>)}
  </nav>;
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [active, setActive] = useState("Overview");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setSearchOpen(false); setMobileOpen(false); }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k" || (event.key === "/" && !(event.target instanceof HTMLInputElement))) {
        event.preventDefault(); setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", mobileOpen);
    if (mobileOpen) setTimeout(() => document.querySelector<HTMLButtonElement>(".mobile-sheet .nav-item")?.focus(), 30);
    else menuRef.current?.focus();
    return () => document.body.classList.remove("menu-open");
  }, [mobileOpen]);

  useEffect(() => { if (searchOpen) setTimeout(() => searchRef.current?.focus(), 20); }, [searchOpen]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next); document.documentElement.dataset.theme = next; localStorage.setItem("najib-admin-theme", next);
  };

  const navigate = (label: string) => { setActive(label); setMobileOpen(false); };

  return <div className={collapsed ? "admin-shell is-collapsed" : "admin-shell"}>
    <aside className="sidebar">
      <Brand compact={collapsed} />
      <Navigation collapsed={collapsed} active={active} onNavigate={navigate} />
      <button className="collapse-control" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        {collapsed ? <ChevronRight size={17} /> : <><ChevronLeft size={17} /><span>Collapse</span></>}
      </button>
    </aside>

    <div className="workspace">
      <header className="topbar">
        <button ref={menuRef} className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
        <div className="topbar-title"><span>Operations</span><i>/</i><strong>{active}</strong></div>
        <div className="topbar-actions">
          <button className="search-trigger" onClick={() => setSearchOpen(true)}><Search size={17} /><span>Search anything</span><kbd>⌘ K</kbd></button>
          <button className="icon-button notification" aria-label="Notifications"><Bell size={18} /><i /></button>
          <button className="icon-button" onClick={toggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button className="profile" aria-label="Open staff profile"><span>ND</span><div><strong>Najib D.</strong><small>Administrator</small></div></button>
        </div>
      </header>
      <main>{active === "Overview" ? children : <Placeholder title={active} onBack={() => setActive("Overview")} />}</main>
    </div>

    {mobileOpen && <><button className="sheet-overlay" onClick={() => setMobileOpen(false)} aria-label="Close navigation" /><aside className="mobile-sheet" aria-label="Mobile navigation">
      <div className="sheet-head"><Brand /><button className="icon-button inverse" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
      <Navigation collapsed={false} active={active} onNavigate={navigate} />
    </aside></>}

    {searchOpen && <div className="command-layer" role="dialog" aria-modal="true" aria-label="Global search" onMouseDown={(e) => { if (e.currentTarget === e.target) setSearchOpen(false); }}>
      <section className="command-panel">
        <div className="command-input"><Search size={19} /><input ref={searchRef} placeholder="Search orders, customers, products…" aria-label="Search" /><button onClick={() => setSearchOpen(false)}>ESC</button></div>
        <p className="command-label">Quick destinations</p>
        {["Find order NZ-2847", "Review low-stock variants", "Add a new product", "Open payment review"].map((item, index) => <button className="command-option" key={item} onClick={() => setSearchOpen(false)}><Command size={15} /><span>{item}</span><small>0{index + 1}</small></button>)}
      </section>
    </div>}
  </div>;
}

function Placeholder({ title, onBack }: { title: string; onBack: () => void }) {
  return <section className="placeholder-state"><span>Module foundation</span><h1>{title}</h1><p>This workspace is prepared for the next delivery phase. The navigation stays functional without sending you to an unfinished route.</p><button className="primary-button" onClick={onBack}>Return to overview</button></section>;
}
