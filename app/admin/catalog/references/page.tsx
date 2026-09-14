import { AdminShell } from "@/components/admin/admin-shell";
import { CatalogReferenceManager } from "@/components/admin/catalog-reference-manager";
import { displayRole, requireStaffPermission } from "@/lib/admin/auth";

export default async function CatalogReferencesPage() {
  const staff = await requireStaffPermission("catalog.read");
  return (
    <AdminShell staff={{
      firstName: staff.firstName,
      lastName: staff.lastName,
      displayRole: displayRole(staff.roles),
      roles: staff.roles,
      permissions: staff.permissions,
    }}>
      <CatalogReferenceManager canWrite={staff.permissions.includes("catalog.write")} />
    </AdminShell>
  );
}
