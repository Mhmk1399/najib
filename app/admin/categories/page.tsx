import { AdminShell } from "@/components/admin/admin-shell";
import { CategoryManager } from "@/components/admin/category-manager";
import { displayRole, requireStaffPermission } from "@/lib/admin/auth";

export default async function AdminCategoriesPage() {
  const staff = await requireStaffPermission("catalog.read");

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
      <CategoryManager canWrite={staff.permissions.includes("catalog.write")} />
    </AdminShell>
  );
}
