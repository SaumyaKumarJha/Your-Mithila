import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { createElement } from "react";
import { SubscriptionReceipt } from "@/components/receipt/SubscriptionReceipt";

const PLAN_LIMITS: Record<string, string> = {
  BASIC: "1 Property Listing",
  STANDARD: "3 Property Listings + Job Postings",
  PRO: "Unlimited Listings + Job Postings",
  YEARLY_STANDARD: "3 Property Listings + Job Postings (365 days)",
};

export async function GET(req: NextRequest, { params }: { params: { paymentId: string } }) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

  const userId = (session.user as any).id;
  const payment = await prisma.subscription.findFirst({
    where: { razorpayId: params.paymentId, userId },
    include: { user: true },
  });

  if (!payment) return new NextResponse("Not found", { status: 404 });

  const receiptNumber = `YM-${payment.id.slice(-8).toUpperCase()}`;
  const gst = payment.price * 0.18;
  const total = payment.price + gst;

  const pdfBuffer = await renderToBuffer(
    createElement(SubscriptionReceipt, {
      data: {
        receiptNumber,
        ownerName: payment.user.name,
        ownerEmail: payment.user.email,
        ownerPhone: payment.user.phone ?? "",
        plan: payment.plan,
        amount: payment.price,
        gst,
        total,
        paymentDate: new Date(payment.createdAt).toLocaleDateString("en-IN"),
        validFrom: new Date(payment.startDate).toLocaleDateString("en-IN"),
        validTo: new Date(payment.endDate).toLocaleDateString("en-IN"),
        razorpayId: payment.razorpayId ?? "N/A",
        listingLimit: PLAN_LIMITS[payment.plan] ?? payment.plan,
      },
    })
  );

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="YourMithila-Receipt-${receiptNumber}.pdf"`,
    },
  });
}
