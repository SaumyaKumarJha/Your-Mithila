"use client";
import { useEffect } from "react";

// Cards marked .gz-tilt lean toward the pointer in 3D and catch a moving glare.
// Mouse / trackpad only, and never when the visitor prefers reduced motion.
const TARGET = ".gz-tilt";

export function TiltEffect() {
  useEffect(() => {
    if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let current: HTMLElement | null = null;
    const reset = (el: HTMLElement | null) => {
      if (!el) return;
      el.classList.remove("is-tilting");
      ["--rx", "--ry", "--gx", "--gy"].forEach(p => el.style.removeProperty(p));
    };
    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(TARGET) as HTMLElement | null;
      if (el !== current) { reset(current); current = el; }
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      el.classList.add("is-tilting");
      el.style.setProperty("--ry", ((px - 0.5) * 10).toFixed(2) + "deg");
      el.style.setProperty("--rx", ((0.5 - py) * 8).toFixed(2) + "deg");
      el.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
      el.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
    };
    const onLeave = () => { reset(current); current = null; };
    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      reset(current);
    };
  }, []);
  return null;
}
