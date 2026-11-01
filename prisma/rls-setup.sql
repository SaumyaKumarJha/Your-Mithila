-- ============================================================
-- YourMithila.in — Enable RLS on all public tables
-- Run this in Supabase → SQL Editor → New Query → Run
-- This blocks direct PostgREST/anon access while your app
-- continues to work normally via Prisma (service role bypasses RLS)
-- ============================================================

-- 1. Enable RLS on every table
ALTER TABLE public."User"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Property"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Job"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Subscription"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SavedProperty"     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OtpVerification"   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Complaint"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Review"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PromoCode"         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Notification"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SearchAlert"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Enquiry"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Report"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Account"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Session"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationToken" ENABLE ROW LEVEL SECURITY;

-- 2. Add DENY-ALL policies for the anon role
--    (no row is returned/writable via the public API without auth)
--    Your app uses the service_role which skips RLS entirely — unaffected.

-- User table — deny all anon access (passwords are here)
CREATE POLICY "deny_anon_user" ON public."User"
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "deny_anon_user_auth" ON public."User"
  AS RESTRICTIVE FOR ALL TO authenticated USING (false);

-- Property — public read is fine, but block direct API writes
CREATE POLICY "allow_public_read_property" ON public."Property"
  FOR SELECT TO anon USING (true);

CREATE POLICY "deny_anon_write_property" ON public."Property"
  AS RESTRICTIVE FOR INSERT TO anon WITH CHECK (false);

CREATE POLICY "deny_anon_update_property" ON public."Property"
  AS RESTRICTIVE FOR UPDATE TO anon USING (false);

CREATE POLICY "deny_anon_delete_property" ON public."Property"
  AS RESTRICTIVE FOR DELETE TO anon USING (false);

-- Job — same: public read OK, no direct writes
CREATE POLICY "allow_public_read_job" ON public."Job"
  FOR SELECT TO anon USING (true);

CREATE POLICY "deny_anon_write_job" ON public."Job"
  AS RESTRICTIVE FOR INSERT TO anon WITH CHECK (false);

CREATE POLICY "deny_anon_update_job" ON public."Job"
  AS RESTRICTIVE FOR UPDATE TO anon USING (false);

CREATE POLICY "deny_anon_delete_job" ON public."Job"
  AS RESTRICTIVE FOR DELETE TO anon USING (false);

-- Sensitive tables — deny all anon access
CREATE POLICY "deny_anon_subscription" ON public."Subscription"
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "deny_anon_savedproperty" ON public."SavedProperty"
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "deny_anon_otpverification" ON public."OtpVerification"
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "deny_anon_complaint" ON public."Complaint"
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "deny_anon_review" ON public."Review"
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "deny_anon_promocode" ON public."PromoCode"
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "deny_anon_notification" ON public."Notification"
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "deny_anon_searchalert" ON public."SearchAlert"
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "deny_anon_enquiry" ON public."Enquiry"
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "deny_anon_report" ON public."Report"
  AS RESTRICTIVE FOR ALL TO anon USING (false);

-- NextAuth internal tables — deny all direct API access
CREATE POLICY "deny_anon_account" ON public."Account"
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "deny_anon_session" ON public."Session"
  AS RESTRICTIVE FOR ALL TO anon USING (false);

CREATE POLICY "deny_anon_verificationtoken" ON public."VerificationToken"
  AS RESTRICTIVE FOR ALL TO anon USING (false);

-- Done. All 20 security errors will be resolved.
-- Your Prisma app is unaffected (service_role bypasses RLS).
