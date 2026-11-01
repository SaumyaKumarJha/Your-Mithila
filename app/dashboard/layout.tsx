import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Home, Briefcase, CreditCard, User,
} from "lucide-react";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Dashboard | YourMithila", template: "%s | Dashboard — YourMithila" },
};

const OWNER_NAV = [
  { href: "/dashboard",              icon: LayoutDashboard, label: "Overview",     labelHi: "ओवरव्यू" },
  { href: "/dashboard/listings/new", icon: Home,            label: "Add Listing",  labelHi: "लिस्टिंग जोड़ें" },
  { href: "/dashboard/jobs/new",     icon: Briefcase,       label: "Post Job",     labelHi: "नौकरी पोस्ट करें" },
  { href: "/dashboard/subscription", icon: CreditCard,      label: "Subscription", labelHi: "सदस्यता" },
  { href: "/dashboard/profile",      icon: User,            label: "My Profile",   labelHi: "मेरी प्रोफाइल" },
];

const SEEKER_NAV = [
  { href: "/dashboard/profile", icon: User, label: "My Profile", labelHi: "मेरी प्रोफाइल" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const role = (session.user as any).role as string;
  const navItems = role === "SEEKER" ? SEEKER_NAV : OWNER_NAV;

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      {/* Sidebar — desktop only */}
      <aside
        className="hidden md:flex flex-col w-56 flex-shrink-0 border-r sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {/* User info */}
        <div className="px-4 py-5 border-b" style={{ borderColor: "var(--border)" }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-base mb-2"
            style={{ background: "var(--primary)" }}
          >
            {session.user.name?.[0]?.toUpperCase()}
          </div>
          <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
            {session.user.name}
          </p>
          <p className="text-xs truncate mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            {role === "OWNER" ? "🏠 Owner" : role === "ADMIN" ? "🛡️ Admin" : "🔍 Seeker"}
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-[var(--surface-alt)] hover:text-[var(--primary)]"
              style={{ color: "var(--text-secondary)" }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 py-3 border-t" style={{ borderColor: "var(--border)" }}>
          <SignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
