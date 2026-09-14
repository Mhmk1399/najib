import { AdminShell } from "@/components/admin/admin-shell";
import { UserManager } from "@/components/admin/user-manager";
import { displayRole, requireStaffPermission } from "@/lib/admin/auth";

export default async function AdminUsersPage() {
  const staff = await requireStaffPermission("staff.manage");

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
      <UserManager />
    </AdminShell>
  );
}
