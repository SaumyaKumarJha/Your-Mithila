import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyRazorpaySignature, PLANS } from "@/lib/razorpay";
import { sendSubscriptionConfirmation } from "@/lib/email";

const schema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
  plan: z.enum(["BASIC", "STANDARD", "PRO", "YEARLY_STANDARD"]),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await req.json());
    const valid = verifyRazorpaySignature(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature
    );

    if (!valid) return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });

    const planInfo = PLANS[body.plan];
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + planInfo.duration);

    // Upsert subscription
    await prisma.subscription.upsert({
      where: { userId: (session.user as any).id },
      update: {
        plan: body.plan,
        status: "ACTIVE",
        startDate: new Date(),
        endDate,
        price: planInfo.price,
        razorpayId: body.razorpay_payment_id,
      },
      create: {
        userId: (session.user as any).id,
        plan: body.plan,
        status: "ACTIVE",
        endDate,
        price: planInfo.price,
        razorpayId: body.razorpay_payment_id,
      },
    });

    // Send confirmation email
    const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
    if (user?.email) {
      await sendSubscriptionConfirmation(user.email, user.name, planInfo.label, endDate).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
