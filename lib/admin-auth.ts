/**
 * Admin authentication helper for API routes.
 * Uses NextAuth JWT with role=ADMIN only (no custom cookie).
 */
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function requireAdmin(req: NextRequest): Promise<NextResponse | null> {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "yourmithila-dev-secret",
  });

  if (token?.role === "ADMIN") return null; // allowed

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
