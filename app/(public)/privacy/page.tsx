import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — YourMithila",
  description: "Privacy policy for YourMithila — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>
        Privacy Policy
      </h1>
      <div className="space-y-6 text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        <p>
          <strong style={{ color: "var(--text-primary)" }}>Last updated:</strong> July 2026
        </p>

        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>What we collect</h2>
        <p>
          We collect your name, email, and phone number when you register. We collect property details when
          you create a listing. We do not sell your data to anyone.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>How we use it</h2>
        <p>
          Your contact details are shown to seekers who want to reach you about your listing. Your email is
          used to send OTP codes and subscription notifications. Your phone may be used for WhatsApp verification.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Data storage</h2>
        <p>
          Your data is stored securely on Supabase (PostgreSQL) servers. We use industry-standard encryption.
          We do not store payment card details — payments are processed securely by Razorpay.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Your rights</h2>
        <p>
          You can request deletion of your account and all associated data at any time by emailing{" "}
          <a href="mailto:yourmithila.official@gmail.com" style={{ color: "var(--primary)" }}>
            yourmithila.official@gmail.com
          </a>.
        </p>

        <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Contact</h2>
        <p>
          Privacy questions:{" "}
          <a href="mailto:yourmithila.official@gmail.com" style={{ color: "var(--primary)" }}>
            yourmithila.official@gmail.com
          </a>
        </p>
      </div>
    </div>
  );
}
