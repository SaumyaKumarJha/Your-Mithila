import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getOwnedListing(id: string, userId: string) {
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property || property.ownerId !== userId) return null;
  return property;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const property = await getOwnedListing(params.id, userId);
  if (!property) return NextResponse.json({ error: "Listing not found or access denied" }, { status: 404 });
  return NextResponse.json(property);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const property = await getOwnedListing(params.id, userId);
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.property.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const property = await getOwnedListing(params.id, userId);
  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.property.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
