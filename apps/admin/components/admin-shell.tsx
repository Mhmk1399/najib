"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3, Bell, ChevronLeft, ChevronRight, CircleDollarSign, Command, CreditCard,
  FolderKanban, Grid2X2, Menu, Package, Search, Settings, ShoppingBag, Sun, Moon,
  Users, X, ChevronDown, LogOut, UserRound,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState, useSyncExternalStore } from "react";

export type StaffProfile = {
  firstName: string;
  lastName: string;
  displayRole: string;
  permissions?: string[];
};

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function getDarkTheme() {
  return document.documentElement.dataset.theme === "dark";
}

const navigation = [
  { label: "Overview", icon: Grid2X2, group: "Workspace", permission: "admin.access", href: "/" },
  { label: "Catalog", icon: ShoppingBag, group: "Commerce", permission: "catalog.read", href: "/catalog/products" },
  { label: "Inventory", icon: Package, group: "Commerce", count: 18, permission: "inventory.read" },
  { label: "Orders", icon: FolderKanban, group: "Commerce", count: 6, permission: "orders.read" },
  { label: "Customers", icon: Users, group: "Relations", permission: "customers.read" },
  { label: "Payments", icon: CreditCard, group: "Relations", permission: "payments.read" },
  { label: "Collections", icon: CircleDollarSign, group: "Editorial", permission: "collections.read" },
  { label: "Insights", icon: BarChart3, group: "Editorial", permission: "insights.read" },
  { label: "Settings", icon: Settings, group: "System", permission: "settings.manage" },
];

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`}>
      <Image src="/brand/logo.png" alt="Najibzadeh" width={42} height={42} priority />
      {!compact && <div><strong>NAJIBZADEH</strong><span>Atelier operations</span></div>}
    </div>
  );
}

function Navigation({ collapsed, pathname, onNavigate, permissions }: { collapsed: boolean; pathname: string; onNavigate: () => void; permissions: string[] }) {
  const allowedNavigation = navigation.filter((item) => permissions.includes(item.permission));
  const groups = [...new Set(allowedNavigation.map((item) => item.group))];
  return <nav aria-label="Primary navigation" className="sidebar-nav">
    {groups.map((group) => <div className="nav-group" key={group}>
      {!collapsed && <p>{group}</p>}
      {allowedNavigation.filter((item) => item.group === group).map(({ label, icon: Icon, count, href }) => {
        const isActive = href === "/" ? pathname === "/" : Boolean(href && pathname.startsWith(href));
        const content = <><Icon size={18} strokeWidth={1.6} />{!collapsed && <><span>{label}</span>{count && <em>{count}</em>}</>}</>;
        return href ? (
          <Link key={label} href={href} className={isActive ? "nav-item active" : "nav-item"} onClick={onNavigate} title={collapsed ? label : undefined} aria-current={isActive ? "page" : undefined}>{content}</Link>
        ) : (
          <button key={label} className="nav-item nav-item--disabled" disabled title={collapsed ? `${label} — coming soon` : "Coming soon"}>{content}</button>
        );
      })}
    </div>)}
  </nav>;
}

export function AdminShell({ children, staff }: { children: ReactNode; staff?: StaffProfile }) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const darkTheme = useSyncExternalStore(subscribeToTheme, getDarkTheme, () => false);
  const searchRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const logoutRef = useRef<HTMLButtonElement>(null);
  const staffProfile = staff ?? { firstName: "Staff", lastName: "Member", displayRole: "Team member", permissions: navigation.map((item) => item.permission) };
  const permissions = staffProfile.permissions ?? [];
  const fullName = `${staffProfile.firstName} ${staffProfile.lastName}`.trim();
  const initials = `${staffProfile.firstName.charAt(0)}${staffProfile.lastName.charAt(0)}`.toUpperCase() || "ST";

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setSearchOpen(false); setMobileOpen(false); setProfileOpen(false); }
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

  useEffect(() => {
    if (!profileOpen) return;
    const focusTimer = window.setTimeout(() => logoutRef.current?.focus(), 20);
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [profileOpen]);

  const toggleTheme = () => {
    const next = darkTheme ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("najib-admin-theme", next);
  };

  const active = pathname.startsWith("/catalog") ? "Catalog" : "Overview";

  const logout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return <div className={collapsed ? "admin-shell is-collapsed" : "admin-shell"}>
    <aside className="sidebar">
      <Brand compact={collapsed} />
      <Navigation collapsed={collapsed} pathname={pathname} onNavigate={() => setMobileOpen(false)} permissions={permissions} />
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
          <button className="icon-button theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${darkTheme ? "light" : "dark"} theme`}>
            <Moon className="theme-dark-icon" size={18} /><Sun className="theme-light-icon" size={18} />
          </button>
          <div className="profile-wrap" ref={profileRef}>
            <button
              ref={profileButtonRef}
              id="staff-profile-trigger"
              className="profile"
              aria-label="Open staff profile"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              aria-controls={profileOpen ? "staff-profile-menu" : undefined}
              onClick={() => setProfileOpen((open) => !open)}
            >
              <span aria-hidden="true">{initials}</span>
              <div><strong>{fullName}</strong><small>{staffProfile.displayRole}</small></div>
              <ChevronDown className="profile-chevron" size={14} aria-hidden="true" />
            </button>
            {profileOpen && (
              <section
                className="profile-menu"
                id="staff-profile-menu"
                aria-labelledby="staff-profile-trigger"
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.stopPropagation();
                    setProfileOpen(false);
                    profileButtonRef.current?.focus();
                  }
                }}
              >
                <header>
                  <span aria-hidden="true">{initials}</span>
                  <div><strong>{fullName}</strong><small>{staffProfile.displayRole}</small></div>
                </header>
                <div className="profile-menu-role"><UserRound size={15} aria-hidden="true" /><span>Signed in as staff</span></div>
                <div className="profile-menu-actions" role="menu">
                  <button ref={logoutRef} role="menuitem" onClick={logout} disabled={loggingOut}>
                    <LogOut size={15} aria-hidden="true" />
                    <span>{loggingOut ? "Signing out…" : "Sign out"}</span>
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>

    {mobileOpen && <><button className="sheet-overlay" onClick={() => setMobileOpen(false)} aria-label="Close navigation" /><aside className="mobile-sheet" aria-label="Mobile navigation">
      <div className="sheet-head"><Brand /><button className="icon-button inverse" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button></div>
      <Navigation collapsed={false} pathname={pathname} onNavigate={() => setMobileOpen(false)} permissions={permissions} />
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
