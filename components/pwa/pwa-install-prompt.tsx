"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";
import { usePathname } from "next/navigation";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
}

type NavigatorWithStandalone = Navigator & {
  standalone?: boolean;
};

const DISMISS_KEY = "najibzadeh:pwa-install-dismissed";

/* ==========================================================================
   PWA HELPERS
============================================================================ */

function wasInstallDismissed() {
  try {
    return window.sessionStorage.getItem(DISMISS_KEY) === "true";
  } catch {
    return false;
  }
}

function rememberInstallDismissal() {
  try {
    window.sessionStorage.setItem(DISMISS_KEY, "true");
  } catch {
    // Storage can be unavailable in privacy-restricted browser modes.
  }
}

function isIosDevice() {
  const navigatorWithStandalone = navigator as NavigatorWithStandalone;

  return (
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) &&
    !navigatorWithStandalone.standalone
  );
}

function isStandaloneMode() {
  const navigatorWithStandalone = navigator as NavigatorWithStandalone;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean(navigatorWithStandalone.standalone)
  );
}

/* ==========================================================================
   LIQUID GLASS CLASSES

   Important:
   - No blur/filter animation.
   - Blur is restricted to a very small surface.
   - A solid translucent fallback exists when backdrop-filter is unavailable.
============================================================================ */

const LIQUID_GLASS_SURFACE = [
  "relative isolate overflow-hidden",

  "border border-white/[0.16]",
  "bg-[#111214]/[0.92]",
  "text-white",

  "shadow-[0_24px_80px_rgba(0,0,0,0.38),0_8px_28px_rgba(0,0,0,0.24),inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(255,255,255,0.045)]",

  // Enhanced glass only where supported.
  "supports-[backdrop-filter]:bg-[#141518]/[0.58]",
  "supports-[backdrop-filter]:backdrop-blur-[26px]",
  "supports-[backdrop-filter]:backdrop-saturate-[175%]",

  "transform-gpu",
  "will-change-transform",

  "motion-reduce:transition-none",
].join(" ");

/* ==========================================================================
   COMPONENT
============================================================================ */

export function PwaInstallPrompt() {
  const pathname = usePathname();

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [showIosHelp, setShowIosHelp] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

  /* ------------------------------------------------------------------------
     SERVICE WORKER
  ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })
      .catch(() => {
        // Installation remains optional when service workers are unavailable.
      });
  }, []);

  /* ------------------------------------------------------------------------
     INSTALL CAPABILITY
  ------------------------------------------------------------------------ */

  useEffect(() => {
    const dismissed = wasInstallDismissed();
    const standalone = isStandaloneMode();

    const frame = window.requestAnimationFrame(() => {
      setIsDismissed(dismissed || standalone);
      setIsIos(!standalone && isIosDevice());
    });

    const handleInstallPrompt = (event: Event) => {
      event.preventDefault();

      setInstallPrompt(event as BeforeInstallPromptEvent);
      setIsDismissed(wasInstallDismissed());
    };

    const handleInstalled = () => {
      setInstallPrompt(null);
      setShowIosHelp(false);
      setIsDismissed(true);
    };

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.cancelAnimationFrame(frame);

      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);

      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  /* ------------------------------------------------------------------------
     ESCAPE KEY
  ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!showIosHelp) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowIosHelp(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [showIosHelp]);

  /* ------------------------------------------------------------------------
     VISIBILITY
  ------------------------------------------------------------------------ */

  const isPrivateWorkspace =
    pathname.startsWith("/admin") ||
    pathname === "/auth" ||
    pathname.startsWith("/customer-dashboard");

  const canInstall = Boolean(installPrompt) || isIos;

  if (isPrivateWorkspace || isDismissed || !canInstall) {
    return null;
  }

  /* ------------------------------------------------------------------------
     ACTIONS
  ------------------------------------------------------------------------ */

  const dismiss = () => {
    rememberInstallDismissal();
    setShowIosHelp(false);
    setIsDismissed(true);
  };

  const install = async () => {
    if (!installPrompt) {
      setShowIosHelp(true);
      return;
    }

    setIsInstalling(true);

    try {
      await installPrompt.prompt();

      const choice = await installPrompt.userChoice;

      setInstallPrompt(null);

      if (choice.outcome === "dismissed") {
        dismiss();
      }
    } finally {
      setIsInstalling(false);
    }
  };

  /* ==========================================================================
     RENDER
  ============================================================================ */

  return (
    <aside
      dir="rtl"
      aria-label="نصب اپلیکیشن نجیب‌زاده"
      className={[
        "pointer-events-none fixed z-[135]",

        /*
         * Mobile:
         * centered like a native iOS floating surface.
         */
        "top-[max(100px,env(safe-area-inset-bottom))]",
        "left-1/2",
        "-translate-x-1/2",

        /*
         * Tablet / Desktop:
         * elegant bottom-left placement.
         */
        "sm:bottom-[max(120px,env(safe-area-inset-bottom))]",
        "sm:left-[max(20px,env(safe-area-inset-left))]",
        "sm:translate-x-0",

        "flex",
        "w-max",
        "max-w-[calc(100vw-24px)]",
        "flex-col",
        "items-start",
        "gap-2.5",
      ].join(" ")}
    >
      {/* ====================================================================
          iOS INSTALL HELP
      ==================================================================== */}

      {showIosHelp ? (
        <section
          role="dialog"
          aria-label="راهنمای نصب اپلیکیشن"
          className={[
            LIQUID_GLASS_SURFACE,

            "pointer-events-auto",
            "w-[min(348px,calc(100vw-24px))]",
            "rounded-[30px]",

            /*
             * Motion stays GPU friendly.
             */
            "animate-in",
            "fade-in",
            "slide-in-from-bottom-3",
            "zoom-in-[0.985]",
            "duration-500",
            "ease-[cubic-bezier(0.16,1,0.3,1)]",
          ].join(" ")}
        >
          {/* --------------------------------------------------------------
              Soft top glass reflection
          -------------------------------------------------------------- */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              -z-20
              bg-[linear-gradient(180deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.055)_14%,rgba(255,255,255,0.012)_38%,rgba(0,0,0,0.08)_100%)]
            "
          />

          {/* --------------------------------------------------------------
              Liquid specular lights
          -------------------------------------------------------------- */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              -z-10
              bg-[radial-gradient(circle_at_18%_-12%,rgba(255,255,255,0.28),transparent_31%),radial-gradient(circle_at_92%_4%,rgba(194,139,95,0.20),transparent_31%),radial-gradient(circle_at_45%_115%,rgba(105,124,255,0.08),transparent_42%)]
            "
          />

          {/* --------------------------------------------------------------
              Precision inner edge
          -------------------------------------------------------------- */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-[1px]
              rounded-[29px]
              ring-1
              ring-inset
              ring-white/[0.055]
            "
          />

          {/* --------------------------------------------------------------
              Glass highlight streak
          -------------------------------------------------------------- */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              left-[12%]
              right-[12%]
              top-0
              h-px
              bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.38),rgba(255,255,255,0.66),rgba(255,255,255,0.30),transparent)]
            "
          />

          <div className="relative z-10 p-3">
            {/* Header */}

            <div className="flex items-start gap-3">
              <div
                className="
                  grid
                  size-11
                  shrink-0
                  place-items-center
                  rounded-[17px]
                  border
                  border-white/[0.13]
                  bg-white/[0.085]
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.13),0_6px_18px_rgba(0,0,0,0.12)]
                "
              >
                <Share
                  aria-hidden="true"
                  className="size-[18px] text-white/90"
                  strokeWidth={1.65}
                />
              </div>

              <div className="min-w-0 flex-1 pt-0.5">
                <span
                  className="
                    block
                    text-[9px]
                    font-medium
                    tracking-[0.02em]
                    text-[#D7B18E]
                  "
                >
                  نجیب‌زاده
                </span>

                <h2
                  className="
                    mt-0.5
                    text-[15px]
                    font-semibold
                    leading-6
                    tracking-[-0.02em]
                    text-white
                  "
                >
                  نصب روی آیفون یا آیپد
                </h2>

                <p
                  className="
                    mt-1
                    max-w-[235px]
                    text-[10.5px]
                    leading-[1.85]
                    text-white/60
                  "
                >
                  اپلیکیشن را مستقیماً به صفحه اصلی اضافه کنید تا مثل یک اپ
                  مستقل اجرا شود.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowIosHelp(false)}
                aria-label="بستن راهنمای نصب"
                title="بستن"
                className="
                  grid
                  size-9
                  shrink-0
                  cursor-pointer
                  place-items-center
                  rounded-full
                  border
                  border-white/[0.12]
                  bg-white/[0.055]
                  text-white/58

                  shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]

                  transform-gpu
                  transition-[background-color,border-color,color,transform]
                  duration-300
                  ease-[cubic-bezier(0.16,1,0.3,1)]

                  hover:scale-[1.04]
                  hover:border-white/[0.22]
                  hover:bg-white/[0.11]
                  hover:text-white

                  active:scale-[0.94]

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-white/65

                  motion-reduce:transition-none
                "
              >
                <X
                  aria-hidden="true"
                  className="size-[15px]"
                  strokeWidth={1.7}
                />
              </button>
            </div>

            {/* Instruction */}

            <div
              className="
                mt-3
                flex
                items-center
                gap-3
                rounded-[21px]
                border
                border-white/[0.10]
                bg-black/[0.18]
                px-3
                py-3

                shadow-[inset_0_1px_0_rgba(255,255,255,0.055)]
              "
            >
              <span
                className="
                  grid
                  size-9
                  shrink-0
                  place-items-center
                  rounded-[14px]
                  border
                  border-[#C89266]/30
                  bg-[#C89266]/[0.10]
                  text-[#E4C09F]
                "
              >
                <Share
                  aria-hidden="true"
                  className="size-4"
                  strokeWidth={1.6}
                />
              </span>

              <div className="min-w-0">
                <p className="text-[10px] font-medium leading-5 text-white/90">
                  ابتدا دکمه اشتراک‌گذاری را بزنید
                </p>

                <p className="text-[9px] leading-5 text-white/48">
                  سپس «افزودن به صفحه اصلی» را انتخاب کنید.
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ====================================================================
          MAIN INSTALL ISLAND
      ==================================================================== */}

      <div
        className={[
          LIQUID_GLASS_SURFACE,

          "pointer-events-auto",

          "rounded-[25px]",
          "p-[5px]",

          /*
           * Only transform / opacity transitions.
           * Blur itself never animates.
           */
          "transition-[transform,box-shadow,border-color]",
          "duration-500",
          "ease-[cubic-bezier(0.16,1,0.3,1)]",

          "hover:border-white/[0.22]",
          "hover:shadow-[0_26px_84px_rgba(0,0,0,0.46),0_8px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.25)]",
        ].join(" ")}
      >
        {/* --------------------------------------------------------------
            Main translucent glass gradient
        -------------------------------------------------------------- */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            -z-20
            bg-[linear-gradient(180deg,rgba(255,255,255,0.17)_0%,rgba(255,255,255,0.055)_20%,rgba(0,0,0,0.04)_55%,rgba(0,0,0,0.14)_100%)]
          "
        />

        {/* --------------------------------------------------------------
            Liquid reflection / color refraction
        -------------------------------------------------------------- */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-0
            -z-10
            bg-[radial-gradient(circle_at_16%_-18%,rgba(255,255,255,0.32),transparent_32%),radial-gradient(circle_at_82%_-8%,rgba(207,157,115,0.19),transparent_29%),radial-gradient(circle_at_62%_135%,rgba(82,104,255,0.075),transparent_38%)]
          "
        />

        {/* --------------------------------------------------------------
            Internal ring
        -------------------------------------------------------------- */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-px
            rounded-[24px]
            ring-1
            ring-inset
            ring-white/[0.055]
          "
        />

        {/* --------------------------------------------------------------
            Apple-like top specular highlight
        -------------------------------------------------------------- */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            left-[12%]
            right-[12%]
            top-0
            h-px
            bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.30),rgba(255,255,255,0.58),rgba(255,255,255,0.26),transparent)]
          "
        />

        <div className="relative z-10 flex items-center gap-1.5">
          {/* ==============================================================
              INSTALL BUTTON
          ============================================================== */}

          <button
            type="button"
            onClick={install}
            disabled={isInstalling}
            aria-live="polite"
            className="
              group
              relative
              flex
              h-[52px]
              min-w-[152px]
              cursor-pointer
              items-center
              gap-2.5
              overflow-hidden
              rounded-[20px]
              border
              border-white/[0.12]
              bg-white/[0.075]
              px-3.5
              text-start
              text-white

              shadow-[inset_0_1px_0_rgba(255,255,255,0.09)]

              transform-gpu
              transition-[transform,background-color,border-color,box-shadow]
              duration-300
              ease-[cubic-bezier(0.16,1,0.3,1)]

              hover:scale-[1.012]
              hover:border-white/[0.20]
              hover:bg-white/[0.115]
              hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_16px_rgba(0,0,0,0.10)]

              active:scale-[0.975]

              disabled:cursor-wait
              disabled:opacity-60
              disabled:hover:scale-100

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-white/70
              focus-visible:ring-offset-1
              focus-visible:ring-offset-transparent

              motion-reduce:transition-none
            "
          >
            {/* Button reflection */}

            <span
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-1/2
                bg-[linear-gradient(180deg,rgba(255,255,255,0.06),transparent)]
              "
            />

            {/* Icon */}

            <span
              className="
                relative
                grid
                size-9
                shrink-0
                place-items-center
                overflow-hidden
                rounded-[14px]
                border
                border-[#D19B6D]/30
                bg-[#C89266]/[0.11]
                text-[#E8C4A3]

                shadow-[inset_0_1px_0_rgba(255,255,255,0.10)]
              "
            >
              <span
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  inset-0
                  bg-[radial-gradient(circle_at_30%_0%,rgba(255,255,255,0.18),transparent_55%)]
                "
              />

              <Download
                aria-hidden="true"
                className={[
                  "relative size-[17px]",
                  isInstalling ? "animate-pulse" : "",
                ].join(" ")}
                strokeWidth={1.7}
              />
            </span>

            {/* Copy */}

            <span className="relative min-w-0 pe-1">
              <span
                className="
                  block
                  text-[8px]
                  font-medium
                  leading-4
                  text-[#D6AE89]
                "
              >
                اپلیکیشن نجیب‌زاده
              </span>

              <strong
                className="
                  block
                  whitespace-nowrap
                  text-[11.5px]
                  font-semibold
                  leading-5
                  tracking-[-0.01em]
                  text-white
                "
              >
                {isInstalling ? "در حال نصب…" : "نصب اپلیکیشن"}
              </strong>
            </span>
          </button>

          {/* ==============================================================
              CLOSE
          ============================================================== */}

          <button
            type="button"
            onClick={dismiss}
            aria-label="بستن پیشنهاد نصب"
            title="بستن"
            className="
              grid
              size-[52px]
              shrink-0
              cursor-pointer
              place-items-center
              rounded-[20px]
              border
              border-white/[0.10]
              bg-white/[0.045]
              text-white/52

              shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]

              transform-gpu
              transition-[transform,background-color,border-color,color]
              duration-300
              ease-[cubic-bezier(0.16,1,0.3,1)]

              hover:scale-[1.035]
              hover:border-white/[0.20]
              hover:bg-white/[0.09]
              hover:text-white

              active:scale-[0.94]

              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-white/65

              motion-reduce:transition-none
            "
          >
            <X aria-hidden="true" className="size-[16px]" strokeWidth={1.65} />
          </button>
        </div>
      </div>
    </aside>
  );
}
