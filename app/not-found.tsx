import Link from "next/link";
import type { Metadata } from "next";
import { Fish } from "@/components/genz/Motifs";

export const metadata: Metadata = {
  title: "Page Not Found | YourMithila",
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16" style={{ background: "var(--background)" }}>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-6" aria-hidden="true">
          <span className="gz-sticker gz-sticker-1 !text-[72px] sm:!text-[96px]" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>4</span>
          <Fish uid="nf" color="#D63A24" className="w-24 sm:w-32 -mx-1" />
          <span className="gz-sticker gz-sticker-3 !text-[72px] sm:!text-[96px]" style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}>4</span>
        </div>
        <h1 className="gz-h2">This page swam away</h1>
        <p className="mt-3 mb-7" style={{ color: "var(--text-tertiary)" }}>
          The link may be old, or the listing was taken down.{" "}
          <span lang="hi">यह पेज नहीं मिला।</span>
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/" className="btn-primary">Go home</Link>
          <Link href="/properties" className="btn-outline">Browse properties</Link>
        </div>
      </div>
    </div>
  );
}
