"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

const FAQS = [
  { q: "How do I list my property?",  qHi: "अपनी संपत्ति कैसे लिस्ट करें?", a: "Register as an Owner, choose a subscription plan, and post your property with photos and details.", aHi: "Owner के रूप में रजिस्टर करें, सब्सक्रिप्शन प्लान चुनें, और अपनी संपत्ति पोस्ट करें।" },
  { q: "Is it free to search?",       qHi: "क्या खोजना मुफ्त है?",           a: "Yes! Browsing properties and jobs is completely free. No registration needed to view listings.", aHi: "हाँ! संपत्ति और नौकरी देखना बिल्कुल मुफ्त है।" },
  { q: "How do I contact the owner?", qHi: "मालिक से कैसे संपर्क करें?",     a: "Each listing has a WhatsApp button. Click it to directly message the owner — no middlemen!", aHi: "हर लिस्टिंग में WhatsApp बटन है। सीधे मालिक से बात करें।" },
  { q: "What areas are covered?",     qHi: "कौन से क्षेत्र शामिल हैं?",      a: "We cover the entire Mithila Region — Madhubani, Darbhanga, Sitamarhi, Muzaffarpur and surrounding districts.", aHi: "हम पूरे मिथिला क्षेत्र को कवर करते हैं।" },
  { q: "How do I post a job?",        qHi: "नौकरी कैसे पोस्ट करें?",         a: "Register as an Owner, get a Standard or Pro plan, and post jobs from your dashboard.", aHi: "Owner के रूप में रजिस्टर करें, Standard या Pro प्लान लें।" },
  { q: "Is my data safe?",            qHi: "क्या मेरा डेटा सुरक्षित है?",    a: "Yes. We use industry-standard encryption and never share your data with third parties.", aHi: "हाँ। हम उद्योग-मानक एन्क्रिप्शन का उपयोग करते हैं।" },
];

function FAQItem({ faq }: { faq: typeof FAQS[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
        style={{ background: open ? "var(--primary-light)" : "var(--surface)" }}>
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{faq.q}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>{faq.qHi}</p>
        </div>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 ml-3 transition-transform`} style={{ color: "var(--text-muted)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>
      {open && (
        <div className="px-5 py-4 border-t" style={{ background: "var(--primary-light)", borderColor: "var(--border-light)" }}>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{faq.a}</p>
          <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>{faq.aHi}</p>
        </div>
      )}
    </div>
  );
}

export function FAQSection() {
  return (
    <section className="py-12 px-4" style={{ background: "var(--surface)" }}>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Frequently Asked Questions</h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>अक्सर पूछे जाने वाले प्रश्न</p>
        </div>
        <div className="space-y-3">
          {FAQS.map((faq, i) => <FAQItem key={i} faq={faq} />)}
        </div>
        <div className="text-center mt-6">
          <Link href="/faq" className="text-sm font-medium hover:underline" style={{ color: "var(--primary)" }}>View all FAQs →</Link>
        </div>
      </div>
    </section>
  );
}
