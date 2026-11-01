import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Post a Job — YourMithila" };

import { NewJobClientForm } from "@/components/dashboard/NewJobClientForm";

export default async function NewJobPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login?callbackUrl=/dashboard/jobs/new");

  const userId = (session.user as any).id as string;
  const role   = (session.user as any).role as string;

  if (role === "SEEKER") redirect("/");

  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE", endDate: { gt: new Date() } },
  }).catch(() => null);

  if (!subscription) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--warning)" }} />
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Subscription Required</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
          You need an active Standard, Pro, or Yearly plan to post jobs.
        </p>
        <Link href="/dashboard/subscription"
          className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm">
          Subscribe Now <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const jobAllowedPlans = new Set(["STANDARD", "PRO", "YEARLY_STANDARD"]);
  if (!jobAllowedPlans.has(subscription.plan)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--warning)" }} />
        <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Upgrade Required</h1>
        <p className="text-sm mb-2" style={{ color: "var(--text-tertiary)" }}>
          Job postings require Standard, Pro, or Yearly plan.
        </p>
        <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
          Your current plan: <strong>{subscription.plan}</strong>
        </p>
        <Link href="/dashboard/subscription"
          className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm">
          Upgrade Plan <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-24">
      <div className="mb-6">
        <Link href="/dashboard"
          className="text-sm hover:opacity-80 transition-opacity flex items-center gap-1"
          style={{ color: "var(--text-tertiary)" }}>
          ← Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold mt-2" style={{ color: "var(--text-primary)" }}>Post a Job</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>Find candidates for your organization</p>
      </div>
      <NewJobClientForm />
    </div>
  );
}
