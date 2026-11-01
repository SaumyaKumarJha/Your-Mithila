import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { code, amount } = await req.json();

    if (!code || !amount) {
      return NextResponse.json({ valid: false, error: "Code and amount are required" }, { status: 400 });
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    });

    if (!promo || !promo.isActive) {
      return NextResponse.json({ valid: false, error: "Invalid promo code" });
    }

    if (new Date() > promo.validUntil) {
      return NextResponse.json({ valid: false, error: "This promo code has expired" });
    }

    if (new Date() < promo.validFrom) {
      return NextResponse.json({ valid: false, error: "This promo code is not yet active" });
    }

    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ valid: false, error: "This promo code has reached its usage limit" });
    }

    if (promo.minAmount !== null && amount < promo.minAmount) {
      return NextResponse.json({
        valid: false,
        error: `Minimum order amount is ₹${promo.minAmount} for this code`,
      });
    }

    const discount =
      promo.discountType === "PERCENT"
        ? Math.round((amount * promo.discountValue) / 100)
        : promo.discountValue;

    const finalAmount = Math.max(0, amount - discount);

    return NextResponse.json({
      valid: true,
      discount,
      finalAmount,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      message: `🎉 Promo applied! You save ₹${discount.toFixed(0)}`,
    });
  } catch (error) {
    console.error("Promo validation error:", error);
    return NextResponse.json({ valid: false, error: "Failed to validate promo code" }, { status: 500 });
  }
}
