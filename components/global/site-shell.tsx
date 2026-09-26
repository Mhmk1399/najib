"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/global/Navbar";
import Footer from "@/components/global/Footer";
import FloatingContactDock from "@/components/global/floating";
import type { Locale } from "@/lib/i18n/config";
import { splitLocalePathname } from "@/lib/i18n/routes";

export function SiteShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: Locale;
}) {
  const pathname = usePathname();
  const { pathnameWithoutLocale } = splitLocalePathname(pathname);
  const isCommerceRoute = ["/cart", "/checkout", "/recover-checkout"].includes(pathnameWithoutLocale);
  const isAdminRoute = pathnameWithoutLocale.startsWith("/admin");
  const isAccountWorkspace =
    pathnameWithoutLocale === "/auth" ||
    pathnameWithoutLocale.startsWith("/customer-dashboard");

  if (isAdminRoute || isAccountWorkspace) return <>{children}</>;

  return (
    <>
      {!isCommerceRoute ? (
        <FloatingContactDock
          phone="+98 21 0000 0000"
          whatsapp="+98 912 000 0000"
          location="https://maps.google.com/?q=35.6892,51.3890"
        />
      ) : null}
      <Navbar />
      {children}
      <Footer initialLocale={locale} />
    </>
  );
}
