import { AdminShell } from "@/components/admin/admin-shell";
import { ImageStories } from "@/components/admin/image-stories";
import { displayRole, requireStaff } from "@/lib/admin/auth";

export default async function CatalogImagesPage() {
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
      <ImageStories
        canRead={staff.permissions.includes("catalog.read")}
        canWrite={staff.permissions.includes("catalog.write")}
      />
    </AdminShell>
  );
}
