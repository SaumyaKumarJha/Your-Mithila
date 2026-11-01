import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getRazorpay, PLANS } from "@/lib/razorpay";

const schema = z.object({ plan: z.enum(["BASIC", "STANDARD", "PRO", "YEARLY_STANDARD"]) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { plan } = schema.parse(await req.json());
    const planInfo = PLANS[plan];

    const order = await getRazorpay().orders.create({
      amount: planInfo.price * 100, // paise
      currency: "INR",
      receipt: `yourmithila_${(session.user as any).id}_${Date.now()}`,
      notes: { plan, userId: (session.user as any).id },
    });

    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, plan });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sub = await prisma.subscription.findUnique({
    where: { userId: (session.user as any).id },
  });
  return NextResponse.json(sub);
}
