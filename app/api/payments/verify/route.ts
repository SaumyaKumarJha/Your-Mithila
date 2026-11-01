import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const PLAN_DURATION: Record<string, number> = { BASIC: 30, STANDARD: 30, PRO: 30, YEARLY_STANDARD: 365 };
const PLAN_PRICES_RS: Record<string, number> = { BASIC: 99, STANDARD: 249, PRO: 499, YEARLY_STANDARD: 1999 };

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = await req.json();

  // Verify signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }

  const userId = (session.user as any).id;
  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (PLAN_DURATION[plan] ?? 30));

  // Cancel existing active subscription
  await prisma.subscription.updateMany({
    where: { userId, status: "ACTIVE" },
    data: { status: "CANCELLED" },
  });

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      plan,
      status: "ACTIVE",
      startDate,
      endDate,
      price: PLAN_PRICES_RS[plan] ?? 99,
      razorpayId: razorpay_payment_id,
    },
  });

  return NextResponse.json({ success: true, subscription, paymentId: razorpay_payment_id });
}
