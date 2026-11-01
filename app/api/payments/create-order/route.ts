import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import Razorpay from "razorpay";

const PLAN_PRICES: Record<string, number> = {
  BASIC: 9900, STANDARD: 24900, PRO: 49900, YEARLY_STANDARD: 199900,
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan, finalPrice } = await req.json();
  const baseAmount = PLAN_PRICES[plan];
  if (!baseAmount) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  // Use finalPrice (after promo) if provided, otherwise use base price
  // finalPrice is in rupees, convert to paise
  const amount = finalPrice ? Math.round(finalPrice * 100) : baseAmount;

  // Validate finalPrice is not less than 1 rupee (Razorpay minimum)
  if (amount < 100) {
    return NextResponse.json({ error: "Amount too low after discount" }, { status: 400 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: `sub_${(session.user as any).id}_${Date.now()}`,
    notes: { userId: (session.user as any).id, plan },
  });

  return NextResponse.json({ orderId: order.id, amount: order.amount, currency: "INR" });
}
