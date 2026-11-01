import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { propertyId, jobId } = await req.json();
    if (propertyId) {
      await prisma.property.update({ where: { id: propertyId }, data: { whatsappClicks: { increment: 1 } } });
    } else if (jobId) {
      await prisma.job.update({ where: { id: jobId }, data: { whatsappClicks: { increment: 1 } } });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
