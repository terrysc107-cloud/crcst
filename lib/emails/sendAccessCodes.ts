import { Resend } from 'resend'

interface SendAccessCodesArgs {
  to: string
  buyerName: string
  codes: string[] // expected as flat 12-char codes; will be formatted XXXX-XXXX-XXXX in the body
  tier: 'pro' | 'triple_crown'
  expiresAt: string // ISO timestamp; will be rendered as a human-readable date
}

const FROM_ADDRESS = 'SPD Cert Prep <noreply@spdcertprep.com>'

function formatCode(code: string): string {
  const flat = code.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  if (flat.length !== 12) return code
  return `${flat.slice(0, 4)}-${flat.slice(4, 8)}-${flat.slice(8, 12)}`
}

function tierLabel(tier: 'pro' | 'triple_crown'): string {
  return tier === 'triple_crown' ? 'Triple Crown (CRCST + CHL + CER)' : 'Pro'
}

function formatExpiry(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export async function sendAccessCodes(args: SendAccessCodesArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set')
  }
  if (args.codes.length === 0) {
    throw new Error('No codes provided to send')
  }

  const resend = new Resend(apiKey)

  const formattedCodes = args.codes.map(formatCode)
  const expiryHuman = formatExpiry(args.expiresAt)
  const tier = tierLabel(args.tier)
  const quantity = formattedCodes.length

  const text = [
    `Hi ${args.buyerName},`,
    '',
    `Here are your ${quantity} access code${quantity === 1 ? '' : 's'} for ${tier} access on SPD Cert Prep:`,
    '',
    ...formattedCodes,
    '',
    'Redemption instructions:',
    'Each student visits spdcertprep.com/redeem and enters their code. Codes are single-use and tie to the student account that redeems them.',
    '',
    `Codes expire on ${expiryHuman}. Unused codes are non-refundable.`,
    '',
    'Questions? Reply to this email and we will get back to you.',
    '',
    '— SPD Cert Prep',
  ].join('\n')

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1a2238; line-height: 1.55;">
      <p>Hi ${escapeHtml(args.buyerName)},</p>
      <p>Here are your <strong>${quantity}</strong> access code${quantity === 1 ? '' : 's'} for <strong>${escapeHtml(tier)}</strong> access on SPD Cert Prep:</p>
      <pre style="background: #F4F1E8; border: 1px solid #DCD3B4; border-radius: 8px; padding: 1rem 1.25rem; font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 0.95rem; letter-spacing: 0.05em; line-height: 1.7;">${formattedCodes.map(escapeHtml).join('\n')}</pre>
      <p style="margin-top: 1.5rem;"><strong>Redemption instructions:</strong><br/>
      Each student visits <a href="https://spdcertprep.com/redeem" style="color: #0D7377;">spdcertprep.com/redeem</a> and enters their code. Codes are single-use and tie to the student account that redeems them.</p>
      <p style="font-size: 0.9rem; color: #555;">Codes expire on <strong>${escapeHtml(expiryHuman)}</strong>. Unused codes are non-refundable.</p>
      <p style="font-size: 0.9rem; color: #555;">Questions? Reply to this email and we will get back to you.</p>
      <p style="margin-top: 2rem; color: #888;">— SPD Cert Prep</p>
    </div>
  `.trim()

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: args.to,
    subject: 'Your SPD Cert Prep Access Codes',
    text,
    html,
  })

  if (error) {
    throw new Error(`Resend send failed: ${error.message ?? JSON.stringify(error)}`)
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
