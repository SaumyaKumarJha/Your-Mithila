import { prisma } from "@/lib/prisma";
import { JobCard } from "@/components/job/JobCard";
import { Suspense } from "react";
import { PageHead } from "@/components/genz/PageHead";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jobs in Madhubani — Local Job Openings in Mithila Region Bihar",
  description:
    "Find local jobs in Madhubani and Mithila region, Bihar. Hotels, hospitals, schools, shops hiring now. Daily wage, part time and full time jobs available.",
  keywords: [
    "jobs in madhubani",
    "naukri madhubani",
    "job vacancy madhubani bihar",
    "local jobs mithila",
    "hotel jobs madhubani",
    "hospital jobs mithila",
    "part time jobs madhubani",
  ],
  openGraph: {
    title: "Jobs in Madhubani Bihar | YourMithila",
    description:
      "Local job openings in Madhubani and Mithila region. Free to apply.",
    url: "https://yourmithila.in/jobs",
  },
  alternates: { canonical: "https://yourmithila.in/jobs" },
};

// ── Lazy-import the client filters inside Suspense ──────────────────────────
import { JobFilters } from "@/components/job/JobFilters";

interface SearchParams {
  q?: string;
  orgType?: string;
  jobType?: string;
  minSalary?: string;
  locality?: string;
  sort?: string;
  page?: string;
}

const PAGE_SIZE = 12;

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  CONTRACT:  "Contract",
  DAILY_WAGE:"Daily Wage",
};

const ORG_TYPE_LABELS: Record<string, string> = {
  HOTEL:    "Hotel",
  HOSPITAL: "Hospital",
  SCHOOL:   "School",
  SHOP:     "Shop",
  FACTORY:  "Factory",
  OFFICE:   "Office",
  HOME:     "Home",
  OTHER:    "Other",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page    = Math.max(1, parseInt(searchParams.page ?? "1"));
  const skip    = (page - 1) * PAGE_SIZE;

  const where: any = { isActive: true };

  if (searchParams.q) {
    where.OR = [
      { title:        { contains: searchParams.q, mode: "insensitive" } },
      { organization: { contains: searchParams.q, mode: "insensitive" } },
      { description:  { contains: searchParams.q, mode: "insensitive" } },
      { locality:     { contains: searchParams.q, mode: "insensitive" } },
    ];
  }
  if (searchParams.orgType)  where.orgType  = searchParams.orgType;
  if (searchParams.jobType)  where.jobType  = searchParams.jobType;
  if (searchParams.locality) where.locality = { contains: searchParams.locality, mode: "insensitive" };
  if (searchParams.minSalary) where.salaryMin = { gte: parseFloat(searchParams.minSalary) };

  const orderBy: any =
    searchParams.sort === "views" ? { viewCount: "desc" }
    : searchParams.sort === "salary" ? { salaryMin: "desc" }
    : [{ isFeatured: "desc" }, { createdAt: "desc" }];

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({ where, orderBy, skip, take: PAGE_SIZE }),
    prisma.job.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Active filter count for UX indicator
  const activeFilters = [
    searchParams.q, searchParams.orgType, searchParams.jobType,
    searchParams.locality, searchParams.minSalary,
  ].filter(Boolean).length;

  return (
    <>
    <PageHead
      title="Jobs in Mithila"
      sub="मिथिला क्षेत्र की नौकरियां"
      meta={`${total} opening${total !== 1 ? "s" : ""} found`}
    >
      {activeFilters > 0 && (
        <span className="gz-chip" style={{ background: "var(--gulabi)", color: "#1D1410" }}>
          {activeFilters} filter{activeFilters > 1 ? "s" : ""} active
        </span>
      )}
    </PageHead>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 md:pb-10">

      {/* Filters — wrapped in Suspense because JobFilters uses useSearchParams internally */}
      <Suspense fallback={
        <div className="flex flex-wrap gap-2 mb-4 p-4 rounded-xl border animate-pulse"
          style={{ background: "var(--surface-alt)", borderColor: "var(--border)" }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-8 w-28 rounded-lg skeleton" />
          ))}
        </div>
      }>
        <JobFilters searchParams={searchParams} />
      </Suspense>

      {/* Job type quick-filter pills */}
      <div className="flex flex-wrap gap-2 mb-8 mt-2">
        <Link
          href={`/jobs${searchParams.q ? `?q=${searchParams.q}` : ""}`}
          className="gz-chip"
          aria-current={!searchParams.jobType ? "true" : undefined}
          style={!searchParams.jobType ? { background: "var(--text-primary)", color: "var(--surface)" } : undefined}
        >
          All Types
        </Link>
        {Object.entries(JOB_TYPE_LABELS).map(([key, label]) => {
          const params = new URLSearchParams();
          if (searchParams.q)        params.set("q",        searchParams.q);
          if (searchParams.orgType)  params.set("orgType",  searchParams.orgType);
          if (searchParams.locality) params.set("locality", searchParams.locality);
          params.set("jobType", key);
          const isActive = searchParams.jobType === key;
          return (
            <Link
              key={key}
              href={`/jobs?${params.toString()}`}
              className="gz-chip"
              aria-current={isActive ? "true" : undefined}
              style={isActive ? { background: "var(--text-primary)", color: "var(--surface)" } : undefined}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Results */}
      {jobs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(j => <JobCard key={j.id} job={j} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8 flex-wrap">
              {page > 1 && (
                <Link
                  href={`/jobs?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`}
                  className="gz-chip"
                >
                  Previous
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center gap-1">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="text-sm" style={{ color: "var(--text-muted)" }}>…</span>
                    )}
                    <Link
                      href={`/jobs?${new URLSearchParams({ ...searchParams, page: String(p) })}`}
                      aria-current={p === page ? "page" : undefined}
                      className="gz-chip !w-10 !h-10 !p-0 justify-center"
                      style={p === page ? { background: "var(--text-primary)", color: "var(--surface)" } : undefined}
                    >
                      {p}
                    </Link>
                  </span>
                ))}
              {page < totalPages && (
                <Link
                  href={`/jobs?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`}
                  className="gz-chip"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        /* Empty state */
        <div className="gz-card text-center py-16 px-6">
          <p className="text-5xl mb-3">💼</p>
          <p className="font-heading text-2xl font-extrabold mb-1" style={{ color: "var(--text-primary)" }}>
            No jobs found
          </p>
          <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
            {activeFilters > 0
              ? "Try removing some filters to see more results."
              : "No jobs have been posted yet. Check back soon!"}
          </p>
          {activeFilters > 0 && (
            <Link href="/jobs" className="btn-outline">
              Clear all filters
            </Link>
          )}
        </div>
      )}
    </div>
    </>
  );
}
