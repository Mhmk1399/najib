import { AdminShell } from "@/components/admin/admin-shell";
import { Dashboard } from "@/components/admin/dashboard";
import { getServiceHealth } from "@/lib/admin/service-health";
import { displayRole, requireStaff } from "@/lib/admin/auth";

export default async function OverviewPage() {
  const [services, staff] = await Promise.all([
    getServiceHealth(),
    requireStaff(),
  ]);
  return (
    <AdminShell
      staff={{
        firstName: staff.firstName,
        lastName: staff.lastName,
        displayRole: displayRole(staff.roles),
        roles: staff.roles,
        permissions: staff.permissions,
      }}
    >
      <Dashboard services={services} />
    </AdminShell>
  );
}
