import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Property — YourMithila" };

// ── Client form is kept separate so the server wrapper can guard it ──────────
import { NewListingClientForm } from "@/components/dashboard/NewListingClientForm";

export default async function NewListingPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/dashboard/listings/new");

  const userId = (session.user as any).id as string;
  const role   = (session.user as any).role as string;

  if (role === "SEEKER") redirect("/");

  // ── FREE FIRST LISTING RULE ──────────────────────────────────────────────
  // The first property listing is always free — no subscription required.
  // Only require a subscription for the 2nd listing onwards.
  const existingCount = await prisma.property.count({ where: { ownerId: userId } }).catch(() => 0);
  const isFirstListing = existingCount === 0;

  // Check active subscription (only needed for 2nd listing+)
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE", endDate: { gt: new Date() } },
  }).catch(() => null);

  if (!isFirstListing && !subscription) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--warning)" }} />
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
          Subscription Required
        </h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
          Your first listing is free. Subscribe to add more listings.
        </p>
        <Link href="/dashboard/subscription"
          className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm">
          Subscribe Now <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Check listing count vs plan limit (only for subscribed users)
  if (!isFirstListing && subscription) {
    const PLAN_LIMITS: Record<string, number> = { BASIC: 1, STANDARD: 3, PRO: -1, YEARLY_STANDARD: 3 };
    const limit = PLAN_LIMITS[subscription.plan] ?? 1;
    if (limit !== -1 && existingCount >= limit) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--warning)" }} />
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            Listing Limit Reached
          </h1>
          <p className="text-sm mb-2" style={{ color: "var(--text-tertiary)" }}>
            Your <strong>{subscription.plan.replace("_", " ")}</strong> plan allows {limit} listing{limit > 1 ? "s" : ""}.
            You have used all {limit}.
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
            Upgrade to Pro for unlimited listings.
          </p>
          <Link href="/dashboard/subscription"
            className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm">
            Upgrade Plan <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      );
    }
  }

  const planLabel = isFirstListing
    ? "Free first listing"
    : subscription ? `${subscription.plan.replace("_", " ")} plan` : "";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24">
      <div className="mb-6">
        <Link href="/dashboard"
          className="text-sm hover:opacity-80 transition-opacity flex items-center gap-1"
          style={{ color: "var(--text-tertiary)" }}>
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold mt-2" style={{ color: "var(--text-primary)" }}>
          Add New Listing
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
          {planLabel}
        </p>
      </div>
      <NewListingClientForm />
    </div>
  );
}
