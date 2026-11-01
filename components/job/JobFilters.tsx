"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";

const LOCALITIES = [
  "Rajnagar", "Lakhnaur", "Benipatti", "Jaynagar", "Madhubani Sadar",
  "Phulparas", "Bisfi", "Pandaul", "Harlakhi", "Khajauli", "Darbhanga",
  "Sitamarhi", "Andharatharhi", "Babangama", "Ghoghardiha", "Jhanjharpur",
  "Khutauna",
];

interface Props {
  searchParams: Record<string, string | undefined>;
}

export function JobFilters({ searchParams }: Props) {
  const router = useRouter();
  const [localityInput, setLocalityInput] = useState(searchParams.locality ?? "");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const applyFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams();
    // Carry over existing params
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== key && k !== "page") params.set(k, v);
    });
    if (value) params.set(key, value);
    router.push(`/jobs?${params.toString()}`);
  }, [searchParams, router]);

  const filteredLocalities = LOCALITIES.filter(l =>
    l.toLowerCase().includes(localityInput.toLowerCase())
  );

  return (
    <div className="card-warm !transform-none flex flex-wrap items-center gap-2.5 mb-5 p-4">

      {/* Org type filter */}
      <select
        value={searchParams.orgType ?? ""}
        onChange={e => applyFilter("orgType", e.target.value)}
        className="text-[15px] font-semibold rounded-full px-4 py-2 border-2 outline-none transition-shadow focus:shadow-[3px_3px_0_var(--haldi)]"
        style={{ borderColor: "var(--line)", background: "var(--surface)", color: "var(--text-primary)" }}
      >
        <option value="">All Organizations</option>
        <option value="HOTEL">🏨 Hotel</option>
        <option value="HOSPITAL">🏥 Hospital</option>
        <option value="SCHOOL">🏫 School</option>
        <option value="SHOP">🏪 Shop</option>
        <option value="FACTORY">🏭 Factory</option>
        <option value="OFFICE">🏢 Office</option>
        <option value="HOME">🏠 Home</option>
        <option value="OTHER">💼 Other</option>
      </select>

      {/* Min salary filter */}
      <select
        value={searchParams.minSalary ?? ""}
        onChange={e => applyFilter("minSalary", e.target.value)}
        className="text-[15px] font-semibold rounded-full px-4 py-2 border-2 outline-none transition-shadow focus:shadow-[3px_3px_0_var(--haldi)]"
        style={{ borderColor: "var(--line)", background: "var(--surface)", color: "var(--text-primary)" }}
      >
        <option value="">Any Salary</option>
        <option value="3000">₹3,000+</option>
        <option value="5000">₹5,000+</option>
        <option value="8000">₹8,000+</option>
        <option value="10000">₹10,000+</option>
        <option value="15000">₹15,000+</option>
      </select>

      {/* Locality autocomplete */}
      <div className="relative">
        <input
          type="text"
          value={localityInput}
          onChange={e => { setLocalityInput(e.target.value); setShowSuggestions(true); }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder="Filter by area..."
          aria-label="Filter by area"
          className="text-[15px] font-semibold rounded-full px-4 py-2 border-2 outline-none transition-shadow w-44 focus:shadow-[3px_3px_0_var(--haldi)]"
          style={{ borderColor: "var(--line)", background: "var(--surface)", color: "var(--text-primary)" }}
        />
        {showSuggestions && localityInput && filteredLocalities.length > 0 && (
          <div className="gz-menu absolute top-full left-0 mt-2 w-52 z-20 max-h-56 overflow-y-auto">
            {filteredLocalities.map(l => (
              <button
                key={l}
                onMouseDown={() => {
                  setLocalityInput(l);
                  setShowSuggestions(false);
                  applyFilter("locality", l);
                }}
                className="w-full text-left"
              >
                {l}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Clear filters */}
      {(searchParams.orgType || searchParams.minSalary || searchParams.locality) && (
        <a
          href="/jobs"
          className="gz-chip"
        >
          Clear filters
        </a>
      )}
    </div>
  );
}
