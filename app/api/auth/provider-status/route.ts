import { NextResponse } from "next/server";

export async function GET() {
  try {
    const hasResend = !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 10);
    const hasSmtp = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    const fromEmail = process.env.FROM_EMAIL || process.env.RESEND_FROM_EMAIL || null;
    const nodeEnv = process.env.NODE_ENV || null;
    const vercelEnv = process.env.VERCEL_ENV || null;

    const providerConfigured = hasResend || hasSmtp;

    return NextResponse.json({
      providerConfigured,
      hasResend,
      hasSmtp,
      fromEmail,
      nodeEnv,
      vercelEnv,
    });
  } catch (err) {
    return NextResponse.json({ error: "Unable to determine provider status" }, { status: 500 });
  }
}
