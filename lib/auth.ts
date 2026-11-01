import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { normalizeEmail, normalizePhone } from "@/lib/auth-utils";

function getBaseUrl() {
  if (process.env.NEXTAUTH_URL || process.env.AUTH_URL) {
    return process.env.NEXTAUTH_URL || process.env.AUTH_URL!;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return process.env.NODE_ENV === "production" ? "https://yourmithila.in" : "http://localhost:3000";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "yourmithila-dev-secret",
  trustHost: true,
  // NOTE: PrismaAdapter is intentionally removed — it is incompatible with
  // strategy: "jwt". Using JWT-only sessions keeps auth stateless and avoids
  // the silent crash caused by adapter + JWT conflict.
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
        // Special field: set to "true" when OTP login is used
        otpVerified: { label: "OTP Verified", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier) return null;

        const id = credentials.identifier as string;
        const normalizedInput = id.trim();
        const normalizedEmail = normalizedInput.includes("@") ? normalizeEmail(normalizedInput) : null;
        const normalizedPhone = normalizePhone(normalizedInput);

        const user = await prisma.user.findFirst({
          where: normalizedEmail
            ? {
                OR: [
                  { email: normalizedEmail },
                  ...(normalizedPhone ? [{ phone: normalizedPhone }] : []),
                ],
              }
            : normalizedPhone
              ? { phone: normalizedPhone }
              : { email: normalizedInput },
        });

        if (!user) return null;

        // ── OTP login path ────────────────────────────────────────────────────
        // The frontend verifies the OTP via /api/auth/verify-otp first,
        // then calls signIn with otpVerified="true". We trust this because
        // the OTP was already validated server-side and marked verified in DB.
        if (credentials.otpVerified === "true") {
          // Double-check: confirm a verified OTP record exists for this email
          const otpRecord = await prisma.otpVerification.findFirst({
            where: { email: normalizeEmail(user.email), verified: true },
            orderBy: { createdAt: "desc" },
          });
          if (!otpRecord) return null;

          // Clean up the used OTP record
          await prisma.otpVerification
            .deleteMany({ where: { email: normalizeEmail(user.email), verified: true } })
            .catch(() => {});

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        // ── Password login path ───────────────────────────────────────────────
        if (!credentials.password || !user.password) return null;
        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: sessionUpdate }) {
      // On first sign-in, user object is present — embed id and role
      if (user) {
        token.id   = user.id;
        token.role = (user as any).role ?? "SEEKER";
        token.name  = user.name  ?? token.name;
        token.email = user.email ?? token.email;
      }

      // When session.update() is called from client, merge the update
      if (trigger === "update" && sessionUpdate?.role) {
        token.role = sessionUpdate.role;
      }

      // Always re-fetch role from DB on every JWT refresh to ensure accuracy
      // This ensures role changes in DB are reflected without re-login
      if (token.id) {
        try {
          const dbUser = await prisma.user.findUnique({
            where:  { id: token.id as string },
            select: { role: true, name: true, isActive: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            if (dbUser.name) token.name = dbUser.name;
          }
        } catch (e) {
          console.error("JWT DB fetch error:", e);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id    = token.id   as string;
        (session.user as any).role  = token.role  as string;
        session.user.name  = token.name  as string;
        session.user.email = token.email as string;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Allow relative URLs and same-origin absolute URLs through unchanged
      if (url.startsWith("/"))           return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl))       return url;
      // Default post-login destination — middleware then routes by role
      return `${getBaseUrl()}/dashboard`;
    },
  },
});
