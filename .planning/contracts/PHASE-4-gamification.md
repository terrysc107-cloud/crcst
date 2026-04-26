# Phase Contract — Phase 4: Gamification Engine

> Roadmap reference: `.planning/ROADMAP.md` § Phase 4
> Masterbuilder mapping: *Phase 06 Assessment & Feedback* + early *Phase 09 Personalization*

## Phase

**Gamification Engine** — daily return feels rewarding. Streak isn't punitive, levels feel earned, badges are worth screenshotting.

## Goal

XP system with field-relevant level names. Badge locker with at least 10 starter badges. Streak freeze (the single biggest retention lever). Daily Challenge with cohort percentile. Confetti + heatmap. Notification emails that bring lapsed users back.

## Why It Matters

A great learning loop without a habit layer plateaus at "students who already know how to study." A great habit layer without learning produces grinders. We built the loop in Phase 3; now we build the reason to come back tomorrow.

## Lead Agent

**`Assessment Builder`** — owns checkpoints, feedback loops, rubric design. XP and badges are a measurement system, not pure UI.

## Support Agents

- **`Frontend Builder`** — celebration UI, badge locker, heatmap, dashboard widget reorder
- **`Backend Builder`** — XP table, badge tables, streak-freeze logic, notification cron
- **`Design Auditor`** — celebration moments must feel rewarding, not annoying; accessibility for sound + motion
- **`Verifier`** — measures D1/D7/D30 retention before vs after
- **`Growth Systems Strategist`** *(specialist — activated)* — owns the lifecycle email cadence + streak-recovery loop
- **`Data Visualization Specialist`** *(specialist — activated)* — owns the streak heatmap + readiness dashboard charts

### Specialist Justification

`Growth Systems Strategist` is activated because gamification is fundamentally a growth/retention system — getting it wrong creates churn (Duolingo's worst-case). `Data Visualization Specialist` is activated because the heatmap and readiness charts are central product surfaces; recharts is installed but no chart hierarchy exists yet.

## In Scope

- **4.1** XP system — `user_xp(user_id, total_xp, current_level, level_progress)`. XP per correct answer, difficulty multipliers, first-attempt-correct bonus. 10 levels: Decon Apprentice → Sterile Steward → Tray Sage → Chief Tech.
- **4.2** Badge locker — `user_badges(user_id, badge_id, earned_at)`. Starter set: First Quiz, 7/30/100-day Streak, 100/500/1000 Questions, Domain Mastered (≥85%), Mock Exam Passed, Flawless Run (20-in-a-row), AI Chat Power User. Locked silhouettes for unearned.
- **4.3** Streak freeze — 1/week earned for free, 1/month bonus for Pro. Restore lost streak. Required gate before shipping streaks.
- **4.4** Daily Challenge — same 10 questions for everyone that day; result feeds `top X% today` percentile. Cron-generated deck.
- **4.5** Celebration moments — `canvas-confetti` on level-up, badge unlock, mock exam pass. Optional sound (toggle in settings).
- **4.6** Streak heatmap (GitHub-style) on `/account`. Recharts custom component.
- **4.7** Dashboard widget reorder — Streak / Due Today / Next Badge / Readiness / Weak Domain. Top fold answers "what should I do right now?"
- **4.8** Notifications via Resend — daily streak-at-risk reminder at 8pm local time; weekly readiness digest Sunday morning. React Email templates.

## Out Of Scope

- Adaptive study plan generator (Phase 5)
- Image-based questions / audio mode (Phase 6)
- Public profile pages with badge sharing (Phase 7)
- Mock exam history depth (Phase 6)

## Repo Areas Likely To Change

- `supabase/migrations/*` — `user_xp`, `user_badges`, `daily_challenge`, RLS for each
- `lib/dal/{xp,badges,streaks,notifications}.ts` (new)
- `lib/gamification/{rules,levels,badges}.ts` (new) — pure functions
- `components/{XPBar,BadgeLocker,StreakHeatmap,DailyChallenge,LevelUpModal}.tsx` (new)
- `app/dashboard/page.tsx` — widget reorder
- `app/account/page.tsx` — heatmap + badge locker tabs
- `app/api/cron/{daily-challenge,streak-reminder,weekly-digest}/route.ts` (new)
- `vercel.json` — cron schedule
- `emails/*` — React Email templates

## Definition Of Done

- D7 and D30 cohort retention curves measurably bend in dogfood vs prior-month baseline
- Hitting a milestone on Friday produces a moment a user would screenshot
- Missing a day no longer means "I quit" — streak freeze auto-applies once available
- Daily Challenge percentile renders within 1 second of submission
- Weekly readiness email renders correctly in Gmail, Apple Mail, Outlook (use React Email preview)
- `Verifier` signs off using before/after retention metrics

## Risks

- **Confetti / sound feels childish to professionals** — Design Auditor sets restraint level; opt-out from settings on day 1
- **Streak freeze logic edge cases** — define explicitly: timezone, freeze inventory, queued-up freezes; document in `memory/DECISIONS.md`
- **Gamification trains grinding** — Phase 3 must be solid first (already gated by phase order); XP is awarded for *correct* answers only, not attempts
- **Notification fatigue** — frequency cap; respect user preferences from day 1
- **Badge inflation** — 10 starter badges is the cap for v1; resist adding more until usage data justifies
- **XP balance trial-and-error** — all XP rules in one config file so tuning is one PR

## Notes

- This phase introduces external sends (email). Add it last in the phase, after the in-app surfaces are solid.
- `Learning Steward` documents XP rule choices, level thresholds, and badge criteria in `memory/DECISIONS.md` so they don't drift.

---

## Execution Prompt

```text
Activate Phase 4 from .planning/contracts/PHASE-4-gamification.md.
Read docs/MASTER-PLAN.md, docs/AGENT-PROMPTS.md, .planning/ROADMAP.md (§ Phase 4),
and this contract.

You are the Assessment Builder leading. Support: Frontend Builder, Backend Builder,
Design Auditor, Verifier. Activate Growth Systems Strategist + Data Visualization
Specialist as specialists.

Order: 4.1 (XP) → 4.2 (badges) → 4.3 (streak freeze) → 4.7 (dashboard reorder)
→ 4.5 (celebration) → 4.6 (heatmap) → 4.4 (daily challenge) → 4.8 (notifications).

Verifier compares D7/D30 retention before vs after exit. Update .planning/STATE.md
after each plan.
```
