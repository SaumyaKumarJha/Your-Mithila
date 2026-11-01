"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useLang } from "@/lib/lang-context";

const TYPES = ["FLAT","ROOM","HOUSE","SHOP","LAND","WAREHOUSE","OFFICE","VACANT_SPACE"];
const TYPE_LABELS: Record<string, { en: string; hi: string }> = {
  FLAT:         { en: "Flat",        hi: "फ्लैट"       },
  ROOM:         { en: "Room",        hi: "कमरा"        },
  HOUSE:        { en: "House",       hi: "मकान"        },
  SHOP:         { en: "Shop",        hi: "दुकान"       },
  LAND:         { en: "Land",        hi: "जमीन"        },
  WAREHOUSE:    { en: "Warehouse",   hi: "गोदाम"       },
  OFFICE:       { en: "Office",      hi: "ऑफिस"        },
  VACANT_SPACE: { en: "Vacant Space",hi: "खाली जगह"   },
};

const INPUT_CLS = [
  "mt-1.5 w-full text-[15px] font-semibold rounded-xl px-3 py-2.5 outline-none transition-shadow",
  "border-2 border-[var(--line)] bg-[var(--surface)] text-[var(--text-primary)]",
  "focus:shadow-[3px_3px_0_var(--haldi)]",
].join(" ");

interface PropertyFiltersProps {
  searchParams: Record<string, string | undefined>;
}

export function PropertyFilters({ searchParams }: PropertyFiltersProps) {
  const router = useRouter();
  const { t, lang } = useLang();
  const [mobileOpen, setMobileOpen] = useState(false);

  function update(key: string, value: string | undefined) {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== key && k !== "page") params.set(k, v);
    });
    if (value) params.set(key, value);
    router.push(`/properties?${params.toString()}`);
  }

  function clearAll() { router.push("/properties"); }

  const hasFilters = Object.values(searchParams).some(Boolean);

  // Active / inactive pill styles
  const activePill  = { background: "var(--text-primary)", color: "var(--surface)",     borderColor: "var(--line)", boxShadow: "2px 2px 0 var(--haldi)" };
  const inactivePill = { background: "var(--surface)",      color: "var(--text-primary)", borderColor: "var(--line)" };

  const FiltersContent = () => (
    <div className="space-y-5">
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1 text-xs font-medium hover:opacity-80 transition-opacity"
          style={{ color: "var(--error)" }}
        >
          <X className="w-3 h-3" /> {t("Clear all filters", "सभी फ़िल्टर हटाएं")}
        </button>
      )}

      {/* Sort */}
      <div>
        <label className="text-[13px] font-bold block mb-1.5" style={{ color: "var(--text-secondary)" }}>
          {t("Sort By", "क्रमबद्ध करें")}
        </label>
        <select
          value={searchParams.sort ?? ""}
          onChange={e => update("sort", e.target.value || undefined)}
          className={INPUT_CLS}
        >
          <option value="">{t("Latest", "नवीनतम")}</option>
          <option value="price_asc">{t("Price: Low to High", "कीमत: कम से ज्यादा")}</option>
          <option value="price_desc">{t("Price: High to Low", "कीमत: ज्यादा से कम")}</option>
          <option value="views">{t("Most Viewed", "सबसे ज्यादा देखे गए")}</option>
        </select>
      </div>

      {/* Purpose */}
      <div>
        <label className="text-[13px] font-bold block mb-1.5" style={{ color: "var(--text-secondary)" }}>
          {t("Purpose", "उद्देश्य")}
        </label>
        <div className="flex gap-2">
          {(["", "RENT", "SALE"] as const).map(p => (
            <button
              key={p}
              onClick={() => update("purpose", p || undefined)}
              className="flex-1 text-sm py-1.5 rounded-full border-2 font-bold transition-all"
              style={(searchParams.purpose ?? "") === p ? activePill : inactivePill}
            >
              {p === "" ? t("All","सभी") : p === "RENT" ? t("Rent","किराया") : t("Sale","बिक्री")}
            </button>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div>
        <label className="text-[13px] font-bold block mb-1.5" style={{ color: "var(--text-secondary)" }}>
          {t("Property Type", "संपत्ति प्रकार")}
        </label>
        <div className="space-y-1.5">
          {TYPES.map(tp => (
            <label key={tp} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="type"
                checked={searchParams.type === tp}
                onChange={() => update("type", searchParams.type === tp ? undefined : tp)}
                className="accent-[var(--primary)]"
              />
              <span
                className="text-sm group-hover:text-[var(--primary)] transition-colors"
                style={{ color: searchParams.type === tp ? "var(--primary)" : "var(--text-secondary)" }}
              >
                {lang === "hi" ? TYPE_LABELS[tp].hi : TYPE_LABELS[tp].en}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Bedrooms */}
      <div>
        <label className="text-[13px] font-bold block mb-1.5" style={{ color: "var(--text-secondary)" }}>
          {t("Bedrooms", "बेडरूम")}
        </label>
        <div className="flex gap-1.5 flex-wrap">
          {["1","2","3","4"].map(b => (
            <button
              key={b}
              onClick={() => update("bedrooms", searchParams.bedrooms === b ? undefined : b)}
              className="min-w-[40px] px-3 py-1 text-sm rounded-full border-2 font-bold transition-all"
              style={searchParams.bedrooms === b ? activePill : inactivePill}
            >
              {b === "4" ? "4+" : b}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <label className="text-[13px] font-bold block mb-1.5" style={{ color: "var(--text-secondary)" }}>
          {t("Price Range (₹)", "मूल्य सीमा (₹)")}
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={t("Min","न्यूनतम")}
            value={searchParams.minPrice ?? ""}
            onChange={e => update("minPrice", e.target.value || undefined)}
            className={INPUT_CLS}
          />
          <input
            type="number"
            placeholder={t("Max","अधिकतम")}
            value={searchParams.maxPrice ?? ""}
            onChange={e => update("maxPrice", e.target.value || undefined)}
            className={INPUT_CLS}
          />
        </div>
      </div>

      {/* Verified only */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={searchParams.verified === "true"}
            onChange={e => update("verified", e.target.checked ? "true" : undefined)}
            className="accent-[var(--primary)] w-4 h-4"
          />
          <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
            {t("Verified listings only", "केवल सत्यापित लिस्टिंग")}
          </span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile filter button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="gz-chip"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {t("Filters","फ़िल्टर")}
          {hasFilters && (
            <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-white rounded-full"
              style={{ background: "var(--primary)" }}>!</span>
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto border-t-[3px] animate-slide-up"
            style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                {t("Filters","फ़िल्टर")}
              </h3>
              <button onClick={() => setMobileOpen(false)} className="gz-iconbtn" aria-label={t("Close filters", "फ़िल्टर बंद करें")}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <FiltersContent />
            <button
              onClick={() => setMobileOpen(false)}
              className="btn-primary w-full mt-5 py-3 rounded-xl justify-center"
            >
              {t("Apply Filters","फ़िल्टर लगाएं")}
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:block card-warm !transform-none p-5">
        <h3 className="text-xl font-extrabold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <SlidersHorizontal className="w-4 h-4" style={{ color: "var(--primary)" }} />
          {t("Filters","फ़िल्टर")}
        </h3>
        <FiltersContent />
      </div>
    </>
  );
}
