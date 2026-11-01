import { prisma } from "@/lib/prisma";
import { TrendingUp, Home, Briefcase, Users, CreditCard, Eye } from "lucide-react";

export const metadata = { title: "Reports — Admin" };

export default async function AdminReportsPage() {
  const [
    totalUsers, ownerCount, seekerCount,
    totalProps, activeProps, verifiedProps,
    totalJobs, activeJobs,
    totalSubs, activeSubs,
    revenue,
    topProperties, topJobs,
    subByPlan,
    usersByMonth,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "OWNER" } }),
    prisma.user.count({ where: { role: "SEEKER" } }),
    prisma.property.count(),
    prisma.property.count({ where: { isAvailable: true } }),
    prisma.property.count({ where: { isVerified: true } }),
    prisma.job.count(),
    prisma.job.count({ where: { isActive: true } }),
    prisma.subscription.count(),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.aggregate({ _sum: { price: true } }),
    prisma.property.findMany({ orderBy: { viewCount: "desc" }, take: 5, select: { id: true, title: true, viewCount: true, type: true, locality: true } }),
    prisma.job.findMany({ orderBy: { viewCount: "desc" }, take: 5, select: { id: true, title: true, viewCount: true, organization: true } }),
    prisma.subscription.groupBy({ by: ["plan"], _count: { id: true }, _sum: { price: true } }),
    prisma.user.groupBy({ by: ["createdAt"], _count: { id: true }, orderBy: { createdAt: "desc" } }),
  ]);

  const CARD = "bg-slate-800 border border-slate-700 rounded-2xl p-5";

  return (
    <div className="p-6 text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-slate-400 text-sm mt-0.5">Platform overview and performance metrics</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue",      value: `₹${(revenue._sum.price ?? 0).toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-green-400" },
          { label: "Total Users",         value: totalUsers,   sub: `${ownerCount} owners · ${seekerCount} seekers`, icon: Users, color: "text-purple-400" },
          { label: "Total Properties",    value: totalProps,   sub: `${activeProps} active · ${verifiedProps} verified`, icon: Home, color: "text-orange-400" },
          { label: "Active Subscriptions",value: activeSubs,   sub: `${totalSubs} all time`, icon: CreditCard, color: "text-indigo-400" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className={CARD}>
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-slate-300 mt-0.5">{label}</p>
            {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue by plan */}
        <div className={CARD}>
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-400" /> Revenue by Plan
          </h2>
          <div className="space-y-3">
            {subByPlan.map(p => {
              const planRevenue = p._sum.price ?? 0;
              const totalRev    = revenue._sum.price ?? 1;
              const pct         = Math.round((planRevenue / totalRev) * 100);
              return (
                <div key={p.plan}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-300">{p.plan.replace("_"," ")}</span>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-white">₹{planRevenue.toLocaleString("en-IN")}</span>
                      <span className="text-xs text-slate-500 ml-2">({p._count.id} subs)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {subByPlan.length === 0 && <p className="text-slate-500 text-sm">No subscriptions yet</p>}
          </div>
        </div>

        {/* Platform health */}
        <div className={CARD}>
          <h2 className="text-sm font-semibold text-white mb-4">Platform Health</h2>
          <div className="space-y-3">
            {[
              { label: "Property Verification Rate", value: totalProps > 0 ? `${Math.round((verifiedProps/totalProps)*100)}%` : "—", good: true },
              { label: "Active Properties",          value: `${activeProps} / ${totalProps}`,  good: activeProps > 0 },
              { label: "Active Jobs",                value: `${activeJobs} / ${totalJobs}`,    good: activeJobs > 0 },
              { label: "Active Subscriptions",       value: `${activeSubs} / ${totalSubs}`,    good: activeSubs > 0 },
              { label: "Owner to Seeker Ratio",      value: ownerCount > 0 ? `1 : ${Math.round(seekerCount/ownerCount)}` : "—", good: true },
            ].map(({ label, value, good }) => (
              <div key={label} className="flex items-center justify-between py-1.5 border-b border-slate-700/50 last:border-0">
                <span className="text-sm text-slate-400">{label}</span>
                <span className={`text-sm font-semibold ${good ? "text-green-400" : "text-red-400"}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Properties by views */}
        <div className={CARD}>
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-orange-400" /> Top Properties by Views
          </h2>
          <div className="space-y-2">
            {topProperties.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-slate-500 text-xs w-4">{i+1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.type} · {p.locality}</p>
                </div>
                <span className="text-sm font-semibold text-indigo-400 flex-shrink-0">{p.viewCount} views</span>
              </div>
            ))}
            {topProperties.length === 0 && <p className="text-slate-500 text-sm">No data yet</p>}
          </div>
        </div>

        {/* Top Jobs by views */}
        <div className={CARD}>
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" /> Top Jobs by Views
          </h2>
          <div className="space-y-2">
            {topJobs.map((j, i) => (
              <div key={j.id} className="flex items-center gap-3">
                <span className="text-slate-500 text-xs w-4">{i+1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{j.title}</p>
                  <p className="text-xs text-slate-500">{j.organization}</p>
                </div>
                <span className="text-sm font-semibold text-blue-400 flex-shrink-0">{j.viewCount} views</span>
              </div>
            ))}
            {topJobs.length === 0 && <p className="text-slate-500 text-sm">No data yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
