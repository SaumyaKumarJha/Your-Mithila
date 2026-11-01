import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * /profile — smart redirect based on role.
 * OWNER/ADMIN → /dashboard/profile (full profile editor inside dashboard)
 * SEEKER      → /dashboard/profile (same editor, accessible to all authenticated users)
 * Unauthenticated → /auth/login
 */
export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/profile");
  // All roles share the same profile editor
  redirect("/dashboard/profile");
}
