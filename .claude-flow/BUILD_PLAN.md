# CRCST App — Build Plan
_Generated: 2026-05-07_

## Context
CRCST exam prep app (Next.js App Router, Supabase, Tailwind, Stripe).
Branch: `claude/fix-mobile-progression-xp-KWV9L` (all prior work merged to main).
Repo: `terrysc107-cloud/crcst`

## Phase 1 — Design System (makes app look professionally built)

| # | Task | Files | Notes |
|---|------|-------|-------|
| 1.1 | Add DM Sans + Playfair Display to Tailwind config | `tailwind.config.ts` | Eliminates 50+ inline `style={{ fontFamily }}` overrides |
| 1.2 | Consolidate color tokens | `tailwind.config.ts` | `#14BDAC` → config teal, `#DAA520` → config amber. 20+ hardcoded hex values |
| 1.3 | Build shared `Card` component | `components/ui/Card.tsx` | Replaces inline `background: rgba(...)` card patterns across all pages |
| 1.4 | Build shared `Badge` component | `components/ui/Badge.tsx` | Subscription tier, XP tier, cert badges |
| 1.5 | Replace emoji icons with Lucide icons | `app/page.tsx`, `app/dashboard/page.tsx`, `components/Results.tsx` | lucide-react is already installed, zero icons use it |
| 1.6 | Fix progression page mobile responsiveness | `app/progression/page.tsx` | Currently 0 responsive breakpoints, fixed 768px width — broken on mobile |
| 1.7 | Add loading skeletons to dashboard + account | `app/dashboard/page.tsx`, `app/account/page.tsx` | `components/ui/spinner.tsx` exists but unused |

## Phase 2 — Study Intelligence (keeps users learning and returning)

| # | Task | Files | Notes |
|---|------|-------|-------|
| 2.1 | "Focus Weak Areas" quiz mode | `app/crcst/page.tsx`, new `lib/quiz-selection.ts` | Auto-generates quiz from bottom 3 domains by accuracy. Makes domain mastery actionable |
| 2.2 | Study Guide tab per cert | `app/crcst/page.tsx`, new `app/crcst/study-guide/page.tsx` | Key concepts already in `lib/progression-config.ts` — surface them here |
| 2.3 | Spaced repetition question weighting | `lib/quiz-selection.ts` | `question_attempts` table already tracks `was_correct`. Weight missed questions higher |
| 2.4 | Smart mock readiness indicator | `app/crcst/page.tsx` | If accuracy 65-75% → suggest focus study. 75-85% → ready for mock. Show on home screen |

## Phase 3 — Retention (brings users back daily)

| # | Task | Files | Notes |
|---|------|-------|-------|
| 3.1 | Streak reminder emails | New `app/api/reminders/send/route.ts` | Streaks already calculated — add email trigger when streak at risk |
| 3.2 | "You're X% exam ready" home widget | `app/crcst/page.tsx` | Motivational readiness score with call-to-action |

## Key Infrastructure Notes
- Question bank: CRCST 394, CHL 338, CER 147, Scenarios 30 = 909 total
- `question_attempts` table tracks every attempt + correctness (use for SRS)
- Domain mastery already in `crcst_domain_mastery` (use for weak-area targeting)
- Streaks calculated in `app/crcst/page.tsx` lines 141-168
- `lucide-react` already in package.json — just import and use
- Progression level key concepts in `lib/progression-config.ts` — reuse for study guide
- Tailwind config already has `teal`, `amber`, `navy` tokens — pages just aren't using them

## Start Order
**Phase 1 first** — design polish makes every subsequent feature look professional.
Within Phase 1: 1.6 (mobile fix) → 1.5 (icons) → 1.1+1.2 (tokens) → 1.3+1.4 (components) → 1.7 (loading states)
