# SPD Cert Prep — Live State

> Single source of truth for what is active right now.
> Updated by `Chief Builder` at start + end of every phase.

## Active Phase

**Roadmap Phase 5 — Personalization + Study Plans**
- Status: `not started`
- Started: —
- Lead: `Systems Architect`

## Phase Status Summary

| Phase | Name | Status | Lead Agent |
|---|---|---|---|
| 1 | Foundation Cleanup | done (partial — DAL + migrations built organically) | Backend Builder |
| 2 | Design System Unification | done (partial — tokens in globals.css, shadcn wired) | Frontend Builder |
| 3 | Core Learning Loop Polish | done | Frontend Builder |
| 4 | Gamification Engine | **done** | Assessment Builder |
| 5 | Personalization + Study Plans | not started | Systems Architect |
| 6 | Content Depth | blocked-by-5 | Content Systems Builder |
| 7 | Marketing Rebuild + Launch | blocked-by-6 | Chief Builder |

## Phase 4 — What Shipped

| Item | Files |
|---|---|
| 4.1 XP system | `lib/dal/xp.ts`, `app/api/xp/award/route.ts`, `scripts/phase4-gamification.sql` |
| 4.2 Badge locker | `lib/dal/badges.ts`, `app/api/badges/check/route.ts`, `components/BadgeLocker.tsx` |
| 4.3 Streak + freeze | `lib/dal/streaks.ts`, `app/api/streaks/activity/route.ts`, `app/api/streaks/freeze/route.ts`, `components/StreakFreezeModal.tsx` |
| 4.4 Daily Challenge | `lib/dal/daily-challenge.ts`, `app/api/daily-challenge/route.ts`, `app/daily-challenge/page.tsx` |
| 4.5 Celebrations | `components/Celebration.tsx` (canvas-confetti + CelebrationBanner + SoundToggle) |
| 4.6 Streak heatmap | `components/StreakHeatmap.tsx` (SVG GitHub-style, wired into /account) |
| 4.7 Dashboard reorder | `app/dashboard/page.tsx` — 5-widget top fold: Streak / Daily / Next Badge / Readiness / Weak Domain + XP bar |
| 4.8 Notifications | `lib/email-templates.ts`, `/api/notifications/streak-reminder`, `/api/notifications/weekly-digest`, `vercel.json` crons |
| Integration | `lib/gamification-client.ts` — wired into crcst/chl/cer `saveResults` |
| /account | Updated with XP card, streak card, heatmap, BadgeLocker, SoundToggle |

### New env vars required for Phase 4

| Var | Purpose |
|---|---|
| `RESEND_API_KEY` | Email delivery for streak reminders + weekly digest |
| `CRON_SECRET` | (optional) Protect cron endpoints from public calls |
| `NEXT_PUBLIC_APP_URL` | Base URL for email links |

### SQL to run in Supabase

```sql
-- scripts/phase4-gamification.sql
```

---

## Open Specialists

None active. Activate per phase contract.

## Recent Decisions Pending Capture

- 2026-05-02 — Phase 4 gamification shipped: XP (10 SPD-themed levels), badge locker (13 badges), streak freeze (auto + manual), daily challenge (deterministic 10q/day), canvas-confetti celebrations, GitHub-style heatmap, Resend email notifications, vercel.json crons.
- 2026-04-25 — Adopt masterbuilder system as the build operating model
- 2026-04-25 — Single payment provider going forward: Square (Stripe deps to be removed in Phase 1)

---

*Last updated 2026-05-02.*
