import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://yourmithila.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, jobs] = await Promise.all([
    prisma.property.findMany({
      where: { isAvailable: true },
      select: { id: true, updatedAt: true, isFeatured: true },
    }),
    prisma.job.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true, isFeatured: true },
    }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                                    lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
    { url: `${BASE_URL}/properties`,                    lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/jobs`,                          lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/pricing`,                       lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/about`,                         lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`,                       lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/faq`,                           lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/terms`,                         lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`,                       lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/auth/login`,                    lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/auth/register`,                 lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/properties?type=FLAT`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE_URL}/properties?type=ROOM`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE_URL}/properties?type=HOUSE`,         lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE_URL}/properties?type=SHOP`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE_URL}/properties?type=LAND`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.8 },
    { url: `${BASE_URL}/properties?type=WAREHOUSE`,     lastModified: new Date(), changeFrequency: "daily",   priority: 0.7 },
    { url: `${BASE_URL}/properties?type=OFFICE`,        lastModified: new Date(), changeFrequency: "daily",   priority: 0.7 },
    { url: `${BASE_URL}/jobs?jobType=FULL_TIME`,        lastModified: new Date(), changeFrequency: "daily",   priority: 0.64 },
    { url: `${BASE_URL}/jobs?jobType=PART_TIME`,        lastModified: new Date(), changeFrequency: "daily",   priority: 0.64 },
    { url: `${BASE_URL}/jobs?jobType=CONTRACT`,         lastModified: new Date(), changeFrequency: "daily",   priority: 0.64 },
    { url: `${BASE_URL}/jobs?jobType=DAILY_WAGE`,       lastModified: new Date(), changeFrequency: "daily",   priority: 0.64 },
  ];

  const propertyRoutes: MetadataRoute.Sitemap = properties.map(p => ({
    url: `${BASE_URL}/properties/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "daily",
    priority: p.isFeatured ? 0.8 : 0.64,
  }));

  const jobRoutes: MetadataRoute.Sitemap = jobs.map(j => ({
    url: `${BASE_URL}/jobs/${j.id}`,
    lastModified: j.updatedAt,
    changeFrequency: "daily",
    priority: j.isFeatured ? 0.8 : 0.64,
  }));

  return [...staticRoutes, ...propertyRoutes, ...jobRoutes];
}
