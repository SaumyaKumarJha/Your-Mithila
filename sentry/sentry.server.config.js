// Server-side Sentry initialization. Requires `@sentry/nextjs` to be installed.
if (process.env.SENTRY_DSN) {
  try {
    const Sentry = require('@sentry/nextjs')
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.05,
      environment: process.env.SENTRY_ENVIRONMENT || process.env.VERCEL_ENV || 'production',
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Sentry (server) failed to initialize:', e.message || e)
  }
}
