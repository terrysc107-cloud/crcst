-- ──────────────────────────────────────────────────────────────────────────────
-- Wholesale access codes
-- Each code grants a tier (pro | triple_crown) for a fixed window when redeemed.
-- expires_at  = the cutoff after which the code can no longer be redeemed AND
--               the cutoff for granted access (a redeemer's tier_expires_at is
--               set to this value at redemption time).
-- ──────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.access_codes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT UNIQUE NOT NULL,
  tier          TEXT NOT NULL CHECK (tier IN ('pro', 'triple_crown')),
  org_id        UUID,
  redeemed_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_at   TIMESTAMPTZ,
  valid_from    TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_access_codes_code ON public.access_codes(code);
CREATE INDEX IF NOT EXISTS idx_access_codes_redeemed_by ON public.access_codes(redeemed_by);
CREATE INDEX IF NOT EXISTS idx_access_codes_org_id ON public.access_codes(org_id);

ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can SELECT an unredeemed code by exact match — this
-- is how the redemption page validates a code before requiring sign-in. The
-- service role handles all writes; no user-facing INSERT/UPDATE policies.
DROP POLICY IF EXISTS "Anyone can look up an unredeemed code" ON public.access_codes;
CREATE POLICY "Anyone can look up an unredeemed code"
  ON public.access_codes FOR SELECT
  USING (redeemed_by IS NULL);

DROP POLICY IF EXISTS "Service role can manage access codes" ON public.access_codes;
CREATE POLICY "Service role can manage access codes"
  ON public.access_codes FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
