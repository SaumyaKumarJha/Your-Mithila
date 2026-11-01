import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  propertyId: z.string().optional(),
  jobId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
  name: z.string().min(2).optional(),
  location: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const data = schema.parse(body);

    if (!data.propertyId && !data.jobId) {
      return NextResponse.json({ error: "Either propertyId or jobId is required" }, { status: 400 });
    }

    // Get user info for name/location if logged in
    let reviewerName = data.name ?? "Anonymous";
    let reviewerLocation = data.location ?? "Mithila Region";

    if (session?.user) {
      const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { name: true, city: true },
      });
      if (user) {
        reviewerName = user.name;
        reviewerLocation = user.city ?? "Mithila Region";
      }
    }

    const review = await prisma.review.create({
      data: {
        name: reviewerName,
        location: reviewerLocation,
        rating: data.rating,
        comment: data.comment,
        propertyId: data.propertyId ?? null,
        jobId: data.jobId ?? null,
        userId: session?.user ? (session.user as any).id : null,
        isApproved: false, // Admin must approve before showing
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review submitted successfully! It will appear after admin approval.",
      reviewId: review.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Review submit error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");
    const jobId = searchParams.get("jobId");

    if (!propertyId && !jobId) {
      return NextResponse.json({ error: "propertyId or jobId required" }, { status: 400 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        isApproved: true,
        ...(propertyId ? { propertyId } : {}),
        ...(jobId ? { jobId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}
