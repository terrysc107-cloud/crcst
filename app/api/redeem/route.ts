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
    const rawCode = (body.code ?? '').trim().toUpperCase()
    if (rawCode.replace(/[^A-Z0-9]/g, '').length < 6) {
      return NextResponse.json({ error: "That doesn't look like a valid code." }, { status: 400 })
    }

    const admin = getServiceSupabase()
    const now = new Date()

    // ── 3a. Try access_codes (flat 12-char codes) ───────────────────────────
    const normalizedFlat = rawCode.replace(/[^A-Z0-9]/g, '')
    if (normalizedFlat.length === 12) {
      const { data: lookup, error: lookupError } = await admin
        .from('access_codes')
        .select('id, code, tier, expires_at, redeemed_by, valid_from')
        .eq('code', normalizedFlat)
        .maybeSingle()

      if (lookupError) {
        console.error('access_codes lookup failed:', lookupError.message)
        // Fall through to wholesale check rather than hard-failing
      } else if (lookup) {
        if (lookup.redeemed_by) {
          return NextResponse.json({ error: 'That code has already been redeemed.' }, { status: 400 })
        }
        if (new Date(lookup.expires_at) <= now) {
          return NextResponse.json({ error: 'That code has expired.' }, { status: 400 })
        }
        if (new Date(lookup.valid_from) > now) {
          return NextResponse.json({ error: 'That code is not active yet.' }, { status: 400 })
        }

        const { data: claim, error: claimError } = await admin
          .from('access_codes')
          .update({ redeemed_by: user.id, redeemed_at: now.toISOString() })
          .eq('id', lookup.id)
          .is('redeemed_by', null)
          .select('id, tier, expires_at')
          .maybeSingle()

        if (claimError) {
          console.error('access_codes claim failed:', claimError.message)
          return NextResponse.json({ error: 'Could not redeem code. Please try again.' }, { status: 500 })
        }
        if (!claim) {
          return NextResponse.json({ error: 'That code has already been redeemed.' }, { status: 400 })
        }

        const { error: profileError } = await admin
          .from('profiles')
          .update({ tier: claim.tier, tier_expires_at: claim.expires_at })
          .eq('id', user.id)

        if (profileError) {
          console.error('profiles update failed after access_codes claim:', profileError.message)
          return NextResponse.json(
            { error: 'Code accepted but account update failed. Contact support.', claimedCodeId: claim.id },
            { status: 500 },
          )
        }

        return NextResponse.json({ tier: claim.tier, tier_expires_at: claim.expires_at })
      }
    }

    // ── 3b. Try wholesale_codes (SLUG-TC-RAND / SLUG-PRO-RAND) ─────────────
    const { data: wc, error: wcError } = await admin
      .from('wholesale_codes')
      .select('id, tier, max_uses, used_count, duration_days, expires_at, is_active')
      .eq('code', rawCode)
      .maybeSingle()

    if (wcError) {
      console.error('wholesale_codes lookup failed:', wcError.message)
      return NextResponse.json({ error: 'Could not validate code. Please try again.' }, { status: 500 })
    }
    if (!wc) {
      return NextResponse.json({ error: 'That code is not recognized. Double-check and try again.' }, { status: 400 })
    }
    if (!wc.is_active) {
      return NextResponse.json({ error: 'That code is no longer active.' }, { status: 400 })
    }
    if (wc.expires_at && new Date(wc.expires_at) <= now) {
      return NextResponse.json({ error: 'That code has expired.' }, { status: 400 })
    }
    if (wc.used_count >= wc.max_uses) {
      return NextResponse.json({ error: 'That code has already been fully redeemed.' }, { status: 400 })
    }

    // Check duplicate redemption
    const { data: existingRedemption } = await admin
      .from('wholesale_redemptions')
      .select('id')
      .eq('code_id', wc.id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existingRedemption) {
      return NextResponse.json({ error: 'You have already redeemed this code.' }, { status: 400 })
    }

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + wc.duration_days)

    const { error: profileError } = await admin
      .from('profiles')
      .update({ tier: wc.tier, tier_expires_at: expiresAt.toISOString() })
      .eq('id', user.id)

    if (profileError) {
      console.error('profiles update failed after wholesale claim:', profileError.message)
      return NextResponse.json({ error: 'Code accepted but account update failed. Contact support.' }, { status: 500 })
    }

    await Promise.all([
      admin.from('wholesale_redemptions').insert({ code_id: wc.id, user_id: user.id, tier_granted: wc.tier }),
      admin.rpc('increment_wholesale_used_count', { code_id: wc.id }),
    ])

    return NextResponse.json({ tier: wc.tier, tier_expires_at: expiresAt.toISOString() })
  } catch (err) {
    console.error('redeem route unexpected error:', err)
    return NextResponse.json({ error: 'Unexpected error. Please try again.' }, { status: 500 })
  }
}
