"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Home, Briefcase, Users, CreditCard,
  MessageSquare, FileText, LogOut, Shield, Menu, ChevronRight, UserCircle,
} from "lucide-react";

const NAV = [
  { href: "/admin",                    icon: LayoutDashboard, label: "Dashboard"     },
  { href: "/admin/properties",         icon: Home,            label: "Properties"    },
  { href: "/admin/jobs",               icon: Briefcase,       label: "Jobs"          },
  { href: "/admin/users",              icon: Users,           label: "Users"         },
  { href: "/admin/subscriptions",      icon: CreditCard,      label: "Subscriptions" },
  { href: "/admin/complaints",         icon: MessageSquare,   label: "Complaints"    },
  { href: "/admin/reports",            icon: FileText,        label: "Reports"       },
  { href: "/admin/profile",            icon: UserCircle,      label: "My Profile"    },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sideOpen, setSideOpen] = useState(false);

  function logout() {
    signOut({ callbackUrl: "/admin/login" });
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? "w-full" : "w-56 hidden lg:flex"} flex-col bg-slate-900 border-r border-slate-700 min-h-screen`}>
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-700">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">YourMithila</p>
          <p className="text-slate-400 text-xs mt-0.5">Admin Panel</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
          return (
            <Link key={href} href={href} onClick={() => setSideOpen(false)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-slate-700 space-y-1">
        <Link href="/" target="_blank"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
          ← View Live Site
        </Link>
        <button onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors">
          <LogOut className="w-3.5 h-3.5" /> Log Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-slate-950" style={{ fontFamily: "var(--font-body, sans-serif)" }}>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {sideOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSideOpen(false)} />
          <div className="relative z-10 w-64">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-slate-900 border-b border-slate-700">
          <button onClick={() => setSideOpen(true)} className="text-slate-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="text-white font-semibold text-sm">Admin Panel</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
