"use client";

import { useEffect } from "react";
import { captureException } from "@/lib/sentry";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--background)" }}>
      <div className="text-center">
        <div className="text-5xl mb-4">😔</div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
          Something went wrong
        </h2>
        <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
          We encountered an unexpected error. Please try again.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={reset}
            className="px-5 py-2.5 text-white font-medium rounded-xl text-sm transition-all"
            style={{ background: "var(--primary)" }}
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-5 py-2.5 font-medium rounded-xl text-sm transition-all border"
            style={{ borderColor: "var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
