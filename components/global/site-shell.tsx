"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/global/Navbar";
import Footer from "@/components/global/Footer";
import FloatingContactDock from "@/components/global/floating";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isAccountWorkspace = pathname === "/auth" || pathname.startsWith("/customer-dashboard");
  const isCommerceRoute = pathname === "/cart" || pathname === "/checkout";

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
      <Footer />
    </>
  );
}
