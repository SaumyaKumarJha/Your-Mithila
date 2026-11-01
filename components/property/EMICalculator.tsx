"use client";
import { useState, useMemo } from "react";
import { Calculator } from "lucide-react";

interface Props {
  price: number;
}

export function EMICalculator({ price }: Props) {
  const [loanAmount, setLoanAmount] = useState(Math.round(price * 0.8));
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);

  const emi = useMemo(() => {
    const r = rate / 12 / 100;
    const n = tenure * 12;
    if (r === 0) return loanAmount / n;
    return (loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }, [loanAmount, rate, tenure]);

  const totalPayment = emi * tenure * 12;
  const totalInterest = totalPayment - loanAmount;

  return (
    <div className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-4 h-4" style={{ color: "var(--primary)" }} />
        <h4 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>EMI Calculator</h4>
      </div>
      <p className="text-xs mb-4" style={{ color: "var(--text-tertiary)" }}>
        Estimate your monthly EMI if buying on loan
      </p>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
            Loan Amount (₹)
          </label>
          <input
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(Number(e.target.value))}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
            style={{
              border: "1px solid var(--border)",
              background: "var(--surface-alt)",
              color: "var(--text-primary)",
              focusRingColor: "var(--primary)",
            }}
          />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
            Interest Rate (% per year)
          </label>
          <input
            type="number"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{ border: "1px solid var(--border)", background: "var(--surface-alt)", color: "var(--text-primary)" }}
          />
        </div>
        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: "var(--text-secondary)" }}>
            Tenure (years)
          </label>
          <input
            type="number"
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none"
            style={{ border: "1px solid var(--border)", background: "var(--surface-alt)", color: "var(--text-primary)" }}
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl p-4" style={{ background: "var(--primary-light)" }}>
        <p className="text-xs mb-1" style={{ color: "var(--text-tertiary)" }}>Estimated Monthly EMI</p>
        <p className="text-2xl font-black" style={{ color: "var(--primary)" }}>
          ₹{Math.round(emi).toLocaleString("en-IN")}
          <span className="text-sm font-normal">/month</span>
        </p>
        <div className="mt-2 space-y-1 text-xs" style={{ color: "var(--text-tertiary)" }}>
          <p>Total Interest: ₹{Math.round(totalInterest).toLocaleString("en-IN")}</p>
          <p>Total Payment: ₹{Math.round(totalPayment).toLocaleString("en-IN")}</p>
        </div>
      </div>
      <p className="text-xs mt-2 text-center" style={{ color: "var(--text-muted)" }}>
        * Indicative only. Actual EMI may vary.
      </p>
    </div>
  );
}
