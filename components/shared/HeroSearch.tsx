"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { useLang } from "@/lib/lang-context";

const SERVICE_OPTIONS = [
  { value: "properties", label: "Properties", labelHi: "संपत्ति", emoji: "🏠" },
  { value: "jobs",       label: "Jobs",       labelHi: "नौकरी",  emoji: "💼" },
];

const CATEGORY_MAP: Record<string, { value: string; label: string; labelHi: string }[]> = {
  properties: [
    { value: "",             label: "All Types",  labelHi: "सभी प्रकार" },
    { value: "FLAT",         label: "Flat",       labelHi: "फ्लैट"      },
    { value: "ROOM",         label: "Room",       labelHi: "कमरा"       },
    { value: "HOUSE",        label: "House",      labelHi: "मकान"       },
    { value: "SHOP",         label: "Shop",       labelHi: "दुकान"      },
    { value: "LAND",         label: "Land",       labelHi: "जमीन"       },
    { value: "WAREHOUSE",    label: "Warehouse",  labelHi: "गोदाम"      },
    { value: "OFFICE",       label: "Office",     labelHi: "ऑफिस"       },
    { value: "VACANT_SPACE", label: "Vacant Space", labelHi: "खाली जगह" },
  ],
  jobs: [
    { value: "",           label: "All Types",  labelHi: "सभी प्रकार" },
    { value: "FULL_TIME",  label: "Full Time",  labelHi: "पूर्णकालिक" },
    { value: "PART_TIME",  label: "Part Time",  labelHi: "अंशकालिक"   },
    { value: "CONTRACT",   label: "Contract",   labelHi: "अनुबंध"     },
    { value: "DAILY_WAGE", label: "Daily Wage", labelHi: "दैनिक मजदूरी" },
  ],
};

const LOCALITIES = [
  { value: "",              label: "All Localities", labelHi: "सभी इलाके"   },
  { value: "Rajnagar",      label: "Rajnagar",       labelHi: "राजनगर"      },
  { value: "Lakhnaur",      label: "Lakhnaur",       labelHi: "लखनौर"       },
  { value: "Benipatti",     label: "Benipatti",      labelHi: "बेनीपट्टी"   },
  { value: "Jaynagar",      label: "Jaynagar",       labelHi: "जयनगर"       },
  { value: "Madhubani Sadar", label: "Madhubani Sadar", labelHi: "मधुबनी सदर" },
  { value: "Phulparas",     label: "Phulparas",      labelHi: "फुलपरास"     },
  { value: "Bisfi",         label: "Bisfi",          labelHi: "बिस्फी"      },
  { value: "Pandaul",       label: "Pandaul",        labelHi: "पंडौल"       },
  { value: "Harlakhi",      label: "Harlakhi",       labelHi: "हरलाखी"      },
  { value: "Khajauli",      label: "Khajauli",       labelHi: "खजौली"       },
  { value: "Darbhanga",     label: "Darbhanga",      labelHi: "दरभंगा"      },
  { value: "Sitamarhi",     label: "Sitamarhi",      labelHi: "सीतामढ़ी"    },
];

function Select({
  value, onChange, options, label, labelHi, id,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; labelHi: string }[];
  label: string;
  labelHi: string;
  id: string;
}) {
  const { lang } = useLang();
  return (
    <div className="relative min-w-0">
      <label htmlFor={id} className="block text-[13px] font-bold mb-1.5 px-1" style={{ color: "var(--text-secondary)" }}>
        {lang === "hi" ? labelHi : label}
      </label>
      <div className="relative">
        <select id={id} value={value} onChange={e => onChange(e.target.value)} className="gz-select">
          {options.map(o => (
            <option key={o.value} value={o.value}>
              {lang === "hi" ? o.labelHi : o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--text-primary)" }} />
      </div>
    </div>
  );
}

export function HeroSearch() {
  const { lang, t } = useLang();
  const router = useRouter();
  const [service,  setService]  = useState("properties");
  const [category, setCategory] = useState("");
  const [locality, setLocality] = useState("");

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (service === "properties") {
      if (category) params.set("type", category);
      if (locality) params.set("locality", locality);
      router.push(`/properties?${params.toString()}`);
    } else {
      if (category) params.set("jobType", category);
      if (locality) params.set("locality", locality);
      router.push(`/jobs?${params.toString()}`);
    }
  }

  function handleServiceChange(v: string) {
    setService(v);
    setCategory("");
  }

  return (
    <form onSubmit={handleSearch} className="gz-search w-full p-4 sm:p-5" role="search">
      {/* Property or job — two toggle pills instead of a dropdown */}
      <div className="flex flex-wrap items-center gap-2 mb-4" aria-label={t("Search for", "क्या खोजें")}>
        {SERVICE_OPTIONS.map(o => (
          <button
            key={o.value}
            type="button"
            aria-pressed={service === o.value}
            onClick={() => handleServiceChange(o.value)}
            className="gz-seg"
          >
            <span aria-hidden="true">{o.emoji}</span> {lang === "hi" ? o.labelHi : o.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
        <Select
          id="hs-category"
          value={category}
          onChange={setCategory}
          label={service === "properties" ? "Property type" : "Job type"}
          labelHi={service === "properties" ? "संपत्ति प्रकार" : "नौकरी प्रकार"}
          options={CATEGORY_MAP[service]}
        />
        <Select
          id="hs-locality"
          value={locality}
          onChange={setLocality}
          label="Locality"
          labelHi="इलाका"
          options={LOCALITIES}
        />
        <button type="submit" className="gz-go w-full sm:w-auto">
          <Search className="w-5 h-5" strokeWidth={2.6} />
          {t("Search", "खोजें")}
        </button>
      </div>
    </form>
  );
}
