"use client";
import { useEffect, useState, useCallback } from "react";
import { Trash2, Loader2, MessageSquare, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

const STATUSES = ["NEW","IN_PROGRESS","RESOLVED","CLOSED"];

export default function AdminComplaintsPage() {
  const [items,   setItems]   = useState<any[]>([]);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);
  const [status,  setStatus]  = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    fetch(`/api/admin/complaints?${params}`)
      .then(r => r.json())
      .then(d => { setItems(d.items ?? []); setTotal(d.total ?? 0); setPages(d.pages ?? 1); })
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(id: string, newStatus: string) {
    const r = await fetch("/api/admin/complaints", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    if (r.ok) {
      setItems(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
      toast.success("Status updated");
    } else toast.error("Failed");
  }

  async function remove(id: string) {
    if (!confirm("Delete this complaint?")) return;
    const r = await fetch("/api/admin/complaints", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (r.ok) { setItems(prev => prev.filter(c => c.id !== id)); setTotal(t => t - 1); toast.success("Deleted"); }
    else toast.error("Failed");
  }

  const statusColor = (s: string) => ({
    NEW:         "bg-red-500/20 text-red-400",
    IN_PROGRESS: "bg-yellow-500/20 text-yellow-400",
    RESOLVED:    "bg-green-500/20 text-green-400",
    CLOSED:      "bg-slate-600 text-slate-400",
  }[s] ?? "bg-slate-600 text-slate-400");

  const newCount  = items.filter(c => c.status === "NEW").length;
  const openCount = items.filter(c => c.status === "IN_PROGRESS").length;

  return (
    <div className="p-6 text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Complaints & Support</h1>
        <p className="text-slate-400 text-sm mt-0.5">{total} total · {newCount} new · {openCount} in progress</p>
      </div>

      {/* Filter */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-4 flex gap-3">
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-xl text-sm text-white outline-none focus:border-indigo-500">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
      ) : (
        <div className="space-y-3">
          {items.map(c => (
            <div key={c.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
              {/* Header row */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-700/30 transition-colors"
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
              >
                <div className="w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium line-clamp-1">{c.subject}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{c.name} · {c.email} · {new Date(c.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(c.status)}`}>
                    {c.status.replace("_"," ")}
                  </span>
                  <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{c.type}</span>
                </div>
              </div>

              {/* Expanded details */}
              {expanded === c.id && (
                <div className="px-5 pb-5 border-t border-slate-700/50 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Contact</p>
                      <p className="text-sm text-white">{c.name}</p>
                      <p className="text-sm text-slate-400">{c.email}</p>
                      {c.phone && <p className="text-sm text-slate-400">{c.phone}</p>}
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Type</p>
                      <p className="text-sm text-white capitalize">{c.type}</p>
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
                    <p className="text-xs text-slate-400 mb-1">Message</p>
                    <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{c.message}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-slate-400">Change status:</span>
                    {STATUSES.map(s => (
                      <button key={s} onClick={() => changeStatus(c.id, s)}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                          c.status === s
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-slate-700 border-slate-600 text-slate-300 hover:border-indigo-500 hover:text-indigo-300"
                        }`}>
                        {s.replace("_"," ")}
                      </button>
                    ))}
                    <button onClick={() => remove(c.id)}
                      className="ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {items.length === 0 && (
            <div className="text-center py-16 bg-slate-800 border border-slate-700 rounded-2xl">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-white font-medium">No complaints found</p>
              <p className="text-slate-400 text-sm mt-1">All clear!</p>
            </div>
          )}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-slate-400">Page {page} of {pages}</p>
          <div className="flex gap-1.5">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 text-xs rounded-lg bg-slate-700 text-slate-300 disabled:opacity-40 hover:bg-slate-600 transition-colors">Previous</button>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 text-xs rounded-lg bg-slate-700 text-slate-300 disabled:opacity-40 hover:bg-slate-600 transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
