"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

declare global { interface Window { Razorpay: any; } }

function loadRazorpayScript(): Promise<void> {
  return new Promise(resolve => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    document.body.appendChild(s);
  });
}

interface Props {
  plan: string;
  price: number;
  finalPrice?: number; // After promo discount
  label?: string;
  isCurrent?: boolean;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
}

export function PayButton({ plan, price, finalPrice, label, isCurrent, userName, userEmail, userPhone }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const payAmount = finalPrice ?? price;

  async function handlePayment() {
    setLoading(true);
    try {
      await loadRazorpayScript();
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, finalPrice: payAmount }),
      });
      const { orderId, amount, error } = await orderRes.json();
      if (error) { toast.error(error); setLoading(false); return; }

      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: "INR",
        name: "Your Mithila",
        description: `${plan} Subscription`,
        order_id: orderId,
        theme: { color: "#7C3AED" },
        prefill: { name: userName ?? "", email: userEmail ?? "", contact: userPhone ?? "" },
        handler: async (response: any) => {
          const verifyRes = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...response, plan }),
          });
          const data = await verifyRes.json();
          if (data.success) {
            toast.success("Subscription activated! 🎉");
            router.push(`/dashboard/subscription?success=true&paymentId=${data.paymentId}`);
          } else {
            toast.error("Payment verification failed. Contact support.");
          }
        },
        modal: { ondismiss: () => setLoading(false) },
      });
      rzp.open();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  if (isCurrent) {
    return (
      <button disabled className="w-full py-2.5 rounded-xl font-semibold text-sm cursor-default"
        style={{ background: "var(--success-light)", color: "var(--success)" }}>
        ✓ Current Plan
      </button>
    );
  }

  return (
    <button onClick={handlePayment} disabled={loading}
      className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 text-white disabled:opacity-60"
      style={{ background: "var(--primary)" }}>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {label ?? (finalPrice && finalPrice < price
        ? `Pay ₹${finalPrice} (was ₹${price})`
        : `Pay ₹${price} via UPI / Card`
      )}
    </button>
  );
}
