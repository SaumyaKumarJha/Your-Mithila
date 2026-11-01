"use client";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Loader2, Phone, Mail, KeyRound,
  Eye, EyeOff, RefreshCw, CheckCircle2,
} from "lucide-react";
import { Logo } from "@/components/Logo";

// ─── Resend countdown ─────────────────────────────────────────────────────────
function useResendTimer(initialSeconds = 60) {
  const [seconds, setSeconds] = useState(0);
  const start = useCallback(() => setSeconds(initialSeconds), [initialSeconds]);
  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);
  return { seconds, canResend: seconds === 0, start };
}

const INPUT =
  "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors " +
  "bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)] " +
  "border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]";

export function LoginForm() {
  const router = useRouter();
  // useSearchParams() is safe here because this component is always
  // rendered inside a <Suspense> boundary in page.tsx
  const params = useSearchParams();
  const registered = params.get("registered");
  const callbackUrl = params.get("callbackUrl") || null; // null = role-based redirect

  // Role-based redirect: if callbackUrl set, use it. Otherwise go to /
  function getRedirectUrl(role?: string) {
    if (callbackUrl) return callbackUrl;
    return "/"; // always home after login unless coming from a specific page
  }

  const [mode, setMode] = useState<"password" | "otp">("password");
  const [tab, setTab] = useState<"email" | "phone">("email");

  // Password login state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // OTP login state
  const [otpEmail, setOtpEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [providerStatus, setProviderStatus] = useState<null | {
    providerConfigured: boolean;
    hasResend: boolean;
    hasSmtp: boolean;
    fromEmail?: string | null;
    nodeEnv?: string | null;
    vercelEnv?: string | null;
  }>(null);
  const { seconds, canResend, start: startTimer } = useResendTimer(60);

  function clearError() { setError(""); }

  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/provider-status')
      .then(r => r.json())
      .then(d => { if (mounted) setProviderStatus(d); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // ── Password login ──────────────────────────────────────────────────────────
  async function loginWithPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await signIn("credentials", {
        identifier: identifier.trim(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid credentials. Please check your email/phone and password.");
        return;
      }
      // Fetch the session to get role for redirect
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const role = sessionData?.user?.role;
      router.push(getRedirectUrl(role));
      router.refresh();
    } finally { setLoading(false); }
  }

  // ── OTP login — send ────────────────────────────────────────────────────────
  async function sendLoginOtp(isResend = false) {
    if (!/\S+@\S+\.\S+/.test(otpEmail)) return setError("Enter a valid email address");
    setLoading(true); setError(""); setDebugOtp(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail.trim().toLowerCase(), type: "LOGIN" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to send OTP. Please try again."); return; }
      startTimer();
      setOtpSent(true);
      if (data.debugOtp) setDebugOtp(data.debugOtp);
    } finally { setLoading(false); }
  }

  // ── OTP login — verify + sign in ────────────────────────────────────────────
  async function loginWithOtp() {
    if (otp.length !== 6) return setError("Enter the 6-digit OTP");
    setLoading(true); setError("");
    try {
      const verifyRes = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail.trim().toLowerCase(), otp }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) { setError(verifyData.error ?? "Invalid OTP. Please try again."); return; }

      const res = await signIn("credentials", {
        identifier: otpEmail.trim().toLowerCase(),
        password: "",
        otpVerified: "true",
        redirect: false,
      });
      if (res?.error) {
        setError("Login failed. The OTP may have already been used. Please request a new one.");
        return;
      }
      // Fetch session for role-based redirect
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const role = sessionData?.user?.role;
      router.push(getRedirectUrl(role));
      router.refresh();
    } finally { setLoading(false); }
  }

  function switchMode(m: "password" | "otp") {
    setMode(m); setError(""); setOtpSent(false); setOtp("");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--background)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-sm p-8"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center gap-1 mb-3">
            <Logo size="md" />
          </Link>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Welcome Back</h1>
          <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>वापस स्वागत है</p>
        </div>

        {/* Success banner after registration */}
        {registered && (
          <div
            className="text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2"
            style={{ background: "var(--success-light)", border: "1px solid var(--success)", color: "var(--success)" }}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Account created successfully! Please log in.
          </div>
        )}

        {/* Email provider warning */}
        {providerStatus && !providerStatus.providerConfigured && (
          <div className="text-sm px-4 py-3 rounded-xl mb-4"
            style={{ background: "#fff4f4", border: "1px solid #f5c2c7", color: "#721c24" }}>
            No email provider configured for production. OTP emails may not be delivered.
            <div className="mt-2 text-xs" style={{ color: "#721c24" }}>
              Resend configured: {providerStatus.hasResend ? 'yes' : 'no'} · SMTP configured: {providerStatus.hasSmtp ? 'yes' : 'no'}
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div
            className="text-sm px-4 py-3 rounded-xl mb-4"
            style={{ background: "var(--error-light)", border: "1px solid var(--error)", color: "var(--error)" }}
          >
            {error}
          </div>
        )}

        {/* Mode toggle: Password / OTP */}
        <div className="flex gap-1 rounded-xl p-1 mb-5" style={{ background: "var(--surface-alt)" }}>
          {(["password", "otp"] as const).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                background: mode === m ? "var(--surface)" : "transparent",
                color: mode === m ? "var(--text-primary)" : "var(--text-tertiary)",
                boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {m === "password"
                ? <><KeyRound className="w-4 h-4" /> Password</>
                : <><Mail className="w-4 h-4" /> OTP Login</>}
            </button>
          ))}
        </div>

        {/* ── Password login ── */}
        {mode === "password" && (
          <>
            {/* Email / Phone sub-tab */}
            <div className="flex gap-1 rounded-xl p-1 mb-4" style={{ background: "var(--surface-alt)" }}>
              {(["email", "phone"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setIdentifier(""); clearError(); }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: tab === t ? "var(--surface)" : "transparent",
                    color: tab === t ? "var(--text-primary)" : "var(--text-tertiary)",
                    boxShadow: tab === t ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  {t === "email"
                    ? <><Mail className="w-4 h-4" /> Email</>
                    : <><Phone className="w-4 h-4" /> Phone</>}
                </button>
              ))}
            </div>

            <form onSubmit={loginWithPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                  {tab === "email" ? "Email Address" : "Phone Number"}
                </label>
                <input
                  type={tab === "email" ? "email" : "tel"}
                  value={identifier}
                  onChange={e => { setIdentifier(e.target.value); clearError(); }}
                  placeholder={tab === "email" ? "you@example.com" : "9876543210"}
                  maxLength={tab === "phone" ? 10 : undefined}
                  required
                  className={INPUT}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                    Password
                  </label>
                  <Link href="/auth/forgot-password" className="text-xs hover:underline" style={{ color: "var(--primary)" }}>
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearError(); }}
                    placeholder="••••••••"
                    required
                    className={`${INPUT} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    className="absolute right-3 top-3"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 rounded-xl justify-center disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Login
              </button>
            </form>
          </>
        )}

        {/* ── OTP login ── */}
        {mode === "otp" && (
          <div className="space-y-4">
            {!otpSent ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={otpEmail}
                    onChange={e => { setOtpEmail(e.target.value); clearError(); }}
                    placeholder="you@example.com"
                    className={INPUT}
                  />
                </div>
                <button
                  onClick={() => sendLoginOtp(false)}
                  disabled={loading}
                  className="btn-primary w-full py-3 rounded-xl justify-center disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Send OTP to Email
                </button>
              </>
            ) : (
              <>
                <div className="text-center py-3 rounded-xl" style={{ background: "var(--surface-alt)" }}>
                  <div className="text-3xl mb-1">📧</div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>OTP sent!</p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: "var(--primary)" }}>{otpEmail}</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Check spam folder if not received</p>
                </div>
                {debugOtp && (
                  <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
                    <div className="font-semibold">Debug OTP:</div>
                    <div className="mt-2 text-xl font-bold tracking-[0.3em]">{debugOtp}</div>
                    <p className="mt-2 text-xs text-yellow-800">
                      Email provider is not configured or not available, so the OTP is shown here.
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                    Enter 6-digit OTP
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={e => { setOtp(e.target.value.replace(/\D/g, "")); clearError(); }}
                    placeholder="• • • • • •"
                    className={`${INPUT} text-center text-2xl tracking-[0.5em] font-bold`}
                  />
                </div>
                <button
                  onClick={loginWithOtp}
                  disabled={loading}
                  className="btn-primary w-full py-3 rounded-xl justify-center disabled:opacity-60"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Verify & Login
                </button>
                <div className="flex items-center justify-between text-sm">
                  <button
                    onClick={() => { setOtpSent(false); setOtp(""); clearError(); }}
                    className="text-xs hover:opacity-80"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    ← Change email
                  </button>
                  {canResend ? (
                    <button
                      onClick={() => sendLoginOtp(true)}
                      disabled={loading}
                      className="flex items-center gap-1 text-xs font-medium hover:opacity-80"
                      style={{ color: "var(--primary)" }}
                    >
                      <RefreshCw className="w-3 h-3" /> Resend OTP
                    </button>
                  ) : (
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>Resend in {seconds}s</span>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Google OAuth */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: "var(--border)" }} />
          </div>
          <div className="relative text-center">
            <span className="px-3 text-xs" style={{ background: "var(--surface)", color: "var(--text-tertiary)" }}>or</span>
          </div>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: callbackUrl ?? "/" })}
          className="w-full border font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm hover:opacity-90"
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

        <p className="text-center text-sm mt-6" style={{ color: "var(--text-tertiary)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-medium hover:underline" style={{ color: "var(--primary)" }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
