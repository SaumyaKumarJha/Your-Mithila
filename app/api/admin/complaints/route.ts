import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const guard = await requireAdmin(req); if (guard) return guard;
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const take   = 20;

  const where: any = {};
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.complaint.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * take, take }),
    prisma.complaint.count({ where }),
  ]);
  return NextResponse.json({ items, total, pages: Math.ceil(total / take) });
}

export async function PATCH(req: NextRequest) {
  const guard = await requireAdmin(req); if (guard) return guard;
  const { id, status } = await req.json();
  const updated = await prisma.complaint.update({ where: { id }, data: { status, updatedAt: new Date() } });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const guard = await requireAdmin(req); if (guard) return guard;
  const { id } = await req.json();
  await prisma.complaint.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
