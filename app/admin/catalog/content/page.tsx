import { AdminShell } from "@/components/admin/admin-shell";
import { PageComposer } from "@/components/admin/page-composer";
import { displayRole, requireStaff } from "@/lib/admin/auth";

export default async function CatalogContentPage() {
  const staff = await requireStaff();
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
      <PageComposer
        canRead={staff.permissions.includes("catalog.read")}
        canWrite={staff.permissions.includes("catalog.write")}
      />
    </AdminShell>
  );
}
