import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = {
  title: "Admin | ColdStack",
  description: "ColdStack operations administration console",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { profile } = await requireAdmin();

  return (
    <AdminShell profile={profile}>
      {children}
    </AdminShell>
  );
}
