import { type CSSProperties } from "react";

import { brandColors } from "@/theme/theme-colors";
import { ArrowRightIcon, Button } from "@/components/ui/Button";

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
      aria-labelledby="home-hero-title"
      style={colors}
      className="relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[var(--hero-black)] px-5 pb-14 pt-[104px] text-[var(--hero-white)] sm:px-8 sm:pb-16 sm:pt-[112px] md:min-h-[720px] md:px-10 md:pb-20 md:pt-[120px] lg:min-h-[760px] xl:min-h-[820px]"
    >
      {/* Decorative background video. Keeping it outside the content tree means
          the semantic hero content is available immediately during SSR. */}
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

      {/* Single cinematic treatment: enough contrast for type without flattening
          the photography/video. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 bg-[linear-gradient(180deg,rgb(var(--hero-black-rgb)/0.38)_0%,rgb(var(--hero-black-rgb)/0.08)_34%,rgb(var(--hero-black-rgb)/0.12)_58%,rgb(var(--hero-black-rgb)/0.62)_100%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_24%,rgb(var(--hero-black-rgb)/0.16)_68%,rgb(var(--hero-black-rgb)/0.42)_125%)]"
      />

      <div className="mx-auto flex w-full max-w-[980px] flex-col items-center text-center">
        <h1
          id="home-hero-title"
          className="max-w-[920px] font-serif text-[clamp(3.2rem,12vw,5.5rem)] font-normal leading-[0.9] tracking-[-0.055em] text-[var(--hero-white)] sm:text-[clamp(4rem,9vw,6.1rem)] md:text-[clamp(4.8rem,7vw,6.9rem)] lg:text-[clamp(5.4rem,6vw,7.4rem)]"
        >
          Presence, tailored.
        </h1>

        <span
          aria-hidden="true"
          className="mt-6 h-px w-9 bg-[var(--hero-copper)]/90 sm:mt-7"
        />

        <p className="mt-6 max-w-[520px] text-[11px] font-normal leading-[1.8] text-white/70 sm:text-[12px] md:mt-7 md:text-[13px] md:leading-[1.75]">
          Modern tailoring, signature fragrance and considered objects shaped
          around the Najibzadeh way of living.
        </p>

        <div className="mt-8 grid w-full max-w-[430px] grid-cols-2 gap-2 sm:mt-9">
          <Button
            href="/clothing"
            variant="cream"
            size="lg"
            icon={<ArrowRightIcon />}
            fullWidth
          >
            Explore Clothing
          </Button>

          <Button
            href="/shop"
            variant="outline"
            size="lg"
            icon={<ArrowRightIcon />}
            fullWidth
            className="min-w-0 border-white/45 bg-black/15 text-white backdrop-blur-sm hover:border-white hover:bg-white hover:text-black"
          >
           Visit Our Shop
          </Button>
        </div>
      </div>
    </section>
  );
}
