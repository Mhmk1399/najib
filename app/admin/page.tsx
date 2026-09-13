import { AdminShell } from "@/components/admin/admin-shell";
import { Dashboard } from "@/components/admin/dashboard";
import { displayRole, requireStaff } from "@/lib/admin/auth";

export default async function AdminPage() {
  const staff = await requireStaff();

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
      <Dashboard />
    </AdminShell>
  );
}
