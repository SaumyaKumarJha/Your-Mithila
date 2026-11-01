"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2, ChevronRight, ChevronLeft, CheckCircle2,
  Upload, X, Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";

const PROPERTY_TYPES = [
  { value: "FLAT",         label: "🏢 Flat"         },
  { value: "ROOM",         label: "🛏️ Room"         },
  { value: "HOUSE",        label: "🏠 House"        },
  { value: "SHOP",         label: "🏪 Shop"         },
  { value: "LAND",         label: "🌿 Land"         },
  { value: "WAREHOUSE",    label: "🏭 Warehouse"    },
  { value: "OFFICE",       label: "💼 Office"       },
  { value: "VACANT_SPACE", label: "📦 Vacant Space" },
];

const LOCALITIES = [
  "Rajnagar","Lakhnaur","Benipatti","Jaynagar","Madhubani Sadar",
  "Phulparas","Bisfi","Pandaul","Harlakhi","Khajauli","Darbhanga",
  "Sitamarhi","Andharatharhi","Ghoghardiha","Jhanjharpur","Khutauna","Other",
];

const AMENITIES = [
  "Water Supply","Electricity","Parking","Furnished","WiFi",
  "Generator","Security Guard","Lift","Garden",
];

const STEPS = ["Basic Info", "Photos", "Price & Details", "Location", "Contact"];

const INPUT = [
  "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors",
  "bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)]",
  "border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]",
].join(" ");
const LABEL = "block text-sm font-medium mb-1.5 text-[var(--text-secondary)]";

export function NewListingClientForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep]           = useState(0);
  const [submitting, setSubmit]   = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState(false);
  const [samePhone, setSame]      = useState(true);
  const [images, setImages]       = useState<string[]>([]); // uploaded Cloudinary URLs
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: "", type: "FLAT", purpose: "RENT", description: "",
    price: "", priceUnit: "MONTHLY", area: "", bedrooms: "", bathrooms: "", floor: "",
    amenities: [] as string[],
    address: "", locality: "", city: "Madhubani", district: "Madhubani", state: "Bihar", pincode: "",
    contactName: "", contactPhone: "", contactWhatsapp: "",
  });

  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setError(""); };
  const toggleAmenity = (a: string) => setForm(f => ({
    ...f,
    amenities: f.amenities.includes(a)
      ? f.amenities.filter(x => x !== a)
      : [...f.amenities, a],
  }));

  // ── Photo upload ──────────────────────────────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = 10 - images.length;
    const toUpload  = files.slice(0, remaining);

    setUploading(true);
    const uploaded: string[] = [];

    for (const file of toUpload) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5 MB)`);
        continue;
      }
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (res.ok && data.url) {
          uploaded.push(data.url);
        } else {
          toast.error(data.error ?? "Upload failed");
        }
      } catch {
        toast.error("Upload failed — check your internet connection");
      }
    }

    setImages(prev => [...prev, ...uploaded]);
    setUploading(false);
    // reset file input so same file can be re-selected if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeImage(url: string) {
    setImages(prev => prev.filter(u => u !== url));
  }

  // ── Validation ────────────────────────────────────────────────────────────
  function validate(): string | null {
    if (step === 0) {
      if (!form.title.trim() || form.title.length < 5) return "Title must be at least 5 characters";
      if (!form.description.trim() || form.description.length < 10) return "Description must be at least 10 characters";
    }
    if (step === 2) {
      if (!form.price || Number(form.price) <= 0) return "Enter a valid price";
    }
    if (step === 3) {
      if (!form.address.trim()) return "Enter the full address";
      if (!form.locality) return "Select a locality";
    }
    if (step === 4) {
      if (!form.contactName.trim()) return "Enter contact name";
      if (form.contactPhone.replace(/\D/g, "").length !== 10)
        return "Enter a valid 10-digit phone number";
    }
    return null;
  }

  function next() {
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  }

  async function submit() {
    const err = validate();
    if (err) { setError(err); return; }
    setSubmit(true); setError("");
    try {
      const res = await fetch("/api/properties", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title:           form.title.trim(),
          type:            form.type,
          purpose:         form.purpose,
          description:     form.description.trim(),
          price:           Number(form.price),
          priceUnit:       form.priceUnit,
          area:            form.area       ? Number(form.area)      : undefined,
          bedrooms:        form.bedrooms   ? Number(form.bedrooms)  : undefined,
          bathrooms:       form.bathrooms  ? Number(form.bathrooms) : undefined,
          floor:           form.floor      ? Number(form.floor)     : undefined,
          amenities:       form.amenities,
          images,
          address:         form.address.trim(),
          locality:        form.locality,
          city:            form.city,
          district:        form.district,
          state:           form.state,
          pincode:         form.pincode || undefined,
          contactName:     form.contactName.trim(),
          contactPhone:    form.contactPhone.replace(/\D/g, ""),
          contactWhatsapp: (samePhone ? form.contactPhone : form.contactWhatsapp).replace(/\D/g, ""),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to create listing"); return; }
      setSuccess(true);
      toast.success("Listing submitted for review!");
      setTimeout(() => router.push("/dashboard"), 1800);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmit(false);
    }
  }

  if (success) return (
    <div className="rounded-2xl p-12 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <CheckCircle2 className="w-14 h-14 mx-auto mb-4" style={{ color: "var(--success)" }} />
      <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>Listing Submitted!</h2>
      <p className="text-sm mb-1" style={{ color: "var(--text-tertiary)" }}>
        Your listing is under review and will appear on the site shortly.
      </p>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>Redirecting to dashboard...</p>
    </div>
  );

  return (
    <div className="rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 flex-shrink-0">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: i < step ? "var(--success)" : i === step ? "var(--primary)" : "var(--surface-alt)",
                color:      i <= step ? "white" : "var(--text-tertiary)",
                border:     i > step ? "1px solid var(--border)" : "none",
              }}
            >
              {i < step ? "✓" : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-5 h-px" style={{ background: i < step ? "var(--success)" : "var(--border)" }} />
            )}
          </div>
        ))}
        <span className="text-xs ml-2 font-medium flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>
          {STEPS[step]}
        </span>
      </div>

      {error && (
        <div className="text-sm px-4 py-3 rounded-xl mb-4"
          style={{ background: "var(--error-light)", border: "1px solid var(--error)", color: "var(--error)" }}>
          {error}
        </div>
      )}

      {/* ── Step 0 — Basic Info ── */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className={LABEL}>Listing Title *</label>
            <input value={form.title} onChange={e => set("title", e.target.value)}
              placeholder="e.g. 2BHK Flat for Rent in Rajnagar" className={INPUT} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Property Type *</label>
              <select value={form.type} onChange={e => set("type", e.target.value)} className={INPUT}>
                {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Purpose *</label>
              <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                {["RENT", "SALE"].map(p => (
                  <button key={p} type="button" onClick={() => set("purpose", p)}
                    className="flex-1 py-3 text-sm font-medium transition-all"
                    style={{
                      background: form.purpose === p ? "var(--primary)" : "var(--surface)",
                      color:      form.purpose === p ? "white" : "var(--text-secondary)",
                    }}>
                    {p === "RENT" ? "For Rent" : "For Sale"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className={LABEL}>Description *</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)}
              rows={4} placeholder="Describe the property — floor, condition, nearby landmarks..."
              className={INPUT} />
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              {form.description.length} characters (min 10)
            </p>
          </div>
        </div>
      )}

      {/* ── Step 1 — Photos ── */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Upload photos of the property. Max 10 photos, 5MB each. JPG/PNG/WebP accepted.
          </p>

          {/* Upload button */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || images.length >= 10}
              className="w-full border-2 border-dashed rounded-xl py-8 flex flex-col items-center gap-2 transition-colors hover:border-[var(--primary)] disabled:opacity-50"
              style={{ borderColor: "var(--border)", background: "var(--surface-alt)" }}
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--primary)" }} />
              ) : (
                <Upload className="w-6 h-6" style={{ color: "var(--text-tertiary)" }} />
              )}
              <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                {uploading ? "Uploading..." : images.length >= 10 ? "Max 10 photos reached" : "Click to upload photos"}
              </span>
              {images.length > 0 && (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {images.length}/10 uploaded
                </span>
              )}
            </button>
          </div>

          {/* Preview grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((url, i) => (
                <div key={url} className="relative rounded-xl overflow-hidden aspect-square"
                  style={{ background: "var(--surface-alt)" }}>
                  <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ background: "rgba(0,0,0,0.6)" }}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 text-xs px-1.5 py-0.5 rounded text-white"
                      style={{ background: "var(--primary)" }}>Cover</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {images.length === 0 && (
            <div className="flex items-center gap-2 rounded-xl p-3"
              style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
              <ImageIcon className="w-4 h-4 flex-shrink-0" style={{ color: "var(--text-muted)" }} />
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                No photos yet. You can skip this step and add photos later by editing the listing.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Step 2 — Price & Details ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Price (₹) *</label>
              <input type="number" value={form.price} onChange={e => set("price", e.target.value)}
                placeholder="e.g. 5000" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Price Unit *</label>
              <select value={form.priceUnit} onChange={e => set("priceUnit", e.target.value)} className={INPUT}>
                <option value="MONTHLY">Per Month</option>
                <option value="YEARLY">Per Year</option>
                <option value="TOTAL">Total Price</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LABEL}>Area (sq ft)</label>
              <input type="number" value={form.area} onChange={e => set("area", e.target.value)}
                placeholder="600" className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Bedrooms</label>
              <select value={form.bedrooms} onChange={e => set("bedrooms", e.target.value)} className={INPUT}>
                <option value="">N/A</option>
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} BHK</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Floor</label>
              <input type="number" value={form.floor} onChange={e => set("floor", e.target.value)}
                placeholder="2" className={INPUT} />
            </div>
          </div>
          <div>
            <label className={LABEL}>Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map(a => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all"
                  style={{
                    background:  form.amenities.includes(a) ? "var(--primary)"  : "var(--surface)",
                    color:       form.amenities.includes(a) ? "white"            : "var(--text-secondary)",
                    borderColor: form.amenities.includes(a) ? "var(--primary)"  : "var(--border)",
                  }}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3 — Location ── */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className={LABEL}>Full Address *</label>
            <textarea value={form.address} onChange={e => set("address", e.target.value)}
              rows={2} placeholder="House number, street, landmark..." className={INPUT} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Locality / Area *</label>
              <select value={form.locality} onChange={e => set("locality", e.target.value)} className={INPUT}>
                <option value="">Select locality</option>
                {LOCALITIES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Pincode</label>
              <input value={form.pincode} onChange={e => set("pincode", e.target.value)}
                placeholder="847211" maxLength={6} className={INPUT} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LABEL}>City</label>
              <input value={form.city} onChange={e => set("city", e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>District</label>
              <input value={form.district} onChange={e => set("district", e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>State</label>
              <input value={form.state} onChange={e => set("state", e.target.value)} className={INPUT} />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 4 — Contact ── */}
      {step === 4 && (
        <div className="space-y-4">
          <div>
            <label className={LABEL}>Contact Name *</label>
            <input value={form.contactName} onChange={e => set("contactName", e.target.value)}
              placeholder="Your name shown to seekers" className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Phone Number *</label>
            <input type="tel" value={form.contactPhone}
              onChange={e => set("contactPhone", e.target.value.replace(/\D/g, "").slice(0,10))}
              placeholder="10-digit mobile number" maxLength={10} className={INPUT} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={samePhone} onChange={e => setSame(e.target.checked)}
              className="w-4 h-4 accent-[var(--primary)]" />
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              WhatsApp number is same as phone
            </span>
          </label>
          {!samePhone && (
            <div>
              <label className={LABEL}>WhatsApp Number</label>
              <input type="tel" value={form.contactWhatsapp}
                onChange={e => set("contactWhatsapp", e.target.value.replace(/\D/g, "").slice(0,10))}
                placeholder="WhatsApp number" maxLength={10} className={INPUT} />
            </div>
          )}

          {/* Summary */}
          <div className="rounded-xl p-4 mt-2" style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-tertiary)" }}>LISTING SUMMARY</p>
            <div className="space-y-1 text-sm">
              <p><span style={{ color: "var(--text-tertiary)" }}>Title:</span>{" "}
                <span style={{ color: "var(--text-primary)" }}>{form.title}</span></p>
              <p><span style={{ color: "var(--text-tertiary)" }}>Type:</span>{" "}
                <span style={{ color: "var(--text-primary)" }}>{form.type} — {form.purpose}</span></p>
              <p><span style={{ color: "var(--text-tertiary)" }}>Price:</span>{" "}
                <span style={{ color: "var(--primary)" }}>₹{form.price}{form.priceUnit === "MONTHLY" ? "/mo" : form.priceUnit === "YEARLY" ? "/yr" : ""}</span></p>
              <p><span style={{ color: "var(--text-tertiary)" }}>Location:</span>{" "}
                <span style={{ color: "var(--text-primary)" }}>{form.locality}, {form.city}</span></p>
              <p><span style={{ color: "var(--text-tertiary)" }}>Photos:</span>{" "}
                <span style={{ color: "var(--text-primary)" }}>{images.length} uploaded</span></p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6 gap-3">
        {step > 0 ? (
          <button type="button" onClick={() => { setStep(s => s - 1); setError(""); }}
            className="flex items-center gap-1 text-sm font-medium px-4 py-2.5 rounded-xl border transition-colors"
            style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}>
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        ) : <div />}

        {step < STEPS.length - 1 ? (
          <button type="button" onClick={next}
            className="btn-primary flex items-center gap-1 text-sm px-6 py-2.5 rounded-xl">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={submitting}
            className="btn-primary flex items-center gap-2 text-sm px-6 py-2.5 rounded-xl disabled:opacity-60">
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Listing
          </button>
        )}
      </div>
    </div>
  );
}
