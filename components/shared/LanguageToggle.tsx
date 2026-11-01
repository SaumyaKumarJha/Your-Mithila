"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function LanguageToggle() {
  const [lang, setLang] = useState<"en" | "hi">("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as "en" | "hi" | null;
    if (saved) setLang(saved);
  }, []);

  function toggle() {
    const next = lang === "en" ? "hi" : "en";
    setLang(next);
    localStorage.setItem("lang", next);
    // Trigger a custom event so other components can react
    window.dispatchEvent(new CustomEvent("langchange", { detail: next }));
  }

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 text-sm font-medium px-2 py-1 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
      aria-label="Toggle language"
    >
      <span className={lang === "en" ? "font-bold text-orange-600" : "text-gray-500"}>EN</span>
      <span className="text-gray-400">|</span>
      <span className={lang === "hi" ? "font-bold text-orange-600" : "text-gray-500"}>हि</span>
    </button>
  );
}
