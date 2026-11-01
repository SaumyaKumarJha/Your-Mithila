import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ── Simple in-memory rate limiter ─────────────────────────────────────────────
const authAttempts = new Map<string, { count: number; resetAt: number }>();
function rateLimit(ip: string, max = 10, windowMs = 15 * 60 * 1000): boolean {
  const now    = Date.now();
  const record = authAttempts.get(ip);
  if (!record || now > record.resetAt) {
    authAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  if (record.count >= max) return true;
  record.count++;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Rate-limit sensitive auth endpoints ───────────────────────────────────
  if (
    pathname === "/api/auth/send-otp"   ||
    pathname === "/api/auth/register"   ||
    pathname === "/api/auth/verify-otp"
  ) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (rateLimit(ip)) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait 15 minutes." },
        { status: 429 }
      );
    }
  }

  // ── ADMIN LOGIN PAGE — always public ─────────────────────────────────────
  if (pathname === "/admin/login") {
    const token = await getToken({
      req:    request,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "yourmithila-dev-secret",
    });
    // Already logged in as admin → go straight to dashboard
    if (token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // ── ALL /admin/* ROUTES — require JWT role=ADMIN ──────────────────────────
  if (pathname.startsWith("/admin")) {
    const token = await getToken({
      req:    request,
      secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "yourmithila-dev-secret",
    });
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (token.role !== "ADMIN") {
      // Non-admin logged-in user — 404 so panel isn't discoverable
      return new NextResponse(null, { status: 404 });
    }
    return NextResponse.next();
  }

  // For all other protected routes, get the JWT token once
  const token = await getToken({
    req:    request,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "yourmithila-dev-secret",
  });

  // ── DASHBOARD — requires login; SEEKERs only get /dashboard/profile ────────
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (token.role === "SEEKER" && pathname !== "/dashboard/profile") {
      return NextResponse.redirect(new URL("/saved", request.url));
    }
    return NextResponse.next();
  }

  // ── SEEKER / PROFILE pages — require login ─────────────────────────────────
  if (pathname.startsWith("/saved") || pathname.startsWith("/profile")) {
    if (!token) {
      const url = new URL("/auth/login", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // ── CHOOSE-ROLE — must be logged in ───────────────────────────────────────
  if (pathname === "/choose-role") {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/admin/login",           // explicit so Next.js matches it
    "/dashboard/:path*",
    "/saved/:path*",
    "/profile/:path*",
    "/choose-role",
    "/api/auth/send-otp",
    "/api/auth/register",
    "/api/auth/verify-otp",
  ],
};
