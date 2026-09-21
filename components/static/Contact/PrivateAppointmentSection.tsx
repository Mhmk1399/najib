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
      className={`
        relative
        isolate

        min-h-[100svh]

        w-full

        overflow-hidden

        bg-[var(--appointment-black)]

        text-white

        md:min-h-[100svh]

        ${className}
      `}
    >
      {/* BACKGROUND */}

      <Image
        src={imageSrc}
        alt={copy.imageAlt}
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

      {/* GRADIENT */}

      <div
        aria-hidden="true"
        className={`
          pointer-events-none

          absolute
          inset-0

          -z-20

          max-md:bg-[linear-gradient(180deg,rgb(var(--appointment-black-rgb)/0.10)_0%,rgb(var(--appointment-black-rgb)/0.22)_30%,rgb(var(--appointment-black-rgb)/0.96)_100%)]

          ${
            isRtl
              ? "md:bg-[linear-gradient(90deg,rgb(var(--appointment-black-rgb)/0.08)_0%,rgb(var(--appointment-black-rgb)/0.48)_48%,rgb(var(--appointment-black-rgb)/0.91)_67%,rgb(var(--appointment-black-rgb)/0.97)_100%)]"
              : "md:bg-[linear-gradient(90deg,rgb(var(--appointment-black-rgb)/0.97)_0%,rgb(var(--appointment-black-rgb)/0.91)_33%,rgb(var(--appointment-black-rgb)/0.48)_52%,rgb(var(--appointment-black-rgb)/0.08)_100%)]"
          }
        `}
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

      {/* CONTENT */}

      <div
        className="
          relative
          z-10

          flex

          min-h-[100svh]

          items-end

          px-6

          pb-12
          pt-28

          sm:px-10
          sm:pb-16

          md:min-h-[100svh]

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

            ${
              revealed
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }
          `}
        >
          {/* EYEBROW */}

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
            <span
              aria-hidden="true"
              className="
                h-px
                w-7

                bg-[var(--appointment-copper)]
              "
            />

            <span>{copy.eyebrow}</span>

            <span
              aria-hidden="true"
              className="
                h-px
                w-7

                bg-[var(--appointment-copper)]
              "
            />
          </div>

          {/* TITLE */}

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
            <span>{copy.title}</span>

            <span
              className="
                mt-[0.1em]

                text-white/76
              "
            >
              {copy.italicTitle}
            </span>
          </h2>

          {/* DESCRIPTION */}

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
            {copy.description}
          </p>

          {/* FORM */}

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
              className="sm:col-span-2"
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

                  text-center

                  text-[7px]
                  font-semibold

                  uppercase
                  tracking-[0.17em]

                  text-white/55
                "
              >
                {copy.form.message}
              </label>

              <textarea
                id="message"
                name="message"
                rows={3}
                dir={direction}
                className="
                  mt-2

                  w-full

                  resize-none

                  border-0
                  border-b
                  border-white/25

                  bg-transparent

                  py-2

                  text-center
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
                icon={<ActionIcon />}
                fullWidth
              >
                {copy.form.submit}
              </Button>
            </div>
          </form>
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
        dir={direction}
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
        if (!entry?.isIntersecting) {
          return;
        }

        requestAnimationFrame(() => {
          setRevealed(true);
        });

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
