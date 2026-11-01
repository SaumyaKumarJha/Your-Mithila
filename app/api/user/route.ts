import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateSchema = z.object({
  name:      z.string().min(2, "Name must be at least 2 characters").optional(),
  phone:     z.string().length(10, "Phone must be 10 digits").or(z.literal("")).optional(),
  whatsapp:  z.string().length(10).or(z.literal("")).optional(),
  city:      z.string().optional(),
  district:  z.string().optional(),
  // Password change — only when all three are provided
  currentPassword: z.string().optional(),
  newPassword:     z.string().min(6, "Password must be at least 6 characters").optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      id: true, name: true, email: true, phone: true,
      whatsapp: true, role: true, city: true, district: true,
      state: true, isVerified: true, createdAt: true,
      subscription: { select: { plan: true, status: true, endDate: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { name, phone, whatsapp, city, district, currentPassword, newPassword } = parsed.data;
  const userId = (session.user as any).id;

  const updateData: Record<string, any> = {};
  if (name)     updateData.name     = name.trim();
  if (city)     updateData.city     = city.trim();
  if (district) updateData.district = district.trim();
  if (phone !== undefined)    updateData.phone    = phone    || null;
  if (whatsapp !== undefined) updateData.whatsapp = whatsapp || null;

  // Password change — verify current password first
  if (newPassword) {
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required to set a new password." }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.password) {
      return NextResponse.json({ error: "Cannot set password for OAuth-only accounts." }, { status: 400 });
    }
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }
    updateData.password = await bcrypt.hash(newPassword, 12);
  }

  // Check phone uniqueness if changing
  if (phone && phone !== "") {
    const existing = await prisma.user.findFirst({
      where: { phone, NOT: { id: userId } },
    });
    if (existing) {
      return NextResponse.json({ error: "This phone number is already linked to another account." }, { status: 409 });
    }
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, name: true, email: true, phone: true, whatsapp: true, city: true, district: true, role: true },
  });

  return NextResponse.json(updated);
}
