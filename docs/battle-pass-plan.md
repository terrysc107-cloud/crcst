# Battle Pass + Verified Study Hours — Implementation Plan

Forward-looking design for a yearly battle-pass mechanic tied to time-on-task that delivers HSPA-CEU-equivalent certificates. Targeted at CRCST holders, who need 12 CEUs/year for renewal.

**Status:** plan only. No code shipped yet. Sequencing decided after wholesale codes (PR #71) is tested in production.

---

## Concept

- 12-tier yearly battle pass (mirrors HSPA's 12-CEU annual renewal requirement)
- Each tier = 1.0 verified study credit, broken into two 0.5 sub-levels for more frequent unlocks (24 milestones/year total)
- Credits earned via active study time + activity floors (anti-cheat)
- Each unlock issues a downloadable PDF certificate with a public verification URL
- Annual reset on user's enrollment anniversary (not calendar year)

**Phase 1 (this plan):** Issue **"Verified Study Hours"** certificates. Not yet HSPA-recognized.
**Phase 2 (after HSPA approval):** Same mechanic, certificates re-template as official CEUs. Existing earned hours convert retroactively.

---

## Earning thresholds

| Credit | Active study time | Activity floor |
|---|---|---|
| 0.5 | 30 minutes | ≥25 questions answered, ≥70% accuracy, across ≥2 sessions |
| 1.0 | 60 minutes | ≥50 questions answered, ≥70% accuracy, across ≥3 sessions |

**Daily cap:** max 1.0 credit per 24 hours (no marathon farming).

**Active time** = client heartbeat + idle detection (no input for 60s pauses the timer). Heartbeats are server-validated for spacing to prevent forged time.

---

## Tier visibility

Linear track UI on the dashboard:

```
Tier 1 ──🟢──── Tier 2 ──○──── Tier 3 ──○ … Tier 12
0.5 / 1.0       1.5 / 2.0      2.5 / 3.0
```

Each tier shows: lock icon → in-progress with progress bar → unlocked (download cert).

---

## Free vs Pro positioning

| | Free | Pro ($19/mo) | Future: CEU Pass |
|---|---|---|---|
| Track visible? | Yes | Yes | Yes |
| Earn credits? | Up to 1.0 (demo) | Full 12.0 | Full 12.0 |
| Cert type | Verified Study Hours | Verified Study Hours | Real HSPA CEUs |
| Submittable to HSPA? | No | After approval | Yes |

Marketing line: *"$240+ in CEU courses for $19/month — earn all 12 by just studying."*

---

## Schema sketch

```sql
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  active_seconds INT NOT NULL DEFAULT 0,
  questions_attempted INT NOT NULL DEFAULT 0,
  questions_correct INT NOT NULL DEFAULT 0,
  domains_studied JSONB
);

CREATE TABLE battle_pass_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  total_active_seconds INT NOT NULL DEFAULT 0,
  total_questions INT NOT NULL DEFAULT 0,
  credits_earned NUMERIC(3,1) NOT NULL DEFAULT 0,
  UNIQUE(user_id, period_start)
);

CREATE TABLE study_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  period_id UUID NOT NULL REFERENCES battle_pass_periods(id),
  credit_amount NUMERIC(3,1) NOT NULL CHECK (credit_amount IN (0.5, 1.0)),
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  certificate_id TEXT UNIQUE NOT NULL,
  certificate_url TEXT,
  active_seconds_at_earn INT NOT NULL,
  questions_at_earn INT NOT NULL
);
```

---

## Sprint sequencing

### Sprint 1 — Time tracking foundation (4-6 days)
- `study_sessions` table + heartbeat API (`POST /api/study/heartbeat` every 30s while active)
- Idle detection client-side (no input for 60s = pause)
- Activity event hooks on existing question-attempt + flashcard flows
- Daily summary aggregation (cron or on-write)

### Sprint 2 — Battle pass schema + dashboard widget (3-4 days)
- `battle_pass_periods` and `study_credits` tables
- Visual track component (12 tiers, progress bar per tier)
- Embed on dashboard above the cert cards

### Sprint 3 — Credit issuance + email (2-3 days)
- Server checks thresholds on each heartbeat completion
- Atomic unlock: insert `study_credits` row + email via Resend
- Account page: "Your Study Hours" list with download buttons

### Sprint 4 — Certificate PDF generation (3-4 days)
- `@react-pdf/renderer` server-side
- Template: name, credit amount, date, unique cert ID, verification URL, domains studied
- Public verification page: `/verify/<cert-id>` shows the cert as valid/invalid
- Store generated PDFs in Supabase Storage

### Sprint 5 — Anti-abuse + edge cases (2-3 days)
- Daily cap enforcement (max 1.0 credit per 24h)
- Tighten heartbeat (signed timestamps, server-validates spacing)
- Annual reset job (cron at midnight checks anniversaries)
- Pause/resume on plan downgrade

### Sprint 6 — HSPA application prep (1-2 days)
- Audit-log export for HSPA reviewers
- Internal admin dashboard at `/admin/credits` to see all issued certs
- Documented anti-fraud policy in writing (helps the application)

**Total: ~3-4 weeks of focused work for v1 ship.**

---

## Services / dependencies

**No new SaaS subscriptions or vendors needed.** Everything maps to the existing stack:

| Need | Service | Status |
|---|---|---|
| Time tracking + DB | Supabase | already have |
| Heartbeat API | Vercel serverless | already have |
| PDF generation | `@react-pdf/renderer` (npm) | npm install only |
| Certificate file storage | Supabase Storage | already have |
| Email delivery | Resend | already have (added in PR #71) |
| Cron (annual reset, daily aggregations) | Vercel Cron | already have on Pro |
| Verification page | Existing Next.js routes | already have |

---

## Open decisions to make before Sprint 1

1. **Half-credits or whole credits per milestone?** → leaning **half** (0.5 increments, 24 milestones/year). Better dopamine cadence, more visible progress.
2. **Free tier credits?** → leaning **1.0 free credit/year** (demo/hook), then locked. Zero is also defensible if upsell pressure is the goal.
3. **Annual reset on signup anniversary or calendar year?** → leaning **anniversary**. Better UX for late-year signups, slightly more cron logic.

---

## HSPA accreditation parallel track

While Sprint 1-4 ships, separately:

1. Visit HSPA's CE Provider application page
2. Gather required documentation (content review, instructor qualifications, anti-fraud policy)
3. Submit application (~$X fee, weeks-to-months review)
4. Once approved: update certificate template with HSPA provider number, swap "Verified Study Hours" → "CEUs", retroactively re-issue prior certificates with the new branding (huge PR moment)

---

## Pricing implications

Once real CEUs are issued, justifies:

- **Higher Pro pricing** (e.g. $19 → $24/mo with CEUs included)
- OR **separate "CEU Pass" tier** ($79-99/yr add-on for CRCST holders specifically)

Comparable: standalone CEU courses run $20-50 each. 12 CEUs/year = $240-600 retail value.
