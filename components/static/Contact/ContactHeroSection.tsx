"use client";

import Image from "next/image";
import Link from "next/link";

import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { contactCopy, type ContactCopy } from "@/lib/i18n/contact-copy";
import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/routes";
import { brandColors } from "@/theme/theme-colors";
import { estedad } from "@/next-persian-fonts/estedad";

type ContactHeroSectionProps = {
  copy: ContactCopy["hero"];
  locale: Locale;
  imageSrc: string;
  mobileImagePosition?: string;
  desktopImagePosition?: string;
  className?: string;
};

type ChannelKind = "phone" | "email" | "whatsapp" | "location";

type Channel = {
  id: ChannelKind;
  label: string;
  value: string;
  href: string;
  external?: boolean;
};

const CONTACT_CHANNELS_ARIA: Record<Locale, string> = {
  fa: "راه‌های ارتباط مستقیم با نجیب‌زاده",
  en: "Direct ways to contact Najibzadeh",
  ar: "طرق التواصل المباشر مع نجيب زاده",
};

const CHANNEL_LABELS: Record<
  Locale,
  Record<ChannelKind, { label: string; helper: string }>
> = {
  fa: {
    phone: { label: "تماس مستقیم", helper: "پاسخ‌گویی تیم مشتریان" },
    email: { label: "ایمیل", helper: "برای درخواست‌های دقیق‌تر" },
    whatsapp: { label: "واتساپ", helper: "گفت‌وگوی سریع با ما" },
    location: { label: "آتلیه", helper: "مشاهده اطلاعات مراجعه" },
  },
  en: {
    phone: { label: "Telephone", helper: "Speak with Client Services" },
    email: { label: "Email", helper: "For considered enquiries" },
    whatsapp: { label: "WhatsApp", helper: "Start a quick conversation" },
    location: { label: "Atelier", helper: "View visiting information" },
  },
  ar: {
    phone: { label: "اتصال مباشر", helper: "تحدث مع فريق خدمة العملاء" },
    email: { label: "البريد الإلكتروني", helper: "للاستفسارات التفصيلية" },
    whatsapp: { label: "واتساب", helper: "ابدأ محادثة سريعة" },
    location: { label: "الأتيلية", helper: "معلومات الزيارة والموقع" },
  },
};

function extractEmail(lines: string[]) {
  return lines.find((line) => line.includes("@")) ?? "info@najibzadeh.com";
}

function extractPhone(lines: string[]) {
  return (
    lines.find((line) => /\+?[\d()\s-]{8,}/.test(line)) ?? "+44 (0)20 4571 8900"
  );
}

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

function normalizeWhatsApp(value: string) {
  return value.replace(/\(0\)/g, "").replace(/\D/g, "");
}

export function ContactHeroSection({
  copy,
  locale,
  imageSrc,
  mobileImagePosition = "68% center",
  desktopImagePosition = "center",
  className = "",
}: ContactHeroSectionProps) {
  const { ref, revealed } = useRevealOnce<HTMLElement>();
  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);
  const isRtl = direction === "rtl";

  const channels = useMemo<Channel[]>(() => {
    const methods = contactCopy[locale].services.methods;
    const contactMethod = methods.find((method) => method.id === "contact");
    const locationMethod = methods.find((method) => method.id === "location");

    const contactLines = contactMethod?.description ?? [];
    const email = extractEmail(contactLines);
    const phone = extractPhone(contactLines);
    const whatsappNumber = normalizeWhatsApp(phone);

    return [
      {
        id: "phone",
        label: CHANNEL_LABELS[locale].phone.label,
        value: phone,
        href: `tel:${normalizePhone(phone)}`,
      },
      {
        id: "email",
        label: CHANNEL_LABELS[locale].email.label,
        value: email,
        href: `mailto:${email}`,
      },
      {
        id: "whatsapp",
        label: CHANNEL_LABELS[locale].whatsapp.label,
        value: CHANNEL_LABELS[locale].whatsapp.helper,
        href: `https://wa.me/${whatsappNumber}`,
        external: true,
      },
      {
        id: "location",
        label: CHANNEL_LABELS[locale].location.label,
        value:
          locationMethod?.description?.[0] ??
          CHANNEL_LABELS[locale].location.helper,
        href: localizedHref(
          locationMethod?.action?.href ?? "/contact-us#location",
          locale,
        ),
      },
    ];
  }, [locale]);

  const themeVars = {
    "--contact-black": brandColors.black.hex,
    "--contact-black-rgb": brandColors.black.rgb,
    "--contact-copper": brandColors.copper.hex,
    "--contact-mobile-position": mobileImagePosition,
    "--contact-desktop-position": desktopImagePosition,
  } as CSSProperties;

  return (
    <section
      ref={ref}
      style={themeVars}
      dir={direction}
      lang={htmlLang}
      aria-labelledby="contact-hero-title"
      aria-describedby="contact-hero-description"
      className={`relative isolate min-h-[100svh] w-full overflow-hidden bg-[var(--contact-black)] text-white ${className}`}
    >
      <Image
        src={imageSrc}
        alt={copy.imageAlt}
        fill
        priority
        sizes="100vw"
        draggable={false}
        className="-z-30 object-cover object-[var(--contact-mobile-position)] md:object-[var(--contact-desktop-position)]"
      />

      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 -z-20 ${
          isRtl
            ? "bg-[linear-gradient(180deg,rgba(7,7,7,0.05)_0%,rgba(7,7,7,0.32)_43%,rgba(7,7,7,0.94)_100%)] md:bg-[linear-gradient(90deg,rgba(7,7,7,0.08)_0%,rgba(7,7,7,0.20)_42%,rgba(7,7,7,0.78)_72%,rgba(7,7,7,0.96)_100%)]"
            : "bg-[linear-gradient(180deg,rgba(7,7,7,0.05)_0%,rgba(7,7,7,0.32)_43%,rgba(7,7,7,0.94)_100%)] md:bg-[linear-gradient(90deg,rgba(7,7,7,0.96)_0%,rgba(7,7,7,0.78)_28%,rgba(7,7,7,0.20)_58%,rgba(7,7,7,0.08)_100%)]"
        }`}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_12%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(180deg,transparent_55%,rgba(0,0,0,0.32)_100%)]"
      />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1920px] flex-col px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-24 sm:px-8 sm:pt-28 lg:px-[5vw] lg:pt-32">
        <div
          className={`flex items-center justify-between gap-5 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
            revealed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
        >
          <p className="text-[9px] font-semibold tracking-[0.16em] text-white/66 sm:text-[10px]">
            {copy.houseMark}
          </p>
          <div className="flex items-center gap-3 text-[8px] font-semibold tracking-[0.12em] text-[var(--contact-copper)] sm:text-[9px]">
            <span className="h-px w-8 bg-current/70" aria-hidden="true" />
            <span>{copy.eyebrow}</span>
          </div>
        </div>

        <div className="grid flex-1 items-center gap-12 py-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(420px,0.72fr)] lg:gap-[7vw] lg:py-16">
          <div
            className={`max-w-[780px] text-start transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              revealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            } ${isRtl ? "lg:col-start-2" : ""}`}
          >
            <p className="mb-5 text-[9px] font-semibold tracking-[0.12em] text-[var(--contact-copper)] sm:text-[10px]">
              {copy.bottomServiceLabel}
            </p>
            <h1
              id="contact-hero-title"
              className="max-w-[760px] text-balance text-[clamp(2.15rem,8.6vw,3rem)] font-normal leading-[1.02] tracking-[-0.045em] text-white sm:text-[clamp(2.55rem,6.4vw,3.75rem)] lg:text-[clamp(3.1rem,4.2vw,4.85rem)] xl:text-[clamp(3.45rem,4vw,5.15rem)]"
            >
              <span className="block">{copy.title}</span>
              <span className="mt-[0.2em] block max-w-[680px] text-[0.58em] leading-[1.18] tracking-[-0.025em] text-white/68">
                {copy.italicTitle}
              </span>
            </h1>
            <p
              id="contact-hero-description"
              className={`${estedad.className} mt-6 max-w-[560px] text-pretty text-[12px] leading-7 text-white/60 sm:mt-7 sm:text-[13px] sm:leading-8 lg:text-[14px]`}
            >
              {copy.description}
            </p>
          </div>

          <div
            className={`self-end lg:self-center transition-[opacity,transform] duration-[900ms] delay-100 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              revealed ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            } ${isRtl ? "lg:col-start-1 lg:row-start-1" : ""}`}
          >
            <nav
              aria-label={CONTACT_CHANNELS_ARIA[locale]}
              className="border-y border-white/[0.14] bg-black/[0.18] supports-[backdrop-filter]:bg-black/[0.12] supports-[backdrop-filter]:backdrop-blur-[6px]"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2">
                {channels.map((channel, index) => (
                  <ContactChannelCard
                    key={channel.id}
                    channel={channel}
                    locale={locale}
                    index={index}
                    isRtl={isRtl}
                  />
                ))}
              </div>
            </nav>
          </div>
        </div>

        <div className="flex items-center gap-4 border-t border-white/[0.12] pt-4 text-[8px] tracking-[0.12em] text-white/34 sm:text-[9px]">
          <span>{copy.bottomBrandLabel}</span>
          <span className="h-px flex-1 bg-white/[0.12]" aria-hidden="true" />
          <span>{copy.bottomServiceLabel}</span>
        </div>
      </div>
    </section>
  );
}

function ContactChannelCard({
  channel,
  locale,
  index,
  isRtl,
}: {
  channel: Channel;
  locale: Locale;
  index: number;
  isRtl: boolean;
}) {
  const externalProps = channel.external
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <Link
      href={channel.href}
      {...externalProps}
      aria-label={`${channel.label}: ${channel.value}`}
      className="group relative min-h-[126px] border-b border-white/[0.10] p-4 text-start outline-none transition-[background-color,color] duration-300 hover:bg-white/[0.07] focus-visible:bg-white/[0.08] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--contact-copper)] sm:min-h-[138px] sm:p-5 md:border-b-0 md:border-e md:last:border-e-0 lg:border-b lg:border-e-0 lg:[&:nth-child(odd)]:border-e lg:[&:nth-last-child(-n+2)]:border-b-0"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-[8px] font-medium tabular-nums text-white/34">
          0{index + 1}
        </span>
        <span className="text-white/56 transition-[color,transform] duration-300 group-hover:text-[var(--contact-copper)] group-hover:translate-x-0.5 ltr:group-hover:-translate-x-0.5">
          <ChannelIcon id={channel.id} />
        </span>
      </div>

      <div className="mt-7">
        <p className="text-[11px] font-semibold text-white sm:text-[12px]">
          {channel.label}
        </p>
        <p
          dir={
            channel.id === "phone" || channel.id === "email" ? "ltr" : undefined
          }
          className={`${estedad.className} mt-2 line-clamp-2 text-[10px] leading-5 text-white/50 sm:text-[11px] ${
            channel.id === "phone" || channel.id === "email"
              ? isRtl
                ? "text-right"
                : "text-left"
              : ""
          }`}
        >
          {channel.value}
        </p>
      </div>

      <span className="sr-only">
        {CHANNEL_LABELS[locale][channel.id].helper}
      </span>
    </Link>
  );
}

function ChannelIcon({ id }: { id: ChannelKind }) {
  if (id === "phone") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="size-[18px]"
      >
        <path
          d="M7.2 4.5 10 7.3 8.5 10c1.25 2.45 3.05 4.25 5.5 5.5l2.7-1.5 2.8 2.8-1.8 1.8c-.8.8-2.25.6-4.1-.3a20.4 20.4 0 0 1-4.95-3.75A20.4 20.4 0 0 1 4.9 9.6c-.9-1.85-1.1-3.3-.3-4.1l1.8-1.8.8.8Z"
          stroke="currentColor"
          strokeWidth="1.25"
        />
      </svg>
    );
  }

  if (id === "email") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="size-[18px]"
      >
        <path
          d="M3.5 5.5h17v13h-17z"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <path
          d="m4.3 7 7.7 5.7L19.7 7"
          stroke="currentColor"
          strokeWidth="1.25"
        />
      </svg>
    );
  }

  if (id === "whatsapp") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="size-[18px]"
      >
        <path
          d="M12 3.5a8.5 8.5 0 0 0-7.4 12.7L3.8 20l3.9-.8A8.5 8.5 0 1 0 12 3.5Z"
          stroke="currentColor"
          strokeWidth="1.25"
        />
        <path
          d="M8.2 8.1c.7 3.1 2.6 5 5.7 5.7l1.1-1.3 2.1 1.1c-.1 1.7-1.2 2.6-2.8 2.6-4.1 0-7.5-3.4-7.5-7.5 0-1.6.9-2.7 2.6-2.8l1.1 2.1-1.3 1.1Z"
          stroke="currentColor"
          strokeWidth="1.15"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="size-[18px]"
    >
      <path
        d="M12 21s6.5-5.45 6.5-11A6.5 6.5 0 1 0 5.5 10C5.5 15.55 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <circle
        cx="12"
        cy="10"
        r="2.2"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

function useRevealOnce<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const frame = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        requestAnimationFrame(() => setRevealed(true));
        observer.disconnect();
      },
      { threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, revealed };
}
