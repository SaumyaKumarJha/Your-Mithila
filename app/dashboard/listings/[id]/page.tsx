"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImageUpload } from "@/components/shared/ImageUpload";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { Loader2, Trash2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const schema = z.object({
  title:          z.string().min(5, "Title must be at least 5 characters"),
  description:    z.string().min(10, "Description must be at least 10 characters"),
  type:           z.enum(["FLAT","ROOM","HOUSE","SHOP","LAND","WAREHOUSE","OFFICE","VACANT_SPACE"]),
  purpose:        z.enum(["RENT","SALE"]),
  price:          z.coerce.number().positive("Enter a valid price"),
  priceUnit:      z.enum(["MONTHLY","YEARLY","TOTAL"]),
  area:           z.coerce.number().optional(),
  bedrooms:       z.coerce.number().int().optional(),
  bathrooms:      z.coerce.number().int().optional(),
  floor:          z.coerce.number().int().optional(),
  address:        z.string().min(5, "Enter full address"),
  locality:       z.string().min(2, "Enter locality"),
  city:           z.string(),
  district:       z.string(),
  state:          z.string(),
  pincode:        z.string().optional(),
  latitude:       z.number().optional(),
  longitude:      z.number().optional(),
  amenities:      z.array(z.string()),
  contactName:    z.string().min(2, "Enter contact name"),
  contactPhone:   z.string().min(10, "Enter valid phone"),
  contactWhatsapp: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const AMENITIES = ["Water","Electricity","Parking","Furnished","WiFi","Garden","Security","Lift"];

const INPUT = "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors bg-[var(--surface)] text-[var(--text-primary)] border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]";
const LABEL = "block text-sm font-medium mb-1.5 text-[var(--text-secondary)]";

export default function EditListingPage() {
  const router   = useRouter();
  const params   = useParams<{ id: string }>();
  const id       = params.id;

  const [images,     setImages]     = useState<string[]>([]);
  const [coords,     setCoords]     = useState<{ lat: number; lng: number } | null>(null);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [loadError,  setLoadError]  = useState("");
  const [loaded,     setLoaded]     = useState(false);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { city: "Madhubani", district: "Madhubani", state: "Bihar", amenities: [] },
  });

  const amenities = watch("amenities") ?? [];

  // Load existing data
  useEffect(() => {
    if (!id) return;
    fetch(`/api/dashboard/listings/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setLoadError(data.error); return; }
        reset({
          title:           data.title,
          description:     data.description,
          type:            data.type,
          purpose:         data.purpose,
          price:           data.price,
          priceUnit:       data.priceUnit,
          area:            data.area ?? undefined,
          bedrooms:        data.bedrooms ?? undefined,
          bathrooms:       data.bathrooms ?? undefined,
          floor:           data.floor ?? undefined,
          address:         data.address,
          locality:        data.locality,
          city:            data.city,
          district:        data.district,
          state:           data.state,
          pincode:         data.pincode ?? undefined,
          latitude:        data.latitude ?? undefined,
          longitude:       data.longitude ?? undefined,
          amenities:       data.amenities ?? [],
          contactName:     data.contactName,
          contactPhone:    data.contactPhone,
          contactWhatsapp: data.contactWhatsapp ?? "",
        });
        setImages(data.images ?? []);
        if (data.latitude && data.longitude) setCoords({ lat: data.latitude, lng: data.longitude });
        setLoaded(true);
      })
      .catch(() => setLoadError("Failed to load listing"));
  }, [id, reset]);

  function toggleAmenity(a: string) {
    setValue("amenities", amenities.includes(a) ? amenities.filter(x => x !== a) : [...amenities, a]);
  }

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      const res = await fetch(`/api/dashboard/listings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, images }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error ?? "Update failed");
        return;
      }
      toast.success("Listing updated successfully!");
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong");
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm("Delete this listing permanently? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/dashboard/listings/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Delete failed"); return; }
      toast.success("Listing deleted");
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong");
    } finally { setDeleting(false); }
  }

  if (loadError) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="text-4xl mb-3">🏠</p>
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
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Edit Listing</h1>
        </div>
        <button onClick={handleDelete} disabled={deleting}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
          style={{ color: "var(--error)", background: "var(--error-light)" }}>
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Title */}
        <div>
          <label className={LABEL}>Listing Title *</label>
          <input {...register("title")} className={INPUT} placeholder="e.g. 2BHK Flat for Rent in Rajnagar" />
          {errors.title && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.title.message}</p>}
        </div>

        {/* Type + Purpose */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Property Type *</label>
            <select {...register("type")} className={INPUT}>
              {[["FLAT","Flat"],["ROOM","Room"],["HOUSE","House"],["SHOP","Shop"],["LAND","Land"],["WAREHOUSE","Warehouse"],["OFFICE","Office"],["VACANT_SPACE","Vacant Space"]].map(([v,l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Purpose *</label>
            <div className="flex gap-4 pt-3">
              {["RENT","SALE"].map(p => (
                <label key={p} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" {...register("purpose")} value={p} className="accent-[var(--primary)]" />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>{p === "RENT" ? "For Rent" : "For Sale"}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={LABEL}>Description *</label>
          <textarea {...register("description")} rows={4} className={INPUT} placeholder="Describe the property..." />
          {errors.description && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.description.message}</p>}
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LABEL}>Price (₹) *</label>
            <input {...register("price")} type="number" className={INPUT} placeholder="5000" />
            {errors.price && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.price.message}</p>}
          </div>
          <div>
            <label className={LABEL}>Price Unit *</label>
            <select {...register("priceUnit")} className={INPUT}>
              <option value="MONTHLY">Per Month</option>
              <option value="YEARLY">Per Year</option>
              <option value="TOTAL">Total Price</option>
            </select>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-3">
          {[["area","Area (sq ft)","600"],["bedrooms","Bedrooms","2"],["bathrooms","Bathrooms","1"],["floor","Floor No.","2"]].map(([k,l,ph]) => (
            <div key={k}>
              <label className={LABEL}>{l}</label>
              <input {...register(k as any)} type="number" className={INPUT} placeholder={ph} />
            </div>
          ))}
        </div>

        {/* Amenities */}
        <div>
          <label className={LABEL}>Amenities</label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map(a => (
              <button key={a} type="button" onClick={() => toggleAmenity(a)}
                className="text-xs px-3 py-1.5 rounded-full border font-medium transition-colors"
                style={{
                  background: amenities.includes(a) ? "var(--primary)" : "var(--surface)",
                  color:      amenities.includes(a) ? "white"          : "var(--text-secondary)",
                  borderColor: amenities.includes(a) ? "var(--primary)" : "var(--border)",
                }}>
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className={LABEL}>Full Address *</label>
          <input {...register("address")} className={INPUT} placeholder="House No., Street, Area" />
          {errors.address && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.address.message}</p>}
        </div>
        <div>
          <label className={LABEL}>Locality *</label>
          <input {...register("locality")} className={INPUT} placeholder="e.g. Rajnagar" />
          {errors.locality && <p className="text-xs mt-1" style={{ color: "var(--error)" }}>{errors.locality.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[["city","City"],["district","District"],["state","State"],["pincode","Pincode"]].map(([k,l]) => (
            <div key={k}>
              <label className={LABEL}>{l}</label>
              <input {...register(k as any)} className={INPUT} />
            </div>
          ))}
        </div>
        <div>
          <label className={LABEL}>Pin Location on Map</label>
          <LocationPicker latitude={coords?.lat} longitude={coords?.lng}
            onChange={(lat, lng) => { setCoords({ lat, lng }); setValue("latitude", lat); setValue("longitude", lng); }} />
        </div>

        {/* Contact */}
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
          <input {...register("contactWhatsapp")} type="tel" className={INPUT} placeholder="10-digit number" />
        </div>

        {/* Photos */}
        <div>
          <label className={LABEL}>Property Photos (max 10)</label>
          <ImageUpload value={images} onChange={setImages} maxImages={10} />
        </div>

        {/* Submit */}
        <button type="submit" disabled={saving}
          className="btn-primary w-full py-3 rounded-xl justify-center gap-2 disabled:opacity-60">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </form>
    </div>
  );
}
