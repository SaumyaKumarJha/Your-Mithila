"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Building2, Briefcase, User, LayoutDashboard, Shield } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;

  // Role-based account destination
  const accountHref =
    role === "OWNER" ? "/dashboard" :
    role === "ADMIN" ? "/admin" :
    session ? "/saved" :
    "/auth/login";

  const accountLabel =
    role === "OWNER" ? "Dashboard" :
    role === "ADMIN" ? "Admin" :
    session ? "Saved" :
    "Account";

  const AccountIcon =
    role === "OWNER" ? LayoutDashboard :
    role === "ADMIN" ? Shield :
    User;

  const NAV_ITEMS = [
    { href: "/",           icon: Home,      label: "Home"       },
    { href: "/properties", icon: Building2, label: "Properties" },
    { href: "/jobs",       icon: Briefcase, label: "Jobs"       },
    { href: accountHref,   icon: AccountIcon, label: accountLabel },
  ];

  return (
    <nav className="gz-dock fixed bottom-0 left-0 right-0 md:hidden z-40" aria-label="Main">
      <div className="flex justify-around pt-2 pb-[max(8px,env(safe-area-inset-bottom))]">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined}
              className="flex flex-col items-center gap-1 min-w-[64px]">
              <span className="gz-dock-ico"><Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} /></span>
              <span className="text-xs font-bold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
