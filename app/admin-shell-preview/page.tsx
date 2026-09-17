import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminShellPreviewPage() {
  return (
    <AdminShell
      staff={{
        firstName: "علی",
        lastName: "احمدی",
        displayRole: "مدیر فروشگاه",
        roles: ["admin"],
        permissions: ["staff.manage"],
      }}
    >
      <div className="p-5">
        <div className="min-h-[720px] border border-white/10 bg-black/10 p-6">
          <p className="text-xs opacity-60">نمای کلی عملیات</p>
          <h1 className="mt-2 text-2xl font-bold">داشبورد مدیریت</h1>
          <div className="mt-8 h-64 border border-white/10" />
        </div>
      </div>
    </AdminShell>
  );
}
