import { AdminShell } from "@/components/admin/admin-shell";
import { CartsManager } from "@/components/admin/carts-manager";
import { displayRole, requireStaffPermission } from "@/lib/admin/auth";

export default async function AdminCartsPage() {
  const staff = await requireStaffPermission("orders.read");
  return <AdminShell staff={{ firstName: staff.firstName, lastName: staff.lastName, displayRole: displayRole(staff.roles), roles: staff.roles, permissions: staff.permissions }}><CartsManager canWrite={staff.permissions.includes("orders.write")} /></AdminShell>;
}
