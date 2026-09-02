import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Najib Atelier Operations",
  description: "Operations dashboard for the Najibzadeh boutique commerce platform.",
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
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeBootScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
