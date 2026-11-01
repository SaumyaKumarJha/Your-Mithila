"use client";

import { useState, useEffect } from "react";
import {
  Loader2, User, Phone, MapPin, Lock, CheckCircle2,
  AlertCircle, Save, Eye, EyeOff, BadgeCheck, Shield,
} from "lucide-react";
import toast from "react-hot-toast";

export const dynamic = "force-dynamic";

const BIHAR_DISTRICTS = [
  "Madhubani","Darbhanga","Sitamarhi","Muzaffarpur","Samastipur","Begusarai",
  "Bhagalpur","Gaya","Patna","Nalanda","Vaishali","Saran","Siwan","Gopalganj",
  "East Champaran","West Champaran","Sheohar","Supaul","Araria","Kishanganj",
  "Purnia","Katihar","Saharsa","Madhepura","Khagaria","Munger","Lakhisarai",
  "Sheikhpura","Jamui","Banka","Nawada","Aurangabad","Arwal","Jehanabad",
  "Rohtas","Kaimur","Buxar","Bhojpur",
];

const INPUT =
  "w-full border border-slate-600 rounded-xl px-4 py-3 text-sm outline-none transition-colors bg-slate-800 text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

interface AdminProfile {
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
  envOnly?: boolean;
}

export default function AdminProfilePage() {
  const [profile, setProfile]    = useState<AdminProfile | null>(null);
  const [loading, setLoading]    = useState(true);
  const [saving, setSaving]      = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "password">("info");

  const [form, setForm] = useState({
    name: "", phone: "", whatsapp: "", city: "", district: "",
  });

  const [passForm, setPassForm] = useState({
    currentPassword: "", newPassword: "", confirmPassword: "",
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);

  useEffect(() => {
    fetch("/api/admin/profile")
      .then(r => r.json())
      .then((data: AdminProfile) => {
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
  }, []);

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
      const res = await fetch("/api/admin/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Update failed"); return; }
      setProfile(p => p ? { ...p, ...data } : p);
      toast.success("Profile updated!");
    } catch {
      toast.error("Something went wrong");
    } finally { setSaving(false); }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passForm.currentPassword) { toast.error("Enter your current password"); return; }
    if (passForm.newPassword.length < 6) { toast.error("New password must be at least 6 characters"); return; }
    if (passForm.newPassword !== passForm.confirmPassword) { toast.error("Passwords do not match"); return; }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          currentPassword: passForm.currentPassword,
          newPassword:     passForm.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Password change failed"); return; }
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed successfully!");
    } catch {
      toast.error("Something went wrong");
    } finally { setSaving(false); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 text-white">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
          {profile.name[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-medium bg-indigo-500/20 text-indigo-300 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Admin
            </span>
            {profile.isVerified && (
              <span className="text-xs flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-green-500/20 text-green-300">
                <BadgeCheck className="w-3 h-3" /> Verified
              </span>
            )}
          </div>
          <p className="text-xs mt-1 text-slate-400">
            {profile.email} · Admin since{" "}
            {new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>

      {profile.envOnly && (
        <div className="mb-6 rounded-xl p-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm">
          <AlertCircle className="inline w-4 h-4 mr-1.5" />
          You are logged in as an environment-variable admin. Profile editing is only available for database-backed admin accounts.
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1 mb-6 bg-slate-800">
        {(["info", "password"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab
                ? "bg-slate-700 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {tab === "info"
              ? <><User className="w-4 h-4" /> Profile Info</>
              : <><Lock className="w-4 h-4" /> Change Password</>}
          </button>
        ))}
      </div>

      {/* Profile Info Tab */}
      {activeTab === "info" && (
        <form onSubmit={saveProfile} className="space-y-5">
          {/* Email — read-only */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-300">Email Address</label>
            <div className="flex items-center gap-2 border border-slate-700 rounded-xl px-4 py-3 text-sm bg-slate-900 text-slate-500">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{profile.email}</span>
              <span className="ml-auto text-xs font-medium text-slate-600">Cannot change</span>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-300">
              Full Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={form.name}
                onChange={e => setField("name", e.target.value)}
                placeholder="Admin Name"
                className={`${INPUT} pl-10`}
                required
                disabled={!!profile.envOnly}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-300">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="tel"
                value={form.phone}
                onChange={e => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                className={`${INPUT} pl-10`}
                maxLength={10}
                disabled={!!profile.envOnly}
              />
            </div>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-300">WhatsApp (optional)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-green-500 text-sm font-bold">W</span>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={e => setField("whatsapp", e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="10-digit WhatsApp number"
                className={`${INPUT} pl-8`}
                maxLength={10}
                disabled={!!profile.envOnly}
              />
            </div>
          </div>

          {/* City + District */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-300">
                <MapPin className="inline w-3.5 h-3.5 mr-1" />City
              </label>
              <input
                type="text"
                value={form.city}
                onChange={e => setField("city", e.target.value)}
                placeholder="Madhubani"
                className={INPUT}
                disabled={!!profile.envOnly}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-300">District</label>
              <select
                value={form.district}
                onChange={e => setField("district", e.target.value)}
                className={INPUT}
                disabled={!!profile.envOnly}
              >
                <option value="">Select district</option>
                {BIHAR_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {!profile.envOnly && (
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          )}
        </form>
      )}

      {/* Change Password Tab */}
      {activeTab === "password" && (
        <form onSubmit={changePassword} className="space-y-5">
          {profile.envOnly && (
            <div className="rounded-xl p-4 bg-slate-800 border border-slate-700 text-slate-400 text-sm">
              Password management is not available for environment-variable-only admin accounts.
              Update the <code className="text-indigo-300">ADMIN_PASSWORD</code> environment variable instead.
            </div>
          )}

          {!profile.envOnly && (
            <>
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-300">
                  Current Password <span className="text-red-400">*</span>
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
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-300">
                  New Password <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={passForm.newPassword}
                    onChange={e => setPassField("newPassword", e.target.value)}
                    placeholder="Min 6 characters"
                    className={`${INPUT} pr-10`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(s => !s)}
                    className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passForm.newPassword.length > 0 && passForm.newPassword.length < 6 && (
                  <p className="text-xs mt-1 text-red-400">Password too short</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium mb-1.5 text-slate-300">
                  Confirm New Password <span className="text-red-400">*</span>
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
                  <p className="text-xs mt-1 flex items-center gap-1 text-red-400">
                    <AlertCircle className="w-3 h-3" /> Passwords do not match
                  </p>
                )}
                {passForm.confirmPassword && passForm.newPassword === passForm.confirmPassword && passForm.newPassword.length >= 6 && (
                  <p className="text-xs mt-1 flex items-center gap-1 text-green-400">
                    <CheckCircle2 className="w-3 h-3" /> Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                Change Password
              </button>
            </>
          )}
        </form>
      )}
    </div>
  );
}
