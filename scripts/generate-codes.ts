#!/usr/bin/env tsx
/**
 * Generate wholesale access codes.
 *
 *   npx tsx scripts/generate-codes.ts --tier pro --quantity 25 --days 120
 *   npx tsx scripts/generate-codes.ts --tier triple_crown --quantity 10 --days 90 --org-id <uuid>
 *
 * Each code is 12 unambiguous uppercase characters (no 0/O/1/I/L) drawn at
 * random from a 32-symbol alphabet. The same expires_at value drives both the
 * code's redemption window AND the granted access duration when redeemed.
 *
 * Output: a CSV table on stdout. Pipe or copy/paste into your delivery email
 * (or call lib/emails/sendAccessCodes.ts to send via Resend).
 */

import { createClient } from '@supabase/supabase-js'
import { randomInt } from 'crypto'

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // 31 chars, no 0/O/1/I/L
const CODE_LEN = 12

interface Args {
  tier: 'pro' | 'triple_crown'
  quantity: number
  days: number
  orgId: string | null
}

function parseArgs(argv: string[]): Args {
  const args: Record<string, string> = {}
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i]
    if (!key.startsWith('--')) continue
    const value = argv[i + 1]
    if (value === undefined || value.startsWith('--')) {
      args[key.slice(2)] = 'true'
    } else {
      args[key.slice(2)] = value
      i++
    }
  }

  const tier = args.tier as Args['tier']
  if (tier !== 'pro' && tier !== 'triple_crown') {
    throw new Error(`--tier must be "pro" or "triple_crown" (got "${args.tier ?? ''}")`)
  }

  const quantity = parseInt(args.quantity ?? '', 10)
  if (!Number.isFinite(quantity) || quantity < 1 || quantity > 10000) {
    throw new Error(`--quantity must be an integer between 1 and 10000 (got "${args.quantity ?? ''}")`)
  }

  const days = parseInt(args.days ?? '', 10)
  if (!Number.isFinite(days) || days < 1 || days > 3650) {
    throw new Error(`--days must be an integer between 1 and 3650 (got "${args.days ?? ''}")`)
  }

  return { tier, quantity, days, orgId: args['org-id'] || null }
}

function generateCode(): string {
  let out = ''
  for (let i = 0; i < CODE_LEN; i++) {
    out += ALPHABET[randomInt(0, ALPHABET.length)]
  }
  return out
}

function generateUniqueCodes(n: number): string[] {
  const set = new Set<string>()
  while (set.size < n) set.add(generateCode())
  return [...set]
}

function formatForDisplay(code: string): string {
  // 12 chars → XXXX-XXXX-XXXX
  return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
  }
  const supabase = createClient(url, serviceKey)

  const expiresAt = new Date(Date.now() + args.days * 24 * 60 * 60 * 1000)
  const codes = generateUniqueCodes(args.quantity)

  const rows = codes.map((code) => ({
    code,
    tier: args.tier,
    org_id: args.orgId,
    expires_at: expiresAt.toISOString(),
  }))

  const { data, error } = await supabase.from('access_codes').insert(rows).select('code, tier, expires_at')
  if (error) {
    throw new Error(`Insert failed: ${error.message}`)
  }
  if (!data || data.length !== args.quantity) {
    throw new Error(`Expected ${args.quantity} rows inserted, got ${data?.length ?? 0}`)
  }

  // CSV output: header + one row per code (display format with hyphens for
  // readability; the stored value in the DB is the flat 12-char form).
  process.stdout.write('code,tier,expires_at\n')
  for (const row of data) {
    process.stdout.write(`${formatForDisplay(row.code)},${row.tier},${row.expires_at}\n`)
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
