"use client";
/**
 * SaveButton — heart icon that saves/unsaves a property.
 *
 * - Optimistic UI: toggles immediately, reverts on error.
 * - Unauthenticated users are redirected to /auth/login.
 * - Accepts an optional `initialSaved` prop for SSR hydration.
 */

import { useState } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Props {
  propertyId: string;
  initialSaved?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function SaveButton({ propertyId, initialSaved = false, size = "md", className = "" }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const iconSize = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const btnSize = size === "sm" ? "w-7 h-7" : "w-9 h-9";

  async function toggle(e: React.MouseEvent) {
    e.preventDefault(); // don't navigate if inside a Link
    e.stopPropagation();

    if (!session) {
      router.push("/auth/login");
      return;
    }

    // Optimistic update
    const prev = saved;
    setSaved(!saved);
    setLoading(true);

    try {
      const res = await fetch("/api/saved", {
        method: saved ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId }),
      });

      if (!res.ok) {
        setSaved(prev); // revert
        const data = await res.json();
        toast.error(data.error ?? "Failed to update wishlist");
        return;
      }

      toast.success(saved ? "Removed from wishlist" : "Saved to wishlist ❤️", {
        duration: 1800,
        position: "bottom-center",
      });
    } catch {
      setSaved(prev); // revert on network error
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
      title={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={`${btnSize} rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-60 ${className}`}
      style={{
        background: saved ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(4px)",
        border: saved ? "1.5px solid rgba(239,68,68,0.3)" : "1.5px solid rgba(0,0,0,0.08)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Heart
        className={`${iconSize} transition-all duration-200 ${loading ? "animate-pulse" : ""}`}
        style={{
          color: saved ? "#EF4444" : "#9CA3AF",
          fill: saved ? "#EF4444" : "transparent",
          strokeWidth: 2,
        }}
      />
    </button>
  );
}
