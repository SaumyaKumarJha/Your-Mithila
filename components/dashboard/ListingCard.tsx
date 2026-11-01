"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, MapPin, Edit2, Home, Briefcase, BadgeCheck } from "lucide-react";
import { useLang } from "@/lib/lang-context";

interface ListingCardProps {
  id: string;
  title: string;
  locality: string;
  price?: number;
  priceUnit?: string;
  viewCount: number;
  isAvailable: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  type: "property" | "job";
  organization?: string;
  jobType?: string;
}

function StatusToggle({
  id, isActive, type,
}: { id: string; isActive: boolean; type: "property" | "job" }) {
  const { t } = useLang();
  const [active, setActive] = useState(isActive);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    const endpoint = type === "property"
      ? `/api/dashboard/listings/${id}`
      : `/api/dashboard/jobs/${id}`;
    const body = type === "property"
      ? { isAvailable: !active }
      : { isActive: !active };

    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) setActive(a => !a);
    setLoading(false);
  }

  const activeLabel  = type === "property" ? t("Active",      "उपलब्ध")    : t("Active",  "सक्रिय");
  const inactiveLabel = type === "property" ? t("Rented/Filled","किराए पर/भरा") : t("Filled", "भरा");

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        disabled={loading}
        role="switch"
        aria-checked={active}
        aria-label={active ? activeLabel : inactiveLabel}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1 disabled:opacity-50 ${active ? "bg-green-500" : "bg-gray-300 dark:bg-slate-600"}`}
      >
        <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ${active ? "translate-x-4" : "translate-x-0"}`} />
      </button>
      <span className={`text-xs font-semibold ${active ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-slate-500"}`}>
        {active ? activeLabel : inactiveLabel}
      </span>
    </div>
  );
}

export function ListingCard({
  id, title, locality, price, priceUnit, viewCount,
  isAvailable, isVerified, isFeatured, type, organization, jobType,
}: ListingCardProps) {
  const { t } = useLang();
  const editHref = type === "property" ? `/dashboard/listings/${id}` : `/dashboard/jobs/${id}`;
  const viewHref = type === "property" ? `/properties/${id}` : `/jobs/${id}`;

  return (
    <div className="rounded-2xl p-4 hover:shadow-md transition-shadow"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0`}
            style={{
              background: type === "property" ? "var(--primary-light)" : "var(--secondary-light)",
            }}>
            {type === "property"
              ? <Home      className="w-4 h-4" style={{ color: "var(--primary)" }} />
              : <Briefcase className="w-4 h-4" style={{ color: "var(--secondary)" }} />}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{title}</h3>
            {organization && (
              <p className="text-xs truncate" style={{ color: "var(--text-tertiary)" }}>{organization}</p>
            )}
          </div>
        </div>
        {/* Badges */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {isFeatured && (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "var(--warning-light)", color: "var(--warning)" }}>
              ⭐ {t("Featured", "फीचर्ड")}
            </span>
          )}
          {isVerified && (
            <span className="flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "var(--info-light)", color: "var(--info)" }}>
              <BadgeCheck className="w-3 h-3" /> {t("Verified", "सत्यापित")}
            </span>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-xs mb-3 flex-wrap" style={{ color: "var(--text-tertiary)" }}>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />{locality}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="w-3 h-3" />{viewCount} {t("views", "व्यू")}
        </span>
        {price !== undefined && (
          <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>
            ₹{price.toLocaleString("en-IN")}{priceUnit === "MONTHLY" ? "/mo" : priceUnit === "YEARLY" ? "/yr" : ""}
          </span>
        )}
        {jobType && (
          <span className="px-2 py-0.5 rounded-full text-xs"
            style={{ background: "var(--secondary-light)", color: "var(--secondary)" }}>
            {jobType.replace("_", " ")}
          </span>
        )}
      </div>

      {/* Footer: toggle + actions */}
      <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--border)" }}>
        <StatusToggle id={id} isActive={isAvailable} type={type} />
        <div className="flex items-center gap-2">
          <a href={viewHref} target="_blank" rel="noopener noreferrer"
            className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors hover:opacity-80"
            style={{
              color: "var(--text-tertiary)",
              borderColor: "var(--border)",
              background: "var(--surface-alt)",
            }}>
            {t("View", "देखें")}
          </a>
          <Link href={editHref}
            className="flex items-center gap-1 text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors hover:opacity-90"
            style={{ background: "var(--primary)" }}>
            <Edit2 className="w-3 h-3" /> {t("Edit", "संपादित")}
          </Link>
        </div>
      </div>
    </div>
  );
}
