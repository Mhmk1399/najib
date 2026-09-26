/**
 * layout.example.tsx
 *
 * Reference implementation of the Next.js App Router root layout with the
 * Najibzadeh theme system fully integrated.
 *
 * USAGE:
 * Copy the content of this file to src/app/layout.tsx and configure the
 * font variables to match your next/font setup.
 *
 * KEY DECISIONS:
 * - <html> has suppressHydrationWarning because ThemeScript mutates its
 *   class / attributes before React hydration. React would otherwise warn
 *   about the mismatch between server-rendered HTML and client DOM.
 * - <body> is not a Client Component. ThemeProvider wraps children only.
 * - ThemeScript is rendered before any content so the browser applies the
 *   correct theme class before any paint occurs.
 * - Metadata export works normally — this is still a Server Component.
 */

import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import "./admin/admin.css";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { QueryProvider } from "@/components/providers/query-provider";

import { ToastProvider } from "@/components/ui/CustomToast";
import { SiteShell } from "@/components/global/site-shell";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";
import { DynamicImageIsland } from "@/components/storefront/dynamic-image-island";
import { ContextualProductReveal } from "@/components/storefront/contextual-product-reveal";
import {
  defaultLocale,
  getHtmlLang,
  getLocaleDirection,
  isLocale,
} from "@/lib/i18n/config";
import {
  localeAlternates,
  localizedOpenGraph,
  siteUrl,
} from "@/lib/i18n/metadata";
import { estedad } from "@/next-persian-fonts/estedad";
import { Aria } from "@/next-persian-fonts/Aria Family";
 
export const metadata: Metadata = {
  title: "Najibzadeh | Luxury Menswear & Tailoring",
  description:
    "Dignity in silence. Najibzadeh is a luxury menswear and tailoring house.",
  metadataBase: siteUrl,
  applicationName: "Najibzadeh",
  manifest: "/manifest.webmanifest",
  alternates: localeAlternates("/", defaultLocale),
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "نجیب‌زاده",
  },
  icons: {
    icon: [
      { url: "/pwa/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/pwa/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    ...localizedOpenGraph(defaultLocale),
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F6F2EB" },
    { media: "(prefers-color-scheme: dark)", color: "#0B0B0B" },
  ],
};

 
interface RootLayoutProps {
  children: React.ReactNode;
}

export default async function RootLayout({
  children,
}: RootLayoutProps): Promise<React.JSX.Element> {
  const requestHeaders = await headers();
  const candidateLocale = requestHeaders.get("x-najib-locale") ?? undefined;
  const locale = isLocale(candidateLocale) ? candidateLocale : defaultLocale;
  const direction = getLocaleDirection(locale);

  // Select font based on locale
  const fontClass = locale === "en" ? Aria.className : estedad.className;
  
  // Set CSS variable for font family
  const fontVariable = locale === "en" ? "--font-aria" : "--font-estedad";

  return (
    /*
     * suppressHydrationWarning is required on <html> because ThemeScript
     * mutates class, data-theme, and style.colorScheme before React mounts.
     * This suppression applies only to the <html> element itself, not to the
     * entire subtree.
     */
    <html
      className="scroll-smooth"
      lang={getHtmlLang(locale)}
      dir={direction}
      suppressHydrationWarning
      style={{ '--font-family': fontVariable } as React.CSSProperties}
    >
      <head></head>

      <body
        dir={direction}
        className={`antialiased ${fontClass} min-h-dvh`}
      >
        <div className="flex min-h-dvh flex-col">
          <LenisProvider>
            <QueryProvider>
              <PwaInstallPrompt />
              <SiteShell locale={locale}>
                <div className="flex-1">
                  <ToastProvider position="top-right" maxToasts={5} locale={locale}>
                    {children}
                  </ToastProvider>
                </div>
              </SiteShell>
              <ContextualProductReveal />
              <DynamicImageIsland />
            </QueryProvider>
          </LenisProvider>
        </div>
      </body>
    </html>
  );
}
