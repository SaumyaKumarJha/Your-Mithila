"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Lang = "en" | "hi";

interface LangCtx {
  lang: Lang;
  toggle: () => void;
  t: (en: string, hi: string) => string;
}

const LangContext = createContext<LangCtx>({ lang: "en", toggle: () => {}, t: (en) => en });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("ym_lang") as Lang | null;
    if (saved === "hi" || saved === "en") setLang(saved);
  }, []);

  function toggle() {
    setLang(prev => {
      const next = prev === "en" ? "hi" : "en";
      localStorage.setItem("ym_lang", next);
      return next;
    });
  }

  function t(en: string, hi: string) {
    return lang === "hi" ? hi : en;
  }

  return <LangContext.Provider value={{ lang, toggle, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
