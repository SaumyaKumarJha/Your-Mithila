"use client";
import { useEffect, useState, useCallback } from "react";
import { BadgeCheck, Star, Trash2, Loader2, Search, ExternalLink } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminJobsPage() {
  const [items,   setItems]   = useState<any[]>([]);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [q,       setQ]       = useState("");
  const [verified,setVerified]= useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (q)        params.set("q", q);
    if (verified) params.set("verified", verified);
    fetch(`/api/admin/jobs?${params}`)
      .then(r => r.json())
      .then(d => { setItems(d.items ?? []); setTotal(d.total ?? 0); setPages(d.pages ?? 1); })
      .finally(() => setLoading(false));
  }, [page, q, verified]);

  useEffect(() => { load(); }, [load]);

  async function update(id: string, data: any) {
    const r = await fetch("/api/admin/jobs", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...data }) });
    if (r.ok) { setItems(prev => prev.map(j => j.id === id ? { ...j, ...data } : j)); toast.success("Updated"); }
    else toast.error("Failed");
  }

  async function remove(id: string) {
    if (!confirm("Permanently delete this job posting?")) return;
    const r = await fetch("/api/admin/jobs", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (r.ok) { setItems(prev => prev.filter(j => j.id !== id)); setTotal(t => t - 1); toast.success("Deleted"); }
    else toast.error("Failed");
  }

  const ROW = "px-4 py-3 text-sm text-slate-300";
  const TH  = "px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide";

  return (
    <div className="p-6 text-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Jobs</h1>
          <p className="text-slate-400 text-sm mt-0.5">{total} total job postings</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input value={q} onChange={e => { setQ(e.target.value); setPage(1); }}
            placeholder="Search title, organization..."
            className="w-full pl-9 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white placeholder-slate-400 outline-none focus:border-indigo-500" />
        </div>
        <select value={verified} onChange={e => { setVerified(e.target.value); setPage(1); load(); }}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white outline-none focus:border-indigo-500">
          <option value="">All Status</option>
          <option value="true">Verified</option>
          <option value="false">Pending</option>
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
                <tr>{["Title","Organization","Posted By","Type","Locality","Status","Actions"].map(h => <th key={h} className={TH}>{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {items.map(j => (
                  <tr key={j.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className={ROW}>
                      <p className="font-medium text-white line-clamp-1 max-w-[200px]">{j.title}</p>
                      <p className="text-xs text-slate-500">{new Date(j.createdAt).toLocaleDateString("en-IN")}</p>
                    </td>
                    <td className={ROW}>{j.organization}</td>
                    <td className={ROW}>{j.postedBy?.name}</td>
                    <td className={ROW}>
                      <span className="bg-slate-700 text-slate-200 text-xs px-2 py-0.5 rounded-lg">{j.jobType?.replace("_"," ")}</span>
                    </td>
                    <td className={ROW}>{j.locality}</td>
                    <td className={ROW}>
                      <div className="flex flex-col gap-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${j.isVerified ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                          {j.isVerified ? "Verified" : "Pending"}
                        </span>
                        {j.isFeatured && <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 w-fit">Featured</span>}
                        {!j.isActive && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 w-fit">Closed</span>}
                      </div>
                    </td>
                    <td className={ROW}>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => update(j.id, { isVerified: !j.isVerified })} title={j.isVerified ? "Unverify" : "Verify"}
                          className={`p-1.5 rounded-lg transition-colors ${j.isVerified ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-400 hover:bg-green-500/20 hover:text-green-400"}`}>
                          <BadgeCheck className="w-4 h-4" />
                        </button>
                        <button onClick={() => update(j.id, { isFeatured: !j.isFeatured })} title={j.isFeatured ? "Unfeature" : "Feature"}
                          className={`p-1.5 rounded-lg transition-colors ${j.isFeatured ? "bg-orange-500/20 text-orange-400" : "bg-slate-700 text-slate-400 hover:bg-orange-500/20 hover:text-orange-400"}`}>
                          <Star className="w-4 h-4" />
                        </button>
                        <Link href={`/jobs/${j.id}`} target="_blank"
                          className="p-1.5 rounded-lg bg-slate-700 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/20 transition-colors">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button onClick={() => remove(j.id)}
                          className="p-1.5 rounded-lg bg-slate-700 text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-slate-500">No jobs found</td></tr>
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
