export interface WeeklyReadinessData {
  userName: string
  userEmail: string
  targetCert: string
  readinessScore: number
  readinessChange: number
  weakDomain: string | null
  suggestedSessions: number
  examDate: string | null
  daysRemaining: number | null
  appUrl: string
}

export function weeklyReadinessHtml(data: WeeklyReadinessData): string {
  const {
    userName,
    targetCert,
    readinessScore,
    readinessChange,
    weakDomain,
    suggestedSessions,
    examDate,
    daysRemaining,
    appUrl,
  } = data

  const changeSign = readinessChange >= 0 ? '+' : ''
  const changeColor = readinessChange >= 0 ? '#10B981' : '#F59E0B'

  const urgencyBanner =
    daysRemaining !== null && daysRemaining <= 14
      ? `<div style="background:#7F1D1D;color:#FCA5A5;padding:12px 20px;border-radius:8px;margin-bottom:20px;font-size:14px;font-weight:600;">
          ⚠️ ${daysRemaining} days until your ${targetCert} exam — time to push!
        </div>`
      : ''

  const examCountdown =
    daysRemaining !== null && daysRemaining > 0
      ? `<p style="color:#6B7280;font-size:14px;margin:4px 0 0;">
           ${daysRemaining} days until your ${targetCert} exam · ${new Date(examDate!).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
         </p>`
      : ''

  const weakDomainSection = weakDomain
    ? `<div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:8px;padding:16px 20px;margin-top:20px;">
        <p style="color:#92400E;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;margin:0 0 6px;">Focus Area</p>
        <p style="color:#78350F;font-size:15px;font-weight:600;margin:0 0 4px;">${weakDomain}</p>
        <p style="color:#92400E;font-size:13px;margin:0;">
          Your scores in this domain are below average. ${suggestedSessions} targeted sessions this week will move the needle.
        </p>
      </div>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Your weekly readiness report</title></head>
<body style="background:#F9FAFB;font-family:'DM Sans',Arial,sans-serif;margin:0;padding:40px 16px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E5E7EB;">

    <!-- Header -->
    <div style="background:#021B3A;padding:28px 32px;">
      <div style="display:flex;align-items:center;gap:12px;">
        <div style="width:36px;height:36px;background:#14BDAC;border-radius:7px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;font-family:monospace;">SP</div>
        <span style="color:rgba(255,255,255,0.8);font-size:15px;font-weight:600;">SPD Cert Companion</span>
      </div>
      <h1 style="color:#fff;font-size:22px;font-weight:700;margin:20px 0 6px;line-height:1.3;">
        Your Weekly Readiness Report
      </h1>
      <p style="color:rgba(255,255,255,0.55);font-size:14px;margin:0;">Hi ${userName}, here's how your ${targetCert} prep is going.</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px;">
      ${urgencyBanner}

      <!-- Readiness score -->
      <div style="display:flex;align-items:flex-end;gap:12px;margin-bottom:6px;">
        <span style="font-size:48px;font-weight:700;color:#021B3A;line-height:1;">${readinessScore}%</span>
        <span style="font-size:18px;font-weight:600;color:${changeColor};padding-bottom:8px;">${changeSign}${readinessChange}% this week</span>
      </div>
      <p style="color:#6B7280;font-size:14px;margin:0 0 4px;">Overall readiness score</p>
      ${examCountdown}

      <!-- Progress bar -->
      <div style="margin-top:20px;background:#E5E7EB;border-radius:100px;height:8px;overflow:hidden;">
        <div style="background:linear-gradient(90deg,#0D7377,#14BDAC);width:${Math.min(readinessScore, 100)}%;height:100%;border-radius:100px;"></div>
      </div>

      ${weakDomainSection}

      <!-- CTA -->
      <div style="margin-top:28px;text-align:center;">
        <a href="${appUrl}/dashboard"
           style="display:inline-block;background:linear-gradient(135deg,#0D7377,#14BDAC);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:0.02em;">
          Start Today's Session →
        </a>
        <p style="margin:12px 0 0;color:#9CA3AF;font-size:12px;">Recommended: ${suggestedSessions} sessions this week</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F9FAFB;border-top:1px solid #E5E7EB;padding:16px 32px;text-align:center;">
      <p style="color:#9CA3AF;font-size:12px;margin:0;">
        SPD Cert Companion · You're receiving this because you set an exam goal.
        <br><a href="${appUrl}/account" style="color:#14BDAC;">Manage email preferences</a>
      </p>
    </div>
  </div>
</body>
</html>`
}

export function weeklyReadinessText(data: WeeklyReadinessData): string {
  const { userName, targetCert, readinessScore, readinessChange, weakDomain, suggestedSessions, daysRemaining, appUrl } = data
  const changeSign = readinessChange >= 0 ? '+' : ''
  return [
    `Hi ${userName},`,
    '',
    `Your ${targetCert} readiness this week: ${readinessScore}% (${changeSign}${readinessChange}%)`,
    daysRemaining !== null ? `${daysRemaining} days until your exam.` : '',
    weakDomain ? `Focus area: ${weakDomain} — aim for ${suggestedSessions} sessions this week.` : `Keep up the pace — ${suggestedSessions} sessions recommended this week.`,
    '',
    `Study now: ${appUrl}/dashboard`,
    '',
    '— SPD Cert Companion',
  ].filter(Boolean).join('\n')
}
