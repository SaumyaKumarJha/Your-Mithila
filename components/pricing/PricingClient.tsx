"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    id: "BASIC",
    name: "Basic",
    monthlyPrice: 99,
    popular: false,
    bestFor: "Single homeowners renting or selling one property",
    features: ["1 property listing", "3 photos per listing", "WhatsApp contact", "30 days validity"],
    notIncluded: ["Priority in search", "Job postings", "Featured badge"],
  },
  {
    id: "STANDARD",
    name: "Standard",
    monthlyPrice: 249,
    popular: true,
    bestFor: "Property owners with multiple listings or small businesses hiring staff",
    features: ["3 property listings", "8 photos per listing", "WhatsApp contact", "Priority in search", "2 job postings", "30 days validity"],
    notIncluded: ["Featured badge"],
  },
  {
    id: "PRO",
    name: "Pro",
    monthlyPrice: 499,
    popular: false,
    bestFor: "Real estate agents, builders, or businesses with ongoing hiring needs",
    features: ["Unlimited listings", "10 photos per listing", "WhatsApp contact", "Priority in search", "Unlimited job posts", "Featured badge", "30 days validity"],
    notIncluded: [],
  },
];

export function PricingClient({ plans: _plans }: { plans?: any[] }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [yearly, setYearly] = useState(false);
  const role = (session?.user as any)?.role;

  const handlePlanClick = (planId: string) => {
    if (!session) {
      router.push("/auth/register");
      return;
    }
    if (role === "SEEKER") {
      router.push("/choose-role");
      return;
    }
    router.push(`/dashboard/subscription?plan=${planId}`);
  };

  return (
    <div>
      {/* Yearly toggle */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={`text-sm font-medium transition-colors ${!yearly ? "" : "opacity-40"}`}
          style={{ color: "var(--text-primary)" }}>
          Monthly
        </span>
        <button
          onClick={() => setYearly(y => !y)}
          className="relative w-14 h-8 rounded-full transition-colors flex-shrink-0 border-2"
          style={{ background: yearly ? "var(--pan)" : "var(--surface)", borderColor: "var(--line)" }}
          aria-label="Toggle yearly billing"
          aria-pressed={yearly}
        >
          <span className={`absolute top-1 w-5 h-5 rounded-full transition-all border-2 ${yearly ? "left-7" : "left-1"}`} style={{ background: "var(--haldi)", borderColor: "#1D1410" }} />
        </button>
        <span className={`text-sm font-medium transition-colors ${yearly ? "" : "opacity-40"}`}
          style={{ color: "var(--text-primary)" }}>
          Yearly{" "}
          <span className="gz-tag gz-tag-rent ml-1">Save 20%</span>
        </span>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {PLANS.map(plan => {
          const price    = yearly ? Math.round(plan.monthlyPrice * 12 * 0.8) : plan.monthlyPrice;
          const perMonth = yearly ? Math.round(plan.monthlyPrice * 0.8)      : plan.monthlyPrice;

          return (
            <div key={plan.id}
              className="card-warm gz-tilt p-6 flex flex-col"
              style={plan.popular ? { background: "var(--surface-alt)" } : undefined}>
              {plan.popular && (
                <span className="gz-tag gz-tag-feat absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap !text-[13px]">
                  Most popular ⭐
                </span>
              )}

              <div className="mb-5">
                <p className="font-heading font-extrabold text-2xl mb-1" style={{ color: "var(--text-primary)" }}>{plan.name}</p>
                <p className="text-xs mb-3 leading-snug" style={{ color: "var(--text-tertiary)" }}>
                  <span className="font-medium" style={{ color: "var(--primary)" }}>Best for:</span> {plan.bestFor}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="font-heading text-5xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>₹{price}</span>
                  <span className="text-sm" style={{ color: "var(--text-tertiary)" }}>/{yearly ? "year" : "mo"}</span>
                </div>
                {yearly && (
                  <p className="text-xs text-green-600 mt-1">₹{perMonth}/month billed yearly</p>
                )}
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <span className="text-green-500 mt-0.5 flex-shrink-0">✅</span>{f}
                  </li>
                ))}
                {plan.notIncluded.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm line-through" style={{ color: "var(--text-muted)" }}>
                    <span className="text-red-400 mt-0.5 flex-shrink-0">❌</span>{f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanClick(plan.id)}
                className={`${plan.popular ? "btn-primary" : "btn-outline"} !w-full !py-3`}>
                {session ? "Subscribe now" : "Get started"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
