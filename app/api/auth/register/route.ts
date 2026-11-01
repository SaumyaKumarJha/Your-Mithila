/**
 * POST /api/auth/register
 *
 * OTP-verified registration. Requires the user to have verified their email
 * OTP via /api/auth/verify-otp before calling this endpoint.
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { isOtpVerified, cleanupOtps } from "@/lib/otp";
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
  interests: z.array(z.string()).optional(),
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

    // Require OTP verification
    const otpOk = await isOtpVerified(email);
    if (!otpOk) {
      return NextResponse.json(
        { error: "Please verify your email OTP first before registering." },
        { status: 400 }
      );
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
        interests: data.interests ?? [],
        isVerified: true, // OTP was verified
      },
    });

    // Clean up OTP records for this email
    await cleanupOtps(email);

    // Send welcome email (non-blocking)
    sendEmail({
      to: email,
      // Plain hyphen and ASCII only - no Unicode characters
      subject: `Welcome to YourMithila, ${data.name}!`,
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;padding:32px;background:white;border-radius:16px;">
    <h1 style="color:#7C3AED;">Welcome to YourMithila, ${data.name}!</h1>
    <p style="color:#4C4069;">Your account has been created successfully.</p>
    <p style="color:#4C4069;">Mithila ka apna digital manch mein aapka swagat hai.</p>
    ${data.role === "OWNER"
      ? "<p style='color:#4C4069;'>You can now subscribe to a plan and start listing your properties and jobs.</p>"
      : "<p style='color:#4C4069;'>Start browsing properties and jobs in your area - completely free!</p>"
    }
    <a href="https://yourmithila.in/${data.role === "OWNER" ? "dashboard" : ""}"
      style="background:#7C3AED;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;font-weight:600;">
      Go to YourMithila
    </a>
    <hr style="border:none;border-top:1px solid #E4E0F0;margin:24px 0;" />
    <p style="color:#BCA898;font-size:11px;text-align:center;">yourmithila.in - Mithila Region, Bihar, India</p>
  </div>
</body>
</html>`,
    }).catch(err => console.error("[register] Welcome email failed (non-critical):", err));

    return NextResponse.json(
      { success: true, user: { id: user.id, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    console.error("[register] error:", err);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
