import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  type: z.enum(["FLAT", "ROOM", "HOUSE", "SHOP", "LAND", "WAREHOUSE", "OFFICE", "VACANT_SPACE"]),
  purpose: z.enum(["RENT", "SALE"]),
  price: z.coerce.number().positive("Price must be greater than 0"),
  priceUnit: z.enum(["MONTHLY", "YEARLY", "TOTAL"]),
  area: z.coerce.number().positive().optional(),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  bathrooms: z.coerce.number().int().nonnegative().optional(),
  floor: z.coerce.number().int().nonnegative().optional(),
  totalFloors: z.coerce.number().int().nonnegative().optional(),
  address: z.string().trim().min(5, "Enter full address"),
  locality: z.string().trim().min(2, "Enter locality"),
  city: z.string().trim().default("Madhubani"),
  district: z.string().trim().default("Madhubani"),
  state: z.string().trim().default("Bihar"),
  pincode: z.string().trim().regex(/^\d{6}$/, "Pincode must be 6 digits").optional().or(z.literal("")),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  images: z.array(z.string().trim().min(1)).max(10, "Maximum 10 photos allowed").default([]),
  amenities: z.array(z.string().trim().min(1)),
  contactName: z.string().trim().min(2, "Enter contact name"),
  contactPhone: z.string().trim().transform(v => v.replace(/\D/g, "")).pipe(
    z.string().length(10, "Enter a valid 10-digit phone number")
  ),
  contactWhatsapp: z.string().trim().transform(v => v.replace(/\D/g, "")).pipe(
    z.string().length(10, "Enter a valid 10-digit WhatsApp number").optional()
  ).optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const where: any = { isAvailable: true };

  const q = searchParams.get("q");
  if (q) where.OR = [
    { title: { contains: q, mode: "insensitive" } },
    { locality: { contains: q, mode: "insensitive" } },
  ];

  const type = searchParams.get("type");
  if (type) where.type = type;

  const purpose = searchParams.get("purpose");
  if (purpose) where.purpose = purpose;

  const page = parseInt(searchParams.get("page") ?? "1");
  const take = 12;
  const skip = (page - 1) * take;

  const [properties, total] = await Promise.all([
    prisma.property.findMany({ where, skip, take, orderBy: { createdAt: "desc" } }),
    prisma.property.count({ where }),
  ]);

  return NextResponse.json({ properties, total, pages: Math.ceil(total / take) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== "OWNER" && role !== "ADMIN") {
    return NextResponse.json({ error: "Only owners can create listings" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const normalizedData = {
      ...data,
      pincode: data.pincode ? data.pincode.trim() : null,
      contactWhatsapp: data.contactWhatsapp ? data.contactWhatsapp.trim() : null,
      images: data.images.filter(Boolean),
      amenities: data.amenities.filter(Boolean),
    };

    // ── FREE FIRST LISTING — server-side enforcement ──────────────────────────
    if (role === "OWNER") {
      const userId = (session.user as any).id as string;
      const existingCount = await prisma.property.count({ where: { ownerId: userId } });

      if (existingCount === 0) {
        // First listing is always free — skip subscription check
      } else {
        // 2nd listing onwards requires an active subscription
        const sub = await prisma.subscription.findFirst({
          where: { userId, status: "ACTIVE", endDate: { gt: new Date() } },
        });
        if (!sub) {
          return NextResponse.json({ error: "Your first listing is free. Subscribe to add more listings." }, { status: 403 });
        }
        const planLimits: Record<string, number> = { BASIC: 1, STANDARD: 3, PRO: -1, YEARLY_STANDARD: 3 };
        const limit = planLimits[sub.plan] ?? 1;
        if (limit !== -1 && existingCount >= limit) {
          return NextResponse.json({ error: `Your ${sub.plan} plan allows ${limit} listing(s). Upgrade to add more.` }, { status: 403 });
        }
      }
    }

    const property = await prisma.property.create({
      data: { ...normalizedData, ownerId: (session.user as any).id },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
