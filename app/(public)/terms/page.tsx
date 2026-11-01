import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — YourMithila",
  description: "Terms of service for YourMithila — the property and jobs platform for Mithila Region, Bihar.",
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>
        Terms of Service
      </h1>
      <div className="space-y-6 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        <p>
          <strong style={{ color: "var(--text-primary)" }}>Last updated:</strong> July 2026
        </p>

        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>1. Acceptance</h2>
        <p>
          By using YourMithila (yourmithila.in), you agree to these terms. If you do not agree, do not use the platform.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>2. Listings</h2>
        <p>
          Property owners are responsible for the accuracy of their listings. YourMithila does not guarantee
          the accuracy of any listing. We reserve the right to remove any listing that violates our guidelines.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>3. Payments</h2>
        <p>
          Subscription fees are non-refundable once a plan is activated. Payments are processed via Razorpay
          (UPI, cards, net banking). Activation occurs within 24 hours of payment verification.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>4. Prohibited use</h2>
        <p>
          You may not post fake listings, spam, misleading information, or content that violates Indian law.
          Violations will result in account suspension.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>5. Contact</h2>
        <p>
          For questions, contact us at{" "}
          <a href="mailto:yourmithila.official@gmail.com" style={{ color: "var(--primary)" }}>
            yourmithila.official@gmail.com
          </a>{" "}
          or WhatsApp{" "}
          <a href="https://wa.me/917033669971" style={{ color: "var(--primary)" }}>
            +91 70336 69971
          </a>.
        </p>
      </div>
    </div>
  );
}
