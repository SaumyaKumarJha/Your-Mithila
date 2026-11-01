/**
 * Email Transport Service - YourMithila
 *
 * Priority order:
 *   1. Resend SDK  (if RESEND_API_KEY is set and non-empty)
 *   2. Nodemailer  (if SMTP_HOST + SMTP_USER + SMTP_PASS are set)
 *   3. Console log (development fallback - prints OTP to server logs)
 *
 * SMS stub: add your Fast2SMS / Twilio credentials under the SMS section
 * and call sendSms() from sendOtp() when a phone number is provided.
 */

// --- Types -------------------------------------------------------------------

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface SendSmsOptions {
  to: string;   // 10-digit Indian mobile number
  message: string;
}

export interface TransportResult {
  success: boolean;
  provider?: string;
  error?: string;
}

// --- Helpers -----------------------------------------------------------------

function getFromEmail(): string {
  return (
    process.env.FROM_EMAIL ||
    process.env.RESEND_FROM_EMAIL ||
    // Safe default: works without domain verification in Resend.
    // Change to hello@yourmithila.in after verifying domain in Resend dashboard.
    "onboarding@resend.dev"
  );
}

function hasResend(): boolean {
  return !!(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 10);
}

function hasSmtp(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

function hasEmailProvider(): boolean {
  return hasResend() || hasSmtp();
}

// --- Resend transport --------------------------------------------------------

async function sendViaResend(opts: SendEmailOptions): Promise<TransportResult> {
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const { error } = await resend.emails.send({
      from: `Your Mithila <${getFromEmail()}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    if (error) {
      console.error("[Resend] send error:", error);
      return { success: false, provider: "resend", error: String(error) };
    }
    return { success: true, provider: "resend" };
  } catch (err: any) {
    console.error("[Resend] exception:", err?.message);
    return { success: false, provider: "resend", error: err?.message };
  }
}

// --- Nodemailer / SMTP transport ---------------------------------------------

async function sendViaSmtp(opts: SendEmailOptions): Promise<TransportResult> {
  try {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.sendMail({
      from: `"Your Mithila" <${process.env.SMTP_USER ?? getFromEmail()}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return { success: true, provider: "smtp" };
  } catch (err: any) {
    console.error("[SMTP] send error:", err?.message);
    return { success: false, provider: "smtp", error: err?.message };
  }
}

// --- Console fallback (dev only) ---------------------------------------------

function sendViaConsole(opts: SendEmailOptions): TransportResult {
  console.log("\n------------------------------------------------------------");
  console.log("[DEV EMAIL FALLBACK] - No email provider configured");
  console.log(`    To:      ${opts.to}`);
  console.log(`    Subject: ${opts.subject}`);
  // Extract OTP from subject line for easy dev access
  const otpMatch = opts.subject.match(/\b(\d{6})\b/);
  if (otpMatch) console.log(`    OTP:     ${otpMatch[1]}  <- use this to verify`);
  console.log("------------------------------------------------------------\n");
  return { success: true, provider: "console" };
}

// --- Main email sender -------------------------------------------------------

export async function sendEmail(opts: SendEmailOptions): Promise<TransportResult> {
  console.log("[sendEmail] RESEND_API_KEY present:", !!process.env.RESEND_API_KEY, "| SMTP configured:", hasSmtp(), "| FROM:", getFromEmail());

  // 1. Try Resend
  if (hasResend()) {
    const result = await sendViaResend(opts);
    if (result.success) return result;
    console.warn("[Email] Resend failed, trying SMTP fallback...");
  }

  // 2. Try SMTP / Nodemailer
  if (hasSmtp()) {
    const result = await sendViaSmtp(opts);
    if (result.success) return result;
    console.warn("[Email] SMTP failed; not sending OTP via email.");
  }

  // 3. If we are in production, require a real provider rather than silently logging.
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") {
    return {
      success: false,
      provider: "none",
      error:
        "No email provider is configured. Please set RESEND_API_KEY or SMTP_HOST / SMTP_USER / SMTP_PASS in your environment.",
    };
  }

  // 4. Console fallback for development and staging only
  return sendViaConsole(opts);
}

// --- SMS transport (stub - wire up Fast2SMS or Twilio here) ------------------

export async function sendSms(opts: SendSmsOptions): Promise<TransportResult> {
  // Uncomment and add FAST2SMS_API_KEY to env to enable SMS:
  // if (process.env.FAST2SMS_API_KEY) {
  //   try {
  //     const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
  //       method: "POST",
  //       headers: {
  //         authorization: process.env.FAST2SMS_API_KEY,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         route: "q",
  //         message: opts.message,
  //         language: "english",
  //         flash: 0,
  //         numbers: opts.to,
  //       }),
  //     });
  //     const data = await res.json();
  //     if (data.return) return { success: true, provider: "fast2sms" };
  //     return { success: false, provider: "fast2sms", error: data.message };
  //   } catch (err: any) {
  //     return { success: false, provider: "fast2sms", error: err?.message };
  //   }
  // }

  // Console fallback
  console.log(`[DEV SMS FALLBACK] To: +91${opts.to} | Message: ${opts.message}`);
  return { success: true, provider: "console-sms" };
}

// --- OTP email template ------------------------------------------------------
// IMPORTANT: All characters must be plain ASCII (0-127).
// No em dashes, smart quotes, arrows, or any Unicode > 127.
// Resend throws "Cannot convert argument to a ByteString" for any char > 255.

export function buildOtpEmailHtml(otp: string, typeLabel: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;padding:0 16px;">
    <div style="background:white;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
      <div style="background:#7C3AED;padding:28px 32px;text-align:center;">
        <div style="font-size:24px;font-weight:700;color:white;">YourMithila</div>
        <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:4px;">Mithila ka apna digital manch</div>
      </div>
      <div style="padding:32px;">
        <h2 style="margin:0 0 8px;font-size:20px;color:#111827;">Your OTP - ${typeLabel}</h2>
        <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">
          Use this code to complete your ${typeLabel}. Valid for <strong>10 minutes</strong>.
        </p>
        <div style="background:#f5f3ff;border:2px dashed #7C3AED;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
          <div style="font-size:42px;font-weight:700;letter-spacing:12px;color:#7C3AED;font-family:monospace;">${otp}</div>
        </div>
        <div style="background:#fef9c3;border-radius:8px;padding:12px 16px;margin-bottom:24px;">
          <p style="margin:0;font-size:13px;color:#854d0e;">
            Never share this OTP with anyone. YourMithila will never ask for your OTP.
          </p>
        </div>
        <p style="margin:0;font-size:13px;color:#9ca3af;">
          If you did not request this, you can safely ignore this email.
        </p>
      </div>
      <div style="border-top:1px solid #f3f4f6;padding:16px 32px;text-align:center;">
        <p style="margin:0;font-size:11px;color:#9ca3af;">
          &copy; 2026 YourMithila - yourmithila.in - Mithila Region, Bihar
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// --- Subscription confirmation email -----------------------------------------
// Plain ASCII only - no Unicode characters.

export async function sendSubscriptionConfirmation(
  to: string,
  name: string,
  planLabel: string,
  endDate: Date
): Promise<void> {
  await sendEmail({
    to,
    // Plain hyphen, not em dash
    subject: `YourMithila - ${planLabel} Subscription Activated!`,
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <div style="max-width:480px;margin:40px auto;padding:32px;background:white;border-radius:16px;">
    <h1 style="color:#7C3AED;">Subscription Activated, ${name}!</h1>
    <p style="color:#4C4069;">Your <strong>${planLabel}</strong> plan is now active.</p>
    <p style="color:#4C4069;">Valid until: <strong>${endDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong></p>
    <a href="https://yourmithila.in/dashboard"
      style="background:#7C3AED;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;margin-top:16px;font-weight:600;">
      Go to Dashboard
    </a>
    <hr style="border:none;border-top:1px solid #E4E0F0;margin:24px 0;" />
    <p style="color:#BCA898;font-size:11px;text-align:center;">yourmithila.in - Mithila Region, Bihar, India</p>
  </div>
</body>
</html>`,
  });
}
