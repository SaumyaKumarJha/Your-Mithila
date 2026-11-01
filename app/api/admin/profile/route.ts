/**
 * GET  /api/admin/profile — fetch admin's own profile
 * PATCH /api/admin/profile — update admin's own profile / change password
 *
 * Uses NextAuth JWT (role=ADMIN) — no custom cookie needed.
 */
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateSchema = z.object({
  name:            z.string().min(2).optional(),
  phone:           z.string().length(10).or(z.literal("")).optional(),
  whatsapp:        z.string().length(10).or(z.literal("")).optional(),
  city:            z.string().optional(),
  district:        z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword:     z.string().min(6).optional(),
});

async function getAdminId(req: NextRequest): Promise<string | null> {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "yourmithila-dev-secret",
  });
  if (token?.role === "ADMIN") return token.id as string;
  return null;
}

export async function GET(req: NextRequest) {
  const userId = await getAdminId(req);
  if (!userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: {
      id: true, name: true, email: true, phone: true,
      whatsapp: true, role: true, city: true, district: true,
      isVerified: true, createdAt: true,
    },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const userId = await getAdminId(req);
  if (!userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body   = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { name, phone, whatsapp, city, district, currentPassword, newPassword } = parsed.data;
  const updateData: Record<string, any> = {};

  if (name !== undefined)     updateData.name     = name.trim();
  if (city !== undefined)     updateData.city     = city.trim();
  if (district !== undefined) updateData.district = district.trim();
  if (phone !== undefined)    updateData.phone    = phone    || null;
  if (whatsapp !== undefined) updateData.whatsapp = whatsapp || null;

  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required." }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password) {
      return NextResponse.json({ error: "No password set on this account." }, { status: 400 });
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }
    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  const updated = await prisma.user.update({
    where:  { id: userId },
    data:   updateData,
    select: { id: true, name: true, email: true, phone: true, whatsapp: true, city: true, district: true, role: true },
  });

  return NextResponse.json(updated);
}
