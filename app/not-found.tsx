import Image from "next/image";

import { Button } from "@/components/ui/Button";

/**
 * Replace only these two paths with your own 404 background images.
 * Desktop: preferably 16:9 or wider.
 * Mobile: preferably 9:16.
 */
const DESKTOP_BACKGROUND = "/assets/images/404desktop.png";
const MOBILE_BACKGROUND = "/assets/images/404phone.png";

export default function NotFound() {
  return (
    <>
      {/* This prevents the global page/footer underneath from scrolling on 404. */}
      <style>{`
        html,
        body {
          overflow: hidden !important;
          overscroll-behavior: none;
        }
      `}</style>

      <main
        dir="rtl"
        lang="fa"
        aria-labelledby="not-found-title"
        className="fixed inset-0 isolate overflow-hidden bg-[#090806] text-white"
        style={{ zIndex: 2147483000 }}
      >
        {/* ---------------------------------------------------------------
            RESPONSIVE BACKGROUNDS
            Two independent image sources so mobile and desktop art direction
            can be completely different.
        ---------------------------------------------------------------- */}
        <div aria-hidden="true" className="absolute inset-0">
          <Image
            src={MOBILE_BACKGROUND}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover md:hidden"
            style={{ objectPosition: "center center" }}
          />

          <Image
            src={DESKTOP_BACKGROUND}
            alt=""
            fill
            priority
            sizes="100vw"
            className="hidden object-cover md:block"
            style={{ objectPosition: "center center" }}
          />

          {/* Readability without washing out the photography. */}
          <div className="absolute inset-0 bg-black/[0.12]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.04)_38%,rgba(0,0,0,0.30)_66%,rgba(0,0,0,0.82)_100%)] md:bg-[linear-gradient(180deg,rgba(0,0,0,0.015)_0%,rgba(0,0,0,0.03)_44%,rgba(0,0,0,0.24)_68%,rgba(0,0,0,0.78)_100%)]" />
        </div>
        

        {/* ---------------------------------------------------------------
            MAIN CONTENT
        ---------------------------------------------------------------- */}
        <section className="relative z-10 flex h-[100dvh] w-full items-end justify-center -mt-24 lg:mt-0 px-5 pb-[max(2.25rem,env(safe-area-inset-bottom))] pt-8 sm:px-7 md:px-10 md:pb-12 lg:pb-14 xl:pb-16">
          <div className="mx-auto flex w-full max-w-[760px] flex-col items-center text-center">
            <span className="mb-4 inline-flex items-center gap-3 text-[9px] font-medium tracking-[0.18em] text-white/58 sm:text-[10px]">
              <span className="h-px w-8 bg-white/30" aria-hidden="true" />
              خطای ۴۰۴
              <span className="h-px w-8 bg-white/30" aria-hidden="true" />
            </span>

            <h1
              id="not-found-title"
              className="text-balance text-[clamp(1.8rem,7vw,3.45rem)] font-semibold leading-[1.25] tracking-[-0.035em] text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.34)]"
            >
              صفحه مورد نظر پیدا نشد!
            </h1>

            <p className="mt-3 max-w-[560px]  text-pretty text-[12px] leading-7 text-white/68 sm:mt-4 sm:text-[13px] md:text-[14px]">
              به نظر می‌رسد این مسیر دیگر در دسترس نیست یا آدرس آن تغییر کرده است.
              می‌توانید به فروشگاه برگردید و مجموعه‌های نجیب‌زاده را مشاهده کنید.
            </p>

            <div className="mt-7 flex w-full max-w-[460px]  gap-2.5 sm:mt-8  sm:justify-center sm:gap-3">
              <div className="w-full sm:w-[210px]">
                <Button
                  href="/shop"
                  variant="cream"
                  size="lg"
                  fullWidth
                  icon={<BagIcon />}
                  iconPosition="right"
                  className="!min-h-12 !border-[#F4E9D9] !bg-[#F4E9D9] !px-5 !text-[#15110D] !tracking-normal hover:!bg-white"
                >
                    فروشگاه
                </Button>
              </div>

              <div className="w-full sm:w-[210px]">
                <Button
                  href="/"
                  variant="outline"
                  size="lg"
                  fullWidth
                  icon={<HomeIcon />}
                  iconPosition="right"
                  className="!min-h-12 !border-white/32 !bg-black/10 !px-5 !text-white !tracking-normal backdrop-blur-[3px] hover:!border-white/70 hover:!bg-white/10"
                >
                      خانه
                </Button>
              </div>
            </div>

            {/* Quiet brand signature; intentionally not a navbar. */}
            <div className="mt-8 hidden items-center gap-4 text-white/38 md:flex">
              <span className="h-px w-20 bg-white/15" aria-hidden="true" />
              <span className="text-[8px] font-medium tracking-[0.22em]">
                NAJIBZADEH
              </span>
              <span className="h-px w-20 bg-white/15" aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------
            SMALL DESKTOP / MOBILE BRAND DETAILS
        ---------------------------------------------------------------- */}
        <div className="pointer-events-none absolute bottom-7 right-8 z-10 hidden text-right md:block lg:right-10 xl:right-14">
          <p className="text-[10px] font-semibold text-white/72">نجیب‌زاده</p>
          <p className="mt-1 text-[8px] text-white/38">پوشاک لوکس مردانه</p>
          <span className="mt-3 block h-px w-20 bg-white/16" />
        </div>

        <p className="pointer-events-none absolute bottom-7 left-8 z-10 hidden text-[7px] font-medium tracking-[0.24em] text-white/30 md:block lg:left-10 xl:left-14">
          DRESS A HIGHER STANDARD
        </p>
      </main>
    </>
  );
}

function BagIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="size-4"
    >
      <path
        d="M5.25 7.25h9.5l-.55 9H5.8l-.55-9Z"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M7.5 7.25V5.8a2.5 2.5 0 0 1 5 0v1.45"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="size-4"
    >
      <path
        d="m3.5 9 6.5-5.5L16.5 9v7.25h-5v-4.5h-3v4.5h-5V9Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
