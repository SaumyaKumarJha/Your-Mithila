import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Plus, Home, Briefcase, Eye, CreditCard,
  ArrowRight, AlertTriangle, CheckCircle2,
  Heart, MapPin, MessageCircle, BadgeCheck,
} from "lucide-react";
import { ListingCard } from "@/components/dashboard/ListingCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard | YourMithila" };

// ─── Seeker: saved property card ─────────────────────────────────────────────
function SavedPropertyCard({ p }: {
  p: {
    id: string; title: string; type: string; purpose: string;
    price: number; priceUnit: string; locality: string;
    images: string[]; contactPhone: string; contactWhatsapp: string | null;
    isVerified: boolean; isAvailable: boolean;
  };
}) {
  const phone = p.contactWhatsapp || p.contactPhone;
  const waMsg = `Hi, I saw your listing on Your Mithila - "${p.title}". I am interested.`;
  const TYPE_EMOJI: Record<string, string> = {
    FLAT: "🏢", ROOM: "🛏️", HOUSE: "🏠", SHOP: "🏪",
    LAND: "🌿", WAREHOUSE: "🏭", OFFICE: "💼", VACANT_SPACE: "📦",
  };

  return (
    <div className="card-warm rounded-2xl overflow-hidden relative">
      {/* Availability badge */}
      {!p.isAvailable && (
        <div className="absolute top-2 left-2 z-10 text-xs font-bold px-2 py-1 rounded-full text-white"
          style={{ background: "var(--error)" }}>
          Filled / Taken
        </div>
      )}

      {/* Image */}
      <Link href={`/properties/${p.id}`}>
        <div className="relative h-44 overflow-hidden" style={{ background: "var(--surface-alt)" }}>
          {p.images?.[0] ? (
            <img src={p.images[0]} alt={p.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">
              {TYPE_EMOJI[p.type] ?? "🏠"}
            </div>
          )}
          <div className="absolute top-2 right-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
              style={{ background: p.purpose === "RENT" ? "var(--secondary)" : "var(--primary)" }}>
              {p.purpose === "RENT" ? "Rent" : "Sale"}
            </span>
          </div>
        </div>
      </Link>

      {/* Body */}
      <div className="p-3">
        <p className="text-xs flex items-center gap-1 mb-0.5" style={{ color: "var(--text-tertiary)" }}>
          <MapPin className="w-3 h-3" /> {p.locality}
          {p.isVerified && <BadgeCheck className="w-3.5 h-3.5 ml-1" style={{ color: "var(--info)" }} />}
        </p>
        <Link href={`/properties/${p.id}`}>
          <h3 className="font-semibold text-sm truncate hover:text-[var(--primary)] transition-colors"
            style={{ color: "var(--text-primary)" }}>
            {p.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-2">
          <p className="font-bold text-sm" style={{ color: "var(--primary)" }}>
            ₹{p.price.toLocaleString("en-IN")}
            <span className="font-normal text-xs" style={{ color: "var(--text-tertiary)" }}>
              {p.priceUnit === "MONTHLY" ? "/mo" : p.priceUnit === "YEARLY" ? "/yr" : ""}
            </span>
          </p>
          <a href={`https://wa.me/91${phone.replace(/\D/g, "")}?text=${encodeURIComponent(waMsg)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full text-white transition-colors hover:opacity-90"
            style={{ background: "#25D366" }}>
            <MessageCircle className="w-3 h-3" /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const userId = (session.user as any).id;
  const role   = (session.user as any).role as "OWNER" | "ADMIN" | "SEEKER";

  // ── SEEKER view ─────────────────────────────────────────────────────────────
  if (role === "SEEKER") {
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
    });

    const saved     = savedRows.map(r => r.property);
    const available = saved.filter(p => p.isAvailable);
    const taken     = saved.filter(p => !p.isAvailable);

    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
              My Saved Properties
            </h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              Welcome back, {session.user.name} · {saved.length} saved
            </p>
          </div>
          <Link href="/properties"
            className="btn-primary text-sm px-4 py-2 rounded-xl flex items-center gap-1.5 self-start sm:self-auto">
            <Home className="w-4 h-4" /> Browse Properties
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Saved",      value: saved.length,     icon: Heart,  color: "#EF4444" },
            { label: "Still Available",  value: available.length, icon: CheckCircle2, color: "var(--success)" },
            { label: "Filled / Taken",   value: taken.length,     icon: AlertTriangle, color: "var(--warning)" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card-warm rounded-xl p-4">
              <Icon className="w-5 h-5 mb-2" style={{ color }} />
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Available properties */}
        {available.length > 0 && (
          <div className="mb-8">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <CheckCircle2 className="w-5 h-5" style={{ color: "var(--success)" }} />
              Available ({available.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {available.map(p => <SavedPropertyCard key={p.id} p={p} />)}
            </div>
          </div>
        )}

        {/* Taken properties */}
        {taken.length > 0 && (
          <div className="mb-8">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: "var(--text-tertiary)" }}>
              <AlertTriangle className="w-5 h-5" style={{ color: "var(--warning)" }} />
              No Longer Available ({taken.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
              {taken.map(p => <SavedPropertyCard key={p.id} p={p} />)}
            </div>
          </div>
        )}

        {/* Empty state */}
        {saved.length === 0 && (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed"
            style={{ background: "var(--surface-alt)", borderColor: "var(--border)" }}>
            <Heart className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
            <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>No saved properties yet</p>
            <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>
              Tap ❤️ on any listing to save it here
            </p>
            <Link href="/properties" className="btn-primary text-sm px-6 py-2.5 rounded-xl">
              Browse Properties
            </Link>
          </div>
        )}

        {/* Profile shortcut */}
        <div className="mt-6 rounded-xl p-4 flex items-center justify-between"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Your Profile</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              Update your name, phone, and location
            </p>
          </div>
          <Link href="/dashboard/profile"
            className="text-sm flex items-center gap-1 font-medium hover:opacity-80"
            style={{ color: "var(--primary)" }}>
            Edit <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  // ── OWNER / ADMIN view ───────────────────────────────────────────────────────
  const [properties, jobs, subscription] = await Promise.all([
    prisma.property.findMany({
      where: { ownerId: userId },
      orderBy: [{ isAvailable: "desc" }, { createdAt: "desc" }],
    }),
    prisma.job.findMany({
      where: { postedById: userId },
      orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    }),
    prisma.subscription.findUnique({ where: { userId } }),
  ]);

  const totalViews = properties.reduce((s, p) => s + p.viewCount, 0)
                   + jobs.reduce((s, j) => s + j.viewCount, 0);
  const totalEnquiries = await prisma.enquiry.count({
    where: {
      OR: [
        { propertyId: { in: properties.map(p => p.id) } },
        { jobId:      { in: jobs.map(j => j.id)       } },
      ],
    },
  });

  const subActive = subscription?.status === "ACTIVE" && subscription.endDate > new Date();
  const daysLeft  = subActive && subscription
    ? Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / 86400000)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-tertiary)" }}>
            Welcome back, {session.user.name}
            {role === "ADMIN" && (
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                Admin
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/dashboard/listings/new"
            className="btn-primary text-sm px-4 py-2 rounded-xl flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Listing
          </Link>
          <Link href="/dashboard/jobs/new"
            className="text-sm font-medium px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 text-white hover:opacity-90"
            style={{ background: "var(--secondary)" }}>
            <Plus className="w-4 h-4" /> Post Job
          </Link>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Listings",  value: properties.filter(p => p.isAvailable).length, icon: Home,      color: "var(--primary)"                        },
          { label: "Active Jobs",      value: jobs.filter(j => j.isActive).length,          icon: Briefcase, color: "var(--secondary)"                      },
          { label: "Total Views",      value: totalViews,                                   icon: Eye,       color: "var(--success)"                        },
          { label: "Total Enquiries",  value: totalEnquiries,                                icon: MessageCircle, color: "var(--info)"                       },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card-warm rounded-xl p-4">
            <Icon className="w-5 h-5 mb-2" style={{ color }} />
            <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Subscription banners ── */}
      {!subActive && properties.length === 0 && (
        // First-time owner: show a friendly "get started" banner, not a paywall
        <div className="rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ background: "var(--success-light)", border: "1px solid var(--success)" }}>
          <div>
            <p className="font-semibold text-sm flex items-center gap-1.5" style={{ color: "var(--success)" }}>
              <CheckCircle2 className="w-4 h-4" /> Your first listing is free!
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--success)" }}>
              Add your first property — no subscription needed. Subscribe later to add more.
            </p>
          </div>
          <Link href="/dashboard/listings/new"
            className="btn-primary text-sm px-4 py-2 rounded-xl whitespace-nowrap self-start sm:self-auto">
            Add Free Listing
          </Link>
        </div>
      )}

      {!subActive && properties.length > 0 && (
        <div className="rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ background: "var(--error-light)", border: "1px solid var(--error)" }}>
          <div>
            <p className="font-semibold text-sm flex items-center gap-1.5" style={{ color: "var(--error)" }}>
              <AlertTriangle className="w-4 h-4" /> No active subscription
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--error)" }}>
              Subscribe to add more listings and post jobs
            </p>
          </div>
          <Link href="/dashboard/subscription"
            className="btn-primary text-sm px-4 py-2 rounded-xl whitespace-nowrap self-start sm:self-auto">
            Subscribe Now
          </Link>
        </div>
      )}

      {subActive && daysLeft <= 7 && (
        <div className="rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{ background: "var(--warning-light)", border: "1px solid var(--warning)" }}>
          <div>
            <p className="font-semibold text-sm flex items-center gap-1.5" style={{ color: "var(--warning)" }}>
              <AlertTriangle className="w-4 h-4" />
              Subscription expires in {daysLeft} day{daysLeft !== 1 ? "s" : ""}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--warning)" }}>
              Renew now to keep your listings visible
            </p>
          </div>
          <Link href="/dashboard/subscription"
            className="text-sm font-semibold px-4 py-2 rounded-xl whitespace-nowrap self-start sm:self-auto text-white"
            style={{ background: "var(--warning)" }}>
            Renew Now
          </Link>
        </div>
      )}

      {subActive && daysLeft > 7 && subscription && (
        <div className="rounded-xl p-4 mb-6 flex items-center justify-between"
          style={{ background: "var(--success-light)", border: "1px solid var(--success)" }}>
          <div>
            <p className="font-semibold text-sm flex items-center gap-1.5" style={{ color: "var(--success)" }}>
              <CheckCircle2 className="w-4 h-4" /> {subscription.plan.replace("_", " ")} Plan — Active
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--success)" }}>
              Expires {new Date(subscription.endDate).toLocaleDateString("en-IN")} · {daysLeft} days remaining
            </p>
          </div>
          <Link href="/dashboard/subscription"
            className="text-sm flex items-center gap-1 hover:underline" style={{ color: "var(--success)" }}>
            Manage <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ── My Property Listings ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
            My Property Listings
            <span className="ml-2 text-sm font-normal" style={{ color: "var(--text-tertiary)" }}>
              ({properties.filter(p => p.isAvailable).length} active / {properties.length} total)
            </span>
          </h2>
          <Link href="/dashboard/listings/new"
            className="text-xs flex items-center gap-1 font-medium hover:underline"
            style={{ color: "var(--primary)" }}>
            <Plus className="w-3 h-3" /> Add new
          </Link>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border-2 border-dashed"
            style={{ background: "var(--surface-alt)", borderColor: "var(--border)" }}>
            <p className="text-3xl mb-2">🏠</p>
            <p className="text-sm mb-1 font-medium" style={{ color: "var(--text-primary)" }}>No listings yet</p>
            <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>
              {properties.length === 0 && !subActive
                ? "Your first listing is free — add it now!"
                : subActive
                ? "Start by adding your first property listing."
                : "Subscribe first to unlock listings."}
            </p>
            {(subActive || properties.length === 0) ? (
              <Link href="/dashboard/listings/new"
                className="btn-primary text-sm px-5 py-2 rounded-xl">
                Add First Listing →
              </Link>
            ) : (
              <Link href="/dashboard/subscription"
                className="btn-primary text-sm px-5 py-2 rounded-xl">
                Get a Plan →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map(p => (
              <ListingCard
                key={p.id}
                id={p.id}
                title={p.title}
                locality={p.locality}
                price={p.price}
                priceUnit={p.priceUnit}
                viewCount={p.viewCount}
                isAvailable={p.isAvailable}
                isVerified={p.isVerified}
                isFeatured={p.isFeatured}
                type="property"
              />
            ))}
          </div>
        )}
      </div>

      {/* ── My Job Postings ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
            My Job Postings
            <span className="ml-2 text-sm font-normal" style={{ color: "var(--text-tertiary)" }}>
              ({jobs.filter(j => j.isActive).length} active / {jobs.length} total)
            </span>
          </h2>
          <Link href="/dashboard/jobs/new"
            className="text-xs flex items-center gap-1 font-medium hover:underline"
            style={{ color: "var(--secondary)" }}>
            <Plus className="w-3 h-3" /> Post new
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border-2 border-dashed"
            style={{ background: "var(--surface-alt)", borderColor: "var(--border)" }}>
            <p className="text-3xl mb-2">💼</p>
            <p className="text-sm mb-1 font-medium" style={{ color: "var(--text-primary)" }}>No job postings yet</p>
            <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>
              {subActive ? "Post your first job to find local candidates." : "Standard or Pro plan required for jobs."}
            </p>
            {subActive ? (
              <Link href="/dashboard/jobs/new"
                className="text-sm font-semibold px-5 py-2 rounded-xl text-white hover:opacity-90"
                style={{ background: "var(--secondary)" }}>
                Post First Job →
              </Link>
            ) : (
              <Link href="/dashboard/subscription"
                className="btn-primary text-sm px-5 py-2 rounded-xl">
                Upgrade Plan →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map(j => (
              <ListingCard
                key={j.id}
                id={j.id}
                title={j.title}
                locality={j.locality}
                viewCount={j.viewCount}
                isAvailable={j.isActive}
                isVerified={j.isVerified}
                isFeatured={j.isFeatured}
                type="job"
                organization={j.organization}
                jobType={j.jobType}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
