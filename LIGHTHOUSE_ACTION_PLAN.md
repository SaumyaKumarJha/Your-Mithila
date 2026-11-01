# Lighthouse Audit — Action Plan

Audit summary (key metrics):

- First Contentful Paint (FCP): 1.4 s — good
- Largest Contentful Paint (LCP): 2.5 s — borderline; target < 2.5s
- Speed Index: 3.9 s
- Total Blocking Time (TBT): 270 ms — improve towards <200ms
- Time to Interactive (TTI): 2.6 s
- Cumulative Layout Shift (CLS): 0 — good

Top opportunities (from report) and remediation steps (priority ordered):

1) Optimize hero / LCP image
- Preload the LCP image (add `<link rel="preload" as="image" href="/path/to/hero.jpg">`).
- Serve optimized WebP/AVIF via Next/Image or a CDN; compress and set width/height.
- Ensure hero image is server-rendered where possible so it paints early.

2) Reduce unused JS & chunk sizes
- Audit heavy client bundles using `next build` output and the DevTools Coverage tab.
- Convert non-critical components to `use client` only when necessary; prefer server components.
- Code-split large components, lazy-load non-essential widgets (chatbot, maps).

3) Font loading
- Preload key fonts used in LCP and use `font-display: swap`.
- Prefer subset fonts for production (woff2) and avoid blocking render.

4) Optimize critical CSS and avoid render-blocking styles
- Ensure global critical styles are small; defer large CSS if possible.
- Use Next.js built-in CSS splitting (already used) and ensure CSS bundles are minimal.

5) Defer third-party scripts & analytics
- Load analytics, chat widgets, and other third-party libs after interactive using `defer` or afterIdle techniques.

6) Improve TBT by reducing long tasks
- Break up heavy JS tasks, reduce expensive synchronous work on main thread.
- Use web workers for heavy CPU tasks if applicable.

7) Use image CDN, caching, and compression headers
- Serve static assets via CDN and add proper caching headers for images and assets.

8) Lighthouse follow-up checklist
- Add synthetic Lighthouse runs to CI (optional via `lighthouse-ci`) and gate major regressions.
- Collect Real User Monitoring (RUM) for Core Web Vitals (Google Analytics / web-vitals or Sentry Performance).

Quick commands & checks

- Run Lighthouse locally (we ran it and saved `lighthouse-report.json`).
- Check Next build sizes:

```
npm run build
# inspect .next/chunks and first-load sizes printed by Next
```

- Audit bundle with `source-map-explorer` or `next build && next analyze` (add analyzer plugin).

Suggested immediate tasks (this sprint)

1. Preload hero image + serve WebP/AVIF versions.
2. Subset & preload critical font(s); use `font-display: swap`.
3. Lazy-load non-essential widgets (Chatbot, MapEmbed) behind client-only boundary.
4. Move analytics to `afterInteractive` or load via `requestIdleCallback`.
5. Run follow-up Lighthouse after each change and track improvements.

If you want, I can:
- Implement the `link rel=preload` for the hero image and add `font-display` to your fonts.
- Add a Lighthouse CI job to `.github/workflows/ci.yml` to fail PRs that regress performance.

Report file: `lighthouse-report.json` (committed). 
