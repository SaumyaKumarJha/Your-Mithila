/**
 * POST /api/auth/reset-password-direct
 *
 * TEMPORARY utility endpoint — set or reset a user's password directly.
 * Protected by x-reset-secret header (must match ADMIN_PASSWORD env var).
 *
 * Usage (run from terminal after deploying):
 *
 *   curl -X POST https://yourmithila.in/api/auth/reset-password-direct \
 *     -H "Content-Type: application/json" \
 *     -H "x-reset-secret: YOUR_ADMIN_PASSWORD_FROM_VERCEL_ENV" \
 *     -d '{"email":"admin@yourmithila.in","newPassword":"YourNewPassword123"}'
 *
 * IMPORTANT: Delete this file after you have confirmed login works.
 * File to delete: app/api/auth/reset-password-direct/route.ts
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // Guard: must provide the correct secret
  const secret = req.headers.get("x-reset-secret");
  const expectedSecret = process.env.ADMIN_PASSWORD;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD env var is not set on this server." },
      { status: 500 }
    );
  }

  if (!secret || secret !== expectedSecret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { email, newPassword } = body as { email?: string; newPassword?: string };

  if (!email || !newPassword) {
    return NextResponse.json(
      { error: "Both email and newPassword are required." },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "newPassword must be at least 8 characters." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!user) {
    return NextResponse.json(
      { error: `No user found with email: ${email}` },
      { status: 404 }
    );
  }

  const hashed = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { email: email.trim().toLowerCase() },
    data:  { password: hashed },
  });

  return NextResponse.json({
    success: true,
    message: `Password updated for ${email}. You can now log in with this password.`,
    role:    user.role,
    hint:    user.role !== "ADMIN"
      ? "⚠️  This user's role is not ADMIN. Update it in Supabase → users table → role column."
      : "✅ Role is ADMIN. You can now login at /admin/login or /auth/login.",
  });
}
