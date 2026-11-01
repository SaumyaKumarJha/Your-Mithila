# 🚀 Deployment Guide — yourmithila.in

## Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial production build — Your Mithila"
# Create repo on github.com named "yourmithila"
git remote add origin https://github.com/YOUR_USERNAME/yourmithila.git
git push -u origin main
```

## Step 2: Set Up Neon PostgreSQL (Free Database)

1. Go to **neon.tech** → Sign up free
2. Create new project → Name: "yourmithila"
3. Copy the **Connection String** (looks like: `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`)
4. Use this as your `DATABASE_URL` and `DIRECT_URL` in Vercel env vars

## Step 3: Deploy to Vercel

1. Go to **vercel.com** → Sign up with GitHub
2. Click **New Project** → Import your `yourmithila` repo
3. Add ALL environment variables from `.env.example`:
   - `DATABASE_URL` = your Neon connection string
   - `DIRECT_URL` = same Neon connection string
   - `NEXTAUTH_SECRET` = run `openssl rand -base64 32` to generate
   - `NEXTAUTH_URL` = `https://yourmithila.in`
   - All other keys from `.env.example`
4. Click **Deploy** → Wait ~3 minutes

## Step 4: Run Database Migrations

After first deploy, in Vercel dashboard:
- Go to your project → **Functions** tab → or use local terminal:
```bash
npx prisma db push
npx prisma db seed
```

## Step 5: Connect GoDaddy Domain (yourmithila.in)

### In Vercel:
1. Go to your project → **Settings** → **Domains**
2. Add `yourmithila.in` → Click Add
3. Add `www.yourmithila.in` → Click Add
4. Vercel will show you the DNS records needed

### In GoDaddy:
1. Login to **godaddy.com** → My Products → **yourmithila.in**
2. Click **DNS** or **Manage DNS**
3. **Delete** the existing A record for `@` (if any)
4. **Add** these records:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 76.76.21.21 | 600 |
| CNAME | www | cname.vercel-dns.com | 600 |

5. Save changes
6. Wait **10 minutes to 48 hours** for DNS propagation
7. Vercel will auto-provision **SSL certificate** (HTTPS) ✅

## Step 6: Update Google OAuth

1. Go to **console.cloud.google.com**
2. APIs & Services → Credentials → Your OAuth Client
3. Add to **Authorized redirect URIs**:
   - `https://yourmithila.in/api/auth/callback/google`
   - `https://www.yourmithila.in/api/auth/callback/google`

## Step 7: Verify Everything Works

- [ ] https://yourmithila.in loads ✅
- [ ] https://www.yourmithila.in redirects to yourmithila.in ✅
- [ ] SSL padlock shows in browser ✅
- [ ] Login/Register works ✅
- [ ] Admin panel at /admin/login works ✅
- [ ] Dark mode toggle works ✅

## Admin Credentials
- URL: https://yourmithila.in/admin/login
- Admin ID: `yourmithila_admin`
- Password: `YM@Admin2025`

> ⚠️ Change these in production by updating the values in `app/admin/login/page.tsx`
