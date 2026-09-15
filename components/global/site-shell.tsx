"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/global/Navbar";
import Footer from "@/components/global/Footer";
import FloatingContactDock from "@/components/global/floating";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isAccountWorkspace = pathname === "/auth" || pathname.startsWith("/customer-dashboard");

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
