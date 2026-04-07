import AdminLoginFlow from "@/Components/admin/AdminLoginFlow";
import AdminPanel from "@/Components/admin/AdminPanel";
import { getAdminSession } from "@/lib/admin-auth";

export default async function AdminPage() {
  const admin = await getAdminSession();

  return (
    <main className="min-h-screen bg-surface px-6 py-20">
      {admin ? (
        <AdminPanel email={admin.email} fullName={admin.fullName} />
      ) : (
        <AdminLoginFlow />
      )}
    </main>
  );
}
