import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Home, Briefcase, Users, CreditCard, MessageSquare,
  TrendingUp, ArrowRight, CheckCircle, Clock, AlertTriangle,
} from "lucide-react";

export const metadata = { title: "Admin Dashboard — YourMithila" };
export const dynamic = "force-dynamic";

const CARD = "bg-slate-800 border border-slate-700 rounded-2xl p-5";

async function getDashboardData() {
  try {
    const [
      totalProperties, activeProperties, pendingProperties,
      totalJobs, activeJobs, pendingJobs,
      totalUsers, ownerCount, seekerCount,
      activeSubs, totalRevenue,
      newComplaints,
      recentUsers, recentProperties, recentJobs,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { isAvailable: true } }),
      prisma.property.count({ where: { isVerified: false } }),
      prisma.job.count(),
      prisma.job.count({ where: { isActive: true } }),
      prisma.job.count({ where: { isVerified: false } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: "OWNER" } }),
      prisma.user.count({ where: { role: "SEEKER" } }),
      prisma.subscription.count({ where: { status: "ACTIVE" } }),
      prisma.subscription.aggregate({ _sum: { price: true } }),
      prisma.complaint.count({ where: { status: "NEW" } }),
      prisma.user.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.property.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { owner: { select: { name: true } } },
      }),
      prisma.job.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      ok: true as const,
      totalProperties, activeProperties, pendingProperties,
      totalJobs, activeJobs, pendingJobs,
      totalUsers, ownerCount, seekerCount,
      activeSubs,
      revenue: totalRevenue._sum.price ?? 0,
      newComplaints,
      recentUsers, recentProperties, recentJobs,
    };
  } catch (err) {
    console.error("Admin dashboard DB error:", err);
    return { ok: false as const, error: String(err) };
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData();

  if (!data.ok) {
    return (
      <div className="p-6 text-white">
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-300">Dashboard failed to load</p>
            <p className="text-sm text-slate-400 mt-1">
              Database connection error. Check your DATABASE_URL environment variable in Vercel.
            </p>
            <p className="text-xs text-slate-500 mt-2 font-mono">{data.error}</p>
          </div>
        </div>
      </div>
    );
  }

  const {
    totalProperties, activeProperties, pendingProperties,
    totalJobs, activeJobs, pendingJobs,
    totalUsers, ownerCount, seekerCount,
    activeSubs, revenue, newComplaints,
    recentUsers, recentProperties, recentJobs,
  } = data;

  const stats = [
    { label: "Total Properties", value: totalProperties, sub: `${activeProperties} active · ${pendingProperties} pending verify`, icon: Home,         color: "text-orange-400", href: "/admin/properties",   accent: "border-orange-500/30" },
    { label: "Total Jobs",       value: totalJobs,        sub: `${activeJobs} active · ${pendingJobs} pending verify`,             icon: Briefcase,    color: "text-blue-400",   href: "/admin/jobs",          accent: "border-blue-500/30"   },
    { label: "Users",            value: totalUsers,       sub: `${ownerCount} owners · ${seekerCount} seekers`,                    icon: Users,        color: "text-purple-400", href: "/admin/users",         accent: "border-purple-500/30" },
    { label: "Active Plans",     value: activeSubs,       sub: `₹${(revenue / 1000).toFixed(1)}K total revenue`,                   icon: CreditCard,   color: "text-green-400",  href: "/admin/subscriptions", accent: "border-green-500/30"  },
    { label: "New Complaints",   value: newComplaints,    sub: "awaiting response",                                                icon: MessageSquare,color: "text-red-400",    href: "/admin/complaints",    accent: "border-red-500/30"    },
    { label: "Revenue",          value: `₹${revenue.toLocaleString("en-IN")}`, sub: "all-time subscriptions",                     icon: TrendingUp,   color: "text-yellow-400", href: "/admin/reports",       accent: "border-yellow-500/30" },
  ];

  return (
    <div className="p-6 text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">Overview of YourMithila platform</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, sub, icon: Icon, color, href }) => (
          <Link key={label} href={href}
            className={`${CARD} hover:border-slate-600 transition-colors group`}>
            <div className="flex items-start justify-between">
              <Icon className={`w-5 h-5 ${color}`} />
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
            </div>
            <p className="text-2xl font-bold text-white mt-3">{value}</p>
            <p className="text-sm text-slate-300 font-medium mt-0.5">{label}</p>
            <p className="text-xs text-slate-500 mt-1">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className={`${CARD} mb-6`}>
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wide mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          {pendingProperties > 0 && (
            <Link href="/admin/properties?verified=false"
              className="flex items-center gap-1.5 text-xs bg-orange-500/15 text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded-lg hover:bg-orange-500/25 transition-colors">
              <Clock className="w-3.5 h-3.5" /> Verify {pendingProperties} Properties
            </Link>
          )}
          {pendingJobs > 0 && (
            <Link href="/admin/jobs?verified=false"
              className="flex items-center gap-1.5 text-xs bg-blue-500/15 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-500/25 transition-colors">
              <Clock className="w-3.5 h-3.5" /> Verify {pendingJobs} Jobs
            </Link>
          )}
          {newComplaints > 0 && (
            <Link href="/admin/complaints?status=NEW"
              className="flex items-center gap-1.5 text-xs bg-red-500/15 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/25 transition-colors">
              <MessageSquare className="w-3.5 h-3.5" /> {newComplaints} New Complaints
            </Link>
          )}
          {pendingProperties === 0 && pendingJobs === 0 && newComplaints === 0 && (
            <span className="flex items-center gap-1.5 text-xs text-green-400">
              <CheckCircle className="w-3.5 h-3.5" /> All caught up!
            </span>
          )}
        </div>
      </div>

      {/* Recent activity grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent users */}
        <div className={CARD}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recent Users</h2>
            <Link href="/admin/users" className="text-xs text-indigo-400 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentUsers.length === 0 && <p className="text-slate-500 text-sm">No users yet</p>}
            {recentUsers.map(u => (
              <div key={u.id} className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
                  {(u.name ?? "?")[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{u.name}</p>
                  <p className="text-xs text-slate-500 truncate">{u.email}</p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                  u.role === "OWNER" ? "bg-orange-500/20 text-orange-300" :
                  u.role === "ADMIN" ? "bg-red-500/20 text-red-300" :
                  "bg-blue-500/20 text-blue-300"
                }`}>{u.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent properties */}
        <div className={CARD}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recent Properties</h2>
            <Link href="/admin/properties" className="text-xs text-indigo-400 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentProperties.length === 0 && <p className="text-slate-500 text-sm">No properties yet</p>}
            {recentProperties.map(p => (
              <div key={p.id} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 flex-shrink-0 mt-0.5">
                  <Home className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.owner.name} · {p.locality}</p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${p.isVerified ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>
                  {p.isVerified ? "✓" : "⏳"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent jobs */}
        <div className={CARD}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recent Jobs</h2>
            <Link href="/admin/jobs" className="text-xs text-indigo-400 hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {recentJobs.length === 0 && <p className="text-slate-500 text-sm">No jobs yet</p>}
            {recentJobs.map(j => (
              <div key={j.id} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{j.title}</p>
                  <p className="text-xs text-slate-500">{j.organization} · {j.locality}</p>
                </div>
                <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${j.isVerified ? "bg-green-500/20 text-green-300" : "bg-yellow-500/20 text-yellow-300"}`}>
                  {j.isVerified ? "✓" : "⏳"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
