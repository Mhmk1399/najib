import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminQueryProvider } from "@/components/global/table/AdminQueryProvider";

export const metadata: Metadata = {
  title: "پنل مدیریت نجیب‌زاده",
  description: "فضای مدیریت کاتالوگ نجیب‌زاده",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div lang="fa" dir="rtl">
      <AdminQueryProvider>
        {children}
      </AdminQueryProvider>
    </div>
  );
}
