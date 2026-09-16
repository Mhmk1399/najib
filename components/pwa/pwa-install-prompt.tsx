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

export function PwaInstallPrompt() {
  const pathname = usePathname();
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

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

  useEffect(() => {
    if (!showIosHelp) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowIosHelp(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [showIosHelp]);

  const isPrivateWorkspace =
    pathname.startsWith("/admin") ||
    pathname === "/auth" ||
    pathname.startsWith("/customer-dashboard");
  const canInstall = Boolean(installPrompt) || isIos;

  if (isPrivateWorkspace || isDismissed || !canInstall) return null;

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
      if (choice.outcome === "dismissed") dismiss();
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <aside
      dir="rtl"
      aria-label="نصب اپلیکیشن نجیب‌زاده"
      className="fixed bottom-[max(14px,env(safe-area-inset-bottom))] left-[max(14px,env(safe-area-inset-left))] z-[135] flex max-w-[calc(100vw-28px)] flex-col items-start gap-2 sm:bottom-[max(20px,env(safe-area-inset-bottom))] sm:left-[max(20px,env(safe-area-inset-left))]"
    >
      {showIosHelp ? (
        <div className="w-[min(310px,calc(100vw-28px))] bg-black/50 border border-white/15   p-4 text-right text-white shadow-[0_16px_46px_rgba(0,0,0,0.22)] supports-[backdrop-filter]:backdrop-blur-[8px]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="m-0 text-sm font-bold">نصب روی آیفون یا آیپد</p>
              <p className="mt-2 text-xs leading-6 text-white/70">
                از منوی اشتراک‌گذاری مرورگر، گزینه «افزودن به صفحه اصلی» را
                انتخاب کنید.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowIosHelp(false)}
              className="grid size-9 shrink-0 cursor-pointer place-items-center bg-black border border-white/15 text-white/75 transition-colors hover:border-[#C15427] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C15427]"
              aria-label="بستن راهنمای نصب"
              title="بستن"
            >
              <X aria-hidden="true" size={16} strokeWidth={1.8} />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-xs text-white/80">
            <Share aria-hidden="true" size={16} strokeWidth={1.8} />
            <span>اشتراک‌گذاری، سپس افزودن به صفحه اصلی</span>
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={install}
          disabled={isInstalling}
          className="inline-flex h-11 min-w-[108px] cursor-pointer items-center justify-center gap-2 border border-white/15 bg-white px-4 text-sm font-bold text-white shadow-[0_12px_34px_rgba(0,0,0,0.2)] transition-colors hover:border-[#C15427] disabled:cursor-wait disabled:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C15427]"
        >
          <Download aria-hidden="true" size={17} strokeWidth={1.8} />
          <span>{isInstalling ? "در حال نصب" : "نصب اپ"}</span>
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="grid size-11 cursor-pointer place-items-center border border-white/15  bg-white text-white/75 shadow-[0_12px_34px_rgba(0,0,0,0.2)] transition-colors hover:border-[#C15427] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C15427]"
          aria-label="بستن پیشنهاد نصب"
          title="بستن"
        >
          <X aria-hidden="true" size={16} strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}
