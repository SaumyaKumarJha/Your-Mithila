## Production Readiness Checklist

This file lists practical steps to prepare and maintain the production deployment for YourMithila.

1. Environment variables (set in Vercel or your host)
   - `NEXTAUTH_SECRET` – long random string
   - `NEXTAUTH_URL` – https://yourmithila.in
   - `DATABASE_URL` – production database connection
   - `DIRECT_URL` – (if using read replicas)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
   - `RESEND_API_KEY` or `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS`
   - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`
   - `SENTRY_DSN` (optional)
   - `CLOUDINARY_URL` (if using Cloudinary for images)

2. OAuth & Email providers
   - Create production OAuth credentials (Google) and set redirect URIs to `https://yourmithila.in/api/auth/callback/google`.
   - Configure the email provider (Resend or SMTP) and verify the `FROM` email.

3. Vercel project settings
   - Ensure production branch is `main` and deployments are enabled.
   - Add the custom domain `yourmithila.in` and verify domain ownership in Vercel.
   - Add all environment variables in the Vercel dashboard (Production scope).
   - Configure redirects and headers in `vercel.json` (already present).

4. Monitoring & error tracking
   - Add Sentry to the project and set `SENTRY_DSN` in env. See `SENTRY SETUP` below.
   - Add uptime checks (UptimeRobot / Pingdom) for `/`, `/api/health` (create one if missing).

5. Backups
   - Ensure daily DB backups and a retention policy are configured with your DB provider.
   - Backup uploaded media if stored outside cloud provider; for CDN buckets enable versioning.

6. CI/CD and deploy previews
   - CI should run `npm run build` and smoke tests on PRs and on `main` before promoting.
   - Vercel preview deployments are recommended for each PR.

7. Security & performance
   - Harden HTTP headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` already in `vercel.json`).
   - Rate-limit public APIs and add bot protections where needed.
   - Use an image CDN, enable caching headers on static assets, and optimize fonts.

8. SEO & Legal
   - Confirm `sitemap.xml` and `robots.txt` are reachable (they are).
   - Add `Privacy Policy` and `Cookie Consent` pages. See `PRIVACY_POLICY.md`.

9. Testing before launch
   - Smoke-test critical flows: sign-up/login, payment checkout, listing creation, file upload.
   - Run Lighthouse and fix Core Web Vitals issues.

### SENTRY SETUP (quick)
 - Install `@sentry/nextjs` and follow the official docs to initialize in `sentry.client.config.js` and `sentry.server.config.js`.
 - Set `SENTRY_DSN` in Vercel (Production) and optionally set `SENTRY_ENVIRONMENT` and `SENTRY_TRACES_SAMPLE_RATE`.

### Uptime check suggestion
 - Create an uptime monitor for `https://yourmithila.in/` and `https://yourmithila.in/api/health` (create a lightweight `/api/health` that returns 200).

### Structured data & social
 - Add JobPosting schema for job listings and LocalBusiness schema for business info; generate OG images and set `og:image` in metadata.

### Rollback plan (high level)
 - Revert the faulty commit on GitHub and re-deploy via Vercel, or use Vercel's deployment history to restore a previous deployment.

If you want, I can: add a simple `/api/health` route, a smoke-test script, a GitHub Actions CI workflow, and a Privacy Policy template.
