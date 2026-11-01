import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { PropertyCard } from "@/components/property/PropertyCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Properties | YourMithila",
  description: "Your saved and wishlisted properties on YourMithila.",
};

export default async function SavedPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/saved");

  const userId = (session.user as any).id;

  const saved = await prisma.savedProperty.findMany({
    where: { userId },
    include: {
      property: {
        select: {
          id: true, title: true, type: true, purpose: true,
          price: true, priceUnit: true, locality: true,
          bedrooms: true, area: true, images: true,
          contactPhone: true, contactWhatsapp: true,
          isVerified: true, isFeatured: true, isAvailable: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const properties = saved.map(s => s.property).filter(p => p.isAvailable);
  const savedIds = properties.map(p => p.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="p-2 rounded-xl hover:bg-[var(--surface-alt)] transition-colors"
          style={{ color: "var(--text-tertiary)" }}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Heart className="w-6 h-6 fill-current" style={{ color: "#EF4444" }} />
            Saved Properties
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            {properties.length} {properties.length === 1 ? "property" : "properties"} saved
          </p>
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-20 rounded-2xl" style={{ background: "var(--surface-alt)" }}>
          <Heart className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
            No saved properties yet
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
            Tap the ❤️ on any listing to save it here for later.
          </p>
          <Link href="/properties" className="btn-primary px-6 py-2.5 rounded-xl text-sm">
            Browse Properties
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map(p => (
            <PropertyCard key={p.id} property={p} savedIds={savedIds} />
          ))}
        </div>
      )}
    </div>
  );
}
