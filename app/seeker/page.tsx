import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MapPin, MessageCircle, BadgeCheck, Heart, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Account — YourMithila" };

const TYPE_ICONS: Record<string, string> = {
  FLAT: "🏢", ROOM: "🛏️", HOUSE: "🏠", SHOP: "🏪",
  LAND: "🌿", WAREHOUSE: "🏭", OFFICE: "💼", VACANT_SPACE: "📦",
};

export default async function SeekerPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/seeker");
  }

  const userId = (session.user as any).id as string | undefined;
  const role   = (session.user as any).role as string | undefined;

  if (!userId) redirect("/auth/login");

  // Owners and admins go to /dashboard
  if (role === "OWNER" || role === "ADMIN") redirect("/dashboard");

  // No role set yet → choose role first
  if (!role) redirect("/choose-role");

  const savedRows = await prisma.savedProperty.findMany({
    where: { userId },
    include: {
      property: {
        select: {
          id: true, title: true, type: true, purpose: true,
          price: true, priceUnit: true, locality: true,
          images: true, contactPhone: true, contactWhatsapp: true,
          isVerified: true, isAvailable: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  }).catch(() => []);

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Welcome, {session.user.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
            Your saved listings and quick actions
          </p>
        </div>

        {/* Quick action cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            href="/properties"
            className="rounded-2xl border p-5 transition-all hover:border-[var(--primary)] group"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="text-3xl mb-3">🏠</div>
            <p className="font-semibold text-sm group-hover:text-[var(--primary)] transition-colors"
              style={{ color: "var(--text-primary)" }}>
              Browse Properties
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
              Flats, rooms, shops, land
            </p>
          </Link>

          <Link
            href="/jobs"
            className="rounded-2xl border p-5 transition-all hover:border-[var(--primary)] group"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="text-3xl mb-3">💼</div>
            <p className="font-semibold text-sm group-hover:text-[var(--primary)] transition-colors"
              style={{ color: "var(--text-primary)" }}>
              Browse Jobs
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
              Local opportunities near you
            </p>
          </Link>
        </div>

        {/* Saved properties */}
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
            Saved Properties
            <span className="text-sm font-normal ml-2" style={{ color: "var(--text-tertiary)" }}>
              ({savedRows.length})
            </span>
          </h2>

          {savedRows.length === 0 ? (
            <div
              className="rounded-2xl border-2 border-dashed p-10 text-center"
              style={{ background: "var(--surface-alt)", borderColor: "var(--border)" }}
            >
              <Heart className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                No saved properties yet
              </p>
              <p className="text-sm mb-5" style={{ color: "var(--text-tertiary)" }}>
                Tap the ❤️ on any listing to save it here
              </p>
              <Link href="/properties" className="btn-primary text-sm px-6 py-2.5 rounded-xl">
                Browse Properties
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {savedRows.map(({ property: p }) => {
                const phone  = p.contactWhatsapp || p.contactPhone;
                const waMsg  = `Hi, I saw your listing on Your Mithila — "${p.title}". I am interested.`;
                const waUrl  = `https://wa.me/91${phone.replace(/\D/g, "")}?text=${encodeURIComponent(waMsg)}`;

                return (
                  <div
                    key={p.id}
                    className="rounded-2xl border p-4 flex items-center gap-4"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    {/* Type icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: "var(--primary-light)" }}
                    >
                      {TYPE_ICONS[p.type] ?? "🏠"}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: "var(--text-primary)" }}>
                        {p.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-tertiary)" }}>
                          <MapPin className="w-3 h-3" />{p.locality}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
                          ₹{p.price.toLocaleString("en-IN")}
                          {p.priceUnit === "MONTHLY" ? "/mo" : p.priceUnit === "YEARLY" ? "/yr" : ""}
                        </span>
                        {p.isVerified && (
                          <BadgeCheck className="w-3.5 h-3.5" style={{ color: "var(--info)" }} />
                        )}
                        {!p.isAvailable && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: "var(--error-light)", color: "var(--error)" }}
                          >
                            Filled
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-colors hover:opacity-90"
                        style={{ background: "#25D366" }}
                        aria-label="Contact via WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                      <Link
                        href={`/properties/${p.id}`}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors hover:opacity-90"
                        style={{ color: "var(--primary)", borderColor: "var(--primary)" }}
                      >
                        View
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Switch to owner prompt */}
        <div
          className="mt-8 p-4 rounded-2xl border"
          style={{ background: "var(--primary-light)", borderColor: "var(--border)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--primary)" }}>
            Do you own a property or business?
          </p>
          <p className="text-xs mt-0.5 mb-3" style={{ color: "var(--text-secondary)" }}>
            Switch to Owner to list properties or post jobs.
          </p>
          <Link
            href="/choose-role"
            className="inline-flex items-center gap-1.5 btn-primary text-sm px-4 py-2 rounded-xl"
          >
            Switch to Owner Account <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
