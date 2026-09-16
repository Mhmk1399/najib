import { type CSSProperties } from "react";

import { brandColors } from "@/theme/theme-colors";
import { ArrowLeftIcon, Button } from "@/components/ui/Button";

const HERO_VIDEO = "/assets/video/hero-video.mp4";

export function HeroSection() {
  const colors = {
    "--hero-black": brandColors.black.hex,
    "--hero-black-rgb": brandColors.black.rgb,
    "--hero-white": brandColors.white.hex,
    "--hero-copper": brandColors.copper.hex,
  } as CSSProperties;

  return (
    <section
      dir="rtl"
      lang="fa"
      aria-labelledby="home-hero-title"
      style={colors}
      className="relative isolate flex min-h-[100svh] w-full overflow-hidden bg-[var(--hero-black)] text-[var(--hero-white)] md:min-h-[720px] lg:min-h-[760px] xl:min-h-[820px]"
    >
      {/* Background video stays decorative so the main copy is immediately semantic. */}
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

      {/* Mobile readability: content sits lower, so the contrast comes from the bottom. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgb(var(--hero-black-rgb)/0.18)_0%,rgb(var(--hero-black-rgb)/0.08)_28%,rgb(var(--hero-black-rgb)/0.26)_58%,rgb(var(--hero-black-rgb)/0.86)_100%)] md:hidden"
      />

      {/* Desktop readability stays symmetrical because the composition is centered. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 hidden bg-[linear-gradient(180deg,rgb(var(--hero-black-rgb)/0.28)_0%,rgb(var(--hero-black-rgb)/0.08)_32%,rgb(var(--hero-black-rgb)/0.16)_60%,rgb(var(--hero-black-rgb)/0.72)_100%)] md:block"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_22%,rgb(var(--hero-black-rgb)/0.12)_66%,rgb(var(--hero-black-rgb)/0.38)_125%)]"
      />

      {/* Subtle frame keeps the hero feeling like a composed campaign image. */}
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
              نجیب‌زاده / پوشاک مردانه
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
                className="mx-auto max-w-[760px] text-[clamp(2.9rem,12vw,5.1rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-[var(--hero-white)] sm:text-[clamp(3.5rem,9vw,5.8rem)] md:text-[clamp(4.2rem,7vw,6.4rem)] lg:text-[clamp(4.7rem,6vw,6.9rem)]"
              >
                <span className="block">حضور،</span>
                <span className="block text-white/94">با دقت دوخته شده.</span>
              </h1>

              <p className="mx-auto mt-6 max-w-[560px] text-[12px] font-normal leading-7 text-white/66 sm:text-[13px] md:mt-7 md:text-[14px] md:leading-8">
                خیاطی مدرن، عطرهای امضادار و جزئیاتی سنجیده؛ برای مردی که حضورش
                را با انتخاب‌های دقیق تعریف می‌کند.
              </p>

              <div className="mx-auto mt-8 flex w-full max-w-[500px] flex-col gap-2.5 sm:mt-9 sm:flex-row sm:gap-3 md:mt-10">
                <div className="w-full sm:w-[230px]">
                  <Button
                    href="/clothing"
                    variant="cream"
                    size="lg"
                    fullWidth
                    icon={
                         <ArrowLeftIcon />
                     }
                    iconPosition="right"
                    className="!tracking-normal"
                  >
                    مشاهده پوشاک
                  </Button>
                </div>

                <div className="w-full sm:w-[230px]">
                  <Button
                    href="/shop"
                    variant="outline"
                    size="lg"
                    fullWidth
                    icon={
                         <ArrowLeftIcon />
                     }
                    iconPosition="right"
                    className="min-w-0 !border-white/40 !bg-black/15 !text-white !tracking-normal backdrop-blur-[4px] hover:!border-white hover:!bg-white hover:!text-black"
                  >
                    ورود به فروشگاه
                  </Button>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-center gap-3 text-[8px] font-medium tracking-[0.1em] text-white/36 sm:mt-10">
                <span>برای استانداردی بالاتر بپوشید</span>
                <span className="h-px w-12 bg-white/18" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
