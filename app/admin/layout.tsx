import type { ReactNode } from "react";
import Script from "next/script";
import { Vazirmatn } from "next/font/google";
import { AdminQueryProvider } from "@/components/global/table/AdminQueryProvider";

 
 

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
  } catch (_) {
    document.documentElement.dataset.theme = 'dark';
    document.documentElement.style.colorScheme = 'dark';
    document.documentElement.dir = 'rtl';
  }
`;

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div  >
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