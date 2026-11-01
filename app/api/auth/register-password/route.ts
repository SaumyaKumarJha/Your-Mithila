/**
 * POST /api/auth/register-password
 *
 * Direct registration with email + password — no OTP required.
 * User is created with isVerified=true immediately.
 * This is the fallback path when email OTP delivery fails.
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { parseJsonBody, normalizeEmail, normalizePhone } from "@/lib/auth-utils";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().length(10, "Phone must be exactly 10 digits").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["OWNER", "SEEKER"]),
  city: z.string().optional(),
  district: z.string().optional(),
  whatsapp: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await parseJsonBody(req);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Missing request body." }, { status: 400 });
    }
    const data = schema.parse(body);

    const email = normalizeEmail(data.email);
    const phone = normalizePhone(data.phone);
    if (data.phone && !phone) {
      return NextResponse.json({ error: "Phone must be exactly 10 digits." }, { status: 400 });
    }
    if (data.whatsapp && !normalizePhone(data.whatsapp)) {
      return NextResponse.json({ error: "WhatsApp number must be exactly 10 digits." }, { status: 400 });
    }

    // Check email uniqueness
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    // Check phone uniqueness (only if provided)
    if (phone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone } });
      if (existingPhone) {
        return NextResponse.json(
          { error: "An account with this phone number already exists." },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email,
        phone: phone ?? null,
        password: hashedPassword,
        role: data.role,
        city: data.city?.trim() || "Madhubani",
        district: data.district?.trim() || "Madhubani",
        whatsapp: data.whatsapp ? normalizePhone(data.whatsapp) ?? null : null,
        interests: [],
        isVerified: true, // Password registration = verified immediately
      },
    });

    // Send welcome email (non-blocking — never fail registration over this)
    sendEmail({
      to: email,
      subject: `Welcome to YourMithila, ${data.name}! 🏠`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#FAFAF9;border-radius:16px;border:1px solid #E4E0F0;">
          <h1 style="color:#7C3AED;">Welcome to YourMithila, ${data.name}! 🙏</h1>
          <p style="color:#4C4069;">Your account has been created successfully.</p>
          <p style="color:#4C4069;">मिथिला का अपना डिजिटल मंच में आपका स्वागत है।</p>
          ${data.role === "OWNER"
            ? "<p style='color:#4C4069;'>You can now subscribe to a plan and start listing your properties and jobs.</p>"
            : "<p style='color:#4C4069;'>Start browsing properties and jobs in your area — completely free!</p>"
          }
          <a href="https://yourmithila.in/${data.role === "OWNER" ? "dashboard" : ""}"
            style="background:#7C3AED;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;font-weight:600;">
            Go to YourMithila →
          </a>
          <hr style="border:none;border-top:1px solid #E4E0F0;margin:24px 0;" />
          <p style="color:#BCA898;font-size:11px;text-align:center;">yourmithila.in — Mithila Region, Bihar, India</p>
        </div>
      `,
    }).catch(err => console.error("[register-password] Welcome email failed (non-critical):", err));

    return NextResponse.json(
      { success: true, user: { id: user.id, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[register-password] error:", err);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/auth/register-password
 *
 * Password reset after OTP verification.
 * The OTP must already be verified via /api/auth/verify-otp (sets verified=true in DB).
 * This handler looks for a verified OTP record, resets the password, and cleans up.
 */
const resetSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function PATCH(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await parseJsonBody(req);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Missing request body." }, { status: 400 });
    }
    const { email, password } = resetSchema.parse(body);
    const normalizedEmail = email.trim().toLowerCase();

    // Confirm a verified OTP record exists for this email (reset flow)
    const otpRecord = await prisma.otpVerification.findFirst({
      where: { email: normalizedEmail, verified: true },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "OTP not verified. Please complete the OTP verification step first." },
        { status: 400 }
      );
    }

    // Confirm user exists
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address." },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Update password + clean up OTP record atomically
    await prisma.$transaction([
      prisma.user.update({
        where: { email: normalizedEmail },
        data: { password: hashedPassword },
      }),
      prisma.otpVerification.deleteMany({
        where: { email: normalizedEmail, verified: true },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[register-password PATCH] error:", err);
    return NextResponse.json({ error: "Password reset failed. Please try again." }, { status: 500 });
  }
}
