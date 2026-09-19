"use client";

import Image from "next/image";

import { type CSSProperties, useEffect, useState } from "react";

import { brandColors, darkTokens } from "@/theme/theme-colors";

import { ArrowRightIcon, Button } from "@/components/ui/Button";

/* ==========================================================================
   TYPES
============================================================================ */

type TermsSection = {
  id: string;

  title: string;

  paragraphs: string[];
};

/* ==========================================================================
   DATA

   IMPORTANT:
   این متن فعلاً placeholder است.
   بعداً متن حقوقی نهایی را جایگزین کن.
============================================================================ */

const TERMS_SECTIONS: TermsSection[] = [
  {
    id: "introduction",
    title: "مقدمه",
    paragraphs: [
      "به نجیب‌زاده خوش آمدید. این شرایط و ضوابط، نحوه دسترسی و استفاده شما از وب‌سایت، خدمات دیجیتال و خریدهایی را که از طریق تجربه آنلاین ما انجام می‌دهید، مشخص می‌کند.",
      "با دسترسی به این وب‌سایت یا استفاده از آن، تأیید می‌کنید که این شرایط را مطالعه و درک کرده‌اید و با آن‌ها موافق هستید.",
    ],
  },
  {
    id: "use-of-site",
    title: "استفاده از وب‌سایت",
    paragraphs: [
      "شما تنها می‌توانید برای اهداف قانونی از این وب‌سایت استفاده کنید و استفاده شما نباید حقوق دیگران را نقض کند یا دسترسی و بهره‌مندی آن‌ها از تجربه نجیب‌زاده را محدود سازد.",
      "هرگونه سوءاستفاده، بازتولید غیرمجاز، ایجاد اختلال یا تلاش برای دسترسی بدون مجوز به هر بخش از وب‌سایت، سامانه‌ها یا خدمات ما مجاز نیست.",
    ],
  },
  {
    id: "products-orders",
    title: "محصولات و سفارش‌ها",
    paragraphs: [
      "تمام محصولات مشروط به موجودی هستند. در صورت ضرورت معقول، حق محدود کردن تعداد، توقف عرضه محصول یا نپذیرفتن یک سفارش برای نجیب‌زاده محفوظ است.",
      "سفارش تنها زمانی پذیرفته‌شده محسوب می‌شود که تأیید پردازش سفارش را از نجیب‌زاده دریافت کنید.",
    ],
  },
  {
    id: "pricing-payment",
    title: "قیمت‌گذاری و پرداخت",
    paragraphs: [
      "قیمت‌های نمایش‌داده‌شده در وب‌سایت با ارز مربوط ارائه می‌شوند و در مواردی که قانون الزام کند، ممکن است شامل مالیات باشند.",
      "ما برای صحت اطلاعات قیمت‌گذاری دقت معقولی به کار می‌بریم. اگر پیش از انجام سفارش خطایی شناسایی شود، ممکن است پیش از ادامه فرایند با شما تماس بگیریم.",
    ],
  },
  {
    id: "shipping-delivery",
    title: "ارسال و تحویل",
    paragraphs: [
      "زمان‌های تخمینی تحویل صرفاً به‌عنوان راهنما ارائه می‌شوند و ممکن است بر اساس مقصد، موجودی محصول و شرایط خارج از کنترل معقول ما تغییر کنند.",
      "انتقال ریسک محصولات خریداری‌شده مطابق ترتیبات تحویل مربوط و قوانین حمایت از مصرف‌کننده در حوزه قضایی شما انجام می‌شود.",
    ],
  },
  {
    id: "returns-exchanges",
    title: "مرجوعی و تعویض",
    paragraphs: [
      "محصولات واجد شرایط را می‌توان در بازه زمانی مشخص‌شده در سیاست مرجوعی ما بازگرداند یا تعویض کرد؛ مشروط بر اینکه استفاده یا پوشیده نشده باشند و در وضعیت اولیه خود باقی مانده باشند.",
      "برخی محصولات شخصی‌سازی‌شده، سفارشی یا حساس از نظر بهداشتی، در مواردی که قانون اجازه دهد، ممکن است مشمول مرجوعی نباشند.",
    ],
  },
  {
    id: "intellectual-property",
    title: "مالکیت فکری",
    paragraphs: [
      "تمام محتوای موجود در این وب‌سایت، از جمله علائم تجاری، تصاویر، طراحی‌ها، متن، گرافیک، ویدئو و عناصر هویتی برند، متعلق به نجیب‌زاده است یا با مجوز در اختیار آن قرار دارد.",
      "هیچ بخشی از محتوا بدون دریافت اجازه کتبی قبلی نباید کپی، بازتولید، توزیع یا به‌صورت تجاری بهره‌برداری شود.",
    ],
  },
  {
    id: "limitation-liability",
    title: "محدودیت مسئولیت",
    paragraphs: [
      "هیچ بخشی از این شرایط، مسئولیتی را که طبق قانون قابل حذف یا محدود کردن نیست، مستثنا یا محدود نمی‌کند. تا حدی که قانون اجازه می‌دهد، نجیب‌زاده مسئول زیان‌های غیرمستقیم یا تبعی ناشی از استفاده از این وب‌سایت نیست.",
      "ما برای ارائه تجربه‌ای دیجیتال، دقیق و پایدار تلاش می‌کنیم، اما تضمین نمی‌کنیم که وب‌سایت همواره در دسترس یا عاری از خطاهای فنی باشد.",
    ],
  },
  {
    id: "governing-law",
    title: "قانون حاکم",
    paragraphs: [
      "این شرایط تابع قوانینی است که بر واحد نجیب‌زاده مسئول تراکنش شما اعمال می‌شود؛ با رعایت هرگونه حمایت الزامی از مصرف‌کننده که در حوزه قضایی شما در دسترس است.",
    ],
  },
  {
    id: "changes",
    title: "تغییرات این شرایط",
    paragraphs: [
      "ممکن است برای انعکاس تغییرات خدمات، عملیات یا تعهدات قانونی، این شرایط و ضوابط را هر از گاهی به‌روزرسانی کنیم.",
      "نسخه منتشرشده در این صفحه در زمان مراجعه شما، نسخه جاری محسوب می‌شود.",
    ],
  },
  {
    id: "contact",
    title: "تماس با ما",
    paragraphs: [
      "اگر درباره این شرایط و ضوابط، سفارش خود یا تجربه‌تان با نجیب‌زاده پرسشی دارید، تیم خدمات مشتریان ما با خرسندی همراه شما خواهد بود.",
    ],
  },
];

/* ==========================================================================
   COMPONENT
============================================================================ */

type TermsAndConditionsPageProps = {
  heroImage: string;

  heroImageAlt?: string;

  heroImagePosition?: string;

  lastUpdated?: string;
};

export function TermsAndConditionsPage({
  heroImage,

  heroImageAlt = "",

  heroImagePosition = "center",

  lastUpdated = "اوت ۲۰۲۶",
}: TermsAndConditionsPageProps) {
  const [activeSection, setActiveSection] = useState(TERMS_SECTIONS[0].id);

  const themeVars = {
    "--legal-bg": darkTokens.canvas,

    "--legal-surface": darkTokens.surface,

    "--legal-muted": darkTokens.textMuted,

    "--legal-soft": darkTokens.textSoft,

    "--legal-border": darkTokens.border,

    "--legal-border-strong": darkTokens.borderStrong,

    "--legal-text": darkTokens.text,

    "--legal-copper": brandColors.copper.hex,

    "--legal-scrollbar-thumb": `rgb(${brandColors.copper.rgb} / 0.74)`,

    "--legal-scrollbar-thumb-hover": `rgb(${brandColors.copper.rgb} / 0.94)`,

    "--legal-scrollbar-track": "rgb(255 255 255 / 0.08)",

    "--legal-black-rgb": brandColors.black.rgb,
  } as CSSProperties;

  /* ==========================================================================
     ACTIVE SECTION
  ========================================================================== */

  useEffect(() => {
    const elements = TERMS_SECTIONS.map((section) =>
      document.getElementById(section.id),
    ).filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) {
          return;
        }

        setActiveSection(visible.target.id);
      },
      {
        rootMargin: "-22% 0px -58% 0px",

        threshold: [0, 0.1, 0.25, 0.5],
      },
    );

    elements.forEach((element) => {
      observer.observe(element);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  function goToSection(id: string) {
    const element = document.getElementById(id);

    if (!element) {
      return;
    }

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    element.scrollIntoView({
      behavior: reducedMotion ? "auto" : "smooth",

      block: "start",
    });
  }

  function printTerms() {
    window.print();
  }

  return (
    <main
      style={themeVars}
      dir="rtl"
      className="
        min-h-screen

        bg-[var(--legal-bg)]
        text-[var(--legal-text)]

        print:bg-white
        print:text-black
      "
    >
      {/* ================================================================
          OUTER FRAME
      ================================================================= */}

      <div
        className="
          mx-auto

          w-full
          max-w-[1640px]

          px-4

          pb-12
          pt-24

          sm:px-6
          sm:pb-16

          md:pt-28

          lg:px-8
          lg:pb-24
        "
      >
        <div
          className="
            border
            border-white/10

            bg-[var(--legal-surface)]

            print:border-0
            print:bg-white
          "
        >
          {/* ============================================================
              HERO
          ============================================================= */}

          <section
            className="
              relative
              isolate mt-2

              min-h-[400px]

              overflow-hidden

              border-b
              border-white/10

              sm:min-h-[460px]

              md:min-h-[520px]
            "
          >
            <Image
              src={heroImage}
              alt={heroImageAlt}
              fill
              priority
              sizes="100vw"
              draggable={false}
              style={{
                objectPosition: heroImagePosition,
              }}
              className="
                -z-30

                object-cover
              "
            />

            {/* left readability */}

            <div
              aria-hidden="true"
              className="
                pointer-events-none

                absolute
                inset-0
                -z-20

                bg-[linear-gradient(90deg,rgb(var(--legal-black-rgb)/0.62)_0%,rgb(var(--legal-black-rgb)/0.38)_50%,rgb(var(--legal-black-rgb)/0.62)_100%)]
              "
            />

            <div
              aria-hidden="true"
              className="
                pointer-events-none

                absolute
                inset-0
                -z-10

                bg-[linear-gradient(180deg,rgb(var(--legal-black-rgb)/0.08)_0%,rgb(var(--legal-black-rgb)/0.10)_60%,rgb(var(--legal-black-rgb)/0.52)_100%)]
              "
            />

            {/* BRAND MARK */}

            <div
              className="
                absolute

                left-1/2
                top-7
                -translate-x-1/2

                hidden

                text-center

                text-[8px]
                font-medium

                uppercase
                tracking-[0.5em]

                text-white/45

                md:block
                md:top-10
              "
            >
              نجیب‌زاده
            </div>

            {/* HERO CONTENT */}

            <div
              className="
                flex

                min-h-[400px]

                items-end
                justify-center

                px-6

                pb-10
                pt-28

                sm:min-h-[460px]
                sm:px-8
                sm:pb-12

                md:min-h-[520px]
                md:items-center

                md:px-12
                md:pb-0
                md:pt-20

                lg:px-16
              "
            >
              <div
                className="
                  mx-auto
                  max-w-[620px]
                  text-center
                "
              >
                {/* eyebrow */}

                <div
                  className="
                    mb-6

                    flex
                    items-center
                    justify-center
                    gap-3

                    text-[7px]
                    font-semibold

                    uppercase
                    tracking-[0.24em]

                    text-[var(--legal-copper)]

                    sm:text-[8px]
                  "
                >
                  <span className="h-px w-6 bg-[var(--legal-copper)]" />

                  <span>حقوقی / نجیب‌زاده</span>

                  <span
                    className="
                      h-px
                      w-6

                      bg-[var(--legal-copper)]
                    "
                  />
                </div>

                <h1
                  className="
                     

                    text-[clamp(3.1rem,11vw,5rem)]
                    font-normal

                    leading-[0.94]
                    tracking-[-0.055em]

                    text-center
                    text-white

                    md:text-[clamp(4.5rem,6vw,6.4rem)]
                  "
                >
                  شرایط و ضوابط
                </h1>

                <p
                  className="
                    mx-auto
                    mt-6

                    max-w-[430px]
                    text-center

                    text-[9px]

                    leading-[1.8]

                    text-white/55

                    sm:text-[10px]
                  "
                >
                  این شرایط، نحوه استفاده شما از وب‌سایت نجیب‌زاده و خدمات و محصولات ارائه‌شده از طریق آن را مشخص می‌کند.
                </p>

                <div
                  className="
                    mt-7

                    flex
                    flex-wrap

                    items-center
                    justify-center
                    gap-x-5
                    gap-y-3
                  "
                >
                  <span
                    className="
                      text-[7px]
                      font-medium

                      uppercase
                      tracking-[0.17em]

                      text-white/35
                    "
                  >
                    آخرین به‌روزرسانی
                  </span>

                  <span
                    className="
                      h-px
                      w-6

                      bg-white/20
                    "
                  />

                  <span
                    className="
                      text-[8px]

                      text-white/60
                    "
                  >
                    {lastUpdated}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* ============================================================
              MOBILE CONTENTS
          ============================================================= */}

          <details
            className="
              border-b
              border-white/10

              lg:hidden
            "
          >
            <summary
              className="
                flex

                min-h-[64px]

                cursor-pointer

                list-none

                items-center
                justify-center
                gap-3

                px-5

                text-[8px]
                font-semibold

                uppercase
                tracking-[0.19em]

                text-white/65

                [&::-webkit-details-marker]:hidden
              "
            >
              <span>در این صفحه</span>

              <MenuListIcon />
            </summary>

            <nav
              aria-label="بخش‌های شرایط و ضوابط"
              className="
                grid

                border-t
                border-white/10

                sm:grid-cols-2
              "
            >
              {TERMS_SECTIONS.map((section, index) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => goToSection(section.id)}
                  className="
                      flex

                      min-h-[54px]

                      items-center
                      justify-center

                      border-b
                      border-white/10

                      px-5

                      text-center

                      transition-colors

                      hover:bg-white/[0.04]
                    "
                >
                  <span
                    className="
                        w-8

                        shrink-0

                        text-[7px]

                        tabular-nums

                        text-white/25
                      "
                  >
                    {new Intl.NumberFormat("fa-IR", {
            minimumIntegerDigits: 2,
            useGrouping: false,
          }).format(index + 1)}
                  </span>

                  <span
                    className="
                        text-[9px]

                        text-white/65
                      "
                  >
                    {section.title}
                  </span>
                </button>
              ))}
            </nav>
          </details>

          {/* ============================================================
              MAIN LEGAL AREA
          ============================================================= */}

          <div
            className="
              grid

              lg:grid-cols-[280px_minmax(0,1fr)]

              xl:grid-cols-[310px_minmax(0,1fr)]
            "
          >
            {/* ==========================================================
                DESKTOP SIDEBAR
            =========================================================== */}

            <aside
              className="
                relative

                hidden

                border-l
                border-white/10

                lg:block

                print:hidden
              "
            >
              <div
                data-lenis-prevent=""
                className="
                  sticky

                  top-[104px]

                  max-h-[calc(100svh-128px)]
                  overflow-y-auto
                  overscroll-contain
                  [scrollbar-color:var(--legal-scrollbar-thumb)_var(--legal-scrollbar-track)]
                  [scrollbar-gutter:stable]
                  [scrollbar-width:thin]
                  [&::-webkit-scrollbar]:w-2
                  [&::-webkit-scrollbar-track]:bg-[var(--legal-scrollbar-track)]
                  [&::-webkit-scrollbar-thumb]:rounded-full
                  [&::-webkit-scrollbar-thumb]:bg-[var(--legal-scrollbar-thumb)]
                  [&::-webkit-scrollbar-thumb]:border-2
                  [&::-webkit-scrollbar-thumb]:border-solid
                  [&::-webkit-scrollbar-thumb]:border-[var(--legal-surface)]
                  [&::-webkit-scrollbar-thumb:hover]:bg-[var(--legal-scrollbar-thumb-hover)]

                  px-7
                  pr-5
                  py-10

                  xl:px-9
                  xl:pr-7
                  xl:py-12
                "
              >
                {/* eyebrow */}

                <p
                  className="
                    mb-6

                    text-center
                    text-[7px]
                    font-semibold

                    uppercase
                    tracking-[0.22em]

                    text-[var(--legal-copper)]
                  "
                >
                  در این صفحه
                </p>

                {/* nav */}

                <nav aria-label="بخش‌های شرایط و ضوابط">
                  <ol className="space-y-0.5">
                    {TERMS_SECTIONS.map((section, index) => {
                      const active = activeSection === section.id;

                      return (
                        <li key={section.id}>
                          <button
                            type="button"
                            onClick={() => goToSection(section.id)}
                            className={`
                                group

                                relative

                                flex
                                min-h-[38px]

                                w-full

                                items-center
                                justify-center

                                text-center

                                cursor-pointer

                                transition-opacity
                                duration-200

                                focus-visible:outline-none
                                focus-visible:ring-1
                                focus-visible:ring-white/60
                                focus-visible:ring-offset-2
                                focus-visible:ring-offset-[var(--legal-surface)]

                                ${
                                  active
                                    ? "opacity-100"
                                    : "opacity-45 hover:opacity-80"
                                }
                              `}
                            aria-current={active ? "location" : undefined}
                          >
                            <span
                              className="
                                  w-8

                                  shrink-0

                                  text-[7px]

                                  tabular-nums

                                  text-white/35
                                "
                            >
                              {new Intl.NumberFormat("fa-IR", {
            minimumIntegerDigits: 2,
            useGrouping: false,
          }).format(index + 1)}
                            </span>

                            <span
                              className="
                                  text-[9px]

                                  text-white
                                "
                            >
                              {section.title}
                            </span>

                            <span
                              aria-hidden="true"
                              className={`
                                  absolute

                                  -right-7
                                  top-1/2

                                  h-px

                                  -translate-y-1/2

                                  bg-white

                                  transition-[width,opacity]
                                  duration-300

                                  xl:-right-9

                                  ${
                                    active ? "w-4 opacity-100" : "w-0 opacity-0"
                                  }
                                `}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </nav>

                {/* utility */}

                <div
                  className="
                    mt-10

                    border-t
                    border-white/10

                    pt-7
                  "
                >
                  <button
                    type="button"
                    onClick={printTerms}
                    className="
                      group

                      flex
                      w-full

                      items-center
                      justify-center
                      gap-3

                      text-[7px]
                      font-semibold

                      uppercase
                      tracking-[0.17em]

                      text-white/45

                      transition-colors

                      cursor-pointer

                      hover:text-white

                      focus-visible:outline-none
                      focus-visible:ring-1
                      focus-visible:ring-white/60
                      focus-visible:ring-offset-2
                      focus-visible:ring-offset-[var(--legal-surface)]
                    "
                  >
                    <PrintIcon />
                    چاپ / ذخیره PDF
                  </button>
                </div>
              </div>
            </aside>

            {/* ==========================================================
                TERMS
            =========================================================== */}

            <div
              className="
                px-5

                py-4
                text-center

                sm:px-8

                md:px-10

                lg:px-12
                lg:py-5

                xl:px-16
              "
            >
              {TERMS_SECTIONS.map((section, index) => (
                <LegalSection
                  key={section.id}
                  section={section}
                  index={index}
                />
              ))}

              {/* ========================================================
                  SUPPORT CTA
              ========================================================= */}

              <div
                className="
                  my-10

                  grid

                  border
                  border-white/10

                  bg-white

                  text-black

                  sm:grid-cols-[minmax(0,1fr)_240px]

                  sm:items-center

                  lg:my-14
                "
              >
                <div
                  className="
                    p-6
                    text-center

                    sm:p-8

                    lg:p-10
                  "
                >
                  <div
                    className="
                      mb-4

                      flex

                      items-center
                      justify-center
                      gap-3

                      text-[7px]
                      font-semibold

                      uppercase
                      tracking-[0.2em]

                      text-[var(--legal-copper)]
                    "
                  >
                    <span className="h-px w-5 bg-[var(--legal-copper)]" />

                    <span>خدمات مشتریان</span>

                    <span
                      className="
                        h-px
                        w-5

                        bg-[var(--legal-copper)]
                      "
                    />
                  </div>

                  <h2
                    className="
                       

                      text-[clamp(2.2rem,6vw,3.4rem)]
                      font-normal

                      leading-[0.98]
                      tracking-[-0.045em]
                    "
                  >
                    در کنار شما هستیم.
                  </h2>

                  <p
                    className="
                      mx-auto
                      mt-4

                      max-w-[480px]
                      text-center

                      text-[9px]

                      leading-[1.75]

                      text-black/55

                      sm:text-[10px]
                    "
                  >
                    اگر درباره این شرایط، سفارش خود یا تجربه‌تان با نجیب‌زاده پرسشی دارید، تیم ما با خرسندی همراه شما خواهد بود.
                  </p>
                </div>

                <div
                  className="
                    border-t
                    border-black/10

                    p-6

                    sm:border-l
                    sm:border-t-0
                    sm:p-8
                  "
                >
                  <Button
                    href="/contact"
                    variant="black"
                    size="lg"
                    icon={<ArrowRightIcon />}
                    fullWidth
                  >
                    تماس با ما
                  </Button>

                  <a
                    href="mailto:clientservices@najibzadeh.com"
                    className="
                      mt-4

                      block

                      text-center

                      text-[8px]

                      text-black/45

                      transition-colors

                      hover:text-black
                    "
                  >
                    clientservices@najibzadeh.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================
            BOTTOM META
        ================================================================= */}

        <div
          className="
            mt-5

            flex

            flex-col

            gap-3

            text-[6px]
            font-medium

            uppercase
            tracking-[0.18em]

            text-white/25

            items-center
            justify-center
            text-center

            sm:flex-row
            sm:items-center
            sm:justify-center
          "
        >
          <span>© {new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(new Date().getFullYear())} نجیب‌زاده</span>

          <span>شرایط و ضوابط / حقوقی</span>
        </div>
      </div>
    </main>
  );
}

/* ==========================================================================
   LEGAL SECTION
============================================================================ */

function LegalSection({
  section,

  index,
}: {
  section: TermsSection;

  index: number;
}) {
  return (
    <section
      id={section.id}
      className="
        scroll-mt-28

        flex
        flex-col
        items-center

        border-b
        border-white/10

        py-8

        text-center

        sm:py-9
        lg:py-10
      "
    >
      {/* number */}

      <div
        className="
          mb-4
        "
      >
        <span
          className="
             

            text-[22px]

            tabular-nums

            text-white/28

            lg:text-[26px]
          "
        >
          {new Intl.NumberFormat("fa-IR", {
            minimumIntegerDigits: 2,
            useGrouping: false,
          }).format(index + 1)}
        </span>
      </div>

      {/* content */}

      <div
        className="
          mx-auto
          max-w-[880px]
          text-center
        "
      >
        <h2
          className="
             

            text-[22px]
            font-normal

            leading-[1.1]

            tracking-[-0.035em]

            text-white

            sm:text-[24px]

            lg:text-[27px]
          "
        >
          {section.title}
        </h2>

        <div
          className="
            mt-4

            space-y-3
          "
        >
          {section.paragraphs.map((paragraph, paragraphIndex) => (
            <p
              key={paragraphIndex}
              className="
                  mx-auto
                  max-w-[820px]

                  text-center
                  text-[9px]

                  leading-[1.85]

                  text-white/50

                  sm:text-[10px]

                  lg:text-[11px]
                "
            >
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ==========================================================================
   ICONS
============================================================================ */

function PrintIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="
        size-4
      "
    >
      <path d="M6 7V3H14V7" stroke="currentColor" strokeWidth="1" />

      <path d="M5 14H3V8H17V14H15" stroke="currentColor" strokeWidth="1" />

      <path d="M6 11H14V17H6V11Z" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function MenuListIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="
        size-4

        text-white/40
      "
    >
      <path d="M5 6H17M5 10H17M5 14H17" stroke="currentColor" strokeWidth="1" />

      <path d="M2 6H3M2 10H3M2 14H3" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
