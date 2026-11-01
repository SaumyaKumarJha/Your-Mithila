"use client";
import { useEffect, useState, useCallback } from "react";
import { Trash2, Loader2, Search, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const ROLES = ["SEEKER","OWNER","ADMIN"];

export default function AdminUsersPage() {
  const [items,   setItems]   = useState<any[]>([]);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [q,       setQ]       = useState("");
  const [role,    setRole]    = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (q)    params.set("q", q);
    if (role) params.set("role", role);
    fetch(`/api/admin/users?${params}`)
      .then(r => r.json())
      .then(d => { setItems(d.items ?? []); setTotal(d.total ?? 0); setPages(d.pages ?? 1); })
      .finally(() => setLoading(false));
  }, [page, q, role]);

  useEffect(() => { load(); }, [load]);

  async function changeRole(id: string, newRole: string) {
    const r = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, role: newRole }) });
    if (r.ok) { setItems(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u)); toast.success("Role updated"); }
    else toast.error("Failed");
  }

  async function toggleActive(id: string, current: boolean) {
    const r = await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, isActive: !current }) });
    if (r.ok) { setItems(prev => prev.map(u => u.id === id ? { ...u, isActive: !current } : u)); toast.success(current ? "User deactivated" : "User activated"); }
    else toast.error("Failed");
  }

  async function remove(id: string) {
    if (!confirm("Delete this user and ALL their data? This cannot be undone.")) return;
    const r = await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (r.ok) { setItems(prev => prev.filter(u => u.id !== id)); setTotal(t => t - 1); toast.success("User deleted"); }
    else toast.error("Failed");
  }

  const ROW = "px-4 py-3 text-sm text-slate-300";
  const TH  = "px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide";

  return (
    <div className="p-6 text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-slate-400 text-sm mt-0.5">{total} registered users</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input value={q} onChange={e => { setQ(e.target.value); setPage(1); }}
            placeholder="Search name, email, phone..."
            className="w-full pl-9 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-400 outline-none focus:border-indigo-500" />
        </div>
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white outline-none focus:border-indigo-500">
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-700">
                <tr>{["Name","Email","Phone","Role","Subscription","Listings","Joined","Status","Actions"].map(h => <th key={h} className={TH}>{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {items.map(u => (
                  <tr key={u.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className={ROW}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center text-indigo-300 text-xs font-bold flex-shrink-0">
                          {u.name[0]?.toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className={ROW}>{u.email}</td>
                    <td className={ROW}>{u.phone ?? "—"}</td>
                    <td className={ROW}>
                      <select value={u.role} onChange={e => changeRole(u.id, e.target.value)}
                        className="text-xs bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-white outline-none focus:border-indigo-500">
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className={ROW}>
                      {u.subscription ? (
                        <div>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${u.subscription.status === "ACTIVE" ? "bg-green-500/20 text-green-400" : "bg-slate-600 text-slate-400"}`}>
                            {u.subscription.plan}
                          </span>
                          {u.subscription.status === "ACTIVE" && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              until {new Date(u.subscription.endDate).toLocaleDateString("en-IN")}
                            </p>
                          )}
                        </div>
                      ) : <span className="text-slate-500 text-xs">None</span>}
                    </td>
                    <td className={ROW}>
                      <span className="text-xs">{u._count?.properties ?? 0}P · {u._count?.jobs ?? 0}J</span>
                    </td>
                    <td className={ROW}>
                      <span className="text-xs">{new Date(u.createdAt).toLocaleDateString("en-IN")}</span>
                    </td>
                    <td className={ROW}>
                      <button onClick={() => toggleActive(u.id, u.isActive)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-colors ${
                          u.isActive ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        }`}>
                        {u.isActive ? <><CheckCircle className="w-3 h-3" /> Active</> : <><XCircle className="w-3 h-3" /> Inactive</>}
                      </button>
                    </td>
                    <td className={ROW}>
                      <button onClick={() => remove(u.id)}
                        className="p-1.5 rounded-lg bg-slate-700 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={9} className="text-center py-12 text-slate-500">No users found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
            <p className="text-xs text-slate-400">Page {page} of {pages} · {total} results</p>
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
