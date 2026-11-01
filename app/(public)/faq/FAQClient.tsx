"use client";
import { useState } from "react";
import { ChevronDown, MessageCircle } from "lucide-react";
import Link from "next/link";
import { PageHead } from "@/components/genz/PageHead";

const FAQ_DATA = [
  {
    category: "General",
    faqs: [
      { q: "What is YourMithila?", a: "YourMithila is a hyperlocal platform for the Mithila Region of Bihar, connecting property owners with seekers and employers with job seekers — all in one place." },
      { q: "Is it free to use?", a: "Browsing properties and jobs is completely free — no account needed. Listing a property or job requires a subscription starting at ₹99/month." },
      { q: "What areas are covered?", a: "Madhubani, Darbhanga, Sitamarhi, Muzaffarpur, Samastipur and all surrounding districts of Mithila Region, Bihar." },
      { q: "How do I contact support?", a: "Email yourmithila.official@gmail.com or WhatsApp +91 70336 69971. We respond within 24 hours." },
      { q: "Is my data safe?", a: "Yes. We use HTTPS, bcrypt password hashing and never share your data with third parties." },
    ],
  },
  {
    category: "Properties",
    faqs: [
      { q: "How do I list my property?", a: "Register as an Owner → Subscribe to a plan → Dashboard → Add Listing. Fill in details, upload photos, and publish. Your listing goes live after admin verification." },
      { q: "How many photos can I upload?", a: "Basic plan: 3 photos. Standard plan: 8 photos. Pro plan: 10 photos per listing." },
      { q: "How long is my listing active?", a: "Monthly plans keep your listing active for 30 days. Renew anytime from your dashboard before it expires." },
      { q: "How do I contact a property owner?", a: "Every listing has a WhatsApp button that connects you directly with the owner — no middlemen, no commission, no registration needed." },
      { q: "What does 'Verified' mean?", a: "Listings reviewed by our admin team for authenticity. Look for the blue checkmark badge on verified listings." },
      { q: "What happens when my listing expires?", a: "Your listing is hidden from public view after 30 days. You'll receive a WhatsApp reminder before expiry. Simply renew your subscription from your dashboard to reactivate it." },
    ],
  },
  {
    category: "Jobs",
    faqs: [
      { q: "How do I post a job?", a: "Register as an Owner → Get Standard or Pro plan → Dashboard → Post Job. Fill in the details and submit for verification." },
      { q: "How do I apply for a job?", a: "Click 'Apply via WhatsApp' on any job listing to directly contact the employer. No account needed to apply." },
      { q: "What job types are available?", a: "Full Time, Part Time, Contract, and Daily Wage jobs across Hotel, Hospital, School, Shop, Factory, Office and other sectors." },
      { q: "Is job search free?", a: "Yes — searching and applying is completely free for all users. No account required." },
      { q: "Can I post jobs on the Basic plan?", a: "No. Job posting is available on Standard and Pro plans only. The Basic plan is for property listings only." },
    ],
  },
  {
    category: "Payments & Subscriptions",
    faqs: [
      { q: "How do I pay for a subscription?", a: "Payments are processed securely via Razorpay — UPI, credit/debit cards, net banking, and wallets are all accepted." },
      { q: "Are subscriptions refundable?", a: "Subscription fees are non-refundable once a plan is activated. If you face any issue, contact us within 24 hours and we'll do our best to help." },
      { q: "When does my subscription activate?", a: "Activation happens instantly for online payments via Razorpay. If you face any delay, WhatsApp us at +91 70336 69971." },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:opacity-90"
        style={{ background: "var(--surface)" }}
        aria-expanded={open}
      >
        <p className="font-semibold text-sm pr-4" style={{ color: "var(--text-primary)" }}>{q}</p>
        <ChevronDown
          className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--text-tertiary)" }}
        />
      </button>
      {open && (
        <div className="px-5 py-4 border-t" style={{ background: "var(--surface-alt)", borderColor: "var(--border)" }}>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQClient() {
  return (
    <>
    <PageHead title="Questions, answered" sub="अक्सर पूछे जाने वाले प्रश्न" />
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">

      <div className="space-y-8">
        {FAQ_DATA.map(({ category, faqs }) => (
          <div key={category}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
              <span className="w-3 h-3 rotate-45 inline-block flex-shrink-0 border-2" style={{ background: "var(--haldi)", borderColor: "var(--line)" }} />
              {category}
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => <FAQItem key={i} {...faq} />)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-2xl p-6 text-center border" style={{ background: "var(--surface-alt)", borderColor: "var(--border)" }}>
        <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Still have questions?</p>
        <p className="text-sm mb-4" style={{ color: "var(--text-tertiary)" }}>
          Contact us — we respond within 24 hours
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://wa.me/917033669971?text=Hi, I have a question about Your Mithila"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:opacity-90"
            style={{ background: "#25D366" }}
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp Us
          </a>
          <Link href="/contact"
            className="inline-flex items-center justify-center gap-2 font-semibold px-6 py-2.5 rounded-xl text-sm border hover:opacity-90"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
          >
            Contact Form
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
