#!/usr/bin/env tsx
/**
 * One-off smoke test for the Resend wiring.
 *
 *   npx tsx scripts/test-resend.ts
 *
 * Reads RESEND_API_KEY from the environment (.env.local in dev). Sends a
 * "Hello World" message from onboarding@resend.dev — Resend's universal test
 * sender that works without verifying a domain. Once you've verified
 * spdcertprep.com in the Resend dashboard, switch the from/to as needed.
 */

import { Resend } from 'resend'

async function main(): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY is not set. Put it in .env.local (and Vercel env for prod).',
    )
  }

  const resend = new Resend(apiKey)

  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: 'terrysc107@gmail.com',
    subject: 'Hello World',
    html: '<p>Congrats on sending your <strong>first email</strong>!</p>',
  })

  if (error) {
    console.error('Send failed:', error)
    process.exit(1)
  }

  console.log('Sent. Resend message id:', data?.id)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err))
  process.exit(1)
})
