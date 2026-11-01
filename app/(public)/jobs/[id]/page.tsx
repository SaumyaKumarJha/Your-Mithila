import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Building2, BadgeCheck, Star, Phone,
  Calendar, IndianRupee, Clock, MessageCircle, ArrowLeft,
} from "lucide-react";
import { MapEmbed } from "@/components/shared/MapEmbed";
import { StickyContactBar } from "@/components/shared/StickyContactBar";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  try {
    const job = await prisma.job.findUnique({ where: { id: params.id } });
    if (!job) return { title: "Job Not Found | YourMithila" };
    return {
      title: `${job.title} at ${job.organization} | YourMithila`,
      description: `${job.title} job opening at ${job.organization} in ${job.locality}, ${job.city}. Apply via WhatsApp.`,
    };
  } catch {
    return { title: "Job | YourMithila" };
  }
}

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time", PART_TIME: "Part Time",
  CONTRACT: "Contract",   DAILY_WAGE: "Daily Wage",
};
const ORG_TYPE_LABELS: Record<string, string> = {
  HOTEL: "Hotel", HOSPITAL: "Hospital", SCHOOL: "School", SHOP: "Shop",
  FACTORY: "Factory", OFFICE: "Office", HOME: "Home", OTHER: "Other",
};

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await prisma.job.findUnique({ where: { id: params.id } });
  if (!job) notFound();

  // Increment view count (non-blocking)
  prisma.job.update({
    where: { id: params.id },
    data: { viewCount: { increment: 1 } },
  }).catch(console.error);

  const phone = job.contactWhatsapp || job.contactPhone;
  const waMessage = `Hi, I saw the job opening for "${job.title}" at ${job.organization} on Your Mithila. I am interested in applying.`;
  const waUrl = `https://wa.me/91${phone.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}`;

  const salaryText = job.salaryMin
    ? job.salaryMax
      ? `₹${job.salaryMin.toLocaleString("en-IN")} – ₹${job.salaryMax.toLocaleString("en-IN")}/${job.salaryUnit === "DAILY" ? "day" : "month"}`
      : `From ₹${job.salaryMin.toLocaleString("en-IN")}/${job.salaryUnit === "DAILY" ? "day" : "month"}`
    : "Salary negotiable";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
        <Link href="/" className="hover:text-[var(--primary)] transition-colors">Home</Link>
        <span>/</span>
        <Link href="/jobs" className="hover:text-[var(--primary)] transition-colors">Jobs</Link>
        <span>/</span>
        <span className="truncate max-w-[200px]" style={{ color: "var(--text-primary)" }}>{job.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Main content ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
                {JOB_TYPE_LABELS[job.jobType] ?? job.jobType}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "var(--surface-alt)", color: "var(--text-secondary)" }}>
                {ORG_TYPE_LABELS[job.orgType] ?? job.orgType}
              </span>
              {job.isVerified && (
                <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "var(--success-light)", color: "var(--success)" }}>
                  <BadgeCheck className="w-3 h-3" /> Verified
                </span>
              )}
              {job.isFeatured && (
                <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: "var(--warning-light)", color: "var(--warning)" }}>
                  <Star className="w-3 h-3" /> Featured
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight" style={{ color: "var(--text-primary)" }}>{job.title}</h1>
            <div className="flex items-center gap-1 mt-1 font-medium" style={{ color: "var(--text-secondary)" }}>
              <Building2 className="w-4 h-4" />
              {job.organization}
            </div>
            <div className="flex items-center gap-1 text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
              <MapPin className="w-4 h-4" />
              {job.locality}, {job.city}
            </div>
          </div>

          {/* Salary */}
          <div className="card-warm !transform-none p-4 inline-flex items-center gap-3" style={{ background: "#B9F3CF", color: "#1D1410" }}>
            <IndianRupee className="w-6 h-6 flex-shrink-0" />
            <p className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">{salaryText}</p>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>Job Description</h2>
            <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div>
              <h2 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Requirements / योग्यता
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
                {job.requirements}
              </p>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div>
              <h2 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Benefits / लाभ
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
                {job.benefits}
              </p>
            </div>
          )}

          {/* Map */}
          <div>
            <h2 className="font-bold mb-2" style={{ color: "var(--text-primary)" }}>Location</h2>
            <MapEmbed
              address={`${job.address}, ${job.locality}, ${job.city}`}
              latitude={job.latitude}
              longitude={job.longitude}
            />
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div>
          <div
            className="card-warm !transform-none p-5 sticky top-24 space-y-4"
          >
            <h3 className="text-xl font-extrabold" style={{ color: "var(--text-primary)" }}>Apply now</h3>

            <div>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Contact Person</p>
              <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{job.contactName}</p>
            </div>

            {/* Call button */}
            <a
              href={`tel:${job.contactPhone}`}
              className="gz-btn-sm gz-btn-ghost !w-full !justify-start !py-3 !px-4"
            >
              <Phone className="w-4 h-4" />
              {job.contactPhone}
            </a>

            {/* WhatsApp apply button */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="gz-btn-sm gz-btn-wa !w-full !py-3 !text-[15px]"
              aria-label="Apply on WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              Apply on WhatsApp
            </a>

            {/* Meta */}
            <div className="pt-3 border-t space-y-1.5 text-xs" style={{ borderColor: "var(--border)", color: "var(--text-tertiary)" }}>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Posted {new Date(job.createdAt).toLocaleDateString("en-IN")}
              </div>
              {job.expiresAt && (
                <div className="flex items-center gap-1" style={{ color: "var(--error)" }}>
                  <Clock className="w-3 h-3" />
                  Expires {new Date(job.expiresAt).toLocaleDateString("en-IN")}
                </div>
              )}
              <p>👁 {job.viewCount} views</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky mobile bar */}
      <StickyContactBar
        phone={job.contactPhone}
        waPhone={phone}
        waMessage={waMessage}
        label="Apply on WhatsApp"
      />
    </div>
  );
}
