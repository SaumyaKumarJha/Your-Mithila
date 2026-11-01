"use client";
import { MessageCircle, Phone } from "lucide-react";
import { useLang } from "@/lib/lang-context";

interface Props {
  phone: string;
  waPhone: string;
  waMessage: string;
  label?: string;
}

export function StickyContactBar({ phone, waPhone, waMessage, label }: Props) {
  const { t } = useLang();
  const clean = waPhone.replace(/\D/g, "");
  const waNumber = clean.startsWith("91") ? clean : `91${clean}`;
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  return (
    /* Only visible on mobile (md:hidden) — fixed above the bottom nav (h≈56px) */
    <div
      className="md:hidden fixed bottom-16 left-0 right-0 z-40 border-t px-4 py-3 flex gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      role="complementary"
      aria-label={t("Contact options", "संपर्क विकल्प")}
    >
      {/* Call button */}
      <a
        href={`tel:${phone}`}
        aria-label={t("Call owner", "मालिक को कॉल करें")}
        className="flex-1 flex items-center justify-center gap-2 font-semibold py-3 rounded-xl transition-colors text-sm active:scale-95 hover:opacity-90"
        style={{ background: "var(--surface-alt)", color: "var(--text-primary)" }}
      >
        <Phone className="w-4 h-4" />
        {t("Call", "कॉल करें")}
      </a>

      {/* WhatsApp button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("Contact via WhatsApp", "WhatsApp पर संपर्क करें")}
        className="flex-1 flex items-center justify-center gap-2 text-white font-semibold py-3 px-6 rounded-xl transition-colors text-sm active:scale-95 hover:opacity-90"
        style={{ background: "#25D366" }}
      >
        <MessageCircle className="w-4 h-4" />
        {label ?? t("WhatsApp", "WhatsApp")}
      </a>
    </div>
  );
}
