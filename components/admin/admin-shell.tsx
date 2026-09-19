"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  CalendarDays,
  ChevronsUpDown,
  Crown,
  Grid2X2,
  Images,
  LogOut,
  Menu,
  Moon,
  Package,
  Warehouse,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
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

type ThemeMode = "dark" | "light";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
};

type AdminShellProps = {
  children: ReactNode;
  staff?: AdminStaffProfile;
};

const PRIMARY_NAV: NavItem[] = [
  { label: "داشبورد", href: "/admin", icon: Grid2X2 },
  { label: "محصولات", href: "/admin/catalog/products", icon: Package },
  { label: "دسته‌بندی‌ها", href: "/admin/categories", icon: Boxes },
  { label: "تصاویر و استایل‌ها", href: "/admin/catalog/images", icon: Images },
  {
    label: "اطلاعات پایه کاتالوگ",
    href: "/admin/catalog/references",
    icon: SlidersHorizontal,
  },
  {
    label: "مدیریت موجودی",
    href: "/admin/inventory",
    icon: Warehouse,
    permission: "inventory.read",
  },
];

const USERS_NAV: NavItem = {
  label: "کاربران",
  href: "/admin/users",
  icon: Users,
};

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
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [themePreferenceReady, setThemePreferenceReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const logoutOpenerRef = useRef<HTMLElement | null>(null);
  const currentSection = useMemo(
    () =>
      [...PRIMARY_NAV, USERS_NAV].find((item) =>
        isNavActive(pathname, item.href),
      )?.label ?? "پنل مدیریت",
    [pathname],
  );

  useEffect(() => {
    let preferred: ThemeMode = "dark";
    try {
      const saved = localStorage.getItem("najib-admin-theme");
      if (saved === "light" || saved === "dark") {
        preferred = saved;
      } else if (!window.matchMedia("(prefers-color-scheme: dark)").matches) {
        preferred = "light";
      }
    } catch {}

    const frame = requestAnimationFrame(() => {
      setTheme(preferred);
      setThemePreferenceReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const requestLogout = () => {
    logoutOpenerRef.current = document.activeElement as HTMLElement | null;
    setLogoutOpen(true);
  };

  const closeLogout = () => {
    setLogoutOpen(false);
    requestAnimationFrame(() => logoutOpenerRef.current?.focus());
  };

  useEffect(() => {
    if (!themePreferenceReady) return;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem("najib-admin-theme", theme);
    } catch {}
  }, [theme, themePreferenceReady]);

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
        className="admin-workspace-shell group/admin h-dvh overflow-hidden bg-[var(--admin-shell-canvas)] text-[var(--admin-shell-text)] antialiased selection:bg-[var(--admin-shell-accent)]/35"
      >
        <div className="flex h-full min-w-0 flex-row">
          <aside className="admin-desktop-rail group/sidebar relative z-[60] order-1 hidden h-dvh w-[76px] shrink-0 xl:block">
            <div className="admin-desktop-rail__panel absolute inset-y-0 right-0 w-[76px] overflow-hidden border-l border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)]">
              <Sidebar
                pathname={pathname}
                staff={staffProfile}
                imagePriority
                rail
                onLogout={requestLogout}
                onNavigate={() => undefined}
              />
            </div>
          </aside>

          <div className="order-2 flex min-w-0 flex-1 flex-col">
            <Topbar
              clock={clock}
              currentSection={currentSection}
              staff={staffProfile}
              theme={theme}
              menuButtonRef={menuButtonRef}
              onOpenMenu={() => setMobileOpen(true)}
              onToggleTheme={() =>
                setTheme((current) => (current === "dark" ? "light" : "dark"))
              }
              onRequestLogout={requestLogout}
            />

            <main
              dir="rtl"
              data-lenis-prevent
              data-lenis-prevent-wheel
              data-lenis-prevent-touch
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-[var(--admin-shell-canvas)] [scrollbar-gutter:stable]"
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
            requestLogout();
          }}
          staff={staffProfile}
        />

        <LogoutModal open={logoutOpen} onClose={closeLogout} />
      </div>
    </AdminAuthProvider>
  );
}

function Topbar({
  clock,
  currentSection,
  staff,
  theme,
  menuButtonRef,
  onOpenMenu,
  onToggleTheme,
  onRequestLogout,
}: {
  clock: { date: string; time: string };
  currentSection: string;
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
    <header className="relative z-40 h-[68px] shrink-0 border-b border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)]/95 backdrop-blur-xl">
      <div className="flex h-full min-w-0 items-center gap-2.5 px-3 sm:px-4 lg:px-5">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={onOpenMenu}
          aria-label="باز کردن منوی مدیریت"
          className="grid size-10 shrink-0 cursor-pointer place-items-center border border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-control)] text-[var(--admin-shell-muted)] transition-colors hover:border-[var(--admin-shell-accent)]/45 hover:bg-[var(--admin-shell-control-hover)] hover:text-[var(--admin-shell-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/35 xl:hidden"
        >
          <Menu size={18} strokeWidth={1.55} />
        </button>

        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="h-7 w-0.5 shrink-0 bg-[var(--admin-shell-accent)]"
          />
          <div className="min-w-0 text-right">
            <span className="block text-[7px] font-semibold text-[var(--admin-shell-accent-soft)]">
              فضای مدیریت
            </span>
            <strong className="mt-1 block max-w-[180px] truncate text-[11px] font-bold text-[var(--admin-shell-text)] sm:max-w-[260px]">
              {currentSection}
            </strong>
          </div>
        </div>

        <div className="min-w-0 flex-1" />

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden h-10 items-center gap-3 border-l border-[var(--admin-shell-border)] px-3 md:flex">
            <CalendarDays
              size={15}
              className="text-[var(--admin-shell-accent-soft)]"
              strokeWidth={1.45}
            />
            <div className="text-right">
              <p className="text-[9px] font-medium text-[var(--admin-shell-text)]">
                {clock.date}
              </p>
              <p className="mt-0.5 text-[7px] text-[var(--admin-shell-subtle)]">
                ساعت {clock.time} · تهران
              </p>
            </div>
          </div>

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
            className="!size-10 !border-[var(--admin-shell-border-strong)] !bg-[var(--admin-shell-control)] !text-[var(--admin-shell-muted)] hover:!border-[var(--admin-shell-accent)]/45 hover:!bg-[var(--admin-shell-control-hover)] hover:!text-[var(--admin-shell-text)]"
          />

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
    `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim() || "کاربر مدیریت";
  const initials =
    `${staff.firstName?.charAt(0) ?? ""}${staff.lastName?.charAt(0) ?? ""}`.trim() ||
    "N";

  return (
    <div ref={refContainer} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="admin-profile-menu"
        aria-label={open ? "بستن منوی کاربر" : "باز کردن منوی کاربر"}
        onClick={onToggle}
        className="group/profile flex h-11 cursor-pointer items-center gap-2 border border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-control)] p-1 pl-1.5 pr-1 text-[var(--admin-shell-text)] outline-none transition-[background-color,border-color] hover:border-[var(--admin-shell-accent)]/45 hover:bg-[var(--admin-shell-control-hover)] focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/35"
      >
        <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden border border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-text)] text-[10px] font-extrabold text-[var(--admin-shell-panel)]">
          {initials}
          <span
            aria-hidden="true"
            className="absolute bottom-0.5 right-0.5 size-1.5 rounded-full bg-[#58a67b] ring-2 ring-[var(--admin-shell-panel)]"
          />
        </span>

        <span className="hidden min-w-0 px-1 text-right md:block">
          <strong className="block max-w-[118px] truncate text-[9px] font-bold">
            {fullName}
          </strong>
          <small className="mt-1 block max-w-[118px] truncate text-[7px] text-[var(--admin-shell-subtle)]">
            {staff.displayRole}
          </small>
        </span>

        <span className="grid size-7 shrink-0 place-items-center border-r border-[var(--admin-shell-border)] text-[var(--admin-shell-subtle)] transition-colors group-hover/profile:text-[var(--admin-shell-accent-soft)]">
          <ChevronsUpDown size={13} strokeWidth={1.6} />
        </span>
      </button>

      {open ? (
        <div
          id="admin-profile-menu"
          role="menu"
          className="admin-profile-menu absolute left-0 top-[calc(100%+9px)] z-[80] w-[292px] border border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-raised)] p-2.5 shadow-[0_26px_70px_-28px_rgba(0,0,0,0.72)]"
        >
          <div className="flex items-center gap-3 border-b border-[var(--admin-shell-border)] p-2 pb-3">
            <span className="grid size-11 shrink-0 place-items-center border border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-text)] text-[12px] font-extrabold text-[var(--admin-shell-panel)]">
              {initials}
            </span>

            <div className="min-w-0 flex-1 text-right">
              <span className="mb-1 block text-[6px] font-semibold text-[var(--admin-shell-accent-soft)]">
                حساب مدیریت
              </span>
              <strong className="block truncate text-[11px] font-bold text-[var(--admin-shell-text)]">
                {fullName}
              </strong>
              <span className="mt-1 block truncate text-[8px] text-[var(--admin-shell-subtle)]">
                {staff.displayRole}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 border-b border-[var(--admin-shell-border)] px-2 py-3 text-[8px] text-[var(--admin-shell-muted)]">
            <ShieldCheck
              size={15}
              strokeWidth={1.5}
              className="text-[#58a67b]"
            />
            <span>نشست امن و فعال</span>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="mt-2 flex h-10 w-full cursor-pointer items-center justify-between border border-transparent px-3 text-[9px] font-semibold text-[#d8766d] outline-none transition-colors hover:border-[#a7554c]/35 hover:bg-[#a7554c]/10 hover:text-[#efa39b] focus-visible:ring-2 focus-visible:ring-[#a7554c]/35"
          >
            <span>خروج از حساب</span>
            <LogOut size={15} strokeWidth={1.5} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Sidebar({
  pathname,
  staff,
  imagePriority = false,
  rail = false,
  onLogout,
  onNavigate,
}: {
  pathname: string;
  staff: AdminStaffProfile;
  imagePriority?: boolean;
  rail?: boolean;
  onLogout: () => void;
  onNavigate: () => void;
}) {
  return (
    <div
      className={`admin-sidebar relative flex h-full min-h-0 w-full flex-col overflow-hidden ${
        rail ? "admin-sidebar--rail" : ""
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[220px] overflow-hidden opacity-[0.12]"
      >
        <Image
          src="/assets/images/suit.webp"
          alt=""
          fill
          priority={imagePriority}
          sizes="252px"
          className="object-cover object-[42%_18%] grayscale"
        />
        <div className="absolute inset-0 bg-[var(--admin-shell-brand-wash)]" />
      </div>

      <div className="relative z-10 flex h-[68px] shrink-0 items-center border-b border-[var(--admin-shell-border)] px-[17px]">
        <Link
          href="/admin"
          aria-label="پنل مدیریت نجیب‌زاده"
          className="admin-sidebar-brand flex min-w-0 items-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/40"
        >
          <span className="admin-sidebar-brand__mark grid size-10 shrink-0 place-items-center rounded-[3px] border border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-control)] text-[17px] font-extrabold text-[var(--admin-shell-text)] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            N
          </span>
          <span className="admin-sidebar-brand__copy min-w-0 text-right">
            <strong className="block whitespace-nowrap text-[13px] font-semibold tracking-[0.2em] text-[var(--admin-shell-text)]">
              NAJIBZADEH
            </strong>
            <small className="mt-1 block whitespace-nowrap text-[5px] font-semibold tracking-[0.3em] text-[var(--admin-shell-accent-soft)]">
              Atelier Operations
            </small>
          </span>
        </Link>
      </div>

      <nav
        aria-label="ناوبری مدیریت"
        data-lenis-prevent
        data-lenis-prevent-wheel
        data-lenis-prevent-touch
        className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4"
      >
        <p className="admin-sidebar-section-label mb-2 px-2 text-[6px] font-semibold text-[var(--admin-shell-subtle)]">
          ناوبری اصلی
        </p>
        <div className="space-y-1">
          {PRIMARY_NAV.filter(
            (item) => !item.permission || staff.permissions?.includes(item.permission),
          ).map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              active={isNavActive(pathname, item.href)}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        <div className="my-4 h-px bg-[var(--admin-shell-border)]" />

        {staff.permissions?.includes("staff.manage") ? (
          <SidebarLink
            item={USERS_NAV}
            active={isNavActive(pathname, "/admin/users")}
            onNavigate={onNavigate}
          />
        ) : null}

        <button
          type="button"
          onClick={onLogout}
          className="admin-sidebar-link admin-sidebar-logout mt-1 flex h-11 w-full cursor-pointer items-center gap-3 border border-transparent px-3 text-[9px] font-semibold text-[var(--admin-shell-muted)] outline-none transition-colors hover:border-[#a7554c]/30 hover:bg-[#a7554c]/10 hover:text-[#df8178] focus-visible:ring-2 focus-visible:ring-[#a7554c]/35"
        >
          <span className="admin-sidebar-link__icon grid size-6 shrink-0 place-items-center">
            <LogOut size={16} strokeWidth={1.5} />
          </span>
          <span className="admin-sidebar-link__label whitespace-nowrap">
            خروج از حساب
          </span>
        </button>
      </nav>

      <div className="admin-sidebar-footer relative z-10 flex h-[68px] shrink-0 items-center gap-3 border-t border-[var(--admin-shell-border)] px-[22px]">
        <Crown size={15} strokeWidth={1.4} className="shrink-0 text-[var(--admin-shell-accent-soft)]" />
        <span className="admin-sidebar-footer__copy min-w-0 text-right">
          <strong className="block whitespace-nowrap text-[7px] font-semibold text-[var(--admin-shell-muted)]">
            مدیریت نجیب‌زاده
          </strong>
          <small className="mt-1 block whitespace-nowrap text-[5px] text-[var(--admin-shell-accent-soft)]">
            فضای امن کارکنان
          </small>
        </span>
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
      className={`admin-sidebar-link group/nav relative flex h-11 items-center gap-3 rounded-[3px] border px-3 text-[9px] font-semibold outline-none transition-[background-color,border-color,color] focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/40 ${
        active
          ? "border-[var(--admin-shell-active-border)] bg-[var(--admin-shell-active)] text-[var(--admin-shell-text)]"
          : "border-transparent text-[var(--admin-shell-muted)] hover:border-[var(--admin-shell-border)] hover:bg-[var(--admin-shell-control-hover)] hover:text-[var(--admin-shell-text)]"
      }`}
    >
      {active ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-2 right-0 w-0.5 bg-[var(--admin-shell-accent)]"
        />
      ) : null}
      <span className="admin-sidebar-link__icon grid size-6 shrink-0 place-items-center">
        <Icon
          size={16}
          strokeWidth={1.5}
          className={
            active ? "text-[var(--admin-shell-accent-soft)]" : "text-current"
          }
        />
      </span>
      <span className="admin-sidebar-link__label whitespace-nowrap">
        {item.label}
      </span>
    </Link>
  );
}

const FALLBACK_STAFF: AdminStaffProfile = {
  firstName: "کاربر",
  lastName: "مدیریت",
  displayRole: "همکار مدیریت",
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
  staff,
  onClose,
  onLogout,
}: {
  open: boolean;
  pathname: string;
  staff: AdminStaffProfile;
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
        className={`absolute inset-y-0 right-0 flex w-[min(88vw,330px)] flex-col overflow-hidden border-l border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-panel)] shadow-[-28px_0_90px_-36px_rgba(0,0,0,0.72)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
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
            className="!size-9 !border-[var(--admin-shell-border-strong)] !bg-[var(--admin-shell-control)] !text-[var(--admin-shell-muted)] hover:!bg-[var(--admin-shell-control-hover)] hover:!text-[var(--admin-shell-text)]"
          />
        </div>
        <Sidebar
          staff={staff}
          pathname={pathname}
          onLogout={onLogout}
          onNavigate={onClose}
        />
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
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => cancelRef.current?.focus());
  }, [open]);

  if (!open) return null;

  const logout = async () => {
    if (pending) return;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("logout_failed");
      router.replace("/auth?mode=login");
      router.refresh();
    } catch {
      setError("خروج انجام نشد. اتصال خود را بررسی و دوباره تلاش کنید.");
      setPending(false);
    }
  };

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
              نشست کاربری
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
            آیا مطمئن هستید که می‌خواهید از پنل مدیریت خارج شوید؟ نشست امن شما
            پایان می‌یابد و برای ورود دوباره باید رمز عبور را وارد کنید.
          </p>
          {error ? <p role="alert" className="mt-3 text-[11px] text-[#df8178]">{error}</p> : null}
        </div>

        <footer className="grid grid-cols-2 gap-2 border-t border-white/[0.075] p-4 group-data-[theme=light]/admin:border-black/[0.08]">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            disabled={pending}
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
            onClick={() => void logout()}
            loading={pending}
            disabled={pending}
            className="!h-11 !justify-center !border-[#a5574f]/35 !bg-[#a5574f]/12 !tracking-normal !text-[#df8178] hover:!border-[#a5574f]/50 hover:!bg-[#a5574f]/18 hover:!text-[#ef9b93]"
          >
            {pending ? "در حال خروج…" : "خروج از حساب"}
          </Button>
        </footer>
      </section>
    </div>
  );
}
