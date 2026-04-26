# Phase Contract — Phase 3: Core Learning Loop Polish

> Roadmap reference: `.planning/ROADMAP.md` § Phase 3
> Masterbuilder mapping: *Phase 04 Core Experience Completion* + *Phase 06 Assessment & Feedback*

## Phase

**Core Learning Loop Polish** — turn the question bank into a teacher. The actual quiz becomes the thing users brag about.

## Goal

Spaced repetition. Mistake bank. Confidence ratings. A redesigned single-card quiz UI. Cert pages split from 800–1000 LOC monoliths into composable shells. The "Due Today" deck becomes the dashboard's primary call to action.

## Why It Matters

This is the product. Users come for a question bank but stay because something coached them. Spaced repetition is the single most evidence-based feature in study apps; without it the product competes on quantity, with it the product competes on outcomes. Phase 4's gamification rewards a *good* loop — so the loop has to be good first.

## Lead Agent

**`Frontend Builder`** — the quiz card is the most-touched screen in the app.

## Support Agents

- **`Backend Builder`** — `question_state` schema, SM-2 algorithm endpoints, mistake-bank query
- **`Assessment Builder`** — confidence-rating rubric, calibration chart, definition of "mastered"
- **`Systems Architect`** — ensures spaced-rep design scales to Phases 4–6 without re-architecture
- **`Verifier`** — definition-of-done; goal-backward check that learning actually improved
- **`AI Product Strategist`** *(specialist — activated)* — designs the "Ask AI to explain" pre-fill, trust boundaries, and explanation context

### Specialist Justification

`AI Product Strategist` is activated because the "Ask AI to explain" feature (Plan 3.6) crosses a UX trust boundary — students will treat AI explanations as authoritative. Prompt context, factuality guardrails, and citation behavior need design, not improvisation.

## In Scope

- **3.1** Spaced repetition engine — table `question_state(user_id, question_id, ease, interval_days, next_due, last_seen, last_result)`, SM-2 in `lib/srs.ts`, "Due Today" dashboard card
- **3.2** Mistake bank — endpoint returns N most-recent wrongs per cert; dashboard quick-action "Review your 12 misses"
- **3.3** Confidence ratings — Guessed / Unsure / Confident / Certain after each answer; feeds ease factor; calibration chart on `/account`
- **3.4** Quiz card redesign — single elevated card, large tap targets, swipe-to-reveal explanation on mobile, keyboard shortcuts (1–4, Space) on desktop
- **3.5** Split cert pages — `app/{crcst,chl,cer}/page.tsx` (currently 800–1030 LOC each) become `<CertHub>` (server) + `<QuizRunner>` (client) + `<DomainProgress>` (server). Eliminate duplicated streak calc.
- **3.6** "Ask AI to explain" button on every explanation card — pre-fills `/api/chat` with the question stem
- **3.7** Persist quiz session to `quiz_sessions` (table exists per `scripts/`); resume mid-quiz across devices

## Out Of Scope

- XP / levels / badges / streak freeze (Phase 4)
- Daily Challenge (Phase 4)
- Image-based questions, audio mode (Phase 6)
- Adaptive study plan generator (Phase 5)
- Notification emails (Phase 4 starts them, Phase 5 expands)

## Repo Areas Likely To Change

- `lib/srs.ts` (new) — SM-2 implementation
- `lib/dal/progress.ts` — extended for spaced-rep state
- `supabase/migrations/*` — `question_state` table + RLS
- `components/Quiz.tsx` — major redesign
- `components/{CertHub,QuizRunner,DomainProgress}.tsx` (new — split from cert pages)
- `app/{crcst,chl,cer}/page.tsx` — slim to data-fetching shells
- `app/dashboard/page.tsx` — "Due Today" + "Review Misses" cards
- `app/account/page.tsx` — calibration chart
- `app/api/chat/route.ts` — accepts question-context payload for explain-this

## Definition Of Done

- A returning user's first action is reviewing wrongs, not picking a quiz mode
- Dashboard top-fold shows real "Due Today" counts based on SM-2 state
- Quiz files are <300 LOC each (`crcst`, `chl`, `cer`)
- Confidence ratings visible on every answer + calibration chart on `/account`
- "Ask AI to explain" pre-fills with the actual question text and explanation context
- Mid-quiz session can be resumed on a different device without progress loss
- `Verifier` signs off using goal-backward check: did learning measurably improve in dogfood testing?

## Risks

- **SM-2 picks wrong defaults** — research-back the ease starting value; document in `memory/DECISIONS.md` with rationale
- **Spaced rep state diverges from `responses` table** — single source of truth must be `question_state`; `responses` becomes raw audit log
- **Confidence rating fatigue** — keep it to one tap, no submit; default to "Confident" so flow isn't blocked
- **Quiz card redesign breaks existing flows** — feature flag the redesign; ship behind a query param first
- **AI explain answers wrong** — the system prompt already enforces "verify with IAHCSMM/AAMI" — reinforce in pre-fill; AI Product Strategist owns this

## Notes

- This phase touches schema. Do Plan 3.1 first; everything else depends on `question_state` existing.
- `Learning Steward` records the SM-2 parameter choices in `memory/DECISIONS.md` after exit so they aren't re-litigated.

---

## Execution Prompt

```text
Activate Phase 3 from .planning/contracts/PHASE-3-learning-loop.md.
Read docs/MASTER-PLAN.md, docs/AGENT-PROMPTS.md, .planning/ROADMAP.md (§ Phase 3),
and this contract.

You are the Frontend Builder leading. Support: Backend Builder, Assessment Builder,
Systems Architect, Verifier. Activate AI Product Strategist as a specialist.

Ship Plan 3.1 (spaced repetition engine) first — everything else depends on it.
Then 3.2, 3.3, 3.5, 3.4, 3.7, 3.6 in that order.

Use templates/EXECUTION-BRIEF-TEMPLATE.md per plan. Verifier signs off using
goal-backward check before exit. Update .planning/STATE.md after each plan.
```
