import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req); if (guard) return guard;
  const { searchParams } = new URL(req.url);
  const q    = searchParams.get("q") ?? "";
  const role = searchParams.get("role");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const take = 25;

  const where: any = {};
  if (q)    where.OR = [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q, mode: "insensitive" } }];
  if (role) where.role = role;

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, name: true, email: true, phone: true, role: true, city: true, district: true, isActive: true, isVerified: true, createdAt: true, subscription: { select: { plan: true, status: true, endDate: true } }, _count: { select: { properties: true, jobs: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
    }),
    prisma.user.count({ where }),
  ]);
  return NextResponse.json({ items, total, pages: Math.ceil(total / take) });
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin(req); if (guard) return guard;
  const { id, ...data } = await req.json();
  const updated = await prisma.user.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin(req); if (guard) return guard;
  const { id } = await req.json();
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
