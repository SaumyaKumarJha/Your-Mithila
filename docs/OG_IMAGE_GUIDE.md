# OG Image Generation Guide

This document outlines options to generate open-graph (OG) images for social previews.

Options:

- Static images
  - Create a set of static OG images (1200x630) and store in `public/og/`.
  - Use `og:image` meta tags in your pages: `<meta property="og:image" content="/og/home-1200x630.png" />`.

- Dynamic generation (recommended for per-listing images)
  - Use a hosted image service like Cloudinary or Imgix to compose images on the fly.
  - Or use Vercel's `@vercel/og` to render images server-side (requires adding the package).

Sample approach (Cloudinary)

1. Upload a template background to Cloudinary.
2. Build dynamic URLs that overlay text (title, price, location) and a logo.
3. Use that URL in the `og:image` meta tag.

Minimal meta example to add to `app/layout.tsx` metadata:

```
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={imageUrl} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

Dynamic OG with `@vercel/og` (example sketch)

1. Install: `npm i @vercel/og`
2. Create an API route `app/api/og/route.ts` that renders an image and returns it as `image/png`.
3. Reference `/api/og?title=...&price=...` in `og:image`.

If you want, I can add a small `app/api/og/route.ts` based on `@vercel/og` and a sample Cloudinary template URL.
