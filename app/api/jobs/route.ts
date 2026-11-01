import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().trim().min(3, "Enter job title"),
  description: z.string().trim().min(10, "Enter job description"),
  organization: z.string().trim().min(2, "Enter organization name"),
  orgType: z.enum(["HOTEL", "HOSPITAL", "SCHOOL", "SHOP", "FACTORY", "OFFICE", "HOME", "OTHER"]),
  jobType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "DAILY_WAGE"]),
  salaryMin: z.coerce.number().nonnegative().optional(),
  salaryMax: z.coerce.number().nonnegative().optional(),
  salaryUnit: z.enum(["DAILY", "MONTHLY", "YEARLY"]).default("MONTHLY"),
  address: z.string().trim().min(5, "Enter address"),
  locality: z.string().trim().min(2, "Enter locality"),
  city: z.string().trim().default("Madhubani"),
  contactName: z.string().trim().min(2, "Enter contact name"),
  contactPhone: z.string().trim().transform(v => v.replace(/\D/g, "")).pipe(
    z.string().length(10, "Enter a valid 10-digit phone number")
  ),
  contactWhatsapp: z.string().trim().transform(v => v.replace(/\D/g, "")).pipe(
    z.string().length(10, "Enter a valid 10-digit WhatsApp number").optional()
  ).optional(),
  requirements: z.string().trim().optional(),
  benefits: z.string().trim().optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
}).refine((data) => {
  if (data.salaryMin == null || data.salaryMax == null) return true;
  return data.salaryMin <= data.salaryMax;
}, {
  message: "Minimum salary cannot be greater than maximum salary",
  path: ["salaryMax"],
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const where: any = { isActive: true };

  const q = searchParams.get("q");
  if (q) where.OR = [
    { title: { contains: q, mode: "insensitive" } },
    { organization: { contains: q, mode: "insensitive" } },
  ];

  const orgType = searchParams.get("orgType");
  if (orgType) where.orgType = orgType;

  const jobType = searchParams.get("jobType");
  if (jobType) where.jobType = jobType;

  const page = parseInt(searchParams.get("page") ?? "1");
  const take = 12;
  const skip = (page - 1) * take;

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({ jobs, total, pages: Math.ceil(total / take) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "OWNER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Only owners can post jobs" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);

    if (role === "OWNER") {
      const sub = await prisma.subscription.findFirst({
        where: {
          userId: (session.user as any).id,
          status: "ACTIVE",
          endDate: { gt: new Date() },
        },
      });
      if (!sub) {
        return NextResponse.json({ error: "Active subscription required to post jobs. Please subscribe at /dashboard/subscription." }, { status: 403 });
      }
      const allowedPlans = new Set(["STANDARD", "PRO", "YEARLY_STANDARD"]);
      if (!allowedPlans.has(sub.plan)) {
        return NextResponse.json({ error: "Standard or Pro plan required to post jobs." }, { status: 403 });
      }
    }

    const normalizedData = {
      ...data,
      contactWhatsapp: data.contactWhatsapp ? data.contactWhatsapp.trim() : null,
      requirements: data.requirements?.trim() || null,
      benefits: data.benefits?.trim() || null,
    };

    const job = await prisma.job.create({
      data: { ...normalizedData, postedById: (session.user as any).id },
    });
    return NextResponse.json(job, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 });
  }
}
