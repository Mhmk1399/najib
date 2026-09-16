import type { Metadata } from "next";

import { CustomerDashboard } from "@/components/account/customer-dashboard";
import { requireCustomerAccount } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "حساب من | نجیب‌زاده",
  description: "مدیریت سفارش‌ها و مشخصات حساب مشتری نجیب‌زاده",
  robots: { index: false, follow: false, nocache: true },
};

export default async function CustomerDashboardPage() {
  const account = await requireCustomerAccount();
  return (
    <CustomerDashboard
      initialAccount={{
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
      }}
    />
  );
}
