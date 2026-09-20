"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/global/Navbar";
import Footer from "@/components/global/Footer";
import FloatingContactDock from "@/components/global/floating";
import { splitLocalePathname } from "@/lib/i18n/routes";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { pathnameWithoutLocale } = splitLocalePathname(pathname);
  const isAdminRoute = pathnameWithoutLocale.startsWith("/admin");
  const isAccountWorkspace =
    pathnameWithoutLocale === "/auth" ||
    pathnameWithoutLocale.startsWith("/customer-dashboard");

  if (isAdminRoute || isAccountWorkspace) return <>{children}</>;

  return (
    <>
      <FloatingContactDock
        phone="+98 21 0000 0000"
        whatsapp="+98 912 000 0000"
        location="https://maps.google.com/?q=35.6892,51.3890"
      />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
