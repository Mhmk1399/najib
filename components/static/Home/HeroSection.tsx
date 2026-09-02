"use client";

import { type CSSProperties, useEffect, useState } from "react";

import { brandColors } from "@/theme/theme-colors";

import { ArrowRightIcon, Button } from "@/components/ui/Button";

const HERO_VIDEO = "/assets/video/hero-video.mp4";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);

  const colors = {
    "--hero-black": brandColors.black.hex,

    "--hero-black-rgb": brandColors.black.rgb,

    "--hero-white": brandColors.white.hex,

    "--hero-copper": brandColors.copper.hex,
  } as CSSProperties;

  return (
    <section
      style={colors}
      className="
        relative
        isolate

        h-[100svh]
        min-h-[620px]

        w-full
        overflow-hidden

        bg-[var(--hero-black)]
        text-[var(--hero-white)]
      "
    >
      {/* =====================================================
          VIDEO
      ====================================================== */}

      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        className="
          absolute
          inset-0
          -z-30

          size-full

          object-cover
          object-[center_48%]

          brightness-[0.92]

          sm:object-center

          lg:object-[center_46%]
        "
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      {/* =====================================================
          NEUTRAL OVERLAY
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-20

          bg-[linear-gradient(180deg,rgb(var(--hero-black-rgb)/0.18)_0%,rgb(var(--hero-black-rgb)/0.02)_28%,rgb(var(--hero-black-rgb)/0.05)_58%,rgb(var(--hero-black-rgb)/0.58)_100%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-20

          bg-[radial-gradient(circle_at_center,transparent_36%,rgb(var(--hero-black-rgb)/0.32)_120%)]
        "
      />

      {/* Mobile bottom readability */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-x-0
          bottom-0
          -z-10

          h-[32%]

          bg-gradient-to-t
          from-black/55
          to-transparent

          md:h-[24%]
          md:from-black/30
        "
      />

      {/* =====================================================
          CENTER CONTENT
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          z-10

          flex
          items-center
          justify-center

          px-5

          pb-24

          sm:px-8

          md:pb-0
        "
      >
        <div
          className={`
            flex
            w-full
            max-w-[1000px]

            flex-col
            items-center

            text-center

            transition-[opacity,transform]
            duration-[900ms]

            ease-[cubic-bezier(0.22,1,0.36,1)]

            ${
              mounted
                ? `
                  translate-y-0
                  opacity-100
                `
                : `
                  translate-y-8
                  opacity-0
                `
            }
          `}
        >
          

          {/* =================================================
              TITLE

              فقط White.
              Copper وارد heading نمی‌شود.
          ================================================= */}

          <h1
            className="
             

              flex mt-68
              flex-col
              items-center

              font-serif
              font-normal

              leading-[0.87]
              tracking-[-0.055em]
            "
          >
            <span
              className="
                block

                text-[clamp(3.1rem,10vw,5.4rem)]

                text-[var(--hero-white)]

                sm:text-[clamp(4rem,8vw,6rem)]

                md:text-[clamp(4.8rem,7vw,6.8rem)]

                lg:text-[clamp(5.6rem,6.1vw,7.3rem)]
              "
            >
              Presence, tailored.
            </span>

       
          </h1>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <p
            className="
              mt-6

              max-w-[420px]

              text-[9px]
              font-normal

              leading-[1.75]

              text-[var(--hero-white)]/68

              sm:max-w-[470px]
              sm:text-[10px]

              md:mt-7
              md:text-[13px]
            "
          >
            Modern tailoring, signature fragrance and considered objects shaped
            around the Najibzadeh way of living.
          </p>

          {/* =================================================
              DESKTOP BUTTONS

              Mobile version پایین سکشن جداست.
          ================================================= */}

          <div
            className="
              mt-8

              hidden
              w-full
              max-w-[440px]

              grid-cols-2
              gap-2

              md:grid
            "
          >
            <Button
              href="/fragrance"
              variant="copper"
              size="lg"
              icon={<ArrowRightIcon />}
              fullWidth
            >
              Discover Fragrance
            </Button>

            <Button
              href="/clothing"
              variant="cream"
              size="lg"
              icon={<ArrowRightIcon />}
              fullWidth
            >
              Explore Clothing
            </Button>
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE BUTTONS

          همیشه کنار هم.
          همیشه پایین Hero.
      ====================================================== */}

      <div
        className={`
          absolute
          inset-x-4

          bottom-[max(148px,env(safe-area-inset-bottom))]

          z-20

          grid
          grid-cols-2
          gap-2

          transition-[opacity,transform]
          duration-700

          ease-[cubic-bezier(0.22,1,0.36,1)]

          md:hidden

          ${
            mounted
              ? `
                translate-y-0
                opacity-100
                delay-200
              `
              : `
                translate-y-5
                opacity-0
              `
          }
        `}
      >
        <Button
          href="/fragrance"
          variant="outline"
          size="md"
          icon={<ArrowRightIcon />}
          fullWidth
          
          className="
            min-w-0

            border-white/55

            bg-black/25

            text-white

            backdrop-blur-md

            hover:border-white
            hover:bg-white
            hover:text-black
          "
        >
          Discover Fragrance
        </Button>

        <Button
          href="/clothing"
          variant="copper"
          size="md"
          icon={<ArrowRightIcon />}
          fullWidth
        >
          Explore Clothing
        </Button>
      </div>

 
    </section>
  );
}
