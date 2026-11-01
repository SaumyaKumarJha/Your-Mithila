"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchBarProps {
  defaultTab?: "properties" | "jobs";
}

export function SearchBar({ defaultTab = "properties" }: SearchBarProps) {
  const [tab, setTab] = useState<"properties" | "jobs">(defaultTab);
  const [query, setQuery] = useState("");
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const path = tab === "properties" ? "/properties" : "/jobs";
    router.push(`${path}?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Tabs */}
      <div className="flex rounded-t-xl overflow-hidden border border-b-0 border-gray-200">
        {(["properties", "jobs"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-semibold capitalize transition-colors ${
              tab === t
                ? "bg-orange-500 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t === "properties" ? "🏠 Properties" : "💼 Jobs"}
          </button>
        ))}
      </div>

      {/* Search input */}
      <form
        onSubmit={handleSearch}
        className="flex items-center bg-white border border-gray-200 rounded-b-xl shadow-lg overflow-hidden"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            tab === "properties"
              ? "Search by locality, type (flat, room, shop)..."
              : "Search by job title, organization..."
          }
          className="flex-1 px-4 py-3.5 text-sm outline-none"
        />
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3.5 flex items-center gap-2 font-medium transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>
    </div>
  );
}
