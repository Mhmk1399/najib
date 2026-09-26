import { AdminShell } from "@/components/admin/admin-shell";
import { AbandonedCheckoutsManager } from "@/components/admin/abandoned-checkouts-manager";
import { displayRole, requireStaffPermission } from "@/lib/admin/auth";

export default async function AdminAbandonedCheckoutsPage() {
  const staff = await requireStaffPermission("orders.read");
  return <AdminShell staff={{ firstName: staff.firstName, lastName: staff.lastName, displayRole: displayRole(staff.roles), roles: staff.roles, permissions: staff.permissions }}><AbandonedCheckoutsManager canWrite={staff.permissions.includes("orders.write")} /></AdminShell>;
}
