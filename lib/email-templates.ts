// Plain HTML email templates for Resend
// Kept inline to avoid React Email dependency

export function streakReminderHtml(params: {
  firstName: string
  streak: number
  freezeCredits: number
  dashboardUrl: string
}): string {
  const { firstName, streak, freezeCredits, dashboardUrl } = params
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#021B3A;font-family:'DM Sans',sans-serif;color:#ffffff;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#021B3A;padding:40px 20px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#0d1b2a;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;max-width:100%;">
      <!-- Header -->
      <tr><td style="background:linear-gradient(135deg,#0d1b2a,#1a2d42);padding:24px 32px;border-bottom:1px solid rgba(255,255,255,0.07);">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td><div style="width:36px;height:36px;background:#14BDAC;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;color:#021B3A;font-size:14px;vertical-align:middle;line-height:36px;text-align:center;">SP</div>
            <span style="margin-left:10px;font-size:16px;font-weight:600;vertical-align:middle;">SPD Cert Companion</span></td>
          </tr>
        </table>
      </td></tr>
      <!-- Body -->
      <tr><td style="padding:32px;">
        <p style="font-size:28px;margin:0 0 8px;">🔥</p>
        <h1 style="font-size:22px;margin:0 0 12px;font-weight:700;">Your streak is at risk, ${firstName}!</h1>
        <p style="color:rgba(255,255,255,0.65);font-size:15px;line-height:1.6;margin:0 0 24px;">
          You have a <strong style="color:#f97316;">${streak}-day streak</strong> — don't break it now.
          ${streak >= 7 ? "You've been building serious momentum." : 'Every day counts.'}
          Take just 5 minutes to answer some questions before midnight.
        </p>
        ${freezeCredits > 0 ? `<p style="background:rgba(20,189,172,0.08);border:1px solid rgba(20,189,172,0.2);border-radius:10px;padding:12px 16px;font-size:13px;color:rgba(255,255,255,0.6);margin:0 0 24px;">
          ❄️ You have <strong style="color:#14BDAC;">${freezeCredits} streak freeze credit${freezeCredits > 1 ? 's' : ''}</strong> available if you truly can't study tonight.
        </p>` : ''}
        <a href="${dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#0D7377,#14BDAC);color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;">
          Keep My Streak →
        </a>
      </td></tr>
      <!-- Footer -->
      <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);">
        <p style="font-size:12px;color:rgba(255,255,255,0.3);margin:0;">
          You're receiving this because you enabled streak reminders.
          <a href="${dashboardUrl}/account" style="color:rgba(255,255,255,0.3);">Manage preferences</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}

export function weeklyDigestHtml(params: {
  firstName: string
  streak: number
  questionsThisWeek: number
  avgScore: number | null
  weakDomain: string | null
  dashboardUrl: string
}): string {
  const { firstName, streak, questionsThisWeek, avgScore, weakDomain, dashboardUrl } = params
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#021B3A;font-family:'DM Sans',sans-serif;color:#ffffff;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#021B3A;padding:40px 20px;">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="background:#0d1b2a;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;max-width:100%;">
      <tr><td style="background:linear-gradient(135deg,#0d1b2a,#1a2d42);padding:24px 32px;border-bottom:1px solid rgba(255,255,255,0.07);">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td><div style="width:36px;height:36px;background:#14BDAC;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font-weight:700;color:#021B3A;font-size:14px;vertical-align:middle;line-height:36px;text-align:center;">SP</div>
          <span style="margin-left:10px;font-size:16px;font-weight:600;vertical-align:middle;">Weekly Readiness Report</span></td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:32px;">
        <h1 style="font-size:22px;margin:0 0 6px;font-weight:700;">Your week in review, ${firstName}</h1>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 28px;">Here's how you did and what to focus on next week.</p>

        <!-- Stats row -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            <td style="padding:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;text-align:center;width:33%;">
              <div style="font-size:24px;font-weight:700;color:#14BDAC;">${questionsThisWeek}</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:4px;">questions</div>
            </td>
            <td style="width:8px;"></td>
            <td style="padding:16px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:10px;text-align:center;width:33%;">
              <div style="font-size:24px;font-weight:700;color:${avgScore !== null && avgScore >= 70 ? '#10B981' : '#f59e0b'};">${avgScore !== null ? avgScore + '%' : '—'}</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:4px;">avg score</div>
            </td>
            <td style="width:8px;"></td>
            <td style="padding:16px;background:rgba(249,115,22,0.08);border:1px solid rgba(249,115,22,0.2);border-radius:10px;text-align:center;width:33%;">
              <div style="font-size:24px;font-weight:700;color:#f97316;">🔥 ${streak}</div>
              <div style="font-size:11px;color:rgba(255,255,255,0.45);margin-top:4px;">day streak</div>
            </td>
          </tr>
        </table>

        ${weakDomain ? `<div style="background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:16px;margin-bottom:24px;">
          <div style="font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:0.08em;text-transform:uppercase;margin-bottom:6px;">Focus Area This Week</div>
          <div style="font-size:15px;font-weight:600;color:#fca5a5;">⚠️ ${weakDomain}</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.5);margin-top:4px;">Your lowest scoring domain — drill it to boost your readiness.</div>
        </div>` : ''}

        <a href="${dashboardUrl}" style="display:inline-block;background:linear-gradient(135deg,#0D7377,#14BDAC);color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:15px;">
          Start This Week's Study →
        </a>
      </td></tr>
      <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);">
        <p style="font-size:12px;color:rgba(255,255,255,0.3);margin:0;">
          Sent every Sunday morning. <a href="${dashboardUrl}/account" style="color:rgba(255,255,255,0.3);">Manage preferences</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`
}
