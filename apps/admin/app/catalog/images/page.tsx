import { AdminShell } from "@/components/admin-shell";
import { ImageStories } from "@/components/image-stories";
import { displayRole, requireStaff } from "@/lib/auth";

export default async function CatalogImagesPage() {
  const staff = await requireStaff();
  return (
    <AdminShell staff={{ firstName: staff.firstName, lastName: staff.lastName, displayRole: displayRole(staff.roles), permissions: staff.permissions }}>
      <ImageStories canRead={staff.permissions.includes("catalog.read")} canWrite={staff.permissions.includes("catalog.write")} />
    </AdminShell>
  );
}
