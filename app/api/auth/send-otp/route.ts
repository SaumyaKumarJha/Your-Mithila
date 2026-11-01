import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendOtp } from "@/lib/otp";
import { parseJsonBody } from "@/lib/auth-utils";

const schema = z.object({
  email: z.string().email(),
  phone: z.string().min(10).max(10).optional(),
  type: z.enum(["REGISTER", "LOGIN", "RESET_PASSWORD"]).default("REGISTER"),
});

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await parseJsonBody(req);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Missing request body." }, { status: 400 });
    }
    // Debug: confirm RESEND_API_KEY is present in this environment
    console.log("[send-otp] RESEND_API_KEY present:", !!process.env.RESEND_API_KEY);
    console.log("[send-otp] FROM_EMAIL:", process.env.FROM_EMAIL || process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev (default)");
    const { email, phone, type } = schema.parse(body);
    const result = await sendOtp(email.trim().toLowerCase(), phone, type);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true, provider: result.provider, debugOtp: result.debugOtp });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    console.error("send-otp route error:", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
