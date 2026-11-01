"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  Loader2, Eye, EyeOff, Home, Search, CheckCircle2,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Suspense } from "react";

const INPUT =
  "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors " +
  "bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] " +
  "border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "SEEKER" as "SEEKER" | "OWNER",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [done, setDone]         = useState(false);

  function set(k: string, v: string) {
    setForm(f => ({ ...f, [k]: v }));
    setError("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) { setError("Name must be at least 2 characters"); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError("Enter a valid email address"); return; }
    if (form.phone && form.phone.length !== 10) { setError("Phone must be exactly 10 digits, or leave blank"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }

    setLoading(true); setError("");
    try {
      // Register via password path (instant, no OTP required)
      const res = await fetch("/api/auth/register-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:     form.name.trim(),
          email:    form.email.trim().toLowerCase(),
          phone:    form.phone || undefined,
          password: form.password,
          role:     form.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed. Please try again."); return; }

      // Auto-login after successful registration
      const loginRes = await signIn("credentials", {
        identifier: form.email.trim().toLowerCase(),
        password:   form.password,
        redirect:   false,
      });

      if (loginRes?.ok) {
        setDone(true);
        setTimeout(() => {
          router.push(callbackUrl);
          router.refresh();
        }, 1200);
      } else {
        // Registration worked but auto-login failed — redirect to login
        router.push("/auth/login?registered=true");
      }
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-3">🎉</div>
        <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>
          Welcome to YourMithila!
        </h2>
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          Signing you in...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="text-sm px-4 py-3 rounded-xl"
          style={{ background: "var(--error-light)", border: "1px solid var(--error)", color: "var(--error)" }}>
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Full Name *
        </label>
        <input
          type="text"
          value={form.name}
          onChange={e => set("name", e.target.value)}
          placeholder="Ramesh Kumar"
          required
          className={INPUT}
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Email Address *
        </label>
        <input
          type="email"
          value={form.email}
          onChange={e => set("email", e.target.value)}
          placeholder="you@example.com"
          required
          className={INPUT}
        />
      </div>

      {/* Phone (optional) */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Phone Number <span style={{ color: "var(--text-muted)" }}>(optional)</span>
        </label>
        <input
          type="tel"
          value={form.phone}
          onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
          placeholder="9876543210"
          maxLength={10}
          className={INPUT}
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Password *
        </label>
        <div className="relative">
          <input
            type={showPass ? "text" : "password"}
            value={form.password}
            onChange={e => set("password", e.target.value)}
            placeholder="Min 6 characters"
            required
            className={`${INPUT} pr-10`}
          />
          <button
            type="button"
            onClick={() => setShowPass(s => !s)}
            className="absolute right-3 top-3.5"
            style={{ color: "var(--text-tertiary)" }}
          >
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Role — simple inline choice, no extra screen */}
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          I want to...
        </label>
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: "SEEKER", icon: Search, label: "Find Property / Job",      sub: "खोजें" },
            { value: "OWNER",  icon: Home,   label: "List Property / Post Job", sub: "लिस्ट करें" },
          ] as const).map(({ value, icon: Icon, label, sub }) => (
            <button
              key={value}
              type="button"
              onClick={() => setForm(f => ({ ...f, role: value }))}
              className="p-3 rounded-xl border-2 text-left transition-all"
              style={{
                borderColor: form.role === value ? "var(--primary)" : "var(--border)",
                background:  form.role === value ? "var(--primary-light)" : "var(--surface)",
              }}
            >
              <Icon className="w-4 h-4 mb-1.5" style={{ color: form.role === value ? "var(--primary)" : "var(--text-tertiary)" }} />
              <p className="text-xs font-semibold leading-tight" style={{ color: form.role === value ? "var(--primary)" : "var(--text-primary)" }}>
                {label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>
              {form.role === value && (
                <CheckCircle2 className="w-4 h-4 mt-1" style={{ color: "var(--primary)" }} />
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full py-3 rounded-xl justify-center gap-2 disabled:opacity-60"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Create Account
      </button>

      {/* Google */}
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: "var(--border)" }} />
        </div>
        <div className="relative text-center">
          <span className="px-3 text-xs" style={{ background: "var(--surface)", color: "var(--text-tertiary)" }}>or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl })}
        className="w-full border font-medium py-3 rounded-xl flex items-center justify-center gap-2 text-sm hover:opacity-90 transition-opacity"
        style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--background)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-sm p-8"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="text-center mb-6">
          <Link href="/" className="inline-block mb-3">
            <Logo size="md" />
          </Link>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Create Account</h1>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>खाता बनाएं • Free to join</p>
        </div>

        <Suspense fallback={null}>
          <RegisterForm />
        </Suspense>

        <p className="text-center text-sm mt-5" style={{ color: "var(--text-tertiary)" }}>
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium hover:underline" style={{ color: "var(--primary)" }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
