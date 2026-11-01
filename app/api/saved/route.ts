/**
 * GET  /api/saved          — list all saved property IDs for the current user
 * POST /api/saved          — save a property { propertyId }
 * DELETE /api/saved        — unsave a property { propertyId }
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ── GET — return saved property IDs ──────────────────────────────────────────
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ ids: [] });

  const userId = (session.user as any).id;
  const saved = await prisma.savedProperty.findMany({
    where: { userId },
    select: { propertyId: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ ids: saved.map(s => s.propertyId) });
}

// ── POST — save a property ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Login required to save properties" }, { status: 401 });
  }

  const { propertyId } = await req.json();
  if (!propertyId) {
    return NextResponse.json({ error: "propertyId is required" }, { status: 400 });
  }

  const userId = (session.user as any).id;

  // Upsert — idempotent
  await prisma.savedProperty.upsert({
    where: { userId_propertyId: { userId, propertyId } },
    update: {},
    create: { userId, propertyId },
  });

  return NextResponse.json({ success: true, saved: true });
}

// ── DELETE — unsave a property ────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { propertyId } = await req.json();
  if (!propertyId) {
    return NextResponse.json({ error: "propertyId is required" }, { status: 400 });
  }

  const userId = (session.user as any).id;

  await prisma.savedProperty.deleteMany({
    where: { userId, propertyId },
  });

  return NextResponse.json({ success: true, saved: false });
}
