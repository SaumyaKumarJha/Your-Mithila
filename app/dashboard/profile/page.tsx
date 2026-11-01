"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Loader2, User, Phone, MapPin, Lock, CheckCircle2,
  AlertCircle, Save, Eye, EyeOff, BadgeCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLang } from "@/lib/lang-context";

const BIHAR_DISTRICTS = [
  "Madhubani","Darbhanga","Sitamarhi","Muzaffarpur","Samastipur","Begusarai",
  "Bhagalpur","Gaya","Patna","Nalanda","Vaishali","Saran","Siwan","Gopalganj",
  "East Champaran","West Champaran","Sheohar","Supaul","Araria","Kishanganj",
  "Purnia","Katihar","Saharsa","Madhepura","Khagaria","Munger","Lakhisarai",
  "Sheikhpura","Jamui","Banka","Nawada","Aurangabad","Arwal","Jehanabad",
  "Rohtas","Kaimur","Buxar","Bhojpur",
];

const INPUT = [
  "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors",
  "bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)]",
  "border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]",
].join(" ");

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  city: string;
  district: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  subscription?: { plan: string; status: string; endDate: string } | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLang();

  const [profile, setProfile]       = useState<UserProfile | null>(null);
  const [loading, setLoading]        = useState(true);
  const [saving, setSaving]          = useState(false);
  const [activeTab, setActiveTab]    = useState<"info" | "password">("info");

  // Profile form state
  const [form, setForm] = useState({
    name: "", phone: "", whatsapp: "", city: "", district: "",
  });

  // Password form state
  const [passForm, setPassForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [showCurrent, setShowCurrent]  = useState(false);
  const [showNew, setShowNew]          = useState(false);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth/login?callbackUrl=/dashboard/profile");
  }, [status, router]);

  // Load profile
  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/user")
      .then(r => r.json())
      .then((data: UserProfile) => {
        setProfile(data);
        setForm({
          name:     data.name      ?? "",
          phone:    data.phone     ?? "",
          whatsapp: data.whatsapp  ?? "",
          city:     data.city      ?? "",
          district: data.district  ?? "",
        });
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [status]);

  function setField(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }));
  }
  function setPassField(k: keyof typeof passForm, v: string) {
    setPassForm(f => ({ ...f, [k]: v }));
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) { toast.error("Name must be at least 2 characters"); return; }
    if (form.phone && form.phone.length !== 10) { toast.error("Phone must be exactly 10 digits"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Update failed"); return; }
      setProfile(p => p ? { ...p, ...data } : p);
      toast.success(t("Profile updated!", "प्रोफाइल अपडेट हो गई!"));
    } catch {
      toast.error(t("Something went wrong", "कुछ गड़बड़ हुई"));
    } finally { setSaving(false); }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passForm.currentPassword) { toast.error("Enter your current password"); return; }
    if (passForm.newPassword.length < 6) { toast.error("New password must be at least 6 characters"); return; }
    if (passForm.newPassword !== passForm.confirmPassword) { toast.error("Passwords do not match"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passForm.currentPassword,
          newPassword:     passForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Password change failed"); return; }
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success(t("Password changed successfully!", "पासवर्ड बदल गया!"));
    } catch {
      toast.error(t("Something went wrong", "कुछ गड़बड़ हुई"));
    } finally { setSaving(false); }
  }

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  if (!profile) return null;

  const subActive =
    profile.subscription?.status === "ACTIVE" &&
    profile.subscription?.endDate &&
    new Date(profile.subscription.endDate) > new Date();

  const roleLabel = profile.role === "OWNER" ? "🏠 Owner" : profile.role === "ADMIN" ? "🛡️ Admin" : "🔍 Seeker";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
          style={{ background: "var(--primary)" }}
        >
          {profile.name[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            {profile.name}
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
              style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
              {roleLabel}
            </span>
            {profile.isVerified && (
              <span className="text-xs flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium"
                style={{ background: "var(--success-light)", color: "var(--success)" }}>
                <BadgeCheck className="w-3 h-3" /> Verified
              </span>
            )}
            {subActive && (
              <span className="text-xs flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium"
                style={{ background: "var(--warning-light)", color: "var(--warning)" }}>
                ⭐ {profile.subscription!.plan}
              </span>
            )}
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
            {profile.email} · Joined {new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1 mb-6" style={{ background: "var(--surface-alt)" }}>
        {(["info", "password"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background:  activeTab === tab ? "var(--surface)" : "transparent",
              color:       activeTab === tab ? "var(--text-primary)" : "var(--text-tertiary)",
              boxShadow:   activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {tab === "info"
              ? <><User className="w-4 h-4" /> {t("Profile Info", "प्रोफाइल")}</>
              : <><Lock className="w-4 h-4" /> {t("Change Password", "पासवर्ड बदलें")}</>}
          </button>
        ))}
      </div>

      {/* Profile Info Tab */}
      {activeTab === "info" && (
        <form onSubmit={saveProfile} className="space-y-5">
          {/* Email — read-only */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Email Address
            </label>
            <div className="flex items-center gap-2 border rounded-xl px-4 py-3 text-sm"
              style={{ borderColor: "var(--border)", background: "var(--surface-alt)", color: "var(--text-tertiary)" }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{profile.email}</span>
              <span className="ml-auto text-xs font-medium" style={{ color: "var(--text-muted)" }}>Cannot change</span>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              {t("Full Name", "पूरा नाम")} <span style={{ color: "var(--error)" }}>*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
              <input
                type="text"
                value={form.name}
                onChange={e => setField("name", e.target.value)}
                placeholder="Ramesh Kumar"
                className={`${INPUT} pl-10`}
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              {t("Phone Number", "फोन नंबर")}
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
              <input
                type="tel"
                value={form.phone}
                onChange={e => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                className={`${INPUT} pl-10`}
                maxLength={10}
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              WhatsApp {t("(optional)", "(वैकल्पिक)")}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-green-500 text-sm font-bold">W</span>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={e => setField("whatsapp", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit WhatsApp number"
                className={`${INPUT} pl-8`}
                maxLength={10}
              />
            </div>
          </div>

          {/* City + District */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                <MapPin className="inline w-3.5 h-3.5 mr-1" />{t("City", "शहर")}
              </label>
              <input
                type="text"
                value={form.city}
                onChange={e => setField("city", e.target.value)}
                placeholder="Madhubani"
                className={INPUT}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                {t("District", "जिला")}
              </label>
              <select value={form.district} onChange={e => setField("district", e.target.value)} className={INPUT}>
                {BIHAR_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-3 rounded-xl justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t("Save Changes", "बदलाव सेव करें")}
          </button>
        </form>
      )}

      {/* Change Password Tab */}
      {activeTab === "password" && (
        <form onSubmit={changePassword} className="space-y-5">
          <div className="rounded-xl p-4"
            style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {t(
                "For accounts created with Google, you may not have a password set. Use password login if you registered with email/OTP.",
                "Google से बने खातों में पासवर्ड नहीं होता। OTP/ईमेल से बने खातों के लिए पासवर्ड बदलें।"
              )}
            </p>
          </div>

          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              {t("Current Password", "वर्तमान पासवर्ड")} <span style={{ color: "var(--error)" }}>*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={passForm.currentPassword}
                onChange={e => setPassField("currentPassword", e.target.value)}
                placeholder="••••••••"
                className={`${INPUT} pr-10`}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(s => !s)}
                className="absolute right-3 top-3.5"
                style={{ color: "var(--text-tertiary)" }}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              {t("New Password", "नया पासवर्ड")} <span style={{ color: "var(--error)" }}>*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={passForm.newPassword}
                onChange={e => setPassField("newPassword", e.target.value)}
                placeholder={t("Min 6 characters", "न्यूनतम 6 अक्षर")}
                className={`${INPUT} pr-10`}
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(s => !s)}
                className="absolute right-3 top-3.5"
                style={{ color: "var(--text-tertiary)" }}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {passForm.newPassword.length > 0 && passForm.newPassword.length < 6 && (
              <p className="text-xs mt-1" style={{ color: "var(--error)" }}>
                {t("Password too short", "पासवर्ड बहुत छोटा है")}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              {t("Confirm New Password", "पासवर्ड की पुष्टि करें")} <span style={{ color: "var(--error)" }}>*</span>
            </label>
            <input
              type="password"
              value={passForm.confirmPassword}
              onChange={e => setPassField("confirmPassword", e.target.value)}
              placeholder="••••••••"
              className={INPUT}
              required
            />
            {passForm.confirmPassword && passForm.newPassword !== passForm.confirmPassword && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--error)" }}>
                <AlertCircle className="w-3 h-3" /> {t("Passwords do not match", "पासवर्ड मेल नहीं खाते")}
              </p>
            )}
            {passForm.confirmPassword && passForm.newPassword === passForm.confirmPassword && passForm.newPassword.length >= 6 && (
              <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "var(--success)" }}>
                <CheckCircle2 className="w-3 h-3" /> {t("Passwords match", "पासवर्ड मेल खाते हैं")}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-3 rounded-xl justify-center gap-2 disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            {t("Change Password", "पासवर्ड बदलें")}
          </button>
        </form>
      )}
    </div>
  );
}
