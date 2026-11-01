"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-[var(--error-light)] w-full text-left"
      style={{ color: "var(--text-tertiary)" }}
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  );
}
