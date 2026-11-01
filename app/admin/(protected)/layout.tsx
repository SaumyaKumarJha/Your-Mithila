import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isAdmin = (session?.user as any)?.role === "ADMIN";

  if (!isAdmin) redirect("/admin/login");

  return <AdminShell>{children}</AdminShell>;
}
