"use client";

import Image from "next/image";

import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { ArrowLeftIcon, ArrowRightIcon, Button } from "@/components/ui/Button";
import type { ContactCopy } from "@/lib/i18n/contact-copy";
import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";
import { brandColors } from "@/theme/theme-colors";

type PrivateAppointmentSectionProps = {
  copy: ContactCopy["appointment"];
  locale: Locale;
  imageSrc: string;
  mobileImagePosition?: string;
  desktopImagePosition?: string;
  className?: string;
};

const APPOINTMENT_MICROCOPY: Record<
  Locale,
  {
    step: string;
    formTitle: string;
    formNote: string;
    privacy: string;
  }
> = {
  fa: {
    step: "قرار خصوصی / 01",
    formTitle: "جزئیات قرار",
    formNote:
      "زمان پیشنهادی شما پس از بررسی توسط تیم نجیب‌زاده تأیید خواهد شد.",
    privacy: "اطلاعات شما فقط برای هماهنگی این درخواست استفاده می‌شود.",
  },
  en: {
    step: "Private appointment / 01",
    formTitle: "Appointment details",
    formNote:
      "Your preferred time will be confirmed by the Najibzadeh team after review.",
    privacy: "Your details are used only to coordinate this request.",
  },
  ar: {
    step: "موعد خاص / 01",
    formTitle: "تفاصيل الموعد",
    formNote: "سيتم تأكيد الوقت المفضل بعد مراجعته من قبل فريق نجيب زاده.",
    privacy: "تُستخدم معلوماتك فقط لتنسيق هذا الطلب.",
  },
};

export function PrivateAppointmentSection({
  copy,
  locale,
  imageSrc,
  mobileImagePosition = "68% center",
  desktopImagePosition = "center",
  className = "",
}: PrivateAppointmentSectionProps) {
  const { ref, revealed } = useRevealOnce<HTMLElement>();
  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);
  const isRtl = direction === "rtl";
  const ActionIcon = isRtl ? ArrowLeftIcon : ArrowRightIcon;
  const microcopy = APPOINTMENT_MICROCOPY[locale];

  const themeVars = {
    "--appointment-black": brandColors.black.hex,
    "--appointment-copper": brandColors.copper.hex,
    "--appointment-mobile-position": mobileImagePosition,
    "--appointment-desktop-position": desktopImagePosition,
  } as CSSProperties;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    /*
     * API / Server Action
     * بعداً اینجا متصل می‌شود.
     */
  }

  return (
    <section
      id="appointment"
      ref={ref}
      dir={direction}
      lang={htmlLang}
      style={themeVars}
      aria-labelledby="private-appointment-title"
      className={`relative w-full overflow-hidden bg-[#0B0A09] text-white ${className}`}
    >
      <div className="grid min-h-[100svh] lg:grid-cols-[0.92fr_1.08fr]">
        <div
          className={`relative min-h-[52svh] overflow-hidden lg:min-h-[100svh] ${isRtl ? "lg:order-2" : ""}`}
        >
          <Image
            src={imageSrc}
            alt={copy.imageAlt}
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 46vw, 100vw"
            draggable={false}
            className="object-cover object-[var(--appointment-mobile-position)] md:object-[var(--appointment-desktop-position)]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.18)_46%,rgba(0,0,0,0.76)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10 xl:p-12">
            <p className="text-[8px] font-semibold tracking-[0.14em] text-[#D8AE86] sm:text-[9px]">
              {microcopy.step}
            </p>
            <h2
              id="private-appointment-title"
              className="mt-4 max-w-[620px] text-[clamp(2.75rem,6.5vw,5.4rem)] font-normal leading-[0.98] tracking-[-0.05em] text-white"
            >
              {copy.title}
            </h2>
            <p className="mt-3 max-w-[520px] text-[20px] leading-[1.25] tracking-[-0.025em] text-white/60 sm:text-[24px]">
              {copy.italicTitle}
            </p>
            <p className="mt-5 max-w-[500px] text-[10px] leading-6 text-white/48 sm:text-[11px] sm:leading-7">
              {copy.description}
            </p>
          </div>
        </div>

        <div
          className={`relative flex min-h-[100svh] items-center bg-[#F1ECE4] px-5 py-14 text-[#11100F] sm:px-8 sm:py-18 lg:px-[5vw] lg:py-20 ${
            isRtl ? "lg:order-1" : ""
          }`}
        >
          <div
            className={`mx-auto w-full max-w-[760px] transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              revealed ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
            }`}
          >
            <div className="border-b border-black/[0.12] pb-7 sm:pb-8">
              <div className="flex items-center gap-3 text-[8px] font-semibold tracking-[0.14em] text-[var(--appointment-copper)] sm:text-[9px]">
                <span className="h-px w-8 bg-current" aria-hidden="true" />
                <span>{copy.eyebrow}</span>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
                <h3 className="text-[28px] font-semibold tracking-[-0.035em] sm:text-[34px]">
                  {microcopy.formTitle}
                </h3>
                <p className="max-w-[360px] text-[9px] leading-5 text-black/44 sm:text-[10px] sm:leading-6">
                  {microcopy.formNote}
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-8 grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2 sm:gap-y-6"
            >
              <Field
                id="full-name"
                name="fullName"
                label={copy.form.fullName}
                autoComplete="name"
                direction={direction}
              />

              <Field
                id="email"
                name="email"
                label={copy.form.email}
                type="email"
                autoComplete="email"
                direction="ltr"
              />

              <Field
                id="phone"
                name="phone"
                label={copy.form.phone}
                type="tel"
                autoComplete="tel"
                direction="ltr"
              />

              <Field
                id="date"
                name="preferredDate"
                label={copy.form.preferredDate}
                type="date"
                direction="ltr"
              />

              <Field
                id="time"
                name="preferredTime"
                label={copy.form.preferredTime}
                type="time"
                direction="ltr"
                className="sm:col-span-2"
              />

              <div className="sm:col-span-2">
                <label
                  htmlFor="message"
                  className="mb-2 block text-[9px] font-semibold text-black/52 sm:text-[10px]"
                >
                  {copy.form.message}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  dir={direction}
                  className="min-h-[132px] w-full resize-y border border-black/[0.13] bg-white/38 px-4 py-3 text-[13px] leading-6 text-[#11100F] outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-black/24 focus:border-[var(--appointment-copper)] focus:bg-white/62 focus:shadow-[0_0_0_1px_var(--appointment-copper)]"
                />
              </div>

              <div className="mt-1 flex flex-col gap-4 border-t border-black/[0.10] pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-[360px] text-[8px] leading-5 text-black/38 sm:text-[9px]">
                  {microcopy.privacy}
                </p>

                <Button
                  type="submit"
                  variant="copper"
                  size="lg"
                  icon={<ActionIcon />}
                  iconPosition="left"
                  className="!min-h-12 !w-full !px-6 !text-[10px] sm:!w-auto sm:!min-w-[210px]"
                >
                  {copy.form.submit}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

type FieldProps = {
  id: string;
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  direction: "ltr" | "rtl";
  className?: string;
};

function Field({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  direction,
  className = "",
}: FieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-2 block text-[9px] font-semibold text-black/52 sm:text-[10px]"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        dir={direction}
        className="h-12 w-full border border-black/[0.13] bg-white/38 px-4 text-[13px] text-[#11100F] outline-none transition-[border-color,background-color,box-shadow] duration-200 focus:border-[var(--appointment-copper)] focus:bg-white/62 focus:shadow-[0_0_0_1px_var(--appointment-copper)] [color-scheme:light]"
      />
    </div>
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
