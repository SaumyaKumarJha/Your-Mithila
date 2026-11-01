"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Download, AlertTriangle, Tag, X } from "lucide-react";
import { PayButton } from "@/components/payment/PayButton";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const PLAN_FEATURES: Record<string, string[]> = {
  BASIC:           ["1 property listing", "3 photos per listing", "WhatsApp contact button", "30 days validity"],
  STANDARD:        ["3 property listings", "8 photos per listing", "Priority in search", "Job postings", "30 days validity"],
  PRO:             ["Unlimited listings", "10 photos per listing", "Featured badge", "Job postings", "30 days validity"],
  YEARLY_STANDARD: ["3 property listings", "8 photos per listing", "Priority in search", "Job postings", "365 days validity", "2 months free"],
};

const PLAN_PRICES: Record<string, number> = { BASIC: 99, STANDARD: 249, PRO: 499, YEARLY_STANDARD: 1999 };
const PLAN_PERIOD: Record<string, string> = { BASIC: "mo", STANDARD: "mo", PRO: "mo", YEARLY_STANDARD: "yr" };

function daysRemaining(endDate: string) {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
}

// Promo code input component
function PromoCodeInput({
  amount,
  onApply,
  onClear,
}: {
  amount: number;
  onApply: (discount: number, finalAmount: number, code: string) => void;
  onClear: () => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; message: string; discount?: number } | null>(null);
  const [applied, setApplied] = useState(false);

  async function applyCode() {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/payments/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), amount }),
      });
      const data = await res.json();
      setResult(data);
      if (data.valid) {
        setApplied(true);
        onApply(data.discount, data.finalAmount, code.trim().toUpperCase());
      }
    } catch {
      setResult({ valid: false, message: "Failed to validate code. Try again." });
    }
    setLoading(false);
  }

  function clearCode() {
    setCode("");
    setResult(null);
    setApplied(false);
    onClear();
  }

  return (
    <div className="rounded-xl p-4 mb-4" style={{ border: "1px solid var(--border)", background: "var(--surface-alt)" }}>
      <label className="text-sm font-medium mb-2 block flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
        <Tag className="w-4 h-4" style={{ color: "var(--primary)" }} />
        Promo Code / कूपन कोड
      </label>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase()); if (applied) clearCode(); }}
          placeholder="Enter promo code (e.g. MITHILA50)"
          disabled={applied}
          className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none transition-colors"
          style={{
            borderColor: "var(--border)",
            background: applied ? "var(--surface-alt)" : "var(--surface)",
            color: "var(--text-primary)",
          }}
          onKeyDown={e => e.key === "Enter" && !applied && applyCode()}
        />
        {applied ? (
          <button onClick={clearCode}
            className="px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
            style={{ background: "var(--error-light)", color: "var(--error)", border: "1px solid var(--error)" }}>
            <X className="w-3.5 h-3.5" /> Remove
          </button>
        ) : (
          <button onClick={applyCode} disabled={loading || !code.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ background: "var(--primary)" }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
          </button>
        )}
      </div>
      {result && (
        <p className="text-sm mt-2 flex items-center gap-1"
          style={{ color: result.valid ? "var(--success)" : "var(--error)" }}>
          {result.valid ? "✅" : "❌"} {result.message}
        </p>
      )}
    </div>
  );
}

function SubscriptionContent() {
  const [current, setCurrent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [promoState, setPromoState] = useState<Record<string, { discount: number; finalAmount: number; code: string } | null>>({});
  const searchParams = useSearchParams();
  const successPaymentId = searchParams.get("paymentId");
  const isSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    fetch("/api/subscriptions").then(r => r.json()).then(d => { setCurrent(d); setLoading(false); });
  }, []);

  const isActive = current?.status === "ACTIVE" && current?.endDate && new Date(current.endDate) > new Date();
  const days = current?.endDate ? daysRemaining(current.endDate) : 0;

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--primary)" }} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>Subscription Plans</h1>
      <p className="text-sm mb-8" style={{ color: "var(--text-tertiary)" }}>
        Choose a plan to start listing properties and posting jobs
      </p>

      {/* Payment success screen */}
      {isSuccess && successPaymentId && (
        <div className="rounded-2xl p-6 mb-8 text-center border"
          style={{ background: "var(--success-light)", borderColor: "var(--success)" }}>
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: "var(--success)" }} />
          <h2 className="text-lg font-bold mb-1" style={{ color: "var(--success)" }}>Payment Successful!</h2>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>Your subscription is now active.</p>
          <div className="flex gap-3 justify-center">
            <a href={`/api/receipts/${successPaymentId}`} download
              className="btn-primary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2">
              <Download className="w-4 h-4" /> Download Receipt
            </a>
            <a href="/dashboard" className="btn-outline px-5 py-2.5 rounded-xl text-sm">Go to Dashboard</a>
          </div>
        </div>
      )}

      {/* Current plan status */}
      {isActive && current && (
        <div className="rounded-xl p-4 mb-8 border"
          style={{
            background: days <= 7 ? "var(--warning-light)" : "var(--success-light)",
            borderColor: days <= 7 ? "var(--warning)" : "var(--success)",
          }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-sm flex items-center gap-2"
                style={{ color: days <= 7 ? "var(--warning)" : "var(--success)" }}>
                {days <= 7 ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                {current.plan} Plan — Active
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                Expires {new Date(current.endDate).toLocaleDateString("en-IN")} · {days} days remaining
                {days <= 7 && " ⚠️ Expiring soon!"}
              </p>
            </div>
            {current.razorpayId && (
              <a href={`/api/receipts/${current.razorpayId}`} download
                className="btn-outline text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 self-start sm:self-auto">
                <Download className="w-3.5 h-3.5" /> Download Receipt
              </a>
            )}
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(PLAN_PRICES).map(([key, price]) => {
          const isCurrent = current?.plan === key && isActive;
          const isPopular = key === "STANDARD";
          const promo = promoState[key];
          const finalPrice = promo ? promo.finalAmount : price;

          return (
            <div key={key} className="rounded-2xl p-5 flex flex-col border-2 transition-all"
              style={{
                background: "var(--surface)",
                borderColor: isPopular ? "var(--primary)" : "var(--border)",
                boxShadow: isPopular ? "0 4px 24px rgba(124,58,237,0.15)" : undefined,
              }}>
              {isPopular && (
                <div className="text-xs font-bold mb-2" style={{ color: "var(--primary)" }}>⭐ MOST POPULAR</div>
              )}
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>{key.replace("_", " ")}</h3>
              <div className="mt-2">
                {promo ? (
                  <div>
                    <p className="text-lg line-through" style={{ color: "var(--text-muted)" }}>₹{price}</p>
                    <p className="text-3xl font-black" style={{ color: "var(--success)" }}>
                      ₹{promo.finalAmount}
                      <span className="text-sm font-normal" style={{ color: "var(--text-tertiary)" }}>/{PLAN_PERIOD[key]}</span>
                    </p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: "var(--success)" }}>
                      You save ₹{promo.discount}!
                    </p>
                  </div>
                ) : (
                  <p className="text-3xl font-black" style={{ color: "var(--primary)" }}>
                    ₹{price}
                    <span className="text-sm font-normal" style={{ color: "var(--text-tertiary)" }}>/{PLAN_PERIOD[key]}</span>
                  </p>
                )}
              </div>

              <ul className="mt-4 space-y-2 flex-1">
                {PLAN_FEATURES[key].map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs" style={{ color: "var(--text-secondary)" }}>
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Promo code input per plan */}
              {!isCurrent && (
                <div className="mt-4">
                  <PromoCodeInput
                    amount={price}
                    onApply={(discount, finalAmount, code) =>
                      setPromoState(prev => ({ ...prev, [key]: { discount, finalAmount, code } }))
                    }
                    onClear={() =>
                      setPromoState(prev => ({ ...prev, [key]: null }))
                    }
                  />
                </div>
              )}

              <div className="mt-3">
                <PayButton
                  plan={key}
                  price={price}
                  finalPrice={promo ? promo.finalAmount : undefined}
                  isCurrent={isCurrent}
                />
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs mt-6" style={{ color: "var(--text-muted)" }}>
        🔒 Payments secured by Razorpay • UPI, Cards, Net Banking accepted
      </p>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    }>
      <SubscriptionContent />
    </Suspense>
  );
}
