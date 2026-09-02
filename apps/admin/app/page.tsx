import { AdminShell } from "@/components/admin-shell";
import { Dashboard } from "@/components/dashboard";
import { getServiceHealth } from "@/lib/service-health";
import { displayRole, requireStaff } from "@/lib/auth";

export default async function OverviewPage() {
  const [services, staff] = await Promise.all([getServiceHealth(), requireStaff()]);
  return (
    <AdminShell staff={{ firstName: staff.firstName, lastName: staff.lastName, displayRole: displayRole(staff.roles), permissions: staff.permissions }}>
      <Dashboard services={services} />
    </AdminShell>
  );
}
