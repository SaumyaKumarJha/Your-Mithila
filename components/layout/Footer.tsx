import Link from "next/link";
import { MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "@/components/Logo";

const EXPLORE = [["Properties", "/properties"], ["Jobs", "/jobs"], ["Pricing", "/pricing"], ["FAQ", "/faq"]];
const COMPANY = [["About", "/about"], ["Contact", "/contact"], ["Terms of service", "/terms"], ["Privacy policy", "/privacy"]];

export function Footer() {
  return (
    <footer className="gz-foot overflow-hidden" style={{ background: "var(--gradient-footer)", color: "#F4E7DA" }}>
      <div className="gz-border" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1.3fr] gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Logo size="md" variant="white" />
            <p className="mt-4 text-[15px] leading-relaxed max-w-xs" style={{ color: "#D9C7B8" }}>
              <span lang="hi">मिथिला का अपना डिजिटल मंच।</span><br />
              Properties and jobs, all in one place.
            </p>
            <div className="flex gap-2.5 mt-5">
              <a href="https://wa.me/917033669971?text=Hi, I need help with Your Mithila"
                target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp"
                className="w-11 h-11 rounded-full grid place-items-center border-2 transition-transform hover:-translate-y-0.5"
                style={{ background: "var(--wa)", color: "#1D1410", borderColor: "#F4E7DA" }}>
                <MessageCircle className="w-5 h-5" />
              </a>
              <a href="mailto:yourmithila.official@gmail.com" aria-label="Email us"
                className="w-11 h-11 rounded-full grid place-items-center border-2 transition-transform hover:-translate-y-0.5"
                style={{ background: "var(--haldi)", color: "#1D1410", borderColor: "#F4E7DA" }}>
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <nav aria-label="Explore">
            <p className="font-heading font-extrabold text-lg mb-3" style={{ color: "var(--haldi)" }}>Explore</p>
            <ul className="space-y-2">
              {EXPLORE.map(([l, h]) => (
                <li key={h}><Link href={h} className="text-[15px] hover:underline decoration-2 underline-offset-4">{l}</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <p className="font-heading font-extrabold text-lg mb-3" style={{ color: "var(--gulabi)" }}>Company</p>
            <ul className="space-y-2">
              {COMPANY.map(([l, h]) => (
                <li key={h}><Link href={h} className="text-[15px] hover:underline decoration-2 underline-offset-4">{l}</Link></li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-1">
            <p className="font-heading font-extrabold text-lg mb-3" style={{ color: "#B9F3CF" }}>Contact</p>
            <ul className="space-y-2.5 text-[15px]">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0 opacity-70" />
                <a href="mailto:yourmithila.official@gmail.com" className="hover:underline decoration-2 underline-offset-4 break-all">
                  yourmithila.official@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0 opacity-70" />
                <a href="tel:+917033669971" className="hover:underline decoration-2 underline-offset-4">+91 70336 69971</a>
              </li>
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 flex-shrink-0 opacity-70" />Mithila Region, Bihar</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t-2 border-dashed flex flex-col sm:flex-row items-center justify-between gap-2 text-sm" style={{ borderColor: "#4A3A32", color: "#B7A294" }}>
          <p>© {new Date().getFullYear()} Your Mithila. All rights reserved.</p>
          <p>Made with ❤️ for Mithila</p>
        </div>
      </div>

      {/* Giant outlined wordmark sitting on the bottom edge */}
      <div className="gz-wordmark px-2 -mb-[0.12em] text-center" aria-hidden="true">yourmithila</div>
      {/* room for the fixed bottom bar on phones */}
      <div className="h-[72px] md:hidden" />
    </footer>
  );
}
