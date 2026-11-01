/**
 * OTP Service - YourMithila
 *
 * Uses crypto.randomInt for cryptographically secure 6-digit codes.
 * Delegates email delivery to lib/email.ts (Resend -> SMTP -> console fallback).
 * SMS delivery stub is in lib/email.ts - wire up Fast2SMS/Twilio there.
 */

import crypto from "crypto";
import { prisma } from "./prisma";
import { sendEmail, sendSms, buildOtpEmailHtml } from "./email";

const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

// ─── Generate secure OTP ──────────────────────────────────────────────────────

export function generateOtp(): string {
  // crypto.randomInt is cryptographically secure (unlike Math.random)
  return crypto.randomInt(100000, 999999).toString();
}

// ─── Send OTP ─────────────────────────────────────────────────────────────────

export async function sendOtp(
  email: string,
  phone?: string,
  type: "REGISTER" | "LOGIN" | "RESET_PASSWORD" = "REGISTER"
): Promise<{ success: boolean; error?: string; provider?: string; debugOtp?: string }> {
  try {
    // ── Pre-flight checks ────────────────────────────────────────────────────
    if (type === "REGISTER") {
      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        return { success: false, error: "An account with this email already exists. Please log in instead." };
      }
      if (phone) {
        const existingPhone = await prisma.user.findFirst({ where: { phone } });
        if (existingPhone) {
          return { success: false, error: "An account with this phone number already exists." };
        }
      }
    }

    if (type === "LOGIN") {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return { success: false, error: "No account found with this email. Please register first." };
      }
    }

    // ── Generate and store OTP ───────────────────────────────────────────────
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    // Delete all previous OTPs for this email (clean slate)
    await prisma.otpVerification.deleteMany({ where: { email } });

    await prisma.otpVerification.create({
      data: { email, phone: phone ?? null, otp, expiresAt, verified: false },
    });

    const typeLabel =
      type === "REGISTER" ? "Registration" :
      type === "LOGIN" ? "Login" :
      "Password Reset";

    // ── Send via email ───────────────────────────────────────────────────────
    const emailResult = await sendEmail({
      to: email,
      // Plain hyphen only - no em dash or any Unicode > 127 in subject
      subject: `Your Mithila - OTP for ${typeLabel}: ${otp}`,
      html: buildOtpEmailHtml(otp, typeLabel),
    });

    if (!emailResult.success) {
      console.error("[OTP] Email delivery failed:", emailResult.error);
      if (!phone) {
        return {
          success: false,
          error:
            emailResult.error || "Unable to send OTP email. Please try again later or contact support.",
        };
      }
    }

    const response = {
      success: true,
      provider: emailResult.provider,
    } as { success: true; provider?: string; debugOtp?: string };

    if (emailResult.provider === "console") {
      response.debugOtp = otp;
    }

    // ── Send via SMS if phone provided ───────────────────────────────────────
    if (phone) {
      await sendSms({
        to: phone,
        message: `Your YourMithila OTP for ${typeLabel} is: ${otp}. Valid for 10 minutes. Do not share.`,
      }).catch(err => console.error("[OTP] SMS delivery failed:", err));
    }

    return response;
  } catch (err: any) {
    console.error("[OTP] sendOtp error:", err);
    return { success: false, error: "Failed to send OTP. Please try again." };
  }
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export async function verifyOtp(
  email: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const record = await prisma.otpVerification.findFirst({
      where: { email, verified: false },
      orderBy: { createdAt: "desc" },
    });

    if (!record) {
      return { success: false, error: "OTP not found. Please request a new one." };
    }
    if (record.expiresAt < new Date()) {
      return { success: false, error: "OTP has expired. Please request a new one." };
    }
    if (record.otp !== otp.trim()) {
      return { success: false, error: "Incorrect OTP. Please try again." };
    }

    // Mark as verified
    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    return { success: true };
  } catch (err: any) {
    console.error("[OTP] verifyOtp error:", err);
    return { success: false, error: "Verification failed. Please try again." };
  }
}

// ─── Check if OTP was verified (used by register route) ──────────────────────

export async function isOtpVerified(email: string): Promise<boolean> {
  const record = await prisma.otpVerification.findFirst({
    where: { email, verified: true },
    orderBy: { createdAt: "desc" },
  });
  return !!record;
}

// ─── Clean up verified OTPs (call after successful registration) ──────────────

export async function cleanupOtps(email: string): Promise<void> {
  await prisma.otpVerification.deleteMany({ where: { email } }).catch(() => {});
}
