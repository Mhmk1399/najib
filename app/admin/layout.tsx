import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { AdminQueryProvider } from "@/components/global/table/AdminQueryProvider";

export const metadata: Metadata = {
  title: "پنل مدیریت نجیب‌زاده",
  description: "فضای مدیریت کاتالوگ نجیب‌زاده",
  robots: { index: false, follow: false, nocache: true },
};

const themeBootScript = `
  try {
    const saved = localStorage.getItem('najib-admin-theme');

    const dark =
      saved === 'dark' ||
      (!saved && matchMedia('(prefers-color-scheme: dark)').matches);

    document.documentElement.dataset.theme =
      dark ? 'dark' : 'light';

    document.documentElement.style.colorScheme =
      dark ? 'dark' : 'light';

    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'fa';
  } catch (_) {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'fa';
  }
`;

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div lang="fa" dir="rtl">
      <Script
        id="najib-admin-theme"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: themeBootScript,
        }}
      />

      <AdminQueryProvider>
        {children}
      </AdminQueryProvider>
    </div>
  );
}
