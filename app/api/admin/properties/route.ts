import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req); if (guard) return guard;
  const { searchParams } = new URL(req.url);
  const q         = searchParams.get("q")        ?? "";
  const verified  = searchParams.get("verified");
  const type      = searchParams.get("type");
  const page      = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const take      = 20;

  const where: any = {};
  if (q)                          where.OR = [{ title: { contains: q, mode: "insensitive" } }, { locality: { contains: q, mode: "insensitive" } }];
  if (verified === "true")        where.isVerified = true;
  if (verified === "false")       where.isVerified = false;
  if (type)                       where.type = type;

  const [items, total] = await Promise.all([
    prisma.property.findMany({ where, include: { owner: { select: { name: true, email: true, phone: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * take, take }),
    prisma.property.count({ where }),
  ]);
  return NextResponse.json({ items, total, pages: Math.ceil(total / take) });
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin(req); if (guard) return guard;
  const { id, ...data } = await req.json();
  const updated = await prisma.property.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin(req); if (guard) return guard;
  const { id } = await req.json();
  await prisma.property.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
