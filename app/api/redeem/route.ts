import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServiceSupabase } from '@/lib/subscription'

// POST /api/redeem
// Body: { code: string }
// Auth: Authorization: Bearer <supabase_access_token>
//
// Atomic claim: the UPDATE filters on redeemed_by IS NULL so two concurrent
// redeemers cannot both claim the same code — only one will get a row back.
export async function POST(request: NextRequest) {
  try {
    // ── 1. Auth ─────────────────────────────────────────────────────────────
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Sign in to redeem an access code.' }, { status: 401 })
    }
    const token = authHeader.replace(/^Bearer\s+/i, '')

    const anon = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
    const { data: userData, error: authError } = await anon.auth.getUser(token)
    if (authError || !userData.user) {
      return NextResponse.json({ error: 'Sign in to redeem an access code.' }, { status: 401 })
    }
    const user = userData.user

    // ── 2. Body ─────────────────────────────────────────────────────────────
    let body: { code?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
    }
    const normalized = (body.code ?? '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    if (normalized.length !== 12) {
      return NextResponse.json({ error: "That code doesn't look right. Codes are 12 characters." }, { status: 400 })
    }

    // ── 3. Look up the code ─────────────────────────────────────────────────
    const admin = getServiceSupabase()
    const { data: lookup, error: lookupError } = await admin
      .from('access_codes')
      .select('id, code, tier, expires_at, redeemed_by, redeemed_at, valid_from')
      .eq('code', normalized)
      .maybeSingle()

    if (lookupError) {
      console.error('access_codes lookup failed:', lookupError)
      return NextResponse.json({ error: 'Could not validate code. Please try again.' }, { status: 500 })
    }
    if (!lookup) {
      return NextResponse.json({ error: 'That code is not recognized.' }, { status: 400 })
    }
    if (lookup.redeemed_by) {
      return NextResponse.json({ error: 'That code has already been redeemed.' }, { status: 400 })
    }
    const now = new Date()
    if (new Date(lookup.expires_at) <= now) {
      return NextResponse.json({ error: 'That code has expired.' }, { status: 400 })
    }
    if (new Date(lookup.valid_from) > now) {
      return NextResponse.json({ error: 'That code is not active yet.' }, { status: 400 })
    }

    // ── 4. Atomic claim ─────────────────────────────────────────────────────
    const { data: claim, error: claimError } = await admin
      .from('access_codes')
      .update({ redeemed_by: user.id, redeemed_at: now.toISOString() })
      .eq('id', lookup.id)
      .is('redeemed_by', null)
      .select('id, tier, expires_at')
      .maybeSingle()

    if (claimError) {
      console.error('access_codes claim failed:', claimError)
      return NextResponse.json({ error: 'Could not redeem code. Please try again.' }, { status: 500 })
    }
    if (!claim) {
      // Lost the race — another redeemer claimed it between lookup and update.
      return NextResponse.json({ error: 'That code has already been redeemed.' }, { status: 400 })
    }

    // ── 5. Apply tier to profile ────────────────────────────────────────────
    const { error: profileError } = await admin
      .from('profiles')
      .update({ tier: claim.tier, tier_expires_at: claim.expires_at })
      .eq('id', user.id)

    if (profileError) {
      console.error('profiles update failed after claim:', profileError)
      // The code is now claimed but the profile update failed. Surface a
      // clear error so support can roll the redemption back manually.
      return NextResponse.json(
        {
          error: 'Code was accepted but your account could not be updated. Contact support.',
          claimedCodeId: claim.id,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      tier: claim.tier,
      tier_expires_at: claim.expires_at,
    })
  } catch (err) {
    console.error('redeem route unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error. Please try again.' }, { status: 500 })
  }
}
