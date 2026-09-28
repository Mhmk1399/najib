"use client";

import Image from "next/image";
import Link from "next/link";

import { type CSSProperties, useEffect, useRef, useState } from "react";

import type { ContactCopy, ContactMethodIcon } from "@/lib/i18n/contact-copy";
import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/routes";
import { brandColors } from "@/theme/theme-colors";

type ContactServicesSectionProps = {
  copy: ContactCopy["services"];
  locale: Locale;
  imageSrc: string;
  imagePosition?: string;
  className?: string;
};

export function ContactSection({
  copy,
  locale,
  imageSrc,
  imagePosition = "center",
  className = "",
}: ContactServicesSectionProps) {
  const { ref, revealed } = useRevealOnce<HTMLElement>();
  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);
  const isRtl = direction === "rtl";

  const themeVars = {
    "--contact-black": brandColors.black.hex,
    "--contact-copper": brandColors.copper.hex,
    "--contact-image-position": imagePosition,
  } as CSSProperties;

  return (
    <section
      id="services"
      ref={ref}
      dir={direction}
      lang={htmlLang}
      style={themeVars}
      aria-labelledby="contact-services-title"
      className={`relative w-full overflow-hidden bg-[#F1ECE4] text-[#11100F] ${className}`}
    >
      <div className="grid min-h-[92svh] lg:grid-cols-[0.88fr_1.12fr]">
        <div
          className={`relative min-h-[54svh] overflow-hidden bg-[#0A0A09] lg:min-h-[92svh] ${
            isRtl ? "lg:order-2" : ""
          }`}
        >
          <Image
            src={imageSrc}
            alt={copy.imageAlt}
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 44vw, 100vw"
            draggable={false}
            className="object-cover object-[var(--contact-image-position)] transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:hover:scale-[1.015]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.03)_0%,rgba(0,0,0,0.12)_50%,rgba(0,0,0,0.72)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8 lg:p-10 xl:p-12">
            <div className="flex items-center gap-3 text-[8px] font-semibold tracking-[0.14em] text-white/56 sm:text-[9px]">
              <span className="h-px w-8 bg-[var(--contact-copper)]" aria-hidden="true" />
              <span>{copy.imageCaption}</span>
            </div>
            <p className="mt-4 max-w-[430px] text-[11px] leading-6 text-white/62 sm:text-[12px] sm:leading-7">
              {copy.footerNote}
            </p>
          </div>
        </div>

        <div
          className={`flex min-h-[92svh] flex-col justify-center px-5 py-16 sm:px-8 sm:py-20 lg:px-[5vw] lg:py-24 ${
            isRtl ? "lg:order-1" : ""
          }`}
        >
          <div
            className={`transition-[opacity,transform] duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              revealed ? "translate-y-0 opacity-100" : "translate-y-7 opacity-0"
            }`}
          >
            <div className="flex items-center gap-3 text-[8px] font-semibold tracking-[0.14em] text-[var(--contact-copper)] sm:text-[9px]">
              <span className="h-px w-8 bg-current" aria-hidden="true" />
              <span>{copy.eyebrow}</span>
            </div>

            <h2
              id="contact-services-title"
              className="mt-5 max-w-[800px] text-[clamp(2.75rem,7vw,5.7rem)] font-normal leading-[0.98] tracking-[-0.05em] text-[#11100F]"
            >
              {copy.title}
            </h2>

            <div className="mt-10 border-t border-black/[0.12] sm:mt-12">
              {copy.methods.map((method, index) => {
                const href = method.action
                  ? method.action.href.startsWith("/")
                    ? localizedHref(method.action.href, locale)
                    : method.action.href
                  : undefined;

                const externalProps = method.action?.external
                  ? { target: "_blank" as const, rel: "noopener noreferrer" }
                  : {};

                const content = (
                  <>
                    <div className="flex items-start gap-4 sm:gap-5">
                      <span className="mt-0.5 w-7 shrink-0 text-[8px] font-medium tabular-nums text-black/32 sm:w-8">
                        0{index + 1}
                      </span>
                      <span className="mt-0.5 shrink-0 text-[var(--contact-copper)]">
                        <MethodIcon icon={method.icon} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-[18px] font-semibold tracking-[-0.025em] text-[#11100F] sm:text-[21px]">
                          {method.title}
                        </h3>
                        <div className="mt-2.5 max-w-[640px] space-y-0.5">
                          {method.description.map((line, lineIndex) => (
                            <p
                              key={`${method.id}-${lineIndex}`}
                              dir={line.includes("@") || line.startsWith("+") ? "ltr" : undefined}
                              className="text-[10px] leading-5 text-black/48 sm:text-[11px] sm:leading-6"
                            >
                              {line}
                            </p>
                          ))}
                        </div>
                      </div>
                      {method.action ? (
                        <span className="mt-1 hidden shrink-0 items-center gap-2 text-[9px] font-semibold text-black/54 transition-[color,transform] duration-300 group-hover:text-[var(--contact-copper)] group-hover:translate-x-0.5 ltr:group-hover:-translate-x-0.5 sm:inline-flex">
                          {method.action.label}
                          <ArrowIcon isRtl={isRtl} />
                        </span>
                      ) : null}
                    </div>
                    {method.action ? (
                      <div className="mt-4 flex items-center gap-2 ps-[76px] text-[9px] font-semibold text-black/52 sm:hidden">
                        {method.action.label}
                        <ArrowIcon isRtl={isRtl} />
                      </div>
                    ) : null}
                  </>
                );

                return href ? (
                  <Link
                    key={method.id}
                    href={href}
                    {...externalProps}
                    className="group block border-b border-black/[0.10] py-5 outline-none transition-[background-color,padding] duration-300 hover:bg-black/[0.025] focus-visible:bg-black/[0.035] focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[var(--contact-copper)] sm:py-6 lg:hover:px-3"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={method.id} className="border-b border-black/[0.10] py-5 sm:py-6">
                    {content}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MethodIcon({ icon }: { icon: ContactMethodIcon }) {
  if (icon === "appointment") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
        <path d="M5 4.5h14v15H5zM8 2.8v3.4M16 2.8v3.4M5 9h14" stroke="currentColor" strokeWidth="1.2" />
        <path d="M9 13h2v2H9zM13 13h2v2h-2z" fill="currentColor" />
      </svg>
    );
  }

  if (icon === "service") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
        <path d="M4 5h16v11H9l-5 4V5Z" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 9h8M8 12h5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }

  if (icon === "location") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
        <path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="12" cy="10" r="2" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="size-5">
      <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.2" />
      <path d="m5 7 7 5 7-5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function ArrowIcon({ isRtl }: { isRtl: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`size-3.5 ${isRtl ? "" : "rotate-180"}`}
    >
      <path d="M13.5 8H3M6.5 4.5 3 8l3.5 3.5" stroke="currentColor" strokeWidth="1.1" />
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
