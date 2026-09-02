import { AdminShell } from "@/components/admin-shell";
import { Dashboard } from "@/components/dashboard";
import { getServiceHealth } from "@/lib/service-health";

export default async function OverviewPage() {
  const services = await getServiceHealth();
  return (
    <AdminShell>
      <Dashboard services={services} />
    </AdminShell>
  );
}
