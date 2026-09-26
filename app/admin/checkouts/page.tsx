import { AdminShell } from "@/components/admin/admin-shell";
import { CheckoutsManager } from "@/components/admin/checkouts-manager";
import { displayRole, requireStaffPermission } from "@/lib/admin/auth";

export default async function AdminCheckoutsPage() {
  const staff = await requireStaffPermission("orders.read");
  return <AdminShell staff={{ firstName: staff.firstName, lastName: staff.lastName, displayRole: displayRole(staff.roles), roles: staff.roles, permissions: staff.permissions }}><CheckoutsManager /></AdminShell>;
}
