"use client";

import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";
import { getLocaleFromPathname, splitLocalePathname } from "@/lib/i18n/routes";
import { shellCopy } from "@/lib/i18n/shell-copy";
import { brandColors } from "@/theme/theme-colors";
import { estedad } from "@/next-persian-fonts/estedad";

type FloatingContactDockProps = {
  phone: string;
  whatsapp: string;
  location: string;
};

type ContactDockCopy = {
  eyebrow: string;
  trigger: string;
  openAria: string;
  close: string;
  closeAria: string;
  panelAria: string;
  actionsAria: string;
  title: string;
  description: string;
  call: string;
  callDetail: string;
  whatsapp: string;
  whatsappDetail: string;
  location: string;
  locationDetail: string;
  newWindow: string;
};

const CONTACT_DOCK_COPY: Record<Locale, ContactDockCopy> = {
  fa: {
    eyebrow: "خدمات اختصاصی",
    trigger: "ارتباط با ما",
    openAria: "باز کردن راه‌های ارتباطی با نجیب‌زاده",
    close: "بستن",
    closeAria: "بستن راه‌های ارتباطی",
    panelAria: "راه‌های ارتباطی نجیب‌زاده",
    actionsAria: "گزینه‌های تماس",
    title: "چطور می‌توانیم همراهتان باشیم؟",
    description:
      "برای تماس مستقیم، گفت‌وگو در واتساپ یا مشاهده موقعیت، مسیر دلخواهتان را انتخاب کنید.",
    call: "تماس تلفنی",
    callDetail: "ارتباط مستقیم با پشتیبانی",
    whatsapp: "واتساپ",
    whatsappDetail: "گفت‌وگوی مستقیم با تیم نجیب‌زاده",
    location: "موقعیت ما",
    locationDetail: "باز کردن مسیر در نقشه",
    newWindow: "در پنجره جدید باز می‌شود",
  },
  en: {
    eyebrow: "Private client care",
    trigger: "Client care",
    openAria: "Open Najibzadeh contact options",
    close: "Close",
    closeAria: "Close contact options",
    panelAria: "Najibzadeh contact options",
    actionsAria: "Contact options",
    title: "How may we assist you?",
    description:
      "Choose the most convenient way to call, message us on WhatsApp, or find our location.",
    call: "Call",
    callDetail: "Speak directly with client care",
    whatsapp: "WhatsApp",
    whatsappDetail: "Message the Najibzadeh team directly",
    location: "Location",
    locationDetail: "Open directions in Maps",
    newWindow: "Opens in a new window",
  },
  ar: {
    eyebrow: "خدمة العملاء الخاصة",
    trigger: "تواصل معنا",
    openAria: "فتح خيارات التواصل مع نجيب زاده",
    close: "إغلاق",
    closeAria: "إغلاق خيارات التواصل",
    panelAria: "خيارات التواصل مع نجيب زاده",
    actionsAria: "خيارات التواصل",
    title: "كيف يمكننا مساعدتك؟",
    description:
      "اختر الطريقة الأنسب للاتصال أو مراسلتنا عبر واتساب أو فتح موقعنا على الخريطة.",
    call: "اتصال",
    callDetail: "تواصل مباشرة مع خدمة العملاء",
    whatsapp: "واتساب",
    whatsappDetail: "راسل فريق نجيب زاده مباشرة",
    location: "الموقع",
    locationDetail: "فتح الاتجاهات على الخريطة",
    newWindow: "يفتح في نافذة جديدة",
  },
};

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

function normalizeWhatsApp(value: string) {
  return value.replace(/\D/g, "");
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function FloatingContactDock({
  phone,
  whatsapp,
  location,
}: FloatingContactDockProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstActionRef = useRef<HTMLAnchorElement>(null);
  const reactId = useId();
  const pathname = usePathname();

  const locale = getLocaleFromPathname(pathname);
  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);
  const copy = CONTACT_DOCK_COPY[locale];
  const brandName = shellCopy[locale].brandName;
  const pathnameWithoutLocale = splitLocalePathname(
    pathname ?? "/",
  ).pathnameWithoutLocale;

  const panelId = `${reactId.replace(/:/g, "")}-contact-dock`;
  const panelTitleId = `${panelId}-title`;
  const panelDescriptionId = `${panelId}-description`;
  const telHref = `tel:${normalizePhone(phone)}`;
  const whatsappHref = `https://wa.me/${normalizeWhatsApp(whatsapp)}`;

  const themeVars = {
    "--contact-black": brandColors.black.hex,
    "--contact-cream": brandColors.cream.hex,
    "--contact-copper": brandColors.copper.hex,
  } as CSSProperties;

  const closeDock = useCallback((restoreFocus = false) => {
    setOpen(false);

    if (!restoreFocus) return;

    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);

  const openDock = useCallback(() => {
    setOpen(true);

    requestAnimationFrame(() => {
      firstActionRef.current?.focus();
    });
  }, []);

  const toggleDock = useCallback(() => {
    if (open) {
      closeDock(false);
      return;
    }

    openDock();
  }, [closeDock, open, openDock]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;

      closeDock(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      event.preventDefault();
      closeDock(true);
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeDock, open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (
    pathnameWithoutLocale === "/login" ||
    pathnameWithoutLocale === "/signup" ||
    pathnameWithoutLocale.startsWith("/admin")
  ) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      dir={direction}
      lang={htmlLang}
      style={themeVars}
      className={`pointer-events-none  ${estedad.className} fixed bottom-[max(14px,env(safe-area-inset-bottom))] right-[max(14px,env(safe-area-inset-right))] z-[140] sm:bottom-[max(20px,env(safe-area-inset-bottom))] sm:right-[max(20px,env(safe-area-inset-right))]`}
    >
      <section
        id={panelId}
        role="dialog"
        aria-labelledby={panelTitleId}
        aria-describedby={panelDescriptionId}
        aria-hidden={!open}
        className={cx(
          "pointer-events-auto absolute bottom-[62px] right-0 isolate w-[min(354px,calc(100vw-28px))] overflow-hidden rounded-[24px] border border-white/[0.10] bg-[#0B0A09]/[0.97] text-[var(--contact-cream)]",
          "shadow-[0_22px_60px_rgba(0,0,0,0.24),0_6px_20px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.08)]",
          "supports-[backdrop-filter]:bg-[#0B0A09]/[0.88] supports-[backdrop-filter]:backdrop-blur-[14px] supports-[backdrop-filter]:backdrop-saturate-[130%]",
          "origin-bottom-right transform-gpu transition-[opacity,transform,visibility] duration-[220ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible pointer-events-none translate-y-2 scale-[0.985] opacity-0",
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#D1A170]/80 to-transparent"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_0%,rgba(188,132,82,0.14),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.025),transparent_34%)]"
        />

        <header className="flex items-start gap-4 border-b border-white/[0.085] px-5 pb-4 pt-5 sm:px-5.5">
          <span
            aria-hidden="true"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-white/[0.11] bg-white/[0.045] text-[var(--contact-cream)] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
          >
            <ConciergeIcon />
          </span>

          <div className="min-w-0 flex-1 text-start">
            <h2
              id={panelTitleId}
              className="mt-2 text-[17px] font-semibold leading-[1.45] tracking-[-0.018em] text-white sm:text-[14px]"
            >
              {copy.title}
            </h2>

            <p
              id={panelDescriptionId}
              className="mt-1.5 max-w-[260px] text-[10px] leading-5 text-white/48 sm:text-[10.5px]"
            >
              {copy.description}
            </p>
          </div>

          <button
            type="button"
            aria-label={copy.closeAria}
            title={copy.close}
            onClick={() => closeDock(true)}
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border border-white/[0.10] bg-white/[0.035] text-white/68 transition-[border-color,background-color,color,transform] duration-200 hover:-translate-y-px hover:border-[#D0A06F]/55 hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D0A06F]/70 motion-reduce:transform-none [&>svg]:size-[15px]"
          >
            <CloseIcon />
          </button>
        </header>

        <nav aria-label={copy.actionsAria} className="p-2.5">
          <div className="grid gap-1.5">
            <ContactAction
              actionRef={firstActionRef}
              href={telHref}
              index="01"
              label={copy.call}
              detail={phone || copy.callDetail}
              secondaryDetail={phone ? copy.callDetail : undefined}
              icon={<CallIcon />}
              direction={direction}
              onSelect={() => closeDock(false)}
            />

            <ContactAction
              href={whatsappHref}
              index="02"
              label={copy.whatsapp}
              detail={copy.whatsappDetail}
              secondaryDetail={copy.newWindow}
              icon={<WhatsAppIcon />}
              direction={direction}
              target="_blank"
              rel="noopener noreferrer"
              onSelect={() => closeDock(false)}
            />

            <ContactAction
              href={location}
              index="03"
              label={copy.location}
              detail={copy.locationDetail}
              secondaryDetail={copy.newWindow}
              icon={<LocationIcon />}
              direction={direction}
              target="_blank"
              rel="noopener noreferrer"
              onSelect={() => closeDock(false)}
            />
          </div>
        </nav>
      </section>

      <div className="pointer-events-auto flex justify-center items-center">
        <button
          ref={triggerRef}
          type="button"
          aria-label={open ? copy.closeAria : copy.openAria}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggleDock}
          className={cx(
            "group relative inline-flex h-12 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-white/[0.13] bg-[#0B0A09]/[0.95] text-white",
            "shadow-[0_12px_30px_rgba(0,0,0,0.20),inset_0_1px_0_rgba(255,255,255,0.08)]",
            "supports-[backdrop-filter]:bg-[#0B0A09]/[0.86] supports-[backdrop-filter]:backdrop-blur-[10px] supports-[backdrop-filter]:backdrop-saturate-[125%]",
            "transition-[border-color,background-color,transform,box-shadow] duration-200 ease-out",
            "hover:-translate-y-px hover:border-white/[0.24] hover:bg-[#0B0A09] active:translate-y-0",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D0A06F]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
            "motion-reduce:transform-none motion-reduce:transition-none",
            open && "border-[#D0A06F]/55",
          )}
        >
          <span className="grid size-11 shrink-0 place-items-center  [&>svg]:size-[17px]">
            {open ? <CloseIcon /> : <ConciergeIcon />}
          </span>
        </button>
      </div>
    </div>
  );
}

function ContactAction({
  actionRef,
  href,
  index,
  label,
  detail,
  secondaryDetail,
  icon,
  direction,
  target,
  rel,
  onSelect,
}: {
  actionRef?: RefObject<HTMLAnchorElement | null>;
  href: string;
  index: string;
  label: string;
  detail: string;
  secondaryDetail?: string;
  icon: ReactNode;
  direction: "rtl" | "ltr";
  target?: "_blank" | "_self";
  rel?: string;
  onSelect: () => void;
}) {
  return (
    <a
      ref={actionRef}
      href={href}
      target={target}
      rel={rel}
      aria-label={label}
      onClick={onSelect}
      className="group/action relative flex min-h-[68px] items-center gap-3 overflow-hidden rounded-[17px] border border-white/[0.075] bg-white/[0.025] px-3.5 py-3 text-start text-white transition-[border-color,background-color,transform] duration-200 hover:-translate-y-px hover:border-[#D0A06F]/30 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#D0A06F]/65 motion-reduce:transform-none sm:min-h-[72px] sm:px-4"
    >
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-full border border-white/[0.09] bg-black/20 text-white/78 transition-[border-color,color,background-color] duration-200 group-hover/action:border-[#D0A06F]/35 group-hover/action:bg-[#D0A06F]/[0.07] group-hover/action:text-[#E6C29E] [&>svg]:size-[18px]"
      >
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-[7px] font-medium tabular-nums tracking-[0.12em] text-white/26">
            {index}
          </span>
          <span className="text-[10px] font-semibold leading-none tracking-[0.015em] text-white/92 sm:text-[10.5px]">
            {label}
          </span>
        </span>

        <span className="mt-2 block truncate text-[9px] leading-none text-white/48">
          {detail}
        </span>

        {secondaryDetail ? (
          <span className="mt-1.5 hidden truncate text-[7px] leading-none text-white/25 sm:block">
            {secondaryDetail}
          </span>
        ) : null}
      </span>

      <span
        aria-hidden="true"
        className={cx(
          "grid size-7 shrink-0 place-items-center rounded-full border border-white/[0.07] text-white/35 transition-[border-color,color,transform] duration-200 group-hover/action:border-[#D0A06F]/30 group-hover/action:text-[#E6C29E]",
          direction === "rtl"
            ? "group-hover/action:-translate-x-0.5"
            : "group-hover/action:translate-x-0.5",
        )}
      >
        <span className={direction === "rtl" ? "rotate-180" : ""}>
          <ArrowIcon />
        </span>
      </span>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-4 start-0 w-px origin-center scale-y-0 bg-[#D0A06F]/70 transition-transform duration-200 group-hover/action:scale-y-100"
      />
    </a>
  );
}

function ConciergeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 6.25h15v9.5h-7.2L8 19.1v-3.35H4.5v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 10h8M8 12.9h5.1"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CallIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.45 4.75 10 8.6 8.65 10.4c1.16 2.18 2.77 3.8 4.96 4.96L15.4 14l3.85 2.55-1.4 2.16c-.58.9-1.78 1.26-3.13.88-2.15-.6-4.54-2.16-6.58-4.2-2.04-2.04-3.6-4.43-4.2-6.58-.38-1.35-.02-2.55.88-3.13l2.63-.93Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.75a8.25 8.25 0 0 0-7.17 12.34L4 20l4.02-.78A8.25 8.25 0 1 0 12 3.75Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.55 8.15c.2-.38.38-.39.56-.39h.42c.14 0 .36.05.54.45.18.39.62 1.47.68 1.57.05.11.09.23.02.37-.07.14-.11.22-.22.34-.11.12-.23.26-.32.36-.11.1-.21.21-.09.42.12.2.54.87 1.16 1.41.79.7 1.45.92 1.67 1.02.21.11.34.09.46-.05.13-.14.54-.62.68-.83.14-.21.28-.17.48-.1.2.07 1.25.58 1.46.68.21.11.35.16.4.25.05.09.05.49-.12.97-.17.47-1 .91-1.38.97-.36.06-.81.08-1.31-.07-.3-.09-.69-.22-1.18-.43-.2-.09-3.59-1.34-4.95-4.7-.14-.33-.01-1.04.3-1.44Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20.25s6-5.23 6-10.14A6 6 0 0 0 6 10.1c0 4.92 6 10.15 6 10.15Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="12"
        cy="10"
        r="2.25"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6 18 18M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="size-3">
      <path
        d="M2.5 8h10M9.5 5l3 3-3 3"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
