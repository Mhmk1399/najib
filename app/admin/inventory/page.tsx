import { AdminShell } from "@/components/admin/admin-shell";
import { InventoryManager } from "@/components/admin/inventory-manager";
import { displayRole, requireStaffPermission } from "@/lib/admin/auth";

export default async function AdminInventoryPage() {
  const staff = await requireStaffPermission("inventory.read");

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
      <InventoryManager canWrite={staff.permissions.includes("inventory.write")} />
    </AdminShell>
  );
}
