import type { Metadata } from "next";
import { Bricolage_Grotesque, Mukta } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import dynamic from "next/dynamic";
import { LangProvider } from "@/lib/lang-context";
import { Toaster } from "react-hot-toast";
import { JsonLd } from "@/components/seo/JsonLd";
import Script from "next/script";
import { TiltEffect } from "@/components/genz/TiltEffect";

// Chatbot panel — controlled by Navbar buttons, rendered once here
const Chatbot = dynamic(
  () => import("@/components/shared/Chatbot").then(m => m.Chatbot),
  { ssr: false }
);

// Display: Bricolage Grotesque — chunky, slightly quirky grotesque with a width axis for the sticker headlines.
// Body + every Hindi line: Mukta, which carries full Devanagari.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  variable: "--font-heading",
  display: "swap",
});

const body = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yourmithila.in"),
  title: {
    default: "YourMithila — Property & Jobs in Madhubani, Bihar",
    template: "%s | YourMithila",
  },
  description:
    "Find flats, rooms, shops, land and jobs in Madhubani, Bihar. Browse verified property listings and local job openings in Mithila region. Free for seekers.",
  keywords: [
    "property in madhubani",
    "flat for rent in madhubani",
    "room for rent madhubani bihar",
    "shop for rent madhubani",
    "land for sale madhubani",
    "jobs in madhubani",
    "property madhubani bihar",
    "mithila property",
    "yourmithila",
    "madhubani real estate",
    "flat madhubani",
    "makaan madhubani",
    "naukri madhubani",
  ],
  authors: [{ name: "YourMithila", url: "https://yourmithila.in" }],
  creator: "YourMithila",
  publisher: "YourMithila",
  alternates: { canonical: "https://yourmithila.in" },
  icons: {
    icon:     [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
    apple:    "/icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://yourmithila.in",
    siteName: "YourMithila",
    title: "YourMithila — Property & Jobs in Madhubani, Bihar",
    description:
      "Find flats, rooms, shops, land and jobs in Madhubani, Bihar. Free for seekers. Direct WhatsApp contact with owners.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "YourMithila — Property and Jobs in Madhubani Bihar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YourMithila — Property & Jobs in Madhubani Bihar",
    description: "Find property and jobs in Madhubani. Free for seekers.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // google: "add-your-search-console-verification-code-here",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Tag Manager — GTM-P29M2JVC */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src= 'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f); })(window,document,'script','dataLayer','GTM-P29M2JVC');`,
          }}
        />
      </head>
      <body className={`${display.variable} ${body.variable} font-sans antialiased`} style={{ color: "var(--text-primary)" }}>
        {/* Google Tag Manager noscript — immediately after <body> */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P29M2JVC"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LangProvider>
            <SessionProvider>
              <JsonLd />
              <Navbar />
              <div className="pb-20 md:pb-0">{children}</div>
              <Footer />
              <MobileBottomNav />
              <Chatbot />
              <TiltEffect />
              <Toaster
                position="top-center"
                toastOptions={{
                  style: { background: "var(--surface)", color: "var(--text-primary)", border: "2px solid var(--line)", borderRadius: "14px", boxShadow: "var(--hard-sm)", fontWeight: 600 },
                  success: { iconTheme: { primary: "#0F7A42", secondary: "white" } },
                  error: { iconTheme: { primary: "#C0261A", secondary: "white" } },
                }}
              />
            </SessionProvider>
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
