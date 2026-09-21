"use client";

import { type CSSProperties, useEffect, useState } from "react";

import { Download, Share2, ShieldCheck, Smartphone, X } from "lucide-react";

import { usePathname } from "next/navigation";

import { pwaInstallCopy } from "@/lib/i18n/pwa-install-copy";

import {
  defaultLocale,
  getHtmlLang,
  getLocaleDirection,
  locales,
  type Locale,
} from "@/lib/i18n/config";

import { brandColors } from "@/theme/theme-colors";

/* ==========================================================================
   TYPES
============================================================================ */

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

/* ==========================================================================
   CONSTANTS
============================================================================ */

const DISMISS_KEY = "najibzadeh:pwa-install-dismissed";

/* ==========================================================================
   HELPERS
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
    // Storage may be unavailable in privacy-restricted browsers.
  }
}

function isIosDevice() {
  const navigatorWithStandalone = navigator as NavigatorWithStandalone;

  const isIos =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  return isIos && !navigatorWithStandalone.standalone;
}

function isStandaloneMode() {
  const navigatorWithStandalone = navigator as NavigatorWithStandalone;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean(navigatorWithStandalone.standalone)
  );
}

function resolveLocaleFromPathname(pathname: string): Locale {
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (firstSegment && locales.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }

  return defaultLocale;
}

function stripLocalePrefix(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (!segments.length) {
    return "/";
  }

  if (locales.includes(segments[0] as Locale)) {
    const rest = segments.slice(1);

    return rest.length ? `/${rest.join("/")}` : "/";
  }

  return pathname;
}

function isPrivateWorkspacePath(pathname: string) {
  const route = stripLocalePrefix(pathname);

  return (
    route === "/auth" ||
    route.startsWith("/auth/") ||
    route === "/admin" ||
    route.startsWith("/admin/") ||
    route === "/customer-dashboard" ||
    route.startsWith("/customer-dashboard/")
  );
}

/* ==========================================================================
   COMPONENT
============================================================================ */

export function PwaInstallPrompt() {
  const pathname = usePathname();

  const locale = resolveLocaleFromPathname(pathname);

  const copy = pwaInstallCopy[locale];

  const direction = getLocaleDirection(locale);

  const htmlLang = getHtmlLang(locale);

  const isRtl = direction === "rtl";

  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  const [showIosHelp, setShowIosHelp] = useState(false);

  const [isIos, setIsIos] = useState(false);

  const [isDismissed, setIsDismissed] = useState(true);

  const [isInstalling, setIsInstalling] = useState(false);

  const themeVars = {
    "--pwa-black": brandColors.black.hex,

    "--pwa-black-rgb": brandColors.black.rgb,

    "--pwa-copper": brandColors.copper.hex,

    "--pwa-copper-rgb": brandColors.copper.rgb,
  } as CSSProperties;

  /* ==========================================================================
     SERVICE WORKER
  ========================================================================== */

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })
      .catch(() => {
        // PWA installation stays optional.
      });
  }, []);

  /* ==========================================================================
     INSTALL AVAILABILITY
  ========================================================================== */

  useEffect(() => {
    const dismissed = wasInstallDismissed();

    const standalone = isStandaloneMode();

    const frame = window.requestAnimationFrame(() => {
      setIsDismissed(dismissed || standalone);

      setIsIos(!standalone && isIosDevice());
    });

    function handleInstallPrompt(event: Event) {
      event.preventDefault();

      setInstallPrompt(event as BeforeInstallPromptEvent);

      setIsDismissed(wasInstallDismissed());
    }

    function handleInstalled() {
      setInstallPrompt(null);

      setShowIosHelp(false);

      setIsDismissed(true);

      setIsInstalling(false);
    }

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);

    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.cancelAnimationFrame(frame);

      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);

      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  /* ==========================================================================
     KEYBOARD
  ========================================================================== */

  useEffect(() => {
    if (!showIosHelp) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowIosHelp(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [showIosHelp]);

  /* ==========================================================================
     STATE
  ========================================================================== */

  const privateWorkspace = isPrivateWorkspacePath(pathname);

  const canInstall = Boolean(installPrompt) || isIos;

  if (privateWorkspace || isDismissed || !canInstall) {
    return null;
  }

  /* ==========================================================================
     ACTIONS
  ========================================================================== */

  function dismiss() {
    rememberInstallDismissal();

    setShowIosHelp(false);

    setIsDismissed(true);
  }

  async function install() {
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

        return;
      }

      setIsDismissed(true);
    } finally {
      setIsInstalling(false);
    }
  }

  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <aside
      dir={direction}
      lang={htmlLang}
      style={themeVars}
      aria-label={copy.card.ariaLabel}
      className={`
        fixed

        bottom-[max(12px,env(safe-area-inset-bottom))]

        left-1/2

        z-[135]

        flex

        w-[min(400px,calc(100vw-24px))]

        -translate-x-1/2

        flex-col

        gap-2.5

        sm:bottom-[max(20px,env(safe-area-inset-bottom))]
        sm:w-[390px]
        sm:translate-x-0

        ${
          isRtl
            ? `
                sm:left-auto
                sm:right-[max(20px,env(safe-area-inset-right))]
              `
            : `
                sm:left-[max(20px,env(safe-area-inset-left))]
              `
        }
      `}
    >
      {/* ================================================================
          IOS INSTALL GUIDE
      ================================================================= */}

      {showIosHelp ? (
        <div
          className="
            relative

            overflow-hidden

            rounded-[22px]

            border
            border-white/[0.12]

            bg-[rgb(var(--pwa-black-rgb)/0.96)]

            p-5

            text-white

            shadow-[0_24px_70px_-20px_rgba(0,0,0,0.72)]

            supports-[backdrop-filter]:bg-[rgb(var(--pwa-black-rgb)/0.88)]
            supports-[backdrop-filter]:backdrop-blur-[24px]

            motion-safe:animate-[pwa-panel-in_.28s_cubic-bezier(.22,1,.36,1)_both]
          "
        >
          {/* AMBIENT LIGHT */}

          <div
            aria-hidden="true"
            className="
              pointer-events-none

              absolute
              inset-0

              bg-[radial-gradient(circle_at_15%_0%,rgb(var(--pwa-copper-rgb)/0.18),transparent_42%)]
            "
          />

          {/* TOP HAIRLINE */}

          <div
            aria-hidden="true"
            className="
              absolute

              inset-x-8
              top-0

              h-px

              bg-[linear-gradient(90deg,transparent,var(--pwa-copper),transparent)]

              opacity-80
            "
          />

          <div className="relative">
            {/* HEADER */}

            <div
              className="
                flex

                items-start
                justify-between

                gap-5
              "
            >
              <div className="min-w-0">
                <div
                  className="
                    flex

                    items-center

                    gap-2.5
                  "
                >
                  <span
                    className="
                      grid

                      size-8

                      shrink-0

                      place-items-center

                      rounded-full

                      border
                      border-[rgb(var(--pwa-copper-rgb)/0.32)]

                      bg-[rgb(var(--pwa-copper-rgb)/0.08)]

                      text-[var(--pwa-copper)]
                    "
                  >
                    <Smartphone
                      aria-hidden="true"
                      size={15}
                      strokeWidth={1.6}
                    />
                  </span>

                  <p
                    className="
                      text-[9px]

                      font-semibold

                      uppercase

                      tracking-[0.16em]

                      text-[var(--pwa-copper)]
                    "
                  >
                    {copy.iosHelp.badge}
                  </p>
                </div>

                <h2
                  className="
                    mt-4

                    max-w-[290px]

                    text-[14px]

                    font-medium

                    leading-[1.4]

                    tracking-[-0.025em]

                    text-white
                  "
                >
                  {copy.iosHelp.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowIosHelp(false)}
                aria-label={copy.iosHelp.closeAriaLabel}
                title={copy.iosHelp.closeTitle}
                className="
                  grid

                  size-9

                  shrink-0

                  cursor-pointer

                  place-items-center

                  rounded-full

                  border
                  border-white/10

                  bg-white/[0.035]

                  text-white/55

                  transition

                  duration-200

                  hover:border-white/20
                  hover:bg-white/[0.07]
                  hover:text-white

                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[var(--pwa-copper)]
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-black
                "
              >
                <X aria-hidden="true" size={15} strokeWidth={1.7} />
              </button>
            </div>

            <p
              className="
                mt-3

                max-w-[330px]

                text-[11px]

                leading-[1.85]

                text-white/48
              "
            >
              {copy.iosHelp.description}
            </p>

            {/* STEP */}

            <div
              className="
                mt-5

                flex

                items-center

                gap-4

                rounded-[15px]

                border
                border-white/[0.09]

                bg-white/[0.035]

                p-4
              "
            >
              <span
                className="
                  grid

                  size-10

                  shrink-0

                  place-items-center

                  rounded-[12px]

                  bg-white

                  text-black

                  shadow-[0_8px_26px_-12px_rgba(255,255,255,0.35)]
                "
              >
                <Share2 aria-hidden="true" size={17} strokeWidth={1.7} />
              </span>

              <div className="min-w-0">
                <p
                  className="
                    text-[11px]

                    font-semibold

                    text-white
                  "
                >
                  {copy.iosHelp.stepTitle}
                </p>

                <p
                  className="
                    mt-1

                    text-[10px]

                    leading-[1.7]

                    text-white/48
                  "
                >
                  {copy.iosHelp.stepDescription}
                </p>
              </div>
            </div>

            {/* NOTE */}

            <div
              className="
                mt-4

                flex

                items-start

                gap-2.5

                text-[9px]

                leading-[1.75]

                text-white/35
              "
            >
              <ShieldCheck
                aria-hidden="true"
                size={14}
                strokeWidth={1.5}
                className="
                  mt-0.5

                  shrink-0

                  text-[var(--pwa-copper)]
                "
              />

              <p>{copy.iosHelp.note}</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* ================================================================
          MAIN INSTALL CARD
      ================================================================= */}

      <div
        className="
          group/pwa

          relative

          overflow-hidden

          rounded-[20px]

          border
          border-white/[0.12]

          bg-[rgb(var(--pwa-black-rgb)/0.96)]

          text-white

          shadow-[0_20px_65px_-22px_rgba(0,0,0,0.78)]

          supports-[backdrop-filter]:bg-[rgb(var(--pwa-black-rgb)/0.88)]
          supports-[backdrop-filter]:backdrop-blur-[24px]

          motion-safe:animate-[pwa-card-in_.42s_cubic-bezier(.22,1,.36,1)_both]
        "
      >
        {/* AMBIENT GLOW */}

        <div
          aria-hidden="true"
          className="
            pointer-events-none

            absolute
            inset-0

            bg-[radial-gradient(circle_at_8%_10%,rgb(var(--pwa-copper-rgb)/0.17),transparent_34%)]

            opacity-80

            transition-opacity

            duration-500

            group-hover/pwa:opacity-100
          "
        />

        {/* TOP COPPER LINE */}

        <div
          aria-hidden="true"
          className="
            absolute

            inset-x-7
            top-0

            h-px

            bg-[linear-gradient(90deg,transparent,var(--pwa-copper),transparent)]

            opacity-75
          "
        />

        <div
          className="
            relative

            flex

            items-center

            gap-3

            p-3
          "
        >
          {/* APP MARK */}

          <div
            className="
              relative

              grid

              size-[52px]

              shrink-0

              place-items-center

              overflow-hidden

              rounded-[15px]

              border
              border-white/[0.12]

              bg-[linear-gradient(145deg,#191919,#050505)]

              shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_30px_-15px_rgba(0,0,0,0.8)]
            "
          >
            <div
              aria-hidden="true"
              className="
                absolute

                inset-0

                bg-[radial-gradient(circle_at_25%_15%,rgb(var(--pwa-copper-rgb)/0.22),transparent_55%)]
              "
            />

            <span
              className="
                relative

                text-[17px]

                font-medium

                tracking-[0.08em]

                text-[var(--pwa-copper)]
              "
            >
              {copy.card.brandMark}
            </span>
          </div>

          {/* COPY */}

          <div
            className="
              min-w-0
              flex-1
            "
          >
            <p
              className="
                truncate

                text-[7px]

                font-semibold

                uppercase

                tracking-[0.18em]

                text-[var(--pwa-copper)]
              "
            >
              {copy.card.eyebrow}
            </p>

            <p
              className="
                mt-1

                truncate

                text-[12px]

                font-semibold

                tracking-[-0.015em]

                text-white
              "
            >
              {copy.card.title}
            </p>

            <p
              className="
                mt-0.5

                hidden

                max-w-[210px]

                truncate

                text-[8px]

                text-white/38

                min-[360px]:block
              "
            >
              {copy.card.description}
            </p>
          </div>

          {/* ACTIONS */}

          <div
            className="
              flex

              shrink-0

              items-center

              gap-1.5
            "
          >
            <button
              type="button"
              onClick={install}
              disabled={isInstalling}
              className="
                inline-flex

                h-10

                cursor-pointer

                items-center
                justify-center

                gap-2

                rounded-[12px]

                border
                border-[rgb(var(--pwa-copper-rgb)/0.35)]

                bg-[var(--pwa-copper)]

                px-3.5

                text-[10px]

                font-semibold

                text-black

                shadow-[0_10px_28px_-15px_rgb(var(--pwa-copper-rgb)/0.95)]

                transition

                duration-200

                hover:brightness-110

                active:scale-[0.98]

                disabled:cursor-wait
                disabled:opacity-65

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--pwa-copper)]
                focus-visible:ring-offset-2
                focus-visible:ring-offset-black
              "
            >
              <Download
                aria-hidden="true"
                size={14}
                strokeWidth={1.8}
                className={isInstalling ? "motion-safe:animate-pulse" : ""}
              />

              <span
                className="
                  whitespace-nowrap
                "
              >
                {isInstalling ? copy.actions.installing : copy.actions.install}
              </span>
            </button>

            <button
              type="button"
              onClick={dismiss}
              aria-label={copy.actions.dismissAriaLabel}
              title={copy.actions.dismissTitle}
              className="
                grid

                size-10

                cursor-pointer

                place-items-center

                rounded-[12px]

                border
                border-transparent

                bg-white/[0.035]

                text-white/45

                transition

                duration-200

                hover:border-white/10
                hover:bg-white/[0.07]
                hover:text-white

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-[var(--pwa-copper)]
                focus-visible:ring-offset-2
                focus-visible:ring-offset-black
              "
            >
              <X aria-hidden="true" size={15} strokeWidth={1.7} />
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================
          ANIMATION
      ================================================================= */}

 
    </aside>
  );
}
