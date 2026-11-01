"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Shield, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/Logo";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Step 1 — verify admin credentials, get back email for NextAuth
      const res = await fetch("/api/admin/auth", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Invalid credentials");
        return;
      }

      // Step 2 — sign in via NextAuth credentials so JWT gets role=ADMIN
      const result = await signIn("credentials", {
        identifier: data.email,
        password:   data.password,
        redirect:   false,
      });

      if (result?.error || !result?.ok) {
        setError("Login failed. Please try again.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--gradient-hero-bg)" }}
    >
      <div className="w-full max-w-md">
        <div
          className="rounded-2xl p-8"
          style={{
            background:     "rgba(255,255,255,0.05)",
            border:         "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "rgba(49,46,129,0.4)" }}
            >
              <Shield className="w-7 h-7" style={{ color: "#A5B4FC" }} />
            </div>
            <div className="flex justify-center mb-3">
              <Logo size="md" variant="white" />
            </div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              Restricted Access — Admins Only
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="text-sm px-4 py-3 rounded-xl mb-4"
              style={{
                background: "rgba(220,38,38,0.15)",
                border:     "1px solid rgba(220,38,38,0.3)",
                color:      "#FCA5A5",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Admin Username
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="yourmithila_admin"
                required
                autoComplete="username"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors text-white placeholder-white/30"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border:     "1px solid rgba(255,255,255,0.15)",
                }}
                onFocus={e => (e.target.style.borderColor = "#818CF8")}
                onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                Password
              </label>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors text-white pr-10"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border:     "1px solid rgba(255,255,255,0.15)",
                }}
                onFocus={e => (e.target.style.borderColor = "#818CF8")}
                onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.15)")}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-9"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !username.trim() || !password}
              className="w-full font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#312E81" }}
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                : <><Shield className="w-4 h-4" /> Login to Admin Panel</>}
            </button>
          </form>

          <p className="text-center mt-6">
            <Link
              href="/"
              className="text-xs hover:opacity-80 transition-opacity"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              ← Back to website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
