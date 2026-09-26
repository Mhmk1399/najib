import { AdminShell } from "@/components/admin/admin-shell";
import { ProductManager } from "@/components/admin/product-manager";
import { displayRole, requireStaff } from "@/lib/admin/auth";

export default async function ProductsPage() {
  const staff = await requireStaff();
  const profile = {
    firstName: staff.firstName,
    lastName: staff.lastName,
    displayRole: displayRole(staff.roles),
    roles: staff.roles,
    permissions: staff.permissions,
  };

  return (
    <AdminShell staff={profile}>
      <ProductManager
        canRead={staff.permissions.includes("catalog.read")}
        canWrite={staff.permissions.includes("catalog.write")}
        canManageInventory={staff.permissions.includes("inventory.write")}
      />
    </AdminShell>
  );
}
