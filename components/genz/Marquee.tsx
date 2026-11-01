import { FishGlyph } from "@/components/genz/Motifs";

// Localities of Mithila scrolling past on a tilted band, English and Hindi side by side.
const PLACES: [string, string][] = [
  ["Madhubani", "मधुबनी"], ["Rajnagar", "राजनगर"], ["Benipatti", "बेनीपट्टी"], ["Jaynagar", "जयनगर"],
  ["Phulparas", "फुलपरास"], ["Bisfi", "बिस्फी"], ["Pandaul", "पंडौल"], ["Darbhanga", "दरभंगा"], ["Sitamarhi", "सीतामढ़ी"],
];

export function Marquee() {
  const row = PLACES.map(([en, hi]) => (
    <span key={en} className="gz-marquee-item">
      <b>{en}</b>
      <span lang="hi">{hi}</span>
      <FishGlyph className="gz-marquee-fish" />
    </span>
  ));
  return (
    <div className="gz-marquee" aria-hidden="true">
      <div className="gz-marquee-track">{row}{row}</div>
    </div>
  );
}
