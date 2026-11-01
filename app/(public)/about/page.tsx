import type { Metadata } from "next";
import { PageHead } from "@/components/genz/PageHead";

export const metadata: Metadata = {
  title: "About YourMithila — Property & Jobs Platform for Mithila Region",
  description:
    "YourMithila is a local platform connecting property owners and seekers in Madhubani, Darbhanga, Sitamarhi and across Mithila region, Bihar.",
  openGraph: {
    title: "About YourMithila | Property Platform Madhubani Bihar",
    description:
      "YourMithila connects property owners and seekers in Madhubani and across Mithila region, Bihar.",
    url: "https://yourmithila.in/about",
  },
  alternates: { canonical: "https://yourmithila.in/about" },
};

export default function AboutPage() {
  return (
    <>
    <PageHead title="About YourMithila" sub="मिथिला का अपना डिजिटल मंच" />
    <div className="max-w-2xl mx-auto px-4 py-14">

      <div className="space-y-6 text-base leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        <p>
          YourMithila is a local platform built for the people of Mithila Region, Bihar.
          We connect property owners with people looking for flats, rooms, shops, and land —
          and connect employers with local job seekers — all in one simple place.
        </p>
        <p>
          This platform was built by someone who grew up in Madhubani and saw how difficult
          it was for people to find homes and work through just word of mouth and middlemen.
          We believe every person in our region deserves a simple, honest, and free way to
          find what they need.
        </p>

        <h2 className="text-xl font-semibold mt-8" style={{ color: "var(--text-primary)" }}>Our mission</h2>
        <p>
          Make property and job discovery free, simple, and accessible for everyone in
          Madhubani, Darbhanga, Sitamarhi, and across the entire Mithila belt.
        </p>

        <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>For seekers</h2>
        <p>
          Browsing is completely free. No registration needed to view listings.
          Contact any owner directly via WhatsApp — no middleman, no commission.
        </p>

        <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>For owners</h2>
        <p>
          List your property starting at just ₹99 per month. Your listing reaches
          hundreds of verified seekers in your area. We verify all listings before
          they go live.
        </p>

        <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Contact us</h2>
        <p>
          WhatsApp:{" "}
          <a href="https://wa.me/917033669971" className="hover:opacity-80 transition-opacity" style={{ color: "var(--primary)" }}>
            +91 70336 69971
          </a>
          <br />
          Email:{" "}
          <a href="mailto:yourmithila.official@gmail.com" className="hover:opacity-80 transition-opacity" style={{ color: "var(--primary)" }}>
            yourmithila.official@gmail.com
          </a>
          <br />
          Location: Mithila Region, Bihar, India
        </p>
      </div>
    </div>
    </>
  );
}
