"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { Loader2, Trash2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const schema = z.object({
  title:           z.string().min(3, "Enter job title"),
  description:     z.string().min(10, "Enter job description"),
  organization:    z.string().min(2, "Enter organization name"),
  orgType:         z.enum(["HOTEL","HOSPITAL","SCHOOL","SHOP","FACTORY","OFFICE","HOME","OTHER"]),
  jobType:         z.enum(["FULL_TIME","PART_TIME","CONTRACT","DAILY_WAGE"]),
  salaryMin:       z.coerce.number().optional(),
  salaryMax:       z.coerce.number().optional(),
  salaryUnit:      z.enum(["DAILY","MONTHLY","YEARLY"]),
  address:         z.string().min(5, "Enter address"),
  locality:        z.string().min(2, "Enter locality"),
  city:            z.string(),
  contactName:     z.string().min(2, "Enter contact name"),
  contactPhone:    z.string().min(10, "Enter valid phone"),
  contactWhatsapp: z.string().optional(),
  requirements:    z.string().optional(),
  benefits:        z.string().optional(),
  latitude:        z.number().optional(),
  longitude:       z.number().optional(),
});

type FormData = z.infer<typeof schema>;

const INPUT = "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors bg-[var(--surface)] text-[var(--text-primary)] border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]";
const LABEL = "block text-sm font-medium mb-1.5 text-[var(--text-secondary)]";

export default function EditJobPage() {
  const router  = useRouter();
  const params  = useParams<{ id: string }>();
  const id      = params.id;

  const [coords,    setCoords]    = useState<{ lat: number; lng: number } | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [loadError, setLoadError] = useState("");
  const [loaded,    setLoaded]    = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { city: "Madhubani", salaryUnit: "MONTHLY" },
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/dashboard/jobs/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setLoadError(data.error); return; }
        reset({
          title:           data.title,
          description:     data.description,
          organization:    data.organization,
          orgType:         data.orgType,
          jobType:         data.jobType,
          salaryMin:       data.salaryMin ?? undefined,
          salaryMax:       data.salaryMax ?? undefined,
          salaryUnit:      data.salaryUnit ?? "MONTHLY",
          address:         data.address,
          locality:        data.locality,
          city:            data.city,
          contactName:     data.contactName,
          contactPhone:    data.contactPhone,
          contactWhatsapp: data.contactWhatsapp ?? "",
          requirements:    data.requirements ?? "",
          benefits:        data.benefits ?? "",
          latitude:        data.latitude ?? undefined,
          longitude:       data.longitude ?? undefined,
        });
        if (data.latitude && data.longitude) setCoords({ lat: data.latitude, lng: data.longitude });
        setLoaded(true);
      })
      .catch(() => setLoadError("Failed to load job posting"));
  }, [id, reset]);

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      const res = await fetch(`/api/dashboard/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Update failed");
        return;
      }
      toast.success("Job updated successfully!");
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong");
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm("Delete this job posting permanently?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/dashboard/jobs/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Delete failed"); return; }
      toast.success("Job deleted");
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong");
    } finally { setDeleting(false); }
  }

  if (loadError) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-4xl mb-3">💼</p>
      <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{loadError}</p>
      <Link href="/dashboard" className="mt-4 inline-block text-sm font-medium hover:underline" style={{ color: "var(--primary)" }}>
        ← Back to Dashboard
      </Link>
    </div>
  );

  if (!loaded) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-[var(--surface-alt)] transition-colors" style={{ color: "var(--text-tertiary)" }}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Edit Job Posting</h1>
        </div>
        <button onClick={handleDelete} disabled={deleting}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
          style={{ color: "var(--error)", background: "var(--error-light)" }}>
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className={LABEL}>Job Title *</label>
          <input {...register("title")} className={INPUT} placeholder="e.g. Receptionist, Cook, Teacher" />
          {errors.title && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Organization Name *</label>
            <input {...register("organization")} className={INPUT} placeholder="Hotel Madhubani" />
            {errors.organization && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.organization.message}</p>}
          </div>
          <div>
            <label className={LABEL}>Organization Type *</label>
            <select {...register("orgType")} className={INPUT}>
              {[["HOTEL","Hotel"],["HOSPITAL","Hospital"],["SCHOOL","School"],["SHOP","Shop"],["FACTORY","Factory"],["OFFICE","Office"],["HOME","Home"],["OTHER","Other"]].map(([v,l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className={LABEL}>Job Type *</label>
          <div className="flex flex-wrap gap-4">
            {[["FULL_TIME","Full Time"],["PART_TIME","Part Time"],["CONTRACT","Contract"],["DAILY_WAGE","Daily Wage"]].map(([v,l]) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" {...register("jobType")} value={v} className="accent-[var(--primary)]" />
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{l}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className={LABEL}>Job Description *</label>
          <textarea {...register("description")} rows={4} className={INPUT} placeholder="Describe the role and responsibilities..." />
          {errors.description && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.description.message}</p>}
        </div>

        <div>
          <label className={LABEL}>Requirements (optional)</label>
          <textarea {...register("requirements")} rows={3} className={INPUT} placeholder="Education, experience, skills..." />
        </div>

        <div>
          <label className={LABEL}>Benefits (optional)</label>
          <textarea {...register("benefits")} rows={2} className={INPUT} placeholder="Food, accommodation, PF, etc." />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={LABEL}>Min Salary (₹)</label>
            <input {...register("salaryMin")} type="number" className={INPUT} placeholder="5000" />
          </div>
          <div>
            <label className={LABEL}>Max Salary (₹)</label>
            <input {...register("salaryMax")} type="number" className={INPUT} placeholder="10000" />
          </div>
          <div>
            <label className={LABEL}>Per</label>
            <select {...register("salaryUnit")} className={INPUT}>
              <option value="DAILY">Day</option>
              <option value="MONTHLY">Month</option>
              <option value="YEARLY">Year</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Address *</label>
            <input {...register("address")} className={INPUT} placeholder="Street, Area" />
            {errors.address && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.address.message}</p>}
          </div>
          <div>
            <label className={LABEL}>Locality *</label>
            <input {...register("locality")} className={INPUT} placeholder="Rajnagar" />
            {errors.locality && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.locality.message}</p>}
          </div>
        </div>

        <div>
          <label className={LABEL}>City</label>
          <input {...register("city")} className={INPUT} />
        </div>

        <div>
          <label className={LABEL}>Pin Location on Map</label>
          <LocationPicker latitude={coords?.lat} longitude={coords?.lng}
            onChange={(lat, lng) => { setCoords({ lat, lng }); setValue("latitude", lat); setValue("longitude", lng); }} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Contact Name *</label>
            <input {...register("contactName")} className={INPUT} placeholder="Ramesh Kumar" />
            {errors.contactName && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.contactName.message}</p>}
          </div>
          <div>
            <label className={LABEL}>Phone *</label>
            <input {...register("contactPhone")} type="tel" className={INPUT} placeholder="9876543210" />
            {errors.contactPhone && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.contactPhone.message}</p>}
          </div>
        </div>

        <div>
          <label className={LABEL}>WhatsApp (optional)</label>
          <input {...register("contactWhatsapp")} type="tel" className={INPUT} placeholder="Same as phone or different" />
        </div>

        <button type="submit" disabled={saving}
          className="btn-primary w-full py-3 rounded-xl justify-center gap-2 disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </form>
    </div>
  );
}
