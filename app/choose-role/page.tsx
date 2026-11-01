"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function ChooseRolePage() {
  const router              = useRouter();
  const { data: session, update } = useSession();
  const [selected, setSelected] = useState<"OWNER" | "SEEKER" | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  async function handleContinue() {
    if (!selected) return;
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/user/update-role", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ role: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update role");

      // Update the NextAuth session token so all client components see the new role
      await update({ role: selected });

      router.push(selected === "OWNER" ? "/dashboard" : "/saved");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
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
          <Link href="/" className="flex items-center justify-center mb-4">
            <Logo size="md" />
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            How will you use YourMithila?
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
            {session?.user?.name
              ? `Welcome, ${session.user.name.split(" ")[0]}! `
              : ""}
            Choose your account type to continue.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="text-sm px-4 py-3 rounded-xl mb-4"
            style={{ background: "var(--error-light)", border: "1px solid var(--error)", color: "var(--error)" }}
          >
            {error}
          </div>
        )}

        {/* Role cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Seeker */}
          <button
            onClick={() => setSelected("SEEKER")}
            className="p-5 rounded-2xl border-2 text-left transition-all"
            style={{
              borderColor: selected === "SEEKER" ? "var(--info)" : "var(--border)",
              background:  selected === "SEEKER" ? "var(--info-light)" : "var(--surface)",
            }}
          >
            <div className="text-3xl mb-3">🔍</div>
            <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              I am looking
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              संपत्ति खोजने वाले
            </p>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Browse flats, rooms, shops and jobs near me
            </p>
          </button>

          {/* Owner */}
          <button
            onClick={() => setSelected("OWNER")}
            className="p-5 rounded-2xl border-2 text-left transition-all"
            style={{
              borderColor: selected === "OWNER" ? "var(--primary)" : "var(--border)",
              background:  selected === "OWNER" ? "var(--primary-light)" : "var(--surface)",
            }}
          >
            <div className="text-3xl mb-3">🏠</div>
            <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              I am an owner
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              संपत्ति मालिक
            </p>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              List my property or post job openings
            </p>
          </button>
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          disabled={!selected || loading}
          className="btn-primary w-full py-3 rounded-xl justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading
            ? "Saving..."
            : selected
              ? `Continue as ${selected === "OWNER" ? "Owner 🏠" : "Seeker 🔍"} →`
              : "Select your role to continue"}
        </button>

        <p className="text-center text-xs mt-4" style={{ color: "var(--text-muted)" }}>
          You can change this anytime from your profile.
        </p>
      </div>
    </div>
  );
}
