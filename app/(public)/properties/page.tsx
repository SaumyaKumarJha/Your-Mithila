import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyFilters } from "@/components/property/PropertyFilters";
import { Suspense } from "react";
import { PageHead } from "@/components/genz/PageHead";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Property in Madhubani — Flats, Rooms, Shops, Land for Rent & Sale",
  description:
    "Browse verified property listings in Madhubani, Bihar. Find flats, rooms, shops, offices, and land for rent or sale. Contact owners directly on WhatsApp. Free to browse.",
  keywords: [
    "property in madhubani",
    "flat for rent madhubani",
    "room for rent madhubani",
    "shop for rent madhubani bihar",
    "land for sale madhubani",
    "house for rent madhubani",
    "property madhubani bihar",
    "mithila property",
    "madhubani real estate",
  ],
  openGraph: {
    title: "Property in Madhubani Bihar | YourMithila",
    description:
      "Find verified flats, rooms, shops and land in Madhubani. Free for seekers.",
    url: "https://yourmithila.in/properties",
  },
  alternates: { canonical: "https://yourmithila.in/properties" },
};

interface SearchParams {
  q?: string;
  type?: string;
  purpose?: string;
  minPrice?: string;
  maxPrice?: string;
  locality?: string;
  bedrooms?: string;
  verified?: string;
  sort?: string;
  page?: string;
  [key: string]: string | undefined;
}

const PAGE_SIZE = 12;

export default async function PropertiesPage({ searchParams }: { searchParams: SearchParams }) {
  const page = parseInt(searchParams.page ?? "1");
  const skip = (page - 1) * PAGE_SIZE;

  const where: any = { isAvailable: true };
  if (searchParams.q) {
    where.OR = [
      { title:       { contains: searchParams.q, mode: "insensitive" } },
      { locality:    { contains: searchParams.q, mode: "insensitive" } },
      { description: { contains: searchParams.q, mode: "insensitive" } },
    ];
  }
  if (searchParams.type)     where.type     = searchParams.type;
  if (searchParams.purpose)  where.purpose  = searchParams.purpose;
  if (searchParams.locality) where.locality = { contains: searchParams.locality, mode: "insensitive" };
  if (searchParams.bedrooms) where.bedrooms = parseInt(searchParams.bedrooms);
  if (searchParams.verified === "true") where.isVerified = true;
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) where.price.gte = parseFloat(searchParams.minPrice);
    if (searchParams.maxPrice) where.price.lte = parseFloat(searchParams.maxPrice);
  }

  const orderBy: any =
    searchParams.sort === "price_asc"  ? { price: "asc" }
    : searchParams.sort === "price_desc" ? { price: "desc" }
    : searchParams.sort === "views"      ? { viewCount: "desc" }
    : { createdAt: "desc" };

  // Fetch properties + session in parallel
  const [properties, total, session] = await Promise.all([
    prisma.property.findMany({ where, orderBy, skip, take: PAGE_SIZE }),
    prisma.property.count({ where }),
    auth(),
  ]);

  // Fetch saved IDs for the logged-in user (for heart button hydration)
  let savedIds: string[] = [];
  if (session?.user) {
    const userId = (session.user as any).id;
    const saved = await prisma.savedProperty.findMany({
      where: { userId },
      select: { propertyId: true },
    });
    savedIds = saved.map(s => s.propertyId);
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
    <PageHead
      title="Properties in Madhubani & Mithila"
      sub="मिथिला क्षेत्र में घर, दुकान और जमीन"
      meta={`${total} listing${total !== 1 ? "s" : ""} found`}
    />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <aside className="lg:w-64 flex-shrink-0 lg:sticky lg:top-24 self-start">
          <Suspense>
            <PropertyFilters searchParams={searchParams} />
          </Suspense>
        </aside>

        {/* Results grid */}
        <div className="flex-1">
          {properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map(p => (
                  <PropertyCard key={p.id} property={p} savedIds={savedIds} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8 flex-wrap items-center">
                  {page > 1 && (
                    <a
                      href={`?${new URLSearchParams({ ...searchParams, page: String(page - 1) })}`}
                      className="gz-chip"
                    >
                      Previous
                    </a>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => Math.abs(p - page) <= 2 || p === 1 || p === totalPages)
                    .map((p, idx, arr) => (
                      <span key={p} className="flex items-center gap-1">
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="text-sm" style={{ color: "var(--text-muted)" }}>…</span>
                        )}
                        <a
                          href={`?${new URLSearchParams({ ...searchParams, page: String(p) })}`}
                          aria-current={p === page ? "page" : undefined}
                          className="gz-chip !w-10 !h-10 !p-0 justify-center"
                          style={p === page ? { background: "var(--text-primary)", color: "var(--surface)" } : undefined}
                        >
                          {p}
                        </a>
                      </span>
                    ))}
                  {page < totalPages && (
                    <a
                      href={`?${new URLSearchParams({ ...searchParams, page: String(page + 1) })}`}
                      className="gz-chip"
                    >
                      Next
                    </a>
                  )}
                  <span className="text-xs w-full text-center mt-1" style={{ color: "var(--text-muted)" }}>
                    Page {page} of {totalPages} · {total} results
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="gz-card text-center py-16 px-6">
              <p className="text-5xl mb-3" aria-hidden="true">🏠</p>
              <p className="font-heading text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>No properties match these filters</p>
              <p className="mt-1" style={{ color: "var(--text-tertiary)" }}>Remove a filter or pick another locality to see more.</p>
              <a href="/properties" className="btn-outline mt-5">Clear filters</a>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
