"use client";
import Link from "next/link";
import { MapPin, BadgeCheck, Star, MessageCircle, Bed, Maximize2 } from "lucide-react";
import { SaveButton } from "@/components/property/SaveButton";

const TYPE_EMOJI: Record<string, string> = {
  FLAT: "🏢", ROOM: "🛏️", HOUSE: "🏠", SHOP: "🏪",
  LAND: "🌿", WAREHOUSE: "🏭", OFFICE: "💼", VACANT_SPACE: "📦",
};

const TYPE_LABEL: Record<string, string> = {
  FLAT: "Flat", ROOM: "Room", HOUSE: "House", SHOP: "Shop",
  LAND: "Land", WAREHOUSE: "Warehouse", OFFICE: "Office", VACANT_SPACE: "Vacant space",
};

interface Props {
  property: {
    id: string;
    title: string;
    type: string;
    purpose: string;
    price: number;
    priceUnit: string;
    locality: string;
    bedrooms?: number | null;
    area?: number | null;
    images: string[];
    contactPhone: string;
    contactWhatsapp?: string | null;
    isVerified: boolean;
    isFeatured: boolean;
  };
  savedIds?: string[]; // pass from server to hydrate heart state
}

export function PropertyCard({ property: p, savedIds = [] }: Props) {
  const phone = p.contactWhatsapp || p.contactPhone;
  const waMsg = `Hi, I saw your ${p.type} listing on Your Mithila - "${p.title}". I am interested.`;
  const unit = p.priceUnit === "MONTHLY" ? "/mo" : p.priceUnit === "YEARLY" ? "/yr" : "";

  return (
    <article className="gz-card gz-tilt group">
      {/* Image */}
      <Link href={`/properties/${p.id}`} className="block" aria-label={p.title}>
        <div className="gz-card-media">
          {p.images?.[0] ? (
            <img src={p.images[0]} alt={p.title} loading="lazy" />
          ) : (
            <div className="gz-card-empty"><span aria-hidden="true">{TYPE_EMOJI[p.type] ?? "🏠"}</span></div>
          )}

          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            <span className={`gz-tag ${p.purpose === "RENT" ? "gz-tag-rent" : "gz-tag-sale"}`}>
              {p.purpose === "RENT" ? "For rent" : "For sale"}
            </span>
            {p.isFeatured && (
              <span className="gz-tag gz-tag-feat"><Star className="w-3 h-3 fill-current" /> Featured</span>
            )}
          </div>

          <span className="gz-price">
            ₹{p.price.toLocaleString("en-IN")}<small>{unit}</small>
          </span>
        </div>
      </Link>

      {/* Save / wishlist heart — outside the link so it never navigates */}
      <div className="absolute top-2.5 right-2.5 z-[4]">
        <SaveButton propertyId={p.id} initialSaved={savedIds.includes(p.id)} size="sm" />
      </div>

      {/* Body */}
      <div className="p-4 pt-3.5">
        <p className="text-[13px] font-semibold flex items-center gap-1 mb-1" style={{ color: "var(--text-tertiary)" }}>
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" /> <span className="truncate">{p.locality}, Mithila</span>
          {p.isVerified && (
            <span className="inline-flex items-center gap-0.5 ml-1" style={{ color: "var(--info)" }} title="Verified listing">
              <BadgeCheck className="w-4 h-4" /><span className="sr-only">Verified</span>
            </span>
          )}
        </p>

        <Link href={`/properties/${p.id}`}>
          <h3 className="gz-card-title hover:underline decoration-2 underline-offset-2">{p.title}</h3>
        </Link>

        <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
          <span className="gz-mini">{TYPE_EMOJI[p.type] ?? "🏠"} {TYPE_LABEL[p.type] ?? p.type}</span>
          {p.bedrooms ? <span className="gz-mini"><Bed className="w-3.5 h-3.5" />{p.bedrooms} BHK</span> : null}
          {p.area ? <span className="gz-mini"><Maximize2 className="w-3 h-3" />{p.area} sq ft</span> : null}
        </div>

        <div className="flex gap-2 mt-4">
          <Link href={`/properties/${p.id}`} className="gz-btn-sm gz-btn-ghost">Details</Link>
          <a
            href={`https://wa.me/91${phone.replace(/\D/g, "")}?text=${encodeURIComponent(waMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="gz-btn-sm gz-btn-wa"
            onClick={e => e.stopPropagation()}
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}
