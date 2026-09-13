import type { ReactNode } from "react";
import Script from "next/script";
import { Vazirmatn } from "next/font/google";

const vazir = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const themeBootScript = `
  try {
    const saved = localStorage.getItem('najib-admin-theme');
    const dark = saved === 'dark' || (!saved && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    document.documentElement.dir = 'rtl';
  } catch (_) {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
    document.documentElement.dir = 'rtl';
  }
`;

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className={vazir.className}>
      <Script
        id="najib-admin-theme"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: themeBootScript }}
      />
      {children}
    </div>
  );
}
