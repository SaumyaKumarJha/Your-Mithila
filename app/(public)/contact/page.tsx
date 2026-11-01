import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us | YourMithila",
  description: "Contact Your Mithila for support, feedback or complaints. WhatsApp, email or contact form.",
  keywords: "contact YourMithila, Mithila support, Madhubani helpline, संपर्क करें, YourMithila customer care",
};

export default function ContactPage() {
  return <ContactClient />;
}
