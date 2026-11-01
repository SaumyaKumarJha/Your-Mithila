import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/otp";
import { parseJsonBody } from "@/lib/auth-utils";

const schema = z.object({ email: z.string().email(), otp: z.string().length(6) });

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await parseJsonBody(req);
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Missing request body." }, { status: 400 });
    }
    const { email, otp } = schema.parse(body);
    const result = await verifyOtp(email.trim().toLowerCase(), otp);
    if (!result.success) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
