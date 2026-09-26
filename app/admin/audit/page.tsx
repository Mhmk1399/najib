import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { AuditManager } from "@/components/admin/audit-manager";
import { displayRole, requireStaff } from "@/lib/admin/auth";

export default async function AdminAuditPage() {
  const staff = await requireStaff();
  if (!staff.permissions.includes("settings.manage") && !staff.permissions.includes("staff.manage")) redirect("/admin?reason=permission");
  return <AdminShell staff={{ firstName: staff.firstName, lastName: staff.lastName, displayRole: displayRole(staff.roles), roles: staff.roles, permissions: staff.permissions }}><AuditManager /></AdminShell>;
}
