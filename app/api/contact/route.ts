import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  type: z.enum(["complaint", "feedback", "suggestion"]),
  subject: z.string().min(3),
  message: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const data = schema.parse(await req.json());
    await prisma.complaint.create({ data });

    // Send notification email
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Your Mithila <noreply@yourmithila.in>",
        to: "yourmithila.official@gmail.com",
        subject: `[${data.type.toUpperCase()}] ${data.subject} — Your Mithila`,
        html: `<p><b>From:</b> ${data.name} (${data.email}${data.phone ? `, ${data.phone}` : ""})</p><p><b>Type:</b> ${data.type}</p><p><b>Subject:</b> ${data.subject}</p><p><b>Message:</b><br/>${data.message}</p>`,
      });
    } catch (_) {}

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
