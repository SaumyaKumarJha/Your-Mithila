"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

const ORG_TYPES = ["HOTEL","HOSPITAL","SCHOOL","SHOP","FACTORY","OFFICE","HOME","OTHER"];
const JOB_TYPES = [
  { value: "FULL_TIME",  label: "Full Time"  },
  { value: "PART_TIME",  label: "Part Time"  },
  { value: "CONTRACT",   label: "Contract"   },
  { value: "DAILY_WAGE", label: "Daily Wage" },
];
const LOCALITIES = [
  "Rajnagar","Lakhnaur","Benipatti","Jaynagar","Madhubani Sadar",
  "Phulparas","Bisfi","Pandaul","Harlakhi","Khajauli","Darbhanga","Sitamarhi","Other",
];

const INPUT = [
  "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors",
  "bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)]",
  "border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]",
].join(" ");
const LABEL = "block text-sm font-medium mb-1.5 text-[var(--text-secondary)]";

export function NewJobClientForm() {
  const router = useRouter();
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);
  const [samePhone, setSame]    = useState(true);
  const [form, setForm] = useState({
    title: "", organization: "", orgType: "SHOP", jobType: "FULL_TIME",
    description: "", requirements: "", salaryMin: "", salaryMax: "", salaryUnit: "MONTHLY",
    address: "", locality: "", city: "Madhubani",
    contactName: "", contactPhone: "", contactWhatsapp: "",
  });

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setError(""); };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim())        { setError("Job title is required"); return; }
    if (!form.organization.trim()) { setError("Organization name is required"); return; }
    if (!form.description.trim())  { setError("Job description is required"); return; }
    if (!form.locality)            { setError("Please select a locality"); return; }
    if (form.contactPhone.replace(/\D/g, "").length !== 10) {
      setError("Enter a valid 10-digit phone number"); return;
    }

    setLoading(true); setError("");
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:           form.title.trim(),
          organization:    form.organization.trim(),
          orgType:         form.orgType,
          jobType:         form.jobType,
          description:     form.description.trim(),
          requirements:    form.requirements.trim() || undefined,
          salaryMin:       form.salaryMin ? Number(form.salaryMin) : undefined,
          salaryMax:       form.salaryMax ? Number(form.salaryMax) : undefined,
          salaryUnit:      form.salaryUnit,
          address:         form.address.trim() || "Mithila Region",
          locality:        form.locality,
          city:            form.city,
          contactName:     form.contactName.trim(),
          contactPhone:    form.contactPhone.replace(/\D/g, ""),
          contactWhatsapp: (samePhone ? form.contactPhone : form.contactWhatsapp).replace(/\D/g, ""),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to post job"); return; }
      setSuccess(true);
      toast.success("Job posted successfully!");
      setTimeout(() => router.push("/dashboard"), 1800);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) return (
    <div className="rounded-2xl p-12 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <CheckCircle2 className="w-14 h-14 mx-auto mb-4" style={{ color: "var(--success)" }} />
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Job Posted!</h2>
      <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>Redirecting to dashboard...</p>
    </div>
  );

  return (
    <form onSubmit={submit} className="rounded-2xl p-6 space-y-5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>

      {error && (
        <div className="text-sm px-4 py-3 rounded-xl"
          style={{ background: "var(--error-light)", border: "1px solid var(--error)", color: "var(--error)" }}>
          {error}
        </div>
      )}

      <div>
        <label className={LABEL}>Job Title *</label>
        <input value={form.title} onChange={e => set("title", e.target.value)}
          placeholder="e.g. Shop Assistant, Cook, Security Guard" className={INPUT} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Organization Name *</label>
          <input value={form.organization} onChange={e => set("organization", e.target.value)}
            placeholder="e.g. Hotel Madhubani" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Organization Type *</label>
          <select value={form.orgType} onChange={e => set("orgType", e.target.value)} className={INPUT}>
            {ORG_TYPES.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={LABEL}>Job Type *</label>
        <div className="grid grid-cols-2 gap-2">
          {JOB_TYPES.map(j => (
            <button key={j.value} type="button" onClick={() => set("jobType", j.value)}
              className="py-2.5 text-sm font-medium rounded-xl border transition-all"
              style={{
                borderColor: form.jobType === j.value ? "var(--primary)" : "var(--border)",
                background:  form.jobType === j.value ? "var(--primary-light)" : "var(--surface)",
                color:       form.jobType === j.value ? "var(--primary)"       : "var(--text-secondary)",
              }}>
              {j.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={LABEL}>Job Description *</label>
        <textarea value={form.description} onChange={e => set("description", e.target.value)}
          rows={3} placeholder="Describe the job role and responsibilities..." className={INPUT} />
      </div>

      <div>
        <label className={LABEL}>Requirements (optional)</label>
        <textarea value={form.requirements} onChange={e => set("requirements", e.target.value)}
          rows={2} placeholder="Education, experience, skills needed..." className={INPUT} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={LABEL}>Min Salary (₹)</label>
          <input type="number" value={form.salaryMin} onChange={e => set("salaryMin", e.target.value)}
            placeholder="3000" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Max Salary (₹)</label>
          <input type="number" value={form.salaryMax} onChange={e => set("salaryMax", e.target.value)}
            placeholder="8000" className={INPUT} />
        </div>
        <div>
          <label className={LABEL}>Per</label>
          <select value={form.salaryUnit} onChange={e => set("salaryUnit", e.target.value)} className={INPUT}>
            <option value="DAILY">Day</option>
            <option value="MONTHLY">Month</option>
            <option value="YEARLY">Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={LABEL}>Locality *</label>
          <select value={form.locality} onChange={e => set("locality", e.target.value)} className={INPUT}>
            <option value="">Select locality</option>
            {LOCALITIES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL}>City</label>
          <input value={form.city} onChange={e => set("city", e.target.value)} className={INPUT} />
        </div>
      </div>

      <div>
        <label className={LABEL}>Contact Name</label>
        <input value={form.contactName} onChange={e => set("contactName", e.target.value)}
          placeholder="Your name" className={INPUT} />
      </div>

      <div>
        <label className={LABEL}>Contact Phone *</label>
        <input type="tel" value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)}
          placeholder="10-digit mobile number" className={INPUT} />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={samePhone} onChange={e => setSame(e.target.checked)}
          className="w-4 h-4 accent-[var(--primary)]" />
        <span className="text-sm" style={{ color: "var(--text-secondary)" }}>WhatsApp same as phone</span>
      </label>

      {!samePhone && (
        <div>
          <label className={LABEL}>WhatsApp Number</label>
          <input type="tel" value={form.contactWhatsapp} onChange={e => set("contactWhatsapp", e.target.value)}
            placeholder="10-digit WhatsApp" className={INPUT} />
        </div>
      )}

      <button type="submit" disabled={loading}
        className="btn-primary w-full py-3 rounded-xl justify-center gap-2 disabled:opacity-60">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Post Job
      </button>
    </form>
  );
}
