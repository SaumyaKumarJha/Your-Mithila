"use client";
import { useEffect, useRef } from "react";
import { Sun, Fish, Lotus, Ghar, SpinBadge } from "@/components/genz/Motifs";

// A small Madhubani painting whose motifs sit at different depths.
// Pointer movement tilts the stage, so near motifs slide more than far ones (real 3D parallax);
// with no pointer it sways gently on its own. Nothing runs while the painting is off screen.
const PIECES = [
  { key: "sun",   z: 70,  cls: "gz-p-sun",   el: <Sun className="gz-motif" /> },
  { key: "ghar",  z: 25,  cls: "gz-p-ghar",  el: <Ghar uid="hero" className="gz-motif" /> },
  { key: "fishA", z: 95,  cls: "gz-p-fishA", el: <Fish uid="heroA" color="#2D3FCF" className="gz-motif" /> },
  { key: "fishB", z: 45,  cls: "gz-p-fishB", el: <Fish uid="heroB" color="#D63A24" className="gz-motif" /> },
  { key: "lotus", z: 60,  cls: "gz-p-lotus", el: <Lotus className="gz-motif" /> },
];
const DOTS = [[14, 20], [86, 14], [10, 62], [92, 56], [30, 46], [70, 40], [50, 92], [22, 88]];

export function HeroPainting() {
  const root = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = root.current; if (!el) return;
    const stage = el.querySelector<HTMLElement>(".gz-paint-stage"); if (!stage) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lite = reduce || (nav.deviceMemory !== undefined && nav.deviceMemory <= 4) || (navigator.hardwareConcurrency || 8) <= 4;
    let tx = 0, ty = 0, cx = 0, cy = 0, last = 0, raf = 0, prev = 0, visible = true, running = false;

    const onMove = (e: PointerEvent) => {
      if (reduce) return;
      const r = el.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      last = performance.now();
      start();
    };
    const tick = (t: number) => {
      if (!visible) { running = false; return; }
      raf = requestAnimationFrame(tick);
      if (t - prev < 32) return;               // ~30 fps is plenty for a slow sway
      prev = t;
      const idle = t - last > 2500;
      if (idle && lite) { running = false; cancelAnimationFrame(raf); return; }
      if (idle) { tx = Math.sin(t / 3000) * 0.75; ty = Math.cos(t / 3900) * 0.5; }
      cx += (tx - cx) * 0.1; cy += (ty - cy) * 0.1;
      stage.style.transform = `rotateX(${(-cy * 7).toFixed(2)}deg) rotateY(${(cx * 10).toFixed(2)}deg)`;
    };
    function start() { if (!running && visible) { running = true; raf = requestAnimationFrame(tick); } }

    const host = el.closest("section") ?? el;
    host.addEventListener("pointermove", onMove as EventListener);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      el.classList.toggle("is-off", !visible);   // pauses the CSS animations inside
      if (visible) start();
    }, { threshold: 0 });
    io.observe(el);
    start();
    return () => { cancelAnimationFrame(raf); host.removeEventListener("pointermove", onMove as EventListener); io.disconnect(); };
  }, []);

  return (
    <div ref={root} className="gz-paint" aria-hidden="true">
      <div className="gz-paint-frame">
        <div className="gz-paint-band gz-paint-band-top" />
        <div className="gz-paint-stage">
          {DOTS.map(([x, y], i) => (
            <i key={i} className="gz-paint-dot" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${-i * 0.7}s` }} />
          ))}
          {PIECES.map(p => (
            <div key={p.key} className={`gz-piece ${p.cls}`} style={{ ["--z" as any]: `${p.z}px` }}>
              <div className="gz-bob">{p.el}</div>
            </div>
          ))}
        </div>
        <div className="gz-paint-band gz-paint-band-bottom" />
      </div>
      <SpinBadge id="gz-badge-path" text="free for seekers ✺ owner se seedha baat ✺ " className="gz-badge" />
    </div>
  );
}
