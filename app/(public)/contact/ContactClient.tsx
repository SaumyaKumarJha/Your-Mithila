"use client";
import { useState } from "react";
import { MessageCircle, Phone, Mail, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { useLang } from "@/lib/lang-context";
import { PageHead } from "@/components/genz/PageHead";

const INPUT = [
  "w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors",
  "bg-[var(--surface)] text-[var(--text-primary)] placeholder-[var(--text-muted)]",
  "border-[var(--border)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)]",
].join(" ");

const LABEL = "block text-sm font-medium mb-1 text-[var(--text-secondary)]";

export default function ContactClient() {
  const { t } = useLang();
  const [form, setForm]       = useState({ name: "", email: "", phone: "", type: "feedback", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState("");

  function set(key: string, val: string) { setForm(f => ({ ...f, [key]: val })); }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? t("Failed to submit", "जमा करने में विफल")); return; }
      setSuccess(true);
    } finally { setLoading(false); }
  }

  return (
    <>
    <PageHead title={t("Contact us", "संपर्क करें")} sub="हम मदद के लिए यहाँ हैं" />
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>
            {t("Get in Touch", "संपर्क सूचना")}
          </h2>
          {[
            { icon: Phone,         label: t("Phone","फोन"),      value: "+91 70336 69971",               href: "tel:+917033669971" },
            { icon: MessageCircle, label: "WhatsApp",             value: t("Chat with us","हमसे चैट करें"), href: "https://wa.me/917033669971?text=Hi Your Mithila, I need help" },
            { icon: Mail,          label: t("Email","ईमेल"),     value: "yourmithila.official@gmail.com", href: "mailto:yourmithila.official@gmail.com" },
            { icon: MapPin,        label: t("Address","पता"),    value: "Mithila Region, Bihar",           href: null },
          ].map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="flex items-center gap-4 p-4 rounded-xl border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "var(--primary-light)" }}>
                <Icon className="w-5 h-5" style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>{label}</p>
                {href ? (
                  <a href={href} target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="font-medium text-sm break-all hover:opacity-80 transition-opacity"
                    style={{ color: "var(--primary)" }}>{value}</a>
                ) : (
                  <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{value}</p>
                )}
              </div>
            </div>
          ))}
          <a href="https://wa.me/917033669971?text=Hi Your Mithila, I need help"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full text-white font-semibold py-3 rounded-xl transition-colors text-sm hover:opacity-90"
            style={{ background: "#25D366" }}>
            <MessageCircle className="w-4 h-4" />
            {t("Message on WhatsApp", "WhatsApp पर संदेश करें")}
          </a>
        </div>

        <div className="rounded-2xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          {success ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--success)" }} />
              <h3 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                {t("Message Sent!", "संदेश भेजा गया!")}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                {t("We'll get back to you within 24 hours.", "हम 24 घंटे के भीतर जवाब देंगे।")}
              </p>
              <button onClick={() => { setSuccess(false); setForm({ name: "", email: "", phone: "", type: "feedback", subject: "", message: "" }); }}
                className="mt-4 text-sm font-medium hover:underline" style={{ color: "var(--primary)" }}>
                {t("Send another message", "और संदेश भेजें")}
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                {t("Send a Message", "संदेश भेजें")}
              </h2>
              {error && (
                <div className="text-sm px-4 py-3 rounded-xl mb-4"
                  style={{ background: "var(--error-light)", border: "1px solid var(--error)", color: "var(--error)" }}>
                  {error}
                </div>
              )}
              <form onSubmit={onSubmit} className="space-y-3">
                {[
                  { key: "name",    label: t("Your Name *","आपका नाम *"),  type: "text",  placeholder: "Ramesh Kumar"        },
                  { key: "email",   label: t("Email *","ईमेल *"),           type: "email", placeholder: "you@example.com"     },
                  { key: "phone",   label: t("Phone / WhatsApp","फोन / WhatsApp"), type: "tel", placeholder: "9876543210" },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key}>
                    <label className={LABEL}>{label}</label>
                    <input type={type} value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                      placeholder={placeholder} required={label.includes("*")} className={INPUT} />
                  </div>
                ))}
                <div>
                  <label className={LABEL}>{t("Type *","प्रकार *")}</label>
                  <select value={form.type} onChange={e => set("type", e.target.value)} required className={INPUT}>
                    <option value="feedback">{t("Feedback","प्रतिक्रिया")}</option>
                    <option value="complaint">{t("Complaint","शिकायत")}</option>
                    <option value="suggestion">{t("Suggestion","सुझाव")}</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL}>{t("Subject *","विषय *")}</label>
                  <input type="text" value={form.subject} onChange={e => set("subject", e.target.value)}
                    placeholder={t("Brief subject", "संक्षिप्त विषय")} required className={INPUT} />
                </div>
                <div>
                  <label className={LABEL}>{t("Message *","संदेश *")}</label>
                  <textarea value={form.message} onChange={e => set("message", e.target.value)}
                    rows={4} placeholder={t("How can we help you?", "हम आपकी कैसे मदद कर सकते हैं?")}
                    required className={`${INPUT} resize-none`} />
                </div>
                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-3 rounded-xl justify-center gap-2 disabled:opacity-60">
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t("Send Message", "संदेश भेजें")}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
