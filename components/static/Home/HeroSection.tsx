import { type CSSProperties } from "react";

import { ArrowLeftIcon, Button } from "@/components/ui/Button";
import type { HomeCopy } from "@/lib/i18n/home-copy";
import {
  getHtmlLang,
  getLocaleDirection,
  type Locale,
} from "@/lib/i18n/config";
import { localizedHref } from "@/lib/i18n/routes";
import { brandColors } from "@/theme/theme-colors";

const HERO_VIDEO = "/assets/video/hero-video.mp4";

type HeroSectionProps = {
  copy: HomeCopy["hero"];
  locale: Locale;
};

export function HeroSection({ copy, locale }: HeroSectionProps) {
  const colors = {
    "--hero-black": brandColors.black.hex,
    "--hero-black-rgb": brandColors.black.rgb,
    "--hero-white": brandColors.white.hex,
    "--hero-copper": brandColors.copper.hex,
  } as CSSProperties;
  const direction = getLocaleDirection(locale);
  const htmlLang = getHtmlLang(locale);

  return (
    <section
      dir={direction}
      lang={htmlLang}
      aria-labelledby="home-hero-title"
      style={colors}
      className="relative isolate flex min-h-[100svh] w-full overflow-hidden bg-[var(--hero-black)] text-[var(--hero-white)] md:min-h-[720px] lg:min-h-[760px] xl:min-h-[820px]"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        className="pointer-events-none absolute inset-0 -z-30 size-full object-cover object-[center_48%] sm:object-center lg:object-[center_46%]"
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgb(var(--hero-black-rgb)/0.18)_0%,rgb(var(--hero-black-rgb)/0.08)_28%,rgb(var(--hero-black-rgb)/0.26)_58%,rgb(var(--hero-black-rgb)/0.86)_100%)] md:hidden"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 hidden bg-[linear-gradient(180deg,rgb(var(--hero-black-rgb)/0.28)_0%,rgb(var(--hero-black-rgb)/0.08)_32%,rgb(var(--hero-black-rgb)/0.16)_60%,rgb(var(--hero-black-rgb)/0.72)_100%)] md:block"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_22%,rgb(var(--hero-black-rgb)/0.12)_66%,rgb(var(--hero-black-rgb)/0.38)_125%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-5 bottom-5 top-[90px] border border-white/[0.08] sm:inset-x-7 sm:bottom-7 md:inset-x-10 md:bottom-9 md:top-[104px] lg:inset-x-12 xl:inset-x-14"
      />

      <div className="mx-auto flex min-h-[100svh] w-full max-w-[1920px] items-end justify-center px-5 pb-14 pt-[112px] sm:px-8 sm:pb-16 md:min-h-[720px] md:items-center md:px-10 md:pb-20 md:pt-[120px] lg:min-h-[760px] lg:px-12 xl:min-h-[820px] xl:px-14">
        <div className="flex w-full max-w-[860px] flex-col items-center text-center">
          <div className="flex items-center justify-center gap-3">
            <span
              className="h-px w-8 bg-[var(--hero-copper)]/90"
              aria-hidden="true"
            />
            <p className="text-[9px] font-medium tracking-[0.12em] text-white/56 sm:text-[10px]">
              {copy.eyebrow}
            </p>
            <span
              className="h-px w-8 bg-[var(--hero-copper)]/90"
              aria-hidden="true"
            />
          </div>

          <div className="mt-5 flex w-full flex-col items-center sm:mt-6">
            <div className="min-w-0 text-center">
              <h1
                id="home-hero-title"
                className="mx-auto max-w-[760px] text-xl font-semibold leading-[1.02] tracking-[-0.055em] text-[var(--hero-white)] md:text-5xl"
              >
                {copy.title}
              </h1>

              <p className="mx-auto mt-6 max-w-[560px] text-[12px] font-normal leading-7 text-white/66 sm:text-[13px] md:mt-7 md:text-[14px] md:leading-8">
                {copy.description}
              </p>

              <div className="mx-auto mt-8 flex w-full max-w-[500px] flex-col gap-2.5 sm:mt-9 sm:flex-row sm:gap-3 md:mt-10">
                <div className="w-full sm:w-[230px]">
                  <Button
                    href={localizedHref(copy.primaryAction.href, locale)}
                    variant="cream"
                    size="lg"
                    fullWidth
                    icon={<ArrowLeftIcon />}
                    iconPosition="right"
                    className="!tracking-normal"
                  >
                    {copy.primaryAction.label}
                  </Button>
                </div>

                <div className="w-full sm:w-[230px]">
                  <Button
                    href={localizedHref(copy.secondaryAction.href, locale)}
                    variant="outline"
                    size="lg"
                    fullWidth
                    icon={<ArrowLeftIcon />}
                    iconPosition="right"
                    className="min-w-0 !border-white/40 !bg-black/15 !text-white !tracking-normal backdrop-blur-[4px] hover:!border-white hover:!bg-white hover:!text-black"
                  >
                    {copy.secondaryAction.label}
                  </Button>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-3 text-[8px] font-medium tracking-[0.1em] text-white/36 sm:mt-10">
                <span>{copy.footnote}</span>
                <span className="h-px w-12 bg-white/18" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
