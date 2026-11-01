"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2, Mail, Eye, EyeOff, KeyRound,
  CheckCircle2, RefreshCw, ArrowLeft,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { useLang } from "@/lib/lang-context";

type Step = "email" | "otp" | "newpass" | "done";

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

const INPUT = [
  "w-full border rounded-xl px-4 py-3 text-sm outline-none transition-colors",
  "bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)]",
  "border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]",
].join(" ");

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t } = useLang();

  const [step, setStep]           = useState<Step>("email");
  const [email, setEmail]         = useState("");
  const [otp, setOtp]             = useState("");
  const [newPass, setNewPass]     = useState("");
  const [confirmPass, setConfirm] = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [debugOtp, setDebugOtp]   = useState<string | null>(null);
  const [providerStatus, setProviderStatus] = useState<null | { providerConfigured: boolean; hasResend: boolean; hasSmtp: boolean; fromEmail?: string | null }>(null);

  const { seconds, canResend, start: startTimer } = useResendTimer(60);

  async function sendOtp(isResend = false) {
    if (!/\S+@\S+\.\S+/.test(email)) { setError(t("Enter a valid email address", "सही ईमेल दर्ज करें")); return; }
    setLoading(true); setError(""); setDebugOtp(null);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), type: "RESET_PASSWORD" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? t("Failed to send OTP", "OTP भेजने में विफल")); return; }
      startTimer();
      if (data.debugOtp) setDebugOtp(data.debugOtp);
      if (!isResend) setStep("otp");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    let mounted = true;
    fetch('/api/auth/provider-status')
      .then(r => r.json())
      .then(d => { if (mounted) setProviderStatus(d); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  async function verifyOtp() {
    if (otp.length !== 6) { setError(t("Enter the 6-digit OTP", "6 अंकों का OTP दर्ज करें")); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? t("Invalid OTP", "गलत OTP")); return; }
      setStep("newpass");
    } finally { setLoading(false); }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPass.length < 6) { setError(t("Password must be at least 6 characters", "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए")); return; }
    if (newPass !== confirmPass) { setError(t("Passwords do not match", "पासवर्ड मेल नहीं खाते")); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/register-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: newPass }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? t("Reset failed. Please try again.", "रीसेट विफल। पुनः प्रयास करें।")); return; }
      setStep("done");
      setTimeout(() => router.push("/auth/login"), 2500);
    } finally { setLoading(false); }
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
        <div className="text-center mb-6">
          <Link href="/" className="flex items-center justify-center mb-3">
            <Logo size="md" />
          </Link>
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {t("Reset Password", "पासवर्ड रीसेट करें")}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
            {t("We'll send an OTP to verify your identity", "आपकी पहचान सत्यापित करने के लिए OTP भेजेंगे")}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm px-4 py-3 rounded-xl mb-4"
            style={{ background: "var(--error-light)", border: "1px solid var(--error)", color: "var(--error)" }}>
            {error}
          </div>
        )}
        {providerStatus && !providerStatus.providerConfigured && (
          <div className="text-sm px-4 py-3 rounded-xl mb-4" style={{ background: "#fff4f4", border: "1px solid #f5c2c7", color: "#721c24" }}>
            No email provider configured. OTP emails may not be delivered in production. Resend: {providerStatus.hasResend ? 'yes' : 'no'} · SMTP: {providerStatus.hasSmtp ? 'yes' : 'no'}
          </div>
        )}

        {/* Step 1 — Email */}
        {step === "email" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                {t("Email Address", "ईमेल पता")} <span style={{ color: "var(--error)" }}>*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(""); }}
                  placeholder="you@example.com"
                  className={`${INPUT} pl-10`}
                />
              </div>
            </div>
            <button
              onClick={() => sendOtp(false)}
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl justify-center disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              {t("Send OTP", "OTP भेजें")}
            </button>
          </div>
        )}

        {/* Step 2 — OTP */}
        {step === "otp" && (
          <div className="space-y-4">
            <div className="text-center py-3 rounded-xl" style={{ background: "var(--surface-alt)" }}>
              <div className="text-3xl mb-2">📧</div>
              <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                {t("OTP sent to your email", "OTP आपके ईमेल पर भेजा गया")}
              </p>
              <p className="text-xs mt-1 font-medium" style={{ color: "var(--primary)" }}>{email}</p>
            </div>
            {debugOtp && (
              <div className="rounded-xl border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-900">
                <div className="font-semibold">Debug OTP:</div>
                <div className="mt-2 text-xl font-bold tracking-[0.3em]">{debugOtp}</div>
                <p className="mt-2 text-xs text-yellow-800">
                  Email provider is not configured or unavailable, so the OTP is shown here.
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                {t("Enter 6-digit OTP", "6 अंकों का OTP दर्ज करें")} <span style={{ color: "var(--error)" }}>*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={e => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
                placeholder="• • • • • •"
                className={`${INPUT} text-center text-2xl tracking-[0.5em] font-bold`}
              />
            </div>
            <button
              onClick={verifyOtp}
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl justify-center disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("Verify OTP", "OTP सत्यापित करें")}
            </button>
            <div className="flex items-center justify-between text-sm">
              <button
                onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                className="flex items-center gap-1 text-xs hover:opacity-80"
                style={{ color: "var(--text-tertiary)" }}
              >
                <ArrowLeft className="w-3 h-3" /> {t("Change email", "ईमेल बदलें")}
              </button>
              {canResend ? (
                <button
                  onClick={() => sendOtp(true)}
                  disabled={loading}
                  className="flex items-center gap-1 text-xs font-medium hover:opacity-80"
                  style={{ color: "var(--primary)" }}
                >
                  <RefreshCw className="w-3 h-3" /> {t("Resend OTP", "OTP पुनः भेजें")}
                </button>
              ) : (
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {t(`Resend in ${seconds}s`, `${seconds}s में पुनः भेजें`)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Step 3 — New Password */}
        {step === "newpass" && (
          <form onSubmit={resetPassword} className="space-y-4">
            <div className="text-center py-2 rounded-xl mb-2" style={{ background: "var(--success-light)" }}>
              <p className="text-sm font-semibold flex items-center justify-center gap-1.5" style={{ color: "var(--success)" }}>
                <CheckCircle2 className="w-4 h-4" /> {t("Identity verified!", "पहचान सत्यापित!")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                {t("New Password", "नया पासवर्ड")} <span style={{ color: "var(--error)" }}>*</span>
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={newPass}
                  onChange={e => { setNewPass(e.target.value); setError(""); }}
                  placeholder={t("Min 6 characters", "न्यूनतम 6 अक्षर")}
                  className={`${INPUT} pr-10`}
                  required
                />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-3.5" style={{ color: "var(--text-tertiary)" }}>
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                {t("Confirm Password", "पासवर्ड की पुष्टि")} <span style={{ color: "var(--error)" }}>*</span>
              </label>
              <input
                type="password"
                value={confirmPass}
                onChange={e => { setConfirm(e.target.value); setError(""); }}
                placeholder="••••••••"
                className={INPUT}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 rounded-xl justify-center disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              {t("Reset Password", "पासवर्ड रीसेट करें")}
            </button>
          </form>
        )}

        {/* Step 4 — Done */}
        {step === "done" && (
          <div className="text-center py-10">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              {t("Password Reset!", "पासवर्ड रीसेट हो गया!")}
            </h2>
            <p className="text-sm mb-1" style={{ color: "var(--text-tertiary)" }}>
              {t("Redirecting to login...", "लॉगिन पर भेजा जा रहा है...")}
            </p>
          </div>
        )}

        {step !== "done" && (
          <p className="text-center text-sm mt-6" style={{ color: "var(--text-tertiary)" }}>
            {t("Remember your password?", "पासवर्ड याद है?")}{" "}
            <Link href="/auth/login" className="font-medium hover:underline" style={{ color: "var(--primary)" }}>
              {t("Sign In", "लॉगिन करें")}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
