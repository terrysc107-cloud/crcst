# Project Kickoff — SPD Cert Prep

> Filled-in instance of `templates/PROJECT-KICKOFF-TEMPLATE.md`.
> This is the master brief every agent reads before stepping into a phase.

## Project Name

SPD Cert Prep (working brand: SPD Cert Companion)

## Product Type

AI-augmented learning platform — certification exam prep for sterile processing professionals (CRCST, CHL, CER, plus situational judgment).

## Who It Serves

- **Primary:** Sterile processing technicians preparing for HSPA certification exams (CRCST first-time test takers; CRCST holders moving up to CHL or CER)
- **Secondary:** Hospital sterile-processing department managers buying access for their teams
- **Tertiary:** Career-changers entering the field who need foundational study material

## Core Problem

Existing prep options are fragmented and demoralizing — overpriced textbooks, low-quality question dumps, and no real coaching. Students fail repeatedly because nothing tells them what to study next, calibrates their confidence, or rewards the daily habit it takes to pass.

## Core Outcome

A student should pass their certification exam on the first attempt and feel taught — not just tested. Daily return should feel rewarding even on a five-minute lunch break.

## Primary User Journey

1. Land on marketing site → see real-time stat counter + cert pricing → sign up free
2. Onboarding captures cert + exam date + experience → first quiz launches immediately from final step
3. Daily return: dashboard shows "due today" deck (spaced repetition) + streak + next badge
4. Hit a milestone → confetti + badge unlock + LinkedIn share moment
5. Mock exam pass → claim digital badge → become a marketing surface for the next cohort
6. Optional: upgrade to Pro ($19/90 days) or Triple Crown ($39/90 days) when free limits hit

## Secondary User Journeys

- Lapsed user: weekly Resend email with readiness delta brings them back
- Driving / hands-busy study: audio mode reads questions aloud
- Visual learner: instrument-identification image quizzes
- Coach-style use: weak-domain detector tells the user what to drill today

## What Must Feel Excellent

- The quiz card itself — the single screen users spend the most time on
- The streak + level-up + badge celebration moments
- Onboarding — conversion-critical, no dead clicks
- The first 60 seconds after signup
- Visual coherence — every screen feels like the same product

## What Can Wait

- Native mobile apps (web-first, PWA-capable)
- Hospital B2B portal / site licenses
- Live human tutoring
- Public API / LMS integrations
- Resume / job-board features (link out to MyQualifiedResume.com instead)
- Discord community
- Question authoring tools for non-admins

## Likely Technical Shape

- **Framework:** Next.js 16 App Router + React 19
- **Database + Auth:** Supabase (Postgres + RLS + `@supabase/ssr`)
- **Styling:** Tailwind v4 + shadcn/ui (one design system, top to bottom)
- **AI:** Anthropic SDK (Claude Sonnet for chat coach)
- **Payments:** Square (single provider — Stripe deps to be removed)
- **Hosting:** Vercel
- **Email:** Resend + React Email
- **Analytics:** Vercel Analytics + PostHog (optional)
- **Storage:** Supabase Storage (instrument images)

## Risks

- **Scope creep into hospital B2B too early** — defer until v1 retention proves out
- **Gamification training grinding instead of learning** — must order Phase 3 (learning loop) before Phase 4 (gamification)
- **Payment provider mid-flight switch** — Square is the chosen one; remove Stripe early to avoid double maintenance
- **Schema churn** — spaced repetition + XP + badges all add tables; sequence migrations carefully
- **Two visual systems silently coexisting** — marketing palette ≠ app palette today; resolve in Phase 2 or every later screen ships visual debt
- **AI chat cost growth** — per-user daily caps already in place but no IP-level rate limit yet (deferred until abuse appears)

## Recommended First Phase

**Roadmap Phase 1 — Foundation Cleanup.** Maps to masterbuilder *Phase 03 Frontend Foundation* + *Phase 08 Backend & Data Reality* blended. Auth migration to `@supabase/ssr`, route groups, Data Access Layer, single payment SDK, real Supabase migrations, Tailwind v4 token consolidation, font fix, generated types.

Skipping masterbuilder Phases 01 (Product Clarity) and 02 (Core User Flow Clarity) is justified because:
- Product is already clear (this kickoff doc)
- Primary flow already exists end-to-end (signup → onboarding → cert hub → quiz → results → upgrade)
- Repo has 14 routes, 79 components, 15K LOC — strategic confusion is not the constraint; structural debt is

## Chief Builder Decision

- **Active phase:** Roadmap Phase 1 — Foundation Cleanup
- **Lead agent:** `Backend Builder`
- **Support agents:** `Systems Architect`, `Frontend Builder`, `Verifier`, `Security Reviewer` (specialist)
- **Reference docs:** `.planning/ROADMAP.md`, `.planning/contracts/PHASE-1-foundation-cleanup.md`, `docs/MASTER-PLAN.md`, `docs/AGENT-PROMPTS.md`

## Operating Cadence

- One roadmap phase active at a time
- Each phase has a contract in `.planning/contracts/`
- Each plan within a phase ships as one PR
- After every phase: `Verifier` signs off → `Learning Steward` updates `memory/DECISIONS.md`, `memory/LEARNINGS.md`, `memory/DEBT.md`, `memory/PATTERNS.md`
- `.planning/STATE.md` tracks the live phase + plan progress

---

*Last updated 2026-04-25.*
