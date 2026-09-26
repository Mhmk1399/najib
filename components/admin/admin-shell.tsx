"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  CalendarDays,
  ClipboardClock,
  ChevronsUpDown,
  Crown,
  Grid2X2,
  Images,
  LogOut,
  Menu,
  Moon,
  Package,
  PanelRightClose,
  PanelRightOpen,
  Search,
  ShoppingBag,
  ShoppingCart,
  ScrollText,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Users,
  Warehouse,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
  permissionsAny?: string[];
};

type AdminShellProps = {
  children: ReactNode;
  staff?: AdminStaffProfile;
};

function canAccessNavItem(item: NavItem, permissions: string[] = []) {
  return (!item.permission || permissions.includes(item.permission)) &&
    (!item.permissionsAny || item.permissionsAny.some((permission) => permissions.includes(permission)));
}

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
  {
    label: "سفارش‌ها",
    href: "/admin/orders",
    icon: ShoppingBag,
    permission: "orders.read",
  },
  { label: "سبدهای خرید", href: "/admin/carts", icon: ShoppingCart, permission: "orders.read" },
  { label: "نشست‌های پرداخت", href: "/admin/checkouts", icon: ClipboardClock, permission: "orders.read" },
  { label: "خریدهای رهاشده", href: "/admin/abandoned-checkouts", icon: CalendarDays, permission: "orders.read" },
  { label: "تاریخچه ممیزی", href: "/admin/audit", icon: ScrollText, permissionsAny: ["settings.manage", "staff.manage"] },
];

const USERS_NAV: NavItem = {
  label: "کاربران",
  href: "/admin/users",
  icon: Users,
};

const DARK_THEME_VARS = {
  "--admin-shell-canvas": "#090806",
  "--admin-shell-panel": "#100E0C",
  "--admin-shell-raised": "#17130F",
  "--admin-shell-control": "#15120F",
  "--admin-shell-control-hover": "#1D1813",
  "--admin-shell-text": "#F4EEE7",
  "--admin-shell-muted": "#A69B91",
  "--admin-shell-subtle": "#756B62",
  "--admin-shell-accent": "#C58C5B",
  "--admin-shell-accent-soft": "#E2B687",
  "--admin-shell-border": "rgba(255,255,255,0.075)",
  "--admin-shell-border-strong": "rgba(255,255,255,0.14)",
  "--admin-shell-active-border": "rgba(197,140,91,0.46)",
  "--admin-shell-active": "rgba(197,140,91,0.12)",
  "--admin-shell-brand-wash":
    "linear-gradient(180deg, rgba(9,8,6,0.34), rgba(9,8,6,0.92))",
} as CSSProperties;

const LIGHT_THEME_VARS = {
  "--admin-shell-canvas": "#ECE6DC",
  "--admin-shell-panel": "#F7F2EA",
  "--admin-shell-raised": "#FFFBF5",
  "--admin-shell-control": "#F1EAE0",
  "--admin-shell-control-hover": "#E9DFD2",
  "--admin-shell-text": "#211B16",
  "--admin-shell-muted": "#675D54",
  "--admin-shell-subtle": "#8C8177",
  "--admin-shell-accent": "#9D673E",
  "--admin-shell-accent-soft": "#7E4E2E",
  "--admin-shell-border": "rgba(42,30,20,0.10)",
  "--admin-shell-border-strong": "rgba(42,30,20,0.17)",
  "--admin-shell-active-border": "rgba(157,103,62,0.40)",
  "--admin-shell-active": "rgba(157,103,62,0.10)",
  "--admin-shell-brand-wash":
    "linear-gradient(180deg, rgba(247,242,234,0.44), rgba(247,242,234,0.96))",
} as CSSProperties;

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
  const [desktopSidebarHovered, setDesktopSidebarHovered] = useState(false);
  const [desktopSidebarFocused, setDesktopSidebarFocused] = useState(false);

  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const logoutOpenerRef = useRef<HTMLElement | null>(null);

  const availableNavItems = useMemo(() => {
    const primary = PRIMARY_NAV.filter((item) => canAccessNavItem(item, staffProfile.permissions));
    return staffProfile.permissions?.includes("staff.manage")
      ? [...primary, USERS_NAV]
      : primary;
  }, [staffProfile.permissions]);

  const currentSection = useMemo(
    () =>
      availableNavItems.find((item) => isNavActive(pathname, item.href))
        ?.label ?? "پنل مدیریت",
    [availableNavItems, pathname],
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

  const themeVars = theme === "dark" ? DARK_THEME_VARS : LIGHT_THEME_VARS;
  const desktopSidebarOpen = desktopSidebarHovered || desktopSidebarFocused;

  return (
    <AdminAuthProvider staff={staffProfile}>
      <div
        dir="rtl"
        lang="fa"
        data-theme={theme}
        style={themeVars}
        className="admin-workspace-shell group/admin h-dvh overflow-hidden bg-[var(--admin-shell-canvas)] text-[var(--admin-shell-text)] antialiased selection:bg-[var(--admin-shell-accent)]/30"
      >
        <div className="flex h-full min-w-0 flex-row">
          <aside
            id="admin-desktop-sidebar"
            aria-label="نوار کناری مدیریت"
            className="relative z-[6000] hidden h-dvh w-[78px] shrink-0 overflow-visible xl:block"
          >
            <div
              data-sidebar-state={desktopSidebarOpen ? "open" : "closed"}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") {
                  setDesktopSidebarHovered(true);
                }
              }}
              onPointerLeave={(event) => {
                if (event.pointerType === "mouse") {
                  setDesktopSidebarHovered(false);
                }
              }}
              onFocusCapture={() => setDesktopSidebarFocused(true)}
              onBlurCapture={(event) => {
                const nextTarget = event.relatedTarget;
                if (
                  nextTarget instanceof Node &&
                  event.currentTarget.contains(nextTarget)
                ) {
                  return;
                }

                setDesktopSidebarFocused(false);
              }}
              className={`absolute inset-y-0 right-0 overflow-hidden border-l border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] transition-[width,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                desktopSidebarOpen
                  ? "w-[252px] border-[var(--admin-shell-border-strong)] shadow-[-26px_0_80px_-42px_rgba(0,0,0,0.82)]"
                  : "w-[78px]"
              }`}
            >
              <Sidebar
                pathname={pathname}
                staff={staffProfile}
                imagePriority
                collapsed={!desktopSidebarOpen}
                onLogout={requestLogout}
                onNavigate={() => undefined}
              />
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar
              clock={clock}
              currentSection={currentSection}
              staff={staffProfile}
              theme={theme}
              navItems={availableNavItems}
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
  navItems,
  menuButtonRef,
  onOpenMenu,
  onToggleTheme,
  onRequestLogout,
}: {
  clock: { date: string; time: string };
  currentSection: string;
  staff: AdminStaffProfile;
  theme: ThemeMode;
  navItems: NavItem[];
  menuButtonRef: RefObject<HTMLButtonElement | null>;
  onOpenMenu: () => void;
  onToggleTheme: () => void;
  onRequestLogout: () => void;
}) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const normalizedQuery = normalizePersianSearch(searchQuery);
  const searchResults = useMemo(() => {
    if (!normalizedQuery) return navItems;
    return navItems.filter((item) =>
      normalizePersianSearch(item.label).includes(normalizedQuery),
    );
  }, [navItems, normalizedQuery]);

  useEffect(() => {
    if (!profileOpen && !searchOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (profileOpen && !profileMenuRef.current?.contains(target)) {
        setProfileOpen(false);
      }
      if (searchOpen && !searchRef.current?.contains(target)) {
        setSearchOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setProfileOpen(false);
      setSearchOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [profileOpen, searchOpen]);

  const navigateToResult = (item: NavItem) => {
    router.push(item.href);
    setSearchOpen(false);
    setSearchQuery("");
    setActiveSearchIndex(0);
  };

  return (
    <header className="relative z-[70] h-[72px] shrink-0 border-b border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)]/96 shadow-[0_14px_44px_-34px_rgba(0,0,0,0.88)] backdrop-blur-2xl">
      <div className="mx-auto flex h-full min-w-0 items-center gap-2.5 px-3 sm:px-4 lg:px-5 xl:px-6">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={onOpenMenu}
          aria-label="باز کردن منوی مدیریت"
          className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-[11px] border border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-control)] text-[var(--admin-shell-muted)] transition-[border-color,background-color,color] hover:border-[var(--admin-shell-accent)]/45 hover:bg-[var(--admin-shell-control-hover)] hover:text-[var(--admin-shell-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/40 xl:hidden"
        >
          <Menu size={18} strokeWidth={1.55} aria-hidden="true" />
        </button>

        <div className="hidden min-w-[150px] items-center gap-3 sm:flex">
          <span
            aria-hidden="true"
            className="h-8 w-0.5 shrink-0 rounded-full bg-[var(--admin-shell-accent)]"
          />
          <div className="min-w-0 text-right">
            <span className="block text-[7px] font-semibold text-[var(--admin-shell-accent-soft)]">
              فضای مدیریت
            </span>
            <strong className="mt-1 block max-w-[190px] truncate text-[11px] font-bold text-[var(--admin-shell-text)]">
              {currentSection}
            </strong>
          </div>
        </div>

        <div
          ref={searchRef}
          className="relative mx-auto min-w-0 flex-1 sm:max-w-[560px]"
        >
          <label htmlFor="admin-sidebar-search" className="sr-only">
            جستجو در منوی مدیریت
          </label>
          <div
            className={`flex h-11 items-center gap-2.5 rounded-[13px] border bg-[var(--admin-shell-control)] px-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.025)] transition-[border-color,background-color,box-shadow] ${
              searchOpen
                ? "border-[var(--admin-shell-accent)]/55 bg-[var(--admin-shell-raised)] shadow-[0_0_0_3px_rgba(197,140,91,0.08)]"
                : "border-[var(--admin-shell-border-strong)] hover:border-[var(--admin-shell-accent)]/28"
            }`}
          >
            <Search
              size={16}
              strokeWidth={1.6}
              className="shrink-0 text-[var(--admin-shell-subtle)]"
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              id="admin-sidebar-search"
              type="search"
              role="combobox"
              aria-autocomplete="list"
              aria-controls="admin-sidebar-search-results"
              aria-expanded={searchOpen}
              aria-activedescendant={
                searchOpen && searchResults[activeSearchIndex]
                  ? `admin-sidebar-result-${activeSearchIndex}`
                  : undefined
              }
              autoComplete="off"
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setSearchOpen(true);
                setActiveSearchIndex(0);
              }}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) return;

                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setSearchOpen(true);
                  setActiveSearchIndex((current) =>
                    searchResults.length
                      ? (current + 1) % searchResults.length
                      : 0,
                  );
                  return;
                }

                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setSearchOpen(true);
                  setActiveSearchIndex((current) =>
                    searchResults.length
                      ? (current - 1 + searchResults.length) %
                        searchResults.length
                      : 0,
                  );
                  return;
                }

                if (event.key === "Enter" && searchResults[activeSearchIndex]) {
                  event.preventDefault();
                  navigateToResult(searchResults[activeSearchIndex]);
                  return;
                }

                if (event.key === "Escape") {
                  event.preventDefault();
                  setSearchOpen(false);
                }
              }}
              placeholder="جستجو در منوی مدیریت…"
              className="min-w-0 flex-1 bg-transparent text-right text-[10px] font-medium text-[var(--admin-shell-text)] outline-none placeholder:text-[var(--admin-shell-subtle)] sm:text-[10.5px]"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setActiveSearchIndex(0);
                  searchInputRef.current?.focus();
                }}
                aria-label="پاک کردن جستجو"
                className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-full text-[var(--admin-shell-subtle)] transition-colors hover:bg-[var(--admin-shell-control-hover)] hover:text-[var(--admin-shell-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/40"
              >
                <X size={13} aria-hidden="true" />
              </button>
            ) : (
              <kbd className="hidden rounded-[6px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-panel)] px-1.5 py-1 text-[7px] font-medium text-[var(--admin-shell-subtle)] lg:inline-flex">
                منو
              </kbd>
            )}
          </div>

          {searchOpen ? (
            <div
              id="admin-sidebar-search-results"
              role="listbox"
              aria-label="نتایج جستجوی منوی مدیریت"
              className="absolute inset-x-0 top-[calc(100%+8px)] z-[100] overflow-hidden rounded-[15px] border border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-raised)] p-1.5 shadow-[0_26px_80px_-28px_rgba(0,0,0,0.84)] backdrop-blur-2xl"
            >
              {searchResults.length ? (
                searchResults.map((item, index) => {
                  const Icon = item.icon;
                  const active = index === activeSearchIndex;
                  return (
                    <button
                      id={`admin-sidebar-result-${index}`}
                      key={item.href}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onPointerEnter={() => setActiveSearchIndex(index)}
                      onClick={() => navigateToResult(item)}
                      className={`flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-[10px] px-3 text-right text-[10px] outline-none transition-[background-color,color] ${
                        active
                          ? "bg-[var(--admin-shell-active)] text-[var(--admin-shell-text)]"
                          : "text-[var(--admin-shell-muted)] hover:bg-[var(--admin-shell-control-hover)] hover:text-[var(--admin-shell-text)]"
                      }`}
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-[9px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-control)] text-[var(--admin-shell-accent-soft)]">
                        <Icon size={15} strokeWidth={1.5} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="px-4 py-5 text-center text-[10px] leading-6 text-[var(--admin-shell-muted)]">
                  موردی در منوی مدیریت پیدا نشد.
                </p>
              )}
              <p className="sr-only" aria-live="polite">
                {searchResults.length
                  ? `${searchResults.length} نتیجه پیدا شد`
                  : "نتیجه‌ای پیدا نشد"}
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden h-10 items-center gap-3 border-l border-[var(--admin-shell-border)] px-3 2xl:flex">
            <CalendarDays
              size={15}
              className="text-[var(--admin-shell-accent-soft)]"
              strokeWidth={1.45}
              aria-hidden="true"
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
            className="!size-10 !rounded-[11px] !border-[var(--admin-shell-border-strong)] !bg-[var(--admin-shell-control)] !text-[var(--admin-shell-muted)] hover:!border-[var(--admin-shell-accent)]/45 hover:!bg-[var(--admin-shell-control-hover)] hover:!text-[var(--admin-shell-text)]"
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
  refContainer: RefObject<HTMLDivElement | null>;
  staff: AdminStaffProfile;
  open: boolean;
  onToggle: () => void;
  onLogout: () => void;
}) {
  const fullName =
    `${staff.firstName ?? ""} ${staff.lastName ?? ""}`.trim() || "کاربر مدیریت";
  const initials =
    `${staff.firstName?.charAt(0) ?? ""}${staff.lastName?.charAt(0) ?? ""}`.trim() ||
    "ن";

  return (
    <div ref={refContainer} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="admin-profile-menu"
        aria-label={open ? "بستن منوی کاربر" : "باز کردن منوی کاربر"}
        onClick={onToggle}
        className="group/profile flex h-11 cursor-pointer items-center gap-2 rounded-[12px] border border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-control)] p-1 text-[var(--admin-shell-text)] outline-none transition-[background-color,border-color] hover:border-[var(--admin-shell-accent)]/45 hover:bg-[var(--admin-shell-control-hover)] focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/40"
      >
        <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-[9px] border border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-text)] text-[10px] font-extrabold text-[var(--admin-shell-panel)]">
          {initials}
          <span
            aria-hidden="true"
            className="absolute bottom-0.5 right-0.5 size-1.5 rounded-full bg-[#58A67B] ring-2 ring-[var(--admin-shell-panel)]"
          />
        </span>

        <span className="hidden min-w-0 px-1 text-right xl:block 2xl:hidden min-[1560px]:block">
          <strong className="block max-w-[118px] truncate text-[9px] font-bold">
            {fullName}
          </strong>
          <small className="mt-1 block max-w-[118px] truncate text-[7px] text-[var(--admin-shell-subtle)]">
            {staff.displayRole}
          </small>
        </span>

        <span className="hidden size-7 shrink-0 place-items-center border-r border-[var(--admin-shell-border)] text-[var(--admin-shell-subtle)] transition-colors group-hover/profile:text-[var(--admin-shell-accent-soft)] md:grid">
          <ChevronsUpDown size={13} strokeWidth={1.6} aria-hidden="true" />
        </span>
      </button>

      {open ? (
        <div
          id="admin-profile-menu"
          role="menu"
          className="absolute left-0 top-[calc(100%+9px)] z-[110] w-[286px] overflow-hidden rounded-[16px] border border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-raised)] p-2.5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.84)]"
        >
          <div className="flex items-center gap-3 border-b border-[var(--admin-shell-border)] p-2 pb-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-[10px] border border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-text)] text-[12px] font-extrabold text-[var(--admin-shell-panel)]">
              {initials}
            </span>

            <div className="min-w-0 flex-1 text-right">
              <span className="mb-1 block text-[7px] font-semibold text-[var(--admin-shell-accent-soft)]">
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
              className="text-[#58A67B]"
              aria-hidden="true"
            />
            <span>نشست امن و فعال</span>
          </div>

          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="mt-2 flex h-10 w-full cursor-pointer items-center justify-between rounded-[10px] border border-transparent px-3 text-[9px] font-semibold text-[#D8766D] outline-none transition-colors hover:border-[#A7554C]/35 hover:bg-[#A7554C]/10 hover:text-[#EFA39B] focus-visible:ring-2 focus-visible:ring-[#A7554C]/35"
          >
            <span>خروج از حساب</span>
            <LogOut size={15} strokeWidth={1.5} aria-hidden="true" />
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
  collapsed = false,
  onToggleCollapse,
  onLogout,
  onNavigate,
}: {
  pathname: string;
  staff: AdminStaffProfile;
  imagePriority?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onLogout: () => void;
  onNavigate: () => void;
}) {
  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[235px] overflow-hidden opacity-[0.17]"
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

      <div
        className={`relative z-10 flex h-[72px] shrink-0 items-center border-b border-[var(--admin-shell-border)] ${
          collapsed ? "justify-center px-2" : "justify-between gap-2 px-3"
        }`}
      >
        <Link
          href="/admin"
          aria-label="پنل مدیریت نجیب‌زاده"
          className={`flex min-w-0 items-center outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/40 ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-[10px] border border-[var(--admin-shell-accent)]/30 bg-[var(--admin-shell-control)] text-[18px] font-medium text-[var(--admin-shell-accent-soft)] shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]">
            N
          </span>
          {!collapsed ? (
            <span className="min-w-0 text-right">
              <strong className="block whitespace-nowrap text-[12px] font-semibold tracking-[0.16em] text-[var(--admin-shell-text)]">
                NAJIBZADEH
              </strong>
              <small className="mt-1 block whitespace-nowrap text-[6px] font-medium text-[var(--admin-shell-accent-soft)]">
                پنل مدیریت
              </small>
            </span>
          ) : null}
        </Link>

        {!collapsed && onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-controls="admin-desktop-sidebar"
            aria-expanded="true"
            aria-label="جمع کردن نوار کناری"
            title="جمع کردن نوار کناری"
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-[9px] border border-[var(--admin-shell-border)] bg-[var(--admin-shell-control)] text-[var(--admin-shell-subtle)] transition-colors hover:border-[var(--admin-shell-accent)]/42 hover:text-[var(--admin-shell-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/40"
          >
            <PanelRightClose size={16} strokeWidth={1.5} aria-hidden="true" />
          </button>
        ) : null}

        {collapsed && onToggleCollapse ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-controls="admin-desktop-sidebar"
            aria-expanded="false"
            aria-label="باز کردن نوار کناری"
            title="باز کردن نوار کناری"
            className="absolute -left-px top-[82px] z-30 grid size-8 translate-x-1/2 cursor-pointer place-items-center rounded-full border border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-raised)] text-[var(--admin-shell-accent-soft)] shadow-[0_8px_24px_rgba(0,0,0,0.28)] transition-colors hover:border-[var(--admin-shell-accent)]/60 hover:text-[var(--admin-shell-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/40"
          >
            <PanelRightOpen size={14} strokeWidth={1.6} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <nav
        aria-label="ناوبری مدیریت"
        data-lenis-prevent
        data-lenis-prevent-wheel
        data-lenis-prevent-touch
        className={`relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 ${
          collapsed ? "px-2" : "px-3"
        }`}
      >
        <p
          className={
            collapsed
              ? "sr-only"
              : "mb-2 px-2 text-[7px] font-semibold text-[var(--admin-shell-subtle)]"
          }
        >
          ناوبری اصلی
        </p>

        <div className="space-y-1">
          {PRIMARY_NAV.filter((item) => canAccessNavItem(item, staff.permissions)).map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              active={isNavActive(pathname, item.href)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>

        <div
          className={`my-4 h-px bg-[var(--admin-shell-border)] ${collapsed ? "mx-2" : ""}`}
        />

        {staff.permissions?.includes("staff.manage") ? (
          <SidebarLink
            item={USERS_NAV}
            active={isNavActive(pathname, "/admin/users")}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ) : null}

        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? "خروج از حساب" : undefined}
          className={`mt-1 flex h-11 w-full cursor-pointer items-center rounded-[10px] border border-transparent text-[9px] font-semibold text-[var(--admin-shell-muted)] outline-none transition-colors hover:border-[#A7554C]/30 hover:bg-[#A7554C]/10 hover:text-[#DF8178] focus-visible:ring-2 focus-visible:ring-[#A7554C]/35 ${
            collapsed ? "justify-center px-0" : "gap-3 px-3"
          }`}
        >
          <span className="grid size-7 shrink-0 place-items-center">
            <LogOut size={16} strokeWidth={1.5} aria-hidden="true" />
          </span>
          {!collapsed ? (
            <span className="whitespace-nowrap">خروج از حساب</span>
          ) : null}
        </button>
      </nav>

      <div
        className={`relative z-10 flex h-[72px] shrink-0 items-center border-t border-[var(--admin-shell-border)] ${
          collapsed ? "justify-center px-2" : "gap-3 px-5"
        }`}
      >
        <Crown
          size={16}
          strokeWidth={1.4}
          className="shrink-0 text-[var(--admin-shell-accent-soft)]"
          aria-hidden="true"
        />
        {!collapsed ? (
          <span className="min-w-0 text-right">
            <strong className="block whitespace-nowrap text-[8px] font-semibold text-[var(--admin-shell-muted)]">
              مدیریت نجیب‌زاده
            </strong>
            <small className="mt-1 block whitespace-nowrap text-[6px] text-[var(--admin-shell-accent-soft)]">
              فضای امن کارکنان
            </small>
          </span>
        ) : null}
      </div>
    </div>
  );
}

function SidebarLink({
  item,
  active,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={`group/nav relative flex h-11 items-center rounded-[10px] border text-[9px] font-semibold outline-none transition-[background-color,border-color,color,transform] focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/40 ${
        collapsed ? "justify-center px-0" : "gap-3 px-3"
      } ${
        active
          ? "border-[var(--admin-shell-active-border)] bg-[var(--admin-shell-active)] text-[var(--admin-shell-text)]"
          : "border-transparent text-[var(--admin-shell-muted)] hover:border-[var(--admin-shell-border)] hover:bg-[var(--admin-shell-control-hover)] hover:text-[var(--admin-shell-text)]"
      }`}
    >
      {active ? (
        <span
          aria-hidden="true"
          className={`absolute bg-[var(--admin-shell-accent)] ${
            collapsed
              ? "bottom-1.5 right-1/2 h-0.5 w-4 translate-x-1/2 rounded-full"
              : "inset-y-2 right-0 w-0.5 rounded-full"
          }`}
        />
      ) : null}

      <span className="grid size-7 shrink-0 place-items-center">
        <Icon
          size={16}
          strokeWidth={1.5}
          className={
            active ? "text-[var(--admin-shell-accent-soft)]" : "text-current"
          }
          aria-hidden="true"
        />
      </span>

      {!collapsed ? (
        <span className="whitespace-nowrap">{item.label}</span>
      ) : null}
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

function normalizePersianSearch(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("fa")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/\s+/g, " ");
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
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

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
        className={`absolute inset-0 cursor-pointer bg-black/68 backdrop-blur-[5px] transition-opacity duration-300 motion-reduce:transition-none ${
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
        className={`absolute inset-y-0 right-0 flex w-[min(88vw,330px)] flex-col overflow-hidden border-l border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-panel)] shadow-[-28px_0_90px_-36px_rgba(0,0,0,0.78)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="absolute left-3 top-4 z-30">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="بستن منو"
            className="grid size-9 cursor-pointer place-items-center rounded-[10px] border border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-control)] text-[var(--admin-shell-muted)] transition-colors hover:bg-[var(--admin-shell-control-hover)] hover:text-[var(--admin-shell-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/40"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <Sidebar
          staff={staff}
          pathname={pathname}
          collapsed={false}
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
      aria-describedby="admin-logout-description"
      data-lenis-prevent
      data-lenis-prevent-wheel
      data-lenis-prevent-touch
      className="fixed inset-0 z-[2000] grid place-items-center bg-black/72 px-4 backdrop-blur-[7px]"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <section className="w-full max-w-[420px] overflow-hidden rounded-[18px] border border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-raised)] shadow-[0_38px_100px_-28px_rgba(0,0,0,0.95)]">
        <header className="flex items-start justify-between gap-5 border-b border-[var(--admin-shell-border)] px-6 py-5">
          <div className="text-right">
            <p className="text-[8px] font-semibold text-[var(--admin-shell-accent-soft)]">
              نشست کاربری
            </p>
            <h2
              id="admin-logout-title"
              className="mt-2 text-[20px] font-bold text-[var(--admin-shell-text)]"
            >
              خروج از حساب؟
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="grid size-9 cursor-pointer place-items-center rounded-[10px] border border-[var(--admin-shell-border)] text-[var(--admin-shell-muted)] transition-colors hover:bg-[var(--admin-shell-control-hover)] hover:text-[var(--admin-shell-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/40"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <div className="px-6 py-5 text-right">
          <p
            id="admin-logout-description"
            className="text-[11px] leading-7 text-[var(--admin-shell-muted)]"
          >
            آیا مطمئن هستید که می‌خواهید از پنل مدیریت خارج شوید؟ نشست امن شما
            پایان می‌یابد و برای ورود دوباره باید رمز عبور را وارد کنید.
          </p>
          {error ? (
            <p role="alert" className="mt-3 text-[11px] text-[#DF8178]">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="grid grid-cols-2 gap-2 border-t border-[var(--admin-shell-border)] p-4">
          <button
            ref={cancelRef}
            type="button"
            onClick={onClose}
            disabled={pending}
            className="h-11 cursor-pointer rounded-[11px] border border-[var(--admin-shell-border-strong)] bg-[var(--admin-shell-control)] text-[10px] font-semibold text-[var(--admin-shell-muted)] transition-colors hover:bg-[var(--admin-shell-control-hover)] hover:text-[var(--admin-shell-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-shell-accent)]/35 disabled:cursor-not-allowed disabled:opacity-50"
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
            className="!h-11 !justify-center !rounded-[11px] !border-[#A5574F]/35 !bg-[#A5574F]/12 !tracking-normal !text-[#DF8178] hover:!border-[#A5574F]/50 hover:!bg-[#A5574F]/18 hover:!text-[#EF9B93]"
          >
            {pending ? "در حال خروج…" : "خروج از حساب"}
          </Button>
        </footer>
      </section>
    </div>
  );
}
