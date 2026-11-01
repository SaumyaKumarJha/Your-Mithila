"use client";
import { MessageCircle } from "lucide-react";

// FIX 9 — pinned to bottom-24 left-4, z-50 so it floats above MobileBottomNav (z-40 bottom-0)
export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/917033669971?text=Hi%2C%20I%20need%20help%20with%20Your%20Mithila%20website"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 left-4 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  );
}
