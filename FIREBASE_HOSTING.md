# 🔥 Firebase Hosting + GoDaddy DNS Setup Guide
## yourmithila.in — Complete Deployment Guide

---

## ⚠️ IMPORTANT NOTE ABOUT NEXT.JS + FIREBASE

Next.js uses **server-side rendering (SSR)** and API routes which **cannot run on Firebase Hosting alone**
(Firebase Hosting only serves static files).

### You have TWO options:

**Option A — Keep Vercel (RECOMMENDED for your app)**
Your app has API routes, Prisma DB calls, NextAuth, OTP emails — all need a server.
Vercel handles this perfectly and is FREE. Just connect your GoDaddy domain to Vercel.
→ See DEPLOYMENT.md for Vercel + GoDaddy DNS steps.

**Option B — Firebase Hosting + Cloud Functions (Complex)**
Export static pages to Firebase Hosting, run API routes as Cloud Functions.
This requires significant refactoring and Firebase Blaze (paid) plan.

---

## ✅ RECOMMENDED: Connect yourmithila.in to Vercel (Easiest)

### Step 1 — Add domain in Vercel
1. Go to vercel.com → your project → **Settings** → **Domains**
2. Click **Add** → type `yourmithila.in` → Add
3. Click **Add** → type `www.yourmithila.in` → Add
4. Vercel shows you the DNS records needed (copy them)

### Step 2 — Configure GoDaddy DNS
1. Login to **godaddy.com** → My Products → **yourmithila.in** → **DNS**
2. Delete any existing **A record** for `@`
3. Add these records:

| Type  | Name | Value                  | TTL  |
|-------|------|------------------------|------|
| A     | @    | 76.76.21.21            | 600  |
| CNAME | www  | cname.vercel-dns.com   | 600  |

4. Save → Wait 10 min–48 hours for DNS propagation
5. Vercel auto-provisions SSL ✅

---

## 🔥 IF YOU STILL WANT FIREBASE (Static Export Only)

> This only works if you convert your app to static export (no API routes, no SSR).
> Your current app CANNOT be fully hosted on Firebase without major changes.

### Step 1 — Install Firebase CLI

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Verify installation
firebase --version
```

### Step 2 — Login to Firebase

```bash
firebase login
# Opens browser → login with your Google account
```

### Step 3 — Create Firebase Project

```bash
# Go to console.firebase.google.com
# Click "Add project" → name it "yourmithila-in"
# Disable Google Analytics (optional) → Create project
```

### Step 4 — Initialize Firebase in your project

```bash
cd C:\Users\jhari\IdeaProjects\yourmithila.in

firebase init hosting
# Select: Use an existing project → yourmithila-in
# Public directory: out
# Single-page app: YES
# Overwrite index.html: NO
```

### Step 5 — Add static export to next.config.js

```js
// next.config.js — ADD this line for static export
const nextConfig = {
  output: 'export',        // ← ADD THIS
  trailingSlash: false,
  images: { unoptimized: true },  // ← Required for static export
  // ... rest of config
};
```

### Step 6 — Build and Export

```bash
# Build the static export
npm run build
# This creates an "out/" folder with all static files
```

### Step 7 — Deploy to Firebase

```bash
# Deploy to Firebase Hosting
firebase deploy --only hosting

# Your site will be live at:
# https://yourmithila-in.web.app
# https://yourmithila-in.firebaseapp.com
```

---

## 🌐 Connect yourmithila.in to Firebase Hosting

### Step 1 — Add custom domain in Firebase Console
1. Go to **console.firebase.google.com** → your project
2. **Hosting** → **Add custom domain**
3. Enter `yourmithila.in` → Continue
4. Firebase shows you **TXT record** for domain verification

### Step 2 — Verify domain ownership in GoDaddy
1. Login to **godaddy.com** → My Products → **yourmithila.in** → **DNS**
2. Add the **TXT record** Firebase gave you:

| Type | Name | Value                          | TTL  |
|------|------|--------------------------------|------|
| TXT  | @    | firebase=yourmithila-in-xxxxx  | 600  |

3. Click **Verify** in Firebase Console
4. Wait up to 24 hours for verification

### Step 3 — Add A records for Firebase
After verification, Firebase shows you **two A record IPs**.
Add them in GoDaddy DNS:

| Type | Name | Value           | TTL  |
|------|------|-----------------|------|
| A    | @    | 151.101.1.195   | 600  |
| A    | @    | 151.101.65.195  | 600  |

> ⚠️ Firebase A record IPs may differ — always use the exact IPs shown in YOUR Firebase Console.

### Step 4 — Handle www subdomain
Add a CNAME for www:

| Type  | Name | Value                        | TTL  |
|-------|------|------------------------------|------|
| CNAME | www  | yourmithila-in.web.app       | 600  |

### Step 5 — Wait for SSL
Firebase auto-provisions SSL certificate within 24 hours.
Your site will be live at https://yourmithila.in ✅

---

## 📋 Complete DNS Records Summary (GoDaddy)

### For Vercel (Recommended):
| Type  | Name | Value                | TTL  |
|-------|------|----------------------|------|
| A     | @    | 76.76.21.21          | 600  |
| CNAME | www  | cname.vercel-dns.com | 600  |

### For Firebase Hosting:
| Type  | Name | Value                    | TTL  |
|-------|------|--------------------------|------|
| TXT   | @    | firebase=your-project-id | 600  |
| A     | @    | 151.101.1.195            | 600  |
| A     | @    | 151.101.65.195           | 600  |
| CNAME | www  | your-project.web.app     | 600  |

---

## 🚀 Quick Deploy Commands Reference

```bash
# === VERCEL (Recommended) ===
git add -A
git commit -m "deploy"
git push origin main
# Vercel auto-deploys on every push ✅

# === FIREBASE ===
npm run build          # Build static export (out/ folder)
firebase deploy        # Deploy to Firebase Hosting

# === FIREBASE — Deploy only hosting (not functions)
firebase deploy --only hosting

# === Check Firebase deployment status
firebase hosting:channel:list
```

---

## 🔑 Environment Variables on Vercel

Go to: vercel.com → Project → Settings → Environment Variables

Add all variables from .env.example:
- DATABASE_URL
- NEXTAUTH_SECRET  
- NEXTAUTH_URL = https://yourmithila.in  ← IMPORTANT
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- RESEND_API_KEY
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
