import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getOwnedJob(id: string, userId: string) {
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job || job.postedById !== userId) return null;
  return job;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const job = await getOwnedJob(params.id, userId);
  if (!job) return NextResponse.json({ error: "Job not found or access denied" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const job = await getOwnedJob(params.id, userId);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.job.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const job = await getOwnedJob(params.id, userId);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.job.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
