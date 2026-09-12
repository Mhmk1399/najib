"use client";

import { type CSSProperties, useEffect, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/Button";
import { brandColors, fontTokens } from "@/theme/theme-colors";

type FloatingContactDockProps = {
  phone: string;
  whatsapp: string;
  location: string;
};

function normalizePhone(value: string) {
  return value.replace(/[^\d+]/g, "");
}

function normalizeWhatsApp(value: string) {
  return value.replace(/\D/g, "");
}

export default function FloatingContactDock({
  phone,
  whatsapp,
  location,
}: FloatingContactDockProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reactId = useId();

  const panelId = `${reactId.replace(/:/g, "")}-contact-dock`;
  const telHref = `tel:${normalizePhone(phone)}`;
  const whatsappHref = `https://wa.me/${normalizeWhatsApp(whatsapp)}`;

  const themeVars = {
    "--contact-black": brandColors.black.hex,
    "--contact-cream": brandColors.cream.hex,
    "--contact-copper": brandColors.copper.hex,
  } as CSSProperties;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;
      if (rootRef.current?.contains(target)) return;

      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      dir="ltr"
      style={{
        ...themeVars,
        fontFamily: fontTokens.english,
      }}
      className="pointer-events-none fixed bottom-[max(14px,env(safe-area-inset-bottom))] right-[max(14px,env(safe-area-inset-right))] z-[1400] sm:bottom-[max(20px,env(safe-area-inset-bottom))] sm:right-[max(20px,env(safe-area-inset-right))]"
    >
      {open && (
        <section
          id={panelId}
          role="dialog"
          aria-label="Contact Najibzadeh"
          className="pointer-events-auto absolute bottom-[52px] right-0 w-[min(272px,calc(100vw-28px))] overflow-hidden border border-white/[0.13] bg-[#0B0B0B]/[0.90] text-white shadow-[0_16px_46px_rgba(0,0,0,0.22)] supports-[backdrop-filter]:bg-[#0B0B0B]/[0.80] supports-[backdrop-filter]:backdrop-blur-[8px] supports-[backdrop-filter]:backdrop-saturate-[1.04] motion-safe:animate-[contactDockIn_140ms_ease-out]"
        >
          <style>{`
            @keyframes contactDockIn {
              from { opacity: 0; transform: translateY(6px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>

          <div className="flex h-10 items-center justify-between border-b border-white/[0.10] px-3.5">
            <span className="text-[7px] font-semibold uppercase tracking-[0.22em] text-white/85">
              Client Care
            </span>

            <span className="h-px w-8 bg-[var(--contact-copper)]/70" />
          </div>

          <nav aria-label="Contact options">
            <ContactAction
              href={telHref}
              label="Call"
              detail={phone}
              icon={<CallBrandIcon />}
              onSelect={() => setOpen(false)}
            />

            <ContactAction
              href={whatsappHref}
              label="WhatsApp"
              detail="Message us directly"
              icon={<WhatsAppBrandIcon />}
              target="_blank"
              rel="noopener noreferrer"
              onSelect={() => setOpen(false)}
            />

            <ContactAction
              href={location}
              label="Location"
              detail="Open in Maps"
              icon={<MapsBrandIcon />}
              target="_blank"
              rel="noopener noreferrer"
              onSelect={() => setOpen(false)}
              last
            />
          </nav>
        </section>
      )}

      <div className="pointer-events-auto flex justify-end">
        <Button
          type="button"
          variant="black"
          size="md"
          iconOnly
          aria-label={open ? "Close contact options" : "Open contact options"}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((current) => !current)}
          className={[
            "!size-11 !border-white/[0.16] !bg-[#0B0B0B]/[0.90] !p-0 !text-white",
            "!shadow-[0_10px_28px_rgba(0,0,0,0.18)]",
            "supports-[backdrop-filter]:!bg-[#0B0B0B]/[0.82]",
            "supports-[backdrop-filter]:!backdrop-blur-[6px]",
            "hover:!border-white/[0.28] hover:!bg-[#0B0B0B] hover:!text-white",
            "active:!translate-y-px",
            open
              ? "!border-[var(--contact-copper)]/70 !text-[var(--contact-copper)]"
              : "",
          ].join(" ")}
          icon={open ? <CloseIcon /> : <ConciergeIcon />}
        />
      </div>
    </div>
  );
}

function ContactAction({
  href,
  label,
  detail,
  icon,
  target,
  rel,
  onSelect,
  last = false,
}: {
  href: string;
  label: string;
  detail: string;
  icon: React.ReactNode;
  target?: "_blank" | "_self";
  rel?: string;
  onSelect: () => void;
  last?: boolean;
}) {
  return (
    <Button
      href={href}
      target={target}
      rel={rel}
      variant="black"
      size="sm"
      fullWidth
      align="left"
      aria-label={label}
      onClick={onSelect}
      className={[
        "group/action !min-h-[54px] !w-full !border-0 !bg-transparent !px-3.5 !py-0 !text-white",
        last ? "" : "!border-b !border-b-white/[0.08]",
        "hover:!bg-white/[0.055] hover:!text-white",
        "focus-visible:!ring-white/60 [&>span]:!w-full",
      ].join(" ")}
    >
      <span className="grid w-full grid-cols-[28px_minmax(0,1fr)_14px] items-center gap-3 text-left">
        <span
          aria-hidden="true"
          className="grid size-9 place-items-center [&>svg]:size-[29px]"
        >
          {icon}
        </span>

        <span className="min-w-0">
          <span className="block text-[9px] font-semibold uppercase leading-none tracking-[0.14em] text-white">
            {label}
          </span>
          <span className="mt-1.5 block truncate text-[8px] font-normal normal-case leading-none tracking-normal text-white/58">
            {detail}
          </span>
        </span>

        <span
          aria-hidden="true"
          className="text-white/42 transition-transform duration-150 group-hover/action:translate-x-px"
        >
          <ArrowIcon />
        </span>
      </span>
    </Button>
  );
}

function WhatsAppBrandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3.25A8.75 8.75 0 0 0 4.39 16.32L3.5 20.5l4.3-.84A8.75 8.75 0 1 0 12 3.25Z"
        fill="#25D366"
      />
      <path
        d="M8.05 7.6c.19-.43.39-.44.57-.45h.49c.16 0 .41.06.62.52.21.46.72 1.76.78 1.89.06.12.1.27.02.43-.08.16-.12.26-.25.4-.12.14-.26.31-.37.42-.12.12-.24.25-.1.49.14.25.62 1.02 1.34 1.65.92.82 1.69 1.08 1.94 1.2.25.12.39.1.54-.06.14-.16.62-.72.78-.97.16-.25.33-.2.56-.12.23.08 1.45.68 1.7.8.25.12.41.19.47.29.06.1.06.58-.14 1.13-.2.56-1.17 1.07-1.61 1.14-.42.07-.95.1-1.53-.08-.35-.11-.8-.26-1.38-.51-.24-.1-4.19-1.56-5.78-5.48-.16-.39-.01-1.22.35-1.69Z"
        fill="white"
      />
    </svg>
  );
}

function CallBrandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2.75" y="2.75" width="18.5" height="18.5" fill="#34C759" />
      <path
        d="M7.2 6.25 10 9.05 8.7 11.1c1.18 2.05 2.97 3.84 5.02 5.02l2.05-1.3 2.8 2.8-1.75 1.75c-.73.73-2.05.58-3.72-.25-1.64-.82-3.47-2.19-5.09-3.81-1.62-1.62-2.99-3.45-3.81-5.09-.83-1.67-.98-2.99-.25-3.72L5.7 4.75l1.5 1.5Z"
        fill="white"
      />
    </svg>
  );
}

function MapsBrandIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.75c-4.06 0-7.35 3.14-7.35 7.01 0 5.24 7.35 11.49 7.35 11.49s7.35-6.25 7.35-11.49c0-3.87-3.29-7.01-7.35-7.01Z"
        fill="#4285F4"
      />
      <path
        d="M12 2.75c-4.06 0-7.35 3.14-7.35 7.01 0 1.51.61 3.16 1.51 4.7L12 2.75Z"
        fill="#34A853"
      />
      <path
        d="M6.16 14.46C8.17 17.87 12 21.25 12 21.25l2.38-2.22-8.22-4.57Z"
        fill="#FBBC05"
      />
      <path
        d="M19.35 9.76c0-3.87-3.29-7.01-7.35-7.01v7.01h7.35Z"
        fill="#EA4335"
      />
      <rect x="9" y="6.75" width="6" height="6" fill="white" />
    </svg>
  );
}

function ConciergeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5H20V15H12L7 19V15H4V5Z" stroke="currentColor" />
      <path d="M8 9H16M8 12H13" stroke="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 5L19 19M19 5L5 19" stroke="currentColor" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 8H14M10 4L14 8L10 12" stroke="currentColor" />
    </svg>
  );
}
