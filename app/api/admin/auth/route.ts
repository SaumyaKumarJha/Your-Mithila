/**
 * POST /api/admin/auth
 *
 * Verifies admin credentials against env vars (ADMIN_ID + ADMIN_PASSWORD).
 * On success, ensures an ADMIN user row exists in the DB and returns
 * the email + password so the login page can call NextAuth signIn().
 *
 * This replaces the old cookie-based system with NextAuth JWT (role=ADMIN),
 * which works reliably on Vercel's edge runtime.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const attempts = new Map<string, { count: number; lockedUntil: number }>();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function trackFailure(ip: string) {
  const now     = Date.now();
  const current = attempts.get(ip) ?? { count: 0, lockedUntil: 0 };
  current.count += 1;
  if (current.count >= 5) {
    current.lockedUntil = now + 15 * 60 * 1000;
    current.count       = 0;
  }
  attempts.set(ip, current);
}

export async function POST(req: NextRequest) {
  const ip  = getClientIp(req);
  const now = Date.now();

  // Rate limit
  const record = attempts.get(ip);
  if (record && record.lockedUntil > now) {
    const mins = Math.ceil((record.lockedUntil - now) / 60000);
    return NextResponse.json(
      { error: `Too many failed attempts. Try again in ${mins} minute(s).` },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const { username, password } = body as { username?: string; password?: string };

  if (!username || !password) {
    return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
  }

  const envAdminId  = process.env.ADMIN_ID       || "yourmithila_admin";
  const envAdminPwd = process.env.ADMIN_PASSWORD  || "YM@Admin2025";
  const adminEmail  = process.env.ADMIN_EMAIL     || "admin@yourmithila.in";

  if (username.trim() !== envAdminId || password !== envAdminPwd) {
    trackFailure(ip);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  attempts.delete(ip);

  // Ensure an ADMIN user row exists in DB so NextAuth can find it,
  // and ALWAYS sync the password hash to match current env var password.
  const hashedPw = await bcrypt.hash(password, 12);

  let adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  }).catch(() => null);

  if (!adminUser) {
    // No admin row yet — create one
    adminUser = await prisma.user.create({
      data: {
        name:     "Admin",
        email:    adminEmail,
        password: hashedPw,
        role:     "ADMIN",
      },
    }).catch(() => null);
  } else {
    // Admin row exists — always update password hash to current env var value
    // This ensures password changes in Vercel env vars take effect immediately
    adminUser = await prisma.user.update({
      where: { id: adminUser.id },
      data:  { password: hashedPw },
    }).catch(() => adminUser);
  }

  if (!adminUser) {
    return NextResponse.json({ error: "Failed to prepare admin account" }, { status: 500 });
  }

  return NextResponse.json({
    success:  true,
    email:    adminUser.email,
    password: password, // plain-text, passed straight to NextAuth signIn()
  });
}
