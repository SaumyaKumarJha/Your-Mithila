"use client";
import { useEffect, useState, useCallback } from "react";
import { Loader2, Search, TrendingUp, CreditCard, Users } from "lucide-react";
import toast from "react-hot-toast";

const PLANS    = ["BASIC","STANDARD","PRO","YEARLY_STANDARD"];
const STATUSES = ["ACTIVE","EXPIRED","CANCELLED"];

export default function AdminSubscriptionsPage() {
  const [items,   setItems]        = useState<any[]>([]);
  const [total,   setTotal]        = useState(0);
  const [pages,   setPages]        = useState(1);
  const [page,    setPage]         = useState(1);
  const [loading, setLoading]      = useState(true);
  const [status,  setStatus]       = useState("");
  const [revenue, setRevenue]      = useState(0);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    fetch(`/api/admin/subscriptions?${params}`)
      .then(r => r.json())
      .then(d => {
        setItems(d.items ?? []);
        setTotal(d.total ?? 0);
        setPages(d.pages ?? 1);
        setRevenue(d.totalRevenue ?? 0);
      })
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(id: string, newStatus: string) {
    const r = await fetch("/api/admin/subscriptions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (r.ok) {
      setItems(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      toast.success("Subscription updated");
    } else toast.error("Failed");
  }

  const ROW = "px-4 py-3 text-sm text-slate-300";
  const TH  = "px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide";

  const activeCount   = items.filter(s => s.status === "ACTIVE").length;
  const expiredCount  = items.filter(s => s.status === "EXPIRED").length;

  return (
    <div className="p-6 text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="text-slate-400 text-sm mt-0.5">{total} subscriptions · ₹{revenue.toLocaleString("en-IN")} total revenue</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Revenue",   value: `₹${revenue.toLocaleString("en-IN")}`, icon: TrendingUp, color: "text-green-400" },
          { label: "Active Plans",    value: activeCount,                            icon: CreditCard, color: "text-indigo-400" },
          { label: "Expired",         value: expiredCount,                           icon: Users,      color: "text-red-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <Icon className={`w-5 h-5 ${color} mb-2`} />
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-4 flex gap-3">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white outline-none focus:border-indigo-500">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-700">
                <tr>{["User","Plan","Status","Price","Start Date","End Date","Actions"].map(h => <th key={h} className={TH}>{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {items.map(s => {
                  const expired  = s.status !== "ACTIVE" || new Date(s.endDate) < new Date();
                  const daysLeft = !expired ? Math.ceil((new Date(s.endDate).getTime() - Date.now()) / 86400000) : 0;
                  return (
                    <tr key={s.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className={ROW}>
                        <p className="text-white font-medium">{s.user?.name}</p>
                        <p className="text-xs text-slate-500">{s.user?.email}</p>
                      </td>
                      <td className={ROW}>
                        <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full">
                          {s.plan?.replace("_"," ")}
                        </span>
                      </td>
                      <td className={ROW}>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          s.status === "ACTIVE"    ? "bg-green-500/20 text-green-400" :
                          s.status === "EXPIRED"   ? "bg-red-500/20 text-red-400" :
                          "bg-slate-600 text-slate-400"
                        }`}>{s.status}</span>
                        {s.status === "ACTIVE" && daysLeft <= 7 && (
                          <p className="text-xs text-orange-400 mt-0.5">{daysLeft}d left</p>
                        )}
                      </td>
                      <td className={ROW}><span className="font-semibold text-white">₹{s.price}</span></td>
                      <td className={ROW}>{new Date(s.startDate).toLocaleDateString("en-IN")}</td>
                      <td className={ROW}>
                        <span className={expired ? "text-red-400" : "text-slate-300"}>
                          {new Date(s.endDate).toLocaleDateString("en-IN")}
                        </span>
                      </td>
                      <td className={ROW}>
                        <select value={s.status} onChange={e => changeStatus(s.id, e.target.value)}
                          className="text-xs bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-white outline-none">
                          {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-500">No subscriptions found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
            <p className="text-xs text-slate-400">Page {page} of {pages}</p>
            <div className="flex gap-1.5">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs rounded-lg bg-slate-700 text-slate-300 disabled:opacity-40 hover:bg-slate-600 transition-colors">Previous</button>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs rounded-lg bg-slate-700 text-slate-300 disabled:opacity-40 hover:bg-slate-600 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
