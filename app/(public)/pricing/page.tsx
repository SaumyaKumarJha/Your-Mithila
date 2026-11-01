import type { Metadata } from "next";
import { PricingClient } from "@/components/pricing/PricingClient";
import { PageHead } from "@/components/genz/PageHead";

export const metadata: Metadata = {
  title: "Subscription Plans — List Property in Madhubani Starting ₹99",
  description:
    "List your property in Madhubani starting at ₹99 per month. Reach hundreds of verified seekers. Verified badge, WhatsApp contact, priority search.",
  openGraph: {
    title: "List Property in Madhubani | Pricing | YourMithila",
    description:
      "Affordable plans to list your property in Madhubani Bihar.",
    url: "https://yourmithila.in/pricing",
  },
  alternates: { canonical: "https://yourmithila.in/pricing" },
};

export default function PricingPage() {
  return (
    <>
    <PageHead title="Simple, transparent pricing" sub="सरल और पारदर्शी मूल्य">
      <span className="gz-chip">No hidden charges</span>
      <span className="gz-chip">Pay by UPI, card or net banking</span>
    </PageHead>
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

      <PricingClient />

      <div className="mt-14 card-warm !transform-none p-6 text-center" style={{ background: "var(--surface-alt)" }}>
        <h2 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>Already registered?</h2>
        <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
          Go to your dashboard to subscribe and start listing
        </p>
        <a href="/dashboard/subscription"
          className="inline-block font-medium px-6 py-2.5 rounded-xl transition-colors text-sm text-white"
          style={{ background: "var(--primary)" }}>
          Go to Subscription
        </a>
      </div>

      <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
        🔒 Payments secured by Razorpay • UPI, Cards, Net Banking, Wallets accepted
      </p>
    </div>
    </>
  );
}
