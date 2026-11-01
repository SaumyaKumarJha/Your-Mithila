// Madhubani motifs drawn as die-cut stickers: bold kajal line work, flat pigment fills,
// a white sticker edge and a hard offset shadow. Pure SVG, safe to render on the server.

export const PIGMENT = {
  ink: "#1D1410",
  sindoor: "#D63A24",
  haldi: "#FFC83D",
  neel: "#2D3FCF",
  pan: "#1E9E5A",
  gulabi: "#FF8DB8",
  paper: "#FFFDF7",
} as const;

const C = PIGMENT;
const r1 = (n: number) => Math.round(n * 10) / 10;
const pt = (r: number, deg: number, cx = 100, cy = 100) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return `${r1(cx + r * Math.cos(a))} ${r1(cy + r * Math.sin(a))}`;
};

/** White sticker edge + hard shadow, drawn under the artwork from the motif's outline shapes. */
function StickerBase({ children, edge = 12 }: { children: React.ReactNode; edge?: number }) {
  return (
    <>
      <g transform="translate(5 6)" fill={C.ink} stroke={C.ink} strokeWidth={edge} strokeLinejoin="round">{children}</g>
      <g fill="#fff" stroke="#fff" strokeWidth={edge} strokeLinejoin="round">{children}</g>
    </>
  );
}

type P = { className?: string; style?: React.CSSProperties };

/* ── Surya: the Madhubani sun face ── */
const RAYS = Array.from({ length: 16 }, (_, i) => {
  const a = i * 22.5;
  return { d: `M${pt(58, a - 11.25)}L${pt(95, a)}L${pt(58, a + 11.25)}Z`, c: i % 2 ? C.sindoor : C.haldi };
});
const STAR = "M" + RAYS.map((_, i) => `${pt(58, i * 22.5 - 11.25)}L${pt(95, i * 22.5)}`).join("L") + "Z";

export function Sun({ className, style }: P) {
  return (
    <svg viewBox="-14 -14 236 236" className={className} style={style} aria-hidden="true">
      <StickerBase><path d={STAR} /></StickerBase>
      <g className="gz-sun-rays" stroke={C.ink} strokeWidth={3.5} strokeLinejoin="round">
        {RAYS.map((r, i) => <path key={i} d={r.d} fill={r.c} />)}
      </g>
      <circle cx="100" cy="100" r="61" fill={C.haldi} stroke={C.ink} strokeWidth="4" />
      <circle cx="100" cy="100" r="54" fill="none" stroke={C.ink} strokeWidth="3" strokeDasharray="0.1 7.4" strokeLinecap="round" />
      <circle cx="100" cy="100" r="47" fill="#FFDB75" stroke={C.ink} strokeWidth="3.5" />
      {/* brows */}
      <path d="M68 84 Q83 70 97 81 M103 81 Q117 70 132 84" fill="none" stroke={C.ink} strokeWidth="3.5" strokeLinecap="round" />
      {/* almond eyes */}
      <path d="M70 94 Q83 82 97 94 Q83 102 70 94Z M103 94 Q117 82 130 94 Q117 102 103 94Z" fill="#fff" stroke={C.ink} strokeWidth="3" />
      <circle cx="85" cy="93.5" r="4" fill={C.ink} /><circle cx="115" cy="93.5" r="4" fill={C.ink} />
      {/* long nose, bindi, lips, cheeks */}
      <path d="M100 82 V108 Q100 114 93 112" fill="none" stroke={C.ink} strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="73" r="4.5" fill={C.sindoor} stroke={C.ink} strokeWidth="2" />
      <path d="M89 123 Q100 116 111 123 Q100 131 89 123Z" fill={C.sindoor} stroke={C.ink} strokeWidth="2.5" />
      <circle cx="77" cy="111" r="5.5" fill={C.gulabi} /><circle cx="123" cy="111" r="5.5" fill={C.gulabi} />
    </svg>
  );
}

/* ── Machhli: fish, the Mithila sign of good luck ── */
const FISH_BODY = "M14 65 C52 10 122 10 164 65 C122 120 52 120 14 65Z";
const FISH_TAIL = "M158 65 L214 20 L197 65 L214 110Z";
const FISH_FIN_T = "M88 24 Q108 -6 136 28 Q112 17 88 24Z";
const FISH_FIN_B = "M88 106 Q108 136 136 102 Q112 113 88 106Z";
const SCALES = [32, 45, 58, 71, 84, 97].flatMap((y, row) =>
  [64, 74, 84].map(x => `M${x + (row % 2) * 5} ${y} q5 8 10 0`)).join(" ");
const HATCH = Array.from({ length: 9 }, (_, i) => `M${100 + i * 6} 8 l-16 118`).join(" ");
const DOTS = [[140, 50], [148, 62], [140, 74], [152, 76], [150, 50], [138, 88], [130, 40], [128, 62], [130, 84]];

export function Fish({ className, style, color = C.neel, uid = "f" }: P & { color?: string; uid?: string }) {
  return (
    <svg viewBox="-14 -14 250 160" className={className} style={style} aria-hidden="true">
      <defs><clipPath id={`gzfish-${uid}`}><path d={FISH_BODY} /></clipPath></defs>
      <StickerBase><path d={FISH_BODY} /><path d={FISH_TAIL} /><path d={FISH_FIN_T} /><path d={FISH_FIN_B} /></StickerBase>
      <g stroke={C.ink} strokeWidth="3" strokeLinejoin="round">
        <path d={FISH_FIN_T} fill={C.haldi} /><path d={FISH_FIN_B} fill={C.haldi} />
        <path d={FISH_TAIL} fill={C.haldi} strokeWidth="3.5" />
      </g>
      <path d="M170 65 L205 34 M168 65 H198 M170 65 L205 96" stroke={C.ink} strokeWidth="2" />
      <path d={FISH_BODY} fill={color} />
      <g clipPath={`url(#gzfish-${uid})`}>
        <path d={SCALES} fill="none" stroke={C.paper} strokeWidth="2" strokeLinecap="round" />
        <path d={HATCH} stroke={C.paper} strokeWidth="1.6" opacity=".85" />
        <rect x="124" y="0" width="60" height="130" fill={color} />
        {DOTS.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.6" fill={C.paper} />)}
        <path d="M60 18 Q46 65 60 112 M96 12 Q86 65 96 118 M126 18 Q116 65 126 112" fill="none" stroke={C.ink} strokeWidth="3" />
      </g>
      <path d={FISH_BODY} fill="none" stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
      <circle cx="38" cy="58" r="11" fill={C.paper} stroke={C.ink} strokeWidth="3" />
      <circle cx="40" cy="58" r="5" fill={C.ink} />
      <path d="M17 67 Q24 72 31 67" fill="none" stroke={C.ink} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/* ── Kamal: lotus ── */
const L_CENTER = "M110 18 C137 55 137 100 110 128 C83 100 83 55 110 18Z";
const L_LEFT = "M110 128 C78 121 50 92 48 50 C78 60 101 90 110 128Z";
const L_RIGHT = "M110 128 C142 121 170 92 172 50 C142 60 119 90 110 128Z";
const L_OUT_L = "M108 133 C70 138 32 118 16 90 C52 87 88 103 108 133Z";
const L_OUT_R = "M112 133 C150 138 188 118 204 90 C168 87 132 103 112 133Z";
const L_BASE = "M66 134 Q110 162 154 134 Q110 148 66 134Z";

export function Lotus({ className, style }: P) {
  return (
    <svg viewBox="-12 -12 244 196" className={className} style={style} aria-hidden="true">
      <StickerBase>
        <path d={L_CENTER} /><path d={L_LEFT} /><path d={L_RIGHT} /><path d={L_OUT_L} /><path d={L_OUT_R} /><path d={L_BASE} />
      </StickerBase>
      <g stroke={C.ink} strokeWidth="3.5" strokeLinejoin="round">
        <path d={L_OUT_L} fill={C.neel} /><path d={L_OUT_R} fill={C.neel} />
        <path d={L_LEFT} fill={C.sindoor} /><path d={L_RIGHT} fill={C.sindoor} />
        <path d={L_CENTER} fill={C.gulabi} />
        <path d="M110 40 C125 64 125 98 110 116 C95 98 95 64 110 40Z" fill={C.haldi} strokeWidth="2.5" />
        <path d={L_BASE} fill={C.pan} />
      </g>
      <path d="M62 66 Q86 84 104 118 M158 66 Q134 84 116 118 M34 98 Q74 104 100 128 M186 98 Q146 104 120 128" fill="none" stroke={C.paper} strokeWidth="2" strokeLinecap="round" />
      {[[110, 4], [36, 40], [184, 40], [8, 80], [212, 80]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4.5" fill={C.sindoor} stroke={C.ink} strokeWidth="2" />
      ))}
    </svg>
  );
}

/* ── Ghar: a village house in Madhubani line work ── */
const ROOF = "M14 98 L100 22 L186 98Z";
const WALLS = "M36 98 H164 V180 H36Z";
const ROOF_HATCH = Array.from({ length: 22 }, (_, i) => `M${i * 9 - 10} 100 l40 -80`).join(" ");
const WALL_TRI = Array.from({ length: 10 }, (_, i) => `M${40 + i * 12.4} 112 l6.2 -10 l6.2 10Z`).join(" ");

export function Ghar({ className, style, uid = "g" }: P & { uid?: string }) {
  return (
    <svg viewBox="-12 -12 224 214" className={className} style={style} aria-hidden="true">
      <defs><clipPath id={`gzroof-${uid}`}><path d={ROOF} /></clipPath></defs>
      <StickerBase><path d={ROOF} /><path d={WALLS} /><path d="M100 22 V4 L120 10 L100 17Z" /></StickerBase>
      <path d="M100 22 V5" stroke={C.ink} strokeWidth="3" />
      <path d="M100 5 L120 10.5 L100 16Z" fill={C.haldi} stroke={C.ink} strokeWidth="2.5" strokeLinejoin="round" />
      <path d={WALLS} fill={C.haldi} stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
      <path d={WALL_TRI} fill={C.sindoor} stroke={C.ink} strokeWidth="1.6" strokeLinejoin="round" />
      <path d={ROOF} fill={C.sindoor} />
      <g clipPath={`url(#gzroof-${uid})`}><path d={ROOF_HATCH} stroke={C.ink} strokeWidth="2" opacity=".55" /></g>
      <path d="M40 92 L100 40 L160 92" fill="none" stroke={C.paper} strokeWidth="3" strokeLinejoin="round" />
      <path d={ROOF} fill="none" stroke={C.ink} strokeWidth="4" strokeLinejoin="round" />
      <path d="M82 180 V142 Q100 118 118 142 V180Z" fill={C.neel} stroke={C.ink} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M100 128 V180" stroke={C.paper} strokeWidth="2" />
      <g stroke={C.ink} strokeWidth="3">
        <circle cx="60" cy="142" r="11" fill={C.paper} /><circle cx="140" cy="142" r="11" fill={C.paper} />
      </g>
      <path d="M49 142 H71 M60 131 V153 M129 142 H151 M140 131 V153" stroke={C.ink} strokeWidth="2" />
      <path d="M20 182 H180" stroke={C.ink} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** Circular sticker with text running round the edge; spins slowly. */
export function SpinBadge({ id, text, className }: { id: string; text: string; className?: string }) {
  return (
    <svg viewBox="0 0 140 140" className={className} aria-hidden="true">
      <circle cx="73" cy="74" r="64" fill={C.ink} />
      <circle cx="70" cy="70" r="64" fill={C.sindoor} stroke={C.ink} strokeWidth="3" />
      <circle cx="70" cy="70" r="30" fill={C.haldi} stroke={C.ink} strokeWidth="3" />
      <defs><path id={id} d="M70 70 m-47 0 a47 47 0 1 1 94 0 a47 47 0 1 1 -94 0" /></defs>
      <g className="gz-spin">
        <text fill="#fff" fontSize="12.5" fontWeight="700" style={{ fontFamily: "var(--font-heading), sans-serif" }}>
          <textPath href={`#${id}`} textLength="292" lengthAdjust="spacing">{text}</textPath>
        </text>
      </g>
      <path d="M52 70 C60 58 76 58 86 70 C76 82 60 82 52 70Z M86 70 L96 62 L94 70 L96 78Z" fill={C.neel} stroke={C.ink} strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="60" cy="68" r="2.4" fill="#fff" />
    </svg>
  );
}

/** Tiny fish glyph used as a separator in the marquee. */
export function FishGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 34" className={className} aria-hidden="true">
      <path d="M3 17 C14 3 34 3 44 17 C34 31 14 31 3 17Z M43 17 L58 5 L54 17 L58 29Z" fill="currentColor" />
      <circle cx="13" cy="15" r="2.6" fill="#1D1410" />
    </svg>
  );
}
