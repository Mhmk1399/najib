import { AdminShell } from "@/components/admin/admin-shell";
import { OrdersManager } from "@/components/admin/orders-manager";
import { displayRole, requireStaffPermission } from "@/lib/admin/auth";

export default async function AdminOrdersPage() {
  const staff = await requireStaffPermission("orders.read");

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
      <OrdersManager canWrite={staff.permissions.includes("orders.write")} />
    </AdminShell>
  );
}
