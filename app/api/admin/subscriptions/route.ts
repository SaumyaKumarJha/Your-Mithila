import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req); if (guard) return guard;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const take   = 25;

  const where: any = {};
  if (status) where.status = status;

  const [items, total, revenue] = await Promise.all([
    prisma.subscription.findMany({
      where,
      include: { user: { select: { name: true, email: true, phone: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    prisma.subscription.count({ where }),
    prisma.subscription.aggregate({ _sum: { price: true } }),
  ]);
  return NextResponse.json({ items, total, pages: Math.ceil(total / take), totalRevenue: revenue._sum.price ?? 0 });
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin(req); if (guard) return guard;
  const { id, status } = await req.json();
  const updated = await prisma.subscription.update({ where: { id }, data: { status } });
  return NextResponse.json(updated);
}
