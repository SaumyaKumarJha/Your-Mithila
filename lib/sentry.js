// Lightweight Sentry wrapper — pure ESM, safe to import from client or server.
// Dynamically requires @sentry/nextjs so it never crashes if Sentry is not configured.

export function captureException(err) {
  try {
    // Dynamic require so Next.js bundler doesn't fail if @sentry/nextjs is absent
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sentry = require("@sentry/nextjs");
    if (Sentry && typeof Sentry.captureException === "function") {
      Sentry.captureException(err);
    } else {
      console.error("[captureException] Sentry unavailable:", err);
    }
  } catch (e) {
    // Never let Sentry errors break the UI
    console.error("[captureException] failed:", e);
    console.error(err);
  }
}
