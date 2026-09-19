"use client";

import Image from "next/image";

import {
  type CSSProperties,
  type FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { brandColors } from "@/theme/theme-colors";

import { ArrowRightIcon, Button } from "@/components/ui/Button";

type PrivateAppointmentSectionProps = {
  imageSrc: string;

  imageAlt?: string;

  eyebrow?: string;

  title?: string;

  italicTitle?: string;

  description?: string;

  mobileImagePosition?: string;

  desktopImagePosition?: string;

  className?: string;
};

export function PrivateAppointmentSection({
  imageSrc,

  imageAlt = "",

  eyebrow = "اجازه دهید شخصاً همراه شما باشیم",

  title = "رزرو قرار ملاقات خصوصی.",

  italicTitle = "تجربه‌ای متناسب با شما.",

  description = "چند جزئیات کوتاه با ما در میان بگذارید تا تیم نجیب‌زاده برای هماهنگی و تأیید قرار ملاقات با شما در ارتباط باشد.",

  mobileImagePosition = "68% center",

  desktopImagePosition = "center",

  className = "",
}: PrivateAppointmentSectionProps) {
  const { ref, revealed } = useRevealOnce<HTMLElement>();

  const themeVars = {
    "--appointment-black": brandColors.black.hex,

    "--appointment-black-rgb": brandColors.black.rgb,

    "--appointment-copper": brandColors.copper.hex,

    "--appointment-mobile-position": mobileImagePosition,

    "--appointment-desktop-position": desktopImagePosition,
  } as CSSProperties;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    /*
     * بعداً API / Server Action
     * اینجا وصل می‌شود.
     */
  }

  return (
    <section
      dir="rtl"
      ref={ref}
      style={themeVars}
      className={`
        relative
        isolate

        min-h-[100svh]
        md:min-h-[100svh]

        w-full
        overflow-hidden

        bg-[var(--appointment-black)]
        text-white

        ${className}
      `}
    >
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        sizes="100vw"
        loading="lazy"
        draggable={false}
        className="
          -z-30

          object-cover

          object-[var(--appointment-mobile-position)]

          md:object-[var(--appointment-desktop-position)]
        "
      />

      {/* =====================================================
          GRADIENT
      ====================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-20

          bg-[linear-gradient(90deg,rgb(var(--appointment-black-rgb)/0.97)_0%,rgb(var(--appointment-black-rgb)/0.91)_33%,rgb(var(--appointment-black-rgb)/0.48)_52%,rgb(var(--appointment-black-rgb)/0.08)_78%,rgb(var(--appointment-black-rgb)/0.22)_100%)]

          max-md:bg-[linear-gradient(180deg,rgb(var(--appointment-black-rgb)/0.10)_0%,rgb(var(--appointment-black-rgb)/0.22)_30%,rgb(var(--appointment-black-rgb)/0.96)_100%)]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none

          absolute
          inset-0
          -z-10

          bg-[radial-gradient(circle_at_center,transparent_34%,rgb(var(--appointment-black-rgb)/0.30)_120%)]
        "
      />

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          relative
          z-10

          flex

          min-h-[100svh]
          md:min-h-[100svh]

          items-end

          px-6

          pb-12
          pt-28

          sm:px-10
          sm:pb-16

          md:items-center

          md:px-[7vw]
          md:py-24
        "
      >
        <div
          className={`
  mx-auto
  w-full
  max-w-[610px]
  text-center

  transition-[opacity,transform]
  duration-[900ms]
  ease-[cubic-bezier(0.22,1,0.36,1)]

  ${revealed ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}
`}
        >
          {/* =================================================
              EYEBROW
          ================================================= */}

          <div
            className="
    mb-5
    flex
    items-center
    justify-center
    gap-3
    text-[7px]
    font-semibold
    tracking-[0.12em]
    text-[var(--appointment-copper)]
    sm:text-[8px]
  "
          >
            <span className="h-px w-7 bg-[var(--appointment-copper)]" />

            <span>{eyebrow}</span>

            <span className="h-px w-7 bg-[var(--appointment-copper)]" />
          </div>

          {/* =================================================
              TITLE
          ================================================= */}

          <h2
            className="
    flex
    flex-col
    items-center
    text-center
     
    text-[clamp(3rem,11vw,4.5rem)]
    font-normal
    leading-[1.04]
    tracking-[-0.04em]
    text-white
    md:text-[clamp(4rem,5vw,5.7rem)]
  "
          >
            <span>{title}</span>

            <span className="mt-[0.1em] text-white/76">{italicTitle}</span>
          </h2>

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          <p
            className="
    mx-auto
    mt-6
    max-w-[420px]
    text-center
    text-[9px]
    leading-[2]
    text-white/55
    sm:text-[10px]
  "
          >
            {description}
          </p>

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="
              mt-9

              grid
              grid-cols-1

              gap-x-5
              gap-y-7

              sm:grid-cols-2

              md:mt-10
            "
          >
            <Field
              id="full-name"
              name="fullName"
              label="نام و نام خانوادگی"
              autoComplete="name"
            />

            <Field
              id="email"
              name="email"
              label="آدرس ایمیل"
              type="email"
              autoComplete="email"
            />

            <Field
              id="phone"
              name="phone"
              label="شماره تماس"
              type="tel"
              autoComplete="tel"
              className="sm:col-span-2"
            />

            <Field
              id="date"
              name="preferredDate"
              label="تاریخ مورد نظر"
              type="date"
            />

            <Field
              id="time"
              name="preferredTime"
              label="ساعت مورد نظر"
              type="time"
            />

            {/* MESSAGE */}

            <div
              className="
                sm:col-span-2
              "
            >
              <label
                htmlFor="message"
                className="
                  block

                  text-[7px]
                  font-semibold

                  uppercase
                  tracking-[0.17em]

                  text-white/55
                "
              >
                پیام شما
              </label>

              <textarea
                id="message"
                name="message"
                rows={3}
                className="
                  mt-2

                  w-full

                  resize-none

                  border-0
                  border-b
                  border-white/25

                  bg-transparent

                  py-2

                  text-[11px]

                  text-white

                  outline-none

                  transition-colors
                  duration-200

                  placeholder:text-white/25

                  focus:border-white
                "
              />
            </div>

            {/* SUBMIT */}

            <div
              className="
                mt-2

                w-full

                sm:col-span-2
                sm:max-w-[250px]
              "
            >
              <Button
                type="submit"
                variant="copper"
                size="lg"
                icon={<ArrowRightIcon />}
                fullWidth
              >
                ارسال درخواست
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   FIELD
============================================================================ */

type FieldProps = {
  id: string;

  name: string;

  label: string;

  type?: string;

  autoComplete?: string;

  className?: string;
};

function Field({
  id,

  name,

  label,

  type = "text",

  autoComplete,

  className = "",
}: FieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="
  block
  text-center
  text-[7px]
  font-semibold
  tracking-[0.1em]
  text-white/55
"
      >
        {label}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        className="
  mt-2
  h-9
  w-full

  border-0
  border-b
  border-white/25

  bg-transparent

  text-center
  text-[11px]
  text-white

  outline-none

  transition-colors
  duration-200

  focus:border-white

  [color-scheme:dark]
"
      />
    </div>
  );
}

/* ==========================================================================
   REVEAL
============================================================================ */

function useRevealOnce<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;

        requestAnimationFrame(() => setRevealed(true));

        observer.disconnect();
      },
      {
        threshold: 0.08,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return {
    ref,
    revealed,
  };
}
