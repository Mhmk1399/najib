"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Boxes,
  CalendarDays,
  ChevronDown,
  Crown,
  Grid2X2,
  Headphones,
  LogOut,
  Mail,
  Menu,
  Moon,
  Package,
  RotateCcw,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sun,
  Tags,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  AdminAuthProvider,
  type AdminStaffProfile,
} from "@/components/admin/admin-auth-context";
import { Button } from "@/components/ui/Button";
import { CustomInput } from "@/components/ui/CustomInput";

type ThemeMode = "dark" | "light";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type AdminShellProps = {
  children: ReactNode;
  staff?: AdminStaffProfile;
};

const PRIMARY_NAV: NavItem[] = [
  { label: "داشبورد", href: "/admin", icon: Grid2X2 },
  { label: "محصولات", href: "/admin/catalog/products", icon: Package },
  { label: "دسته‌بندی‌ها", href: "/admin/categories", icon: Boxes },
  { label: "سفارشات", href: "/admin/orders", icon: ShoppingCart },
  { label: "مشتریان", href: "/admin/customers", icon: Users },
  { label: "انبار", href: "/admin/inventory", icon: ShoppingBag },
  { label: "مرجوعی‌ها", href: "/admin/returns", icon: RotateCcw },
  { label: "تخفیف‌ها", href: "/admin/discounts", icon: Tags },
  { label: "گزارشات", href: "/admin/reports", icon: BarChart3 },
];

const SECONDARY_NAV: NavItem[] = [
  { label: "تنظیمات", href: "/admin/settings", icon: Settings },
  { label: "کاربران", href: "/admin/users", icon: Users },
  { label: "پشتیبانی", href: "/admin/support", icon: Headphones },
];

function useTehranClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  return useMemo(() => {
    if (!now) {
      return { date: "در حال دریافت تاریخ…", time: "--:--" };
    }

    const date = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      timeZone: "Asia/Tehran",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(now);

    const time = new Intl.DateTimeFormat("fa-IR", {
      timeZone: "Asia/Tehran",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);

    return { date, time };
  }, [now]);
}

export function AdminShell({ children, staff }: AdminShellProps) {
  const pathname = usePathname();
  const clock = useTehranClock();
  const staffProfile = staff ?? FALLBACK_STAFF;
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    try {
      const saved = localStorage.getItem("najib-admin-theme");
      if (saved === "light" || saved === "dark") return saved;
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch {
      return "dark";
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem("najib-admin-theme", theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (logoutOpen) {
        setLogoutOpen(false);
        return;
      }
      if (mobileOpen) {
        setMobileOpen(false);
        requestAnimationFrame(() => menuButtonRef.current?.focus());
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [logoutOpen, mobileOpen]);

  return (
    <AdminAuthProvider staff={staffProfile}>
      <div
        dir="rtl"
        data-theme={theme}
        className="group/admin h-dvh overflow-hidden bg-[#080c10]       text-[#f5f3ee] antialiased selection:bg-[#a87552]/40 group-data-[theme=light]/admin:bg-[#ddd9d2] group-data-[theme=light]/admin:text-[#1d1c1a]"
      >
        <div className="flex h-full min-w-0 flex-row">
          <aside className="relative order-1 hidden h-dvh w-[238px] shrink-0 overflow-hidden border-r border-white/[0.075] bg-[#090d11] xl:flex 2xl:w-[252px] group-data-[theme=light]/admin:border-black/[0.08] group-data-[theme=light]/admin:bg-[#e9e5de]">
            <Sidebar
              pathname={pathname}
              onLogout={() => setLogoutOpen(true)}
              onNavigate={() => undefined}
            />
          </aside>

          <div className="order-2 flex min-w-0 flex-1 flex-col">
            <Topbar
              clock={clock}
              staff={staffProfile}
              theme={theme}
              menuButtonRef={menuButtonRef}
              onOpenMenu={() => setMobileOpen(true)}
              onToggleTheme={() =>
                setTheme((current) => (current === "dark" ? "light" : "dark"))
              }
              onRequestLogout={() => setLogoutOpen(true)}
            />

            <main
              dir="rtl"
              data-lenis-prevent
              data-lenis-prevent-wheel
              data-lenis-prevent-touch
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[#080c10] [scrollbar-gutter:stable] [scrollbar-width:thin] group-data-[theme=light]/admin:bg-[#ddd9d2]"
            >
              {children}
            </main>
          </div>
        </div>

        <MobileSidebar
          open={mobileOpen}
          pathname={pathname}
          onClose={() => {
            setMobileOpen(false);
            requestAnimationFrame(() => menuButtonRef.current?.focus());
          }}
          onLogout={() => {
            setMobileOpen(false);
            setLogoutOpen(true);
          }}
        />

        <LogoutModal open={logoutOpen} onClose={() => setLogoutOpen(false)} />
      </div>
    </AdminAuthProvider>
  );
}

function Topbar({
  clock,
  staff,
  theme,
  menuButtonRef,
  onOpenMenu,
  onToggleTheme,
  onRequestLogout,
}: {
  clock: { date: string; time: string };
  staff: AdminStaffProfile;
  theme: ThemeMode;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
  onOpenMenu: () => void;
  onToggleTheme: () => void;
  onRequestLogout: () => void;
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!profileOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const node = profileMenuRef.current;
      if (!node || node.contains(event.target as Node)) return;
      setProfileOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [profileOpen]);

  return (
    <header className="relative z-40 h-[72px] shrink-0 border-b border-white/[0.075] bg-[#090d11]/95 backdrop-blur-xl group-data-[theme=light]/admin:border-black/[0.08] group-data-[theme=light]/admin:bg-[#e9e5de]/95">
      <div
        dir="ltr"
        className="flex h-full min-w-0 items-center gap-3 px-3 sm:px-4 lg:px-5"
      >
        {/* LEFT: utility controls. Theme stays only here in the header. */}
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            iconOnly
            icon={theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            aria-label={
              theme === "dark" ? "فعال کردن تم روشن" : "فعال کردن تم تیره"
            }
            onClick={onToggleTheme}
            className="!size-10 !border-white/[0.085] !bg-white/[0.02] !text-white/58 hover:!border-white/[0.14] hover:!bg-white/[0.045] hover:!text-white group-data-[theme=light]/admin:!border-black/[0.09] group-data-[theme=light]/admin:!bg-black/[0.02] group-data-[theme=light]/admin:!text-black/58"
          />

          <HeaderIcon label="اعلان‌ها" badge>
            <Bell size={17} strokeWidth={1.45} />
          </HeaderIcon>

          <HeaderIcon label="پیام‌ها">
            <Mail size={17} strokeWidth={1.45} />
          </HeaderIcon>

          <div
            dir="rtl"
            className="hidden h-10 items-center gap-3 border border-white/[0.075] bg-white/[0.02] px-3 md:flex group-data-[theme=light]/admin:border-black/[0.08] group-data-[theme=light]/admin:bg-black/[0.02]"
          >
            <CalendarDays
              size={15}
              className="text-[#b08466]"
              strokeWidth={1.45}
            />
            <div className="text-right">
              <p className="text-[10px] font-medium text-white/78 group-data-[theme=light]/admin:text-black/72">
                {clock.date}
              </p>
              <p className="mt-0.5 text-[8px] text-white/32 group-data-[theme=light]/admin:text-black/42">
                ساعت {clock.time} · تهران
              </p>
            </div>
          </div>
        </div>

        {/* CENTER: canonical search input from the project UI kit. */}
        <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          <div dir="rtl" className="w-full max-w-[560px]">
            <CustomInput
              id="admin-global-search"
              name="adminSearch"
              type="search"
              placeholder="جستجو در محصولات، سفارش‌ها، مشتریان ..."
              inputSize="sm"
              tone={theme === "dark" ? "dark" : "light"}
              leadingIcon={<Search size={16} strokeWidth={1.45} />}
              clearable
              inputClassName="!text-right !text-[11px] !tracking-normal"
            />
          </div>
        </div>

        {/* RIGHT: user identity and mobile navigation. */}
        <div dir="rtl" className="ml-auto flex shrink-0 items-center gap-2">
          <ProfileDropdown
            refContainer={profileMenuRef}
            staff={staff}
            open={profileOpen}
            onToggle={() => setProfileOpen((current) => !current)}
            onLogout={() => {
              setProfileOpen(false);
              onRequestLogout();
            }}
          />

          <button
            ref={menuButtonRef}
            type="button"
            onClick={onOpenMenu}
            aria-label="باز کردن منوی مدیریت"
            className="grid size-10 place-items-center border border-white/[0.085] bg-white/[0.025] text-white/66 transition-colors hover:bg-white/[0.055] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9d7357]/40 group-data-[theme=light]/admin:border-black/[0.09] group-data-[theme=light]/admin:bg-black/[0.025] group-data-[theme=light]/admin:text-black/64 xl:hidden"
          >
            <Menu size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}

function ProfileDropdown({
  refContainer,
  staff,
  open,
  onToggle,
  onLogout,
}: {
  refContainer: React.RefObject<HTMLDivElement | null>;
  staff: AdminStaffProfile;
  open: boolean;
  onToggle: () => void;
  onLogout: () => void;
}) {
  const fullName =
    `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim() || "Admin";

  return (
    <div ref={refContainer} className="relative">
      <Button
        type="button"
        variant="outline"
        size="md"
        uppercase={false}
        aria-label="باز کردن منوی کاربر"
        onClick={onToggle}
        align="center"
        className="!min-h-11 !gap-2.5 !border-white/[0.085] !bg-white/[0.025] !px-1.5 !pr-1.5 !pl-3 !tracking-normal !text-white/86 hover:!border-white/[0.15] hover:!bg-white/[0.045] hover:!text-white group-data-[theme=light]/admin:!border-black/[0.09] group-data-[theme=light]/admin:!bg-black/[0.025] group-data-[theme=light]/admin:!text-black/82"
      >
        <span className="relative size-9 overflow-hidden border border-white/12 bg-[#222] group-data-[theme=light]/admin:border-black/10">
          <Image
            src="/assets/images/suit.webp"
            alt={fullName}
            fill
            sizes="36px"
            className="object-cover object-[35%_25%]"
          />
        </span>

        <span className="hidden min-w-0 text-right sm:block">
          <strong className="block max-w-[110px] truncate text-[10px] font-semibold">
            {fullName}
          </strong>
          <small className="mt-0.5 block text-[7px] text-white/34 group-data-[theme=light]/admin:text-black/42">
            {staff.displayRole}
          </small>
        </span>

        <ChevronDown
          size={13}
          className={`hidden text-white/28 transition-transform duration-200 sm:block group-data-[theme=light]/admin:text-black/32 ${
            open ? "rotate-180" : ""
          }`}
        />
      </Button>

      <div
        role="menu"
        aria-hidden={!open}
        className={`absolute right-0 top-[calc(100%+10px)] z-[80] w-[286px] border border-white/[0.10] bg-[#0c1117] p-3 shadow-[0_26px_70px_-28px_rgba(0,0,0,0.96)] transition-[opacity,transform] duration-180 group-data-[theme=light]/admin:border-black/[0.10] group-data-[theme=light]/admin:bg-[#f0ede7] ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        <div className="flex items-center gap-3 border-b border-white/[0.075] pb-3 group-data-[theme=light]/admin:border-black/[0.08]">
          <span className="relative size-12 shrink-0 overflow-hidden border border-white/[0.10] bg-[#222] group-data-[theme=light]/admin:border-black/[0.10]">
            <Image
              src="/assets/images/suit.webp"
              alt={fullName}
              fill
              sizes="48px"
              className="object-cover object-[35%_25%]"
            />
          </span>

          <div className="min-w-0 flex-1 text-right">
            <strong className="block truncate text-[12px] font-semibold text-white/88 group-data-[theme=light]/admin:text-black/84">
              {fullName}
            </strong>
            <span className="mt-1 block truncate text-[8px] text-white/38 group-data-[theme=light]/admin:text-black/46">
              {staff.displayRole}
            </span>
          </div>
        </div>

        <div className="pt-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            fullWidth
            uppercase={false}
            icon={<LogOut size={15} strokeWidth={1.45} />}
            iconPosition="right"
            onClick={onLogout}
            className="!justify-center !gap-2 !border-[#a7554c]/30 !bg-[#a7554c]/[0.06] !tracking-normal !text-[#df8178] hover:!border-[#a7554c]/50 hover:!bg-[#a7554c]/[0.12] hover:!text-[#f0aaa4]"
          >
            خروج از حساب
          </Button>
        </div>
      </div>
    </div>
  );
}

function HeaderIcon({
  children,
  label,
  badge = false,
}: {
  children: ReactNode;
  label: string;
  badge?: boolean;
}) {
  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="md"
        iconOnly
        icon={children}
        aria-label={label}
        className="!size-10 !border-white/[0.075] !bg-white/[0.02] !text-white/52 hover:!border-white/[0.13] hover:!bg-white/[0.045] hover:!text-white group-data-[theme=light]/admin:!border-black/[0.08] group-data-[theme=light]/admin:!bg-black/[0.02] group-data-[theme=light]/admin:!text-black/54"
      />
      {badge ? (
        <span className="pointer-events-none absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#92654a] text-[7px] font-bold text-white">
          3
        </span>
      ) : null}
    </div>
  );
}

function Sidebar({
  pathname,
  onLogout,
  onNavigate,
}: {
  pathname: string;
  onLogout: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[245px] overflow-hidden opacity-[0.16] group-data-[theme=light]/admin:opacity-[0.08]"
      >
        <Image
          src="/assets/images/suit.webp"
          alt=""
          fill
          sizes="252px"
          className="object-cover object-[42%_22%] grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#090d11]/15 via-[#090d11]/72 to-[#090d11] group-data-[theme=light]/admin:from-[#e9e5de]/20 group-data-[theme=light]/admin:via-[#e9e5de]/78 group-data-[theme=light]/admin:to-[#e9e5de]" />
      </div>

      <div className="relative z-10 flex h-[76px] shrink-0 items-center justify-center border-b border-white/[0.075] px-5 group-data-[theme=light]/admin:border-black/[0.08]">
        <Link
          href="/admin"
          aria-label="Najibzadeh Admin"
          className="group/brand flex items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-[#9d7357]/40"
        >
          <span className="text-right">
            <strong className="block text-[15px] font-semibold tracking-[0.23em] text-[#eee9e2] group-data-[theme=light]/admin:text-[#25221f]">
              NAJIBZADEH
            </strong>
            <small className="mt-1 block text-[5px] font-medium uppercase tracking-[0.34em] text-[#a98368]">
              Modern Menswear
            </small>
          </span>
          <span className="grid size-10 place-items-center rounded-[3px] border border-white/[0.11] bg-black/30 text-[18px] font-bold text-[#eee9e2] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] group-data-[theme=light]/admin:border-black/[0.10] group-data-[theme=light]/admin:bg-black/[0.04] group-data-[theme=light]/admin:text-[#25221f]">
            N
          </span>
        </Link>
      </div>

      <nav
        aria-label="ناوبری مدیریت"
        data-lenis-prevent
        data-lenis-prevent-wheel
        data-lenis-prevent-touch
        className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 [scrollbar-width:thin]"
      >
        <div className="space-y-1">
          {PRIMARY_NAV.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              active={isNavActive(pathname, item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        <div className="my-4 h-px bg-white/[0.07] group-data-[theme=light]/admin:bg-black/[0.075]" />

        <div className="space-y-1">
          {SECONDARY_NAV.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              active={isNavActive(pathname, item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          fullWidth
          uppercase={false}
          icon={<LogOut size={16} strokeWidth={1.4} />}
          iconPosition="right"
          onClick={onLogout}
          className="!mt-1 !h-[42px] !justify-between !border-transparent !px-3.5 !text-[10px] !tracking-normal !text-white/46 hover:!border-[#a7554c]/25 hover:!bg-[#a7554c]/8 hover:!text-[#df8178] group-data-[theme=light]/admin:!text-black/52"
        >
          خروج
        </Button>
      </nav>

      <div className="relative z-10 shrink-0 border-t border-white/[0.075] px-5 py-5 text-center group-data-[theme=light]/admin:border-black/[0.08]">
        <Crown
          size={14}
          strokeWidth={1.35}
          className="mx-auto text-[#9d7357]"
        />
        <p className="mt-2 text-[6px] font-medium uppercase tracking-[0.28em] text-white/30 group-data-[theme=light]/admin:text-black/34">
          Premium Menswear
        </p>
        <p className="mt-1 text-[5px] uppercase tracking-[0.25em] text-[#9d7357]/75">
          For a higher standard
        </p>
      </div>
    </div>
  );
}

function SidebarLink({
  item,
  active,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`group/nav relative flex h-[42px] items-center justify-between rounded-[3px] border px-3.5 text-[10px] font-medium transition-[background-color,border-color,color,box-shadow,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9d7357]/40 ${
        active
          ? "border-[#a87959]/60 bg-[linear-gradient(90deg,rgba(157,104,70,0.48),rgba(157,104,70,0.24))] text-[#f4ede7] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_28px_-18px_rgba(141,93,62,0.9)] group-data-[theme=light]/admin:text-[#2b241f]"
          : "border-transparent text-white/52 hover:translate-x-[-1px] hover:border-white/[0.075] hover:bg-white/[0.035] hover:text-white/88 group-data-[theme=light]/admin:text-black/56 group-data-[theme=light]/admin:hover:border-black/[0.075] group-data-[theme=light]/admin:hover:bg-black/[0.03] group-data-[theme=light]/admin:hover:text-black/86"
      }`}
    >
      <span>{item.label}</span>
      <Icon
        size={16}
        strokeWidth={1.4}
        className={active ? "text-[#d0a181]" : "text-current"}
      />
    </Link>
  );
}

const FALLBACK_STAFF: AdminStaffProfile = {
  firstName: "Najib",
  lastName: "Admin",
  displayRole: "Admin",
  roles: [],
  permissions: [],
};

function isNavActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === href;
  return pathname.startsWith(href);
}

function MobileSidebar({
  open,
  pathname,
  onClose,
  onLogout,
}: {
  open: boolean;
  pathname: string;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-[1200] xl:hidden ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="بستن منو"
        onClick={onClose}
        className={`absolute inset-0 bg-black/64 backdrop-blur-[3px] transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="منوی مدیریت"
        data-lenis-prevent
        data-lenis-prevent-wheel
        data-lenis-prevent-touch
        className={`absolute inset-y-0 right-0 flex w-[min(88vw,330px)] flex-col overflow-hidden border-l border-white/[0.09] bg-[#090d11] shadow-[-28px_0_90px_-36px_rgba(0,0,0,0.92)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[theme=light]/admin:border-black/[0.09] group-data-[theme=light]/admin:bg-[#e9e5de] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="absolute left-3 top-3 z-20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            iconOnly
            icon={<X size={17} />}
            onClick={onClose}
            aria-label="بستن منو"
            className="!size-9 !border-white/[0.09] !bg-white/[0.025] !text-white/58 group-data-[theme=light]/admin:!border-black/[0.09] group-data-[theme=light]/admin:!bg-black/[0.025] group-data-[theme=light]/admin:!text-black/58"
          />
        </div>
        <Sidebar pathname={pathname} onLogout={onLogout} onNavigate={onClose} />
      </aside>
    </div>
  );
}

function LogoutModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => cancelRef.current?.focus());
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-logout-title"
      data-lenis-prevent
      data-lenis-prevent-wheel
      data-lenis-prevent-touch
      className="fixed inset-0 z-[2000] grid place-items-center bg-black/68 px-4 backdrop-blur-[4px]"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section className="w-full max-w-[420px] overflow-hidden rounded-[4px] border border-white/[0.11] bg-[#10151b] shadow-[0_38px_100px_-28px_rgba(0,0,0,0.95)] group-data-[theme=light]/admin:border-black/[0.10] group-data-[theme=light]/admin:bg-[#f0ede7]">
        <header className="flex items-start justify-between gap-5 border-b border-white/[0.075] px-6 py-5 group-data-[theme=light]/admin:border-black/[0.08]">
          <div className="text-right">
            <p className="text-[7px] font-semibold uppercase tracking-[0.19em] text-[#9d7357]">
              Account Session
            </p>
            <h2
              id="admin-logout-title"
              className="mt-2 text-[20px] font-bold text-white group-data-[theme=light]/admin:text-[#24211e]"
            >
              خروج از حساب؟
            </h2>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            iconOnly
            icon={<X size={16} />}
            onClick={onClose}
            aria-label="بستن"
            className="!size-9 !border-white/[0.09] !bg-transparent !text-white/44 hover:!bg-white/[0.04] hover:!text-white group-data-[theme=light]/admin:!border-black/[0.09] group-data-[theme=light]/admin:!text-black/48"
          />
        </header>

        <div className="px-6 py-5 text-right">
          <p className="text-[11px] leading-7 text-white/52 group-data-[theme=light]/admin:text-black/58">
            آیا مطمئن هستید که می‌خواهید از پنل مدیریت خارج شوید؟ این نسخه فقط
            رابط کاربری است و هیچ درخواست شبکه‌ای ارسال نمی‌کند.
          </p>
        </div>

        <footer className="grid grid-cols-2 gap-2 border-t border-white/[0.075] p-4 group-data-[theme=light]/admin:border-black/[0.08]">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            className="h-11 rounded-[3px] border border-white/[0.09] bg-white/[0.02] text-[10px] font-semibold text-white/64 transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/18 group-data-[theme=light]/admin:border-black/[0.09] group-data-[theme=light]/admin:bg-black/[0.02] group-data-[theme=light]/admin:text-black/62"
          >
            انصراف
          </button>
          <Button
            type="button"
            variant="outline"
            size="md"
            fullWidth
            uppercase={false}
            onClick={onClose}
            className="!h-11 !justify-center !border-[#a5574f]/35 !bg-[#a5574f]/12 !tracking-normal !text-[#df8178] hover:!border-[#a5574f]/50 hover:!bg-[#a5574f]/18 hover:!text-[#ef9b93]"
          >
            خروج از حساب
          </Button>
        </footer>
      </section>
    </div>
  );
}
