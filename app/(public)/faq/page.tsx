import type { Metadata } from "next";
import FAQClient from "./FAQClient";

export const metadata: Metadata = {
  title: "FAQ | YourMithila",
  description: "Frequently asked questions about Your Mithila — properties, jobs, pricing and how it works.",
  keywords: "YourMithila FAQ, how to list property Bihar, how to find job Madhubani, Mithila classifieds help, सामान्य प्रश्न",
};

export default function FAQPage() {
  return <FAQClient />;
}
