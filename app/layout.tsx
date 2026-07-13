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

import type { Metadata } from "next";
import { ThemeProvider } from "@/contexts/theme-context";
import "./globals.css";
 import { Footer } from "@/components/global/footer";
import { LenisProvider } from "@/components/providers/lenis-provider";
import { Navbar } from "@/components/global/navbar";
import {
  navbarCategories,
  navbarLabels,
  navbarLogo,
  navbarPrimaryLinks,
} from "@/components/global/navbar/navbar-data.example";
import { footerData } from "@/components/global/footer/footer.data";
import { Dana } from "@/next-persian-fonts/dana";
// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: {
    default: "Najibzadeh — Luxury Menswear & Tailoring",
    template: "%s | Najibzadeh",
  },
  description:
    "Dignity in silence. Najibzadeh is a luxury menswear and tailoring house.",
  metadataBase: new URL("https://najibzadeh.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "fa_IR",
    siteName: "Najibzadeh",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

/**
 * Configure these variables in your next/font setup and pass the resulting
 * className strings to <body>.  The font token names (--font-dana and
 * --font-open-sans) match the values in fontTokens.
 *
 * Example (add to a separate fonts.ts file):
 *
 *   import localFont from 'next/font/local';
 *   import { Open_Sans } from 'next/font/google';
 *
 *   export const dana = localFont({
 *     src: '../fonts/Dana-Regular.woff2',
 *     variable: '--font-dana',
 *     display: 'swap',
 *   });
 *
 *   export const openSans = Open_Sans({
 *     subsets: ['latin'],
 *     variable: '--font-open-sans',
 *     display: 'swap',
 *   });
 */

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: RootLayoutProps): React.JSX.Element {
  return (
    /*
     * suppressHydrationWarning is required on <html> because ThemeScript
     * mutates class, data-theme, and style.colorScheme before React mounts.
     * This suppression applies only to the <html> element itself, not to the
     * entire subtree.
     */
    <html
      className="scroll-smooth"
      lang="en"
      dir="ltr"
      suppressHydrationWarning
    >
      <head></head>

      <body dir="ltr" className={`antialiased ${Dana.className} min-h-dvh`}>
        <div dir="rtl" className="flex min-h-dvh flex-col">
          <ThemeProvider defaultTheme="light">
            <LenisProvider>
              <Navbar
                logo={navbarLogo}
                primaryLinks={navbarPrimaryLinks}
                categories={navbarCategories}
                labels={navbarLabels}
                // user={user}
                // cartCount={cartCount}
                overlayAtTop
                heroTone="light"
                showCategoryRail
              />
              <div className="flex-1">{children}</div>
              <Footer {...footerData} />
            </LenisProvider>
          </ThemeProvider>
        </div>
      </body>
    </html>
  );
}
