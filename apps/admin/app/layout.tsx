import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "داشبورد عملیات نجیب‌زاده",
  description: "فضای مدیریت فروشگاه و کاتالوگ نجیب‌زاده",
};

const themeBootScript = `
  try {
    const saved = localStorage.getItem('najib-admin-theme');
    const dark = saved === 'dark' || (!saved && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  } catch (_) {}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
