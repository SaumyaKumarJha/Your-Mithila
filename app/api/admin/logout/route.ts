import { NextResponse } from "next/server";

export async function GET() {
  const res = NextResponse.redirect(
    new URL("/admin/login", process.env.NEXTAUTH_URL ?? "https://yourmithila.in")
  );
  // Clear legacy cookie if it exists
  res.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
  return res;
}

export async function POST() {
  const res = NextResponse.json({ success: true });
  // Clear legacy cookie if it exists
  res.cookies.set("admin_session", "", { maxAge: 0, path: "/" });
  return res;
}
