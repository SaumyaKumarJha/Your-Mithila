import Razorpay from "razorpay";
import crypto from "crypto";

export function getRazorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

export const PLANS = {
  BASIC: { price: 99, label: "Basic", listings: 1, photos: 3, duration: 30 },
  STANDARD: { price: 249, label: "Standard", listings: 3, photos: 8, duration: 30 },
  PRO: { price: 499, label: "Pro", listings: -1, photos: 10, duration: 30 },
  YEARLY_STANDARD: { price: 1999, label: "Yearly Standard", listings: 3, photos: 8, duration: 365 },
} as const;

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = orderId + "|" + paymentId;
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");
  return expected === signature;
}
