import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/subscription'

// POST /api/wholesale/setup-db
// One-time migration runner for the access_codes table. Mirrors the existing
// /api/payment/setup-db pattern: gated by SETUP_SECRET, runs the CREATE TABLE
// + RLS statements via the service-role client.
//
// Usage:
//   curl -X POST https://spdcertprep.com/api/wholesale/setup-db \
//     -H "x-setup-secret: $SETUP_SECRET"
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-setup-secret')
  if (secret !== process.env.SETUP_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = getServiceSupabase()

  const statements: string[] = [
    `CREATE TABLE IF NOT EXISTS public.access_codes (
       id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       code          TEXT UNIQUE NOT NULL,
       tier          TEXT NOT NULL CHECK (tier IN ('pro', 'triple_crown')),
       org_id        UUID,
       redeemed_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
       redeemed_at   TIMESTAMPTZ,
       valid_from    TIMESTAMPTZ NOT NULL DEFAULT now(),
       expires_at    TIMESTAMPTZ NOT NULL,
       created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
     )`,
    `CREATE INDEX IF NOT EXISTS idx_access_codes_code ON public.access_codes(code)`,
    `CREATE INDEX IF NOT EXISTS idx_access_codes_redeemed_by ON public.access_codes(redeemed_by)`,
    `CREATE INDEX IF NOT EXISTS idx_access_codes_org_id ON public.access_codes(org_id)`,
    `ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY`,
    `DROP POLICY IF EXISTS "Anyone can look up an unredeemed code" ON public.access_codes`,
    `CREATE POLICY "Anyone can look up an unredeemed code"
       ON public.access_codes FOR SELECT
       USING (redeemed_by IS NULL)`,
    `DROP POLICY IF EXISTS "Service role can manage access codes" ON public.access_codes`,
    `CREATE POLICY "Service role can manage access codes"
       ON public.access_codes FOR ALL
       USING (auth.role() = 'service_role')
       WITH CHECK (auth.role() = 'service_role')`,
  ]

  const errors: Array<{ statement: string; error: string }> = []
  for (const sql of statements) {
    const { error } = await supabase.rpc('exec_sql', { query: sql }).single()
    if (error) {
      // Fallback: many Supabase projects don't expose an exec_sql RPC. In that
      // case the statements should be run from the Supabase SQL editor using
      // scripts/create-access-codes-table.sql.
      errors.push({ statement: sql.split('\n')[0], error: error.message })
    }
  }

  if (errors.length > 0) {
    return NextResponse.json(
      {
        error: 'Some statements failed. If exec_sql RPC is unavailable, run scripts/create-access-codes-table.sql in the Supabase SQL editor instead.',
        details: errors,
      },
      { status: 500 },
    )
  }

  return NextResponse.json({ ok: true, statementsRun: statements.length })
}
