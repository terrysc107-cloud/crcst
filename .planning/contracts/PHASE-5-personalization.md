# Phase Contract — Phase 5: Personalization + Study Plans

> Roadmap reference: `.planning/ROADMAP.md` § Phase 5
> Masterbuilder mapping: *Phase 09 Intelligence & Personalization*

## Phase

**Personalization + Study Plans** — move from "question bank" to "coach."

## Goal

The app knows your exam date and tells you exactly what to do today. Onboarding becomes a real funnel, the dashboard answers a personalized question, and weekly emails report progress in human terms.

## Lead Agent

**`Systems Architect`** — owns the personalization model and how data drives it.

## Support Agents

- **`Backend Builder`** — `profiles` schema extensions, plan-generator endpoints, weekly digest cron
- **`Frontend Builder`** — onboarding rebuild, dashboard countdown card, drill CTAs
- **`Assessment Builder`** — readiness score formula, weak-domain detection rubric
- **`Verifier`** — onboarding completion rate target, plan-actionability check
- **`UX Research Synthesizer`** *(specialist — activated)* — synthesizes onboarding friction; pattern-extracts what "good study plan" means to actual SPD students

### Specialist Justification

`UX Research Synthesizer` is activated because personalization without user research turns into product manager hunches. Even minimal user notes (support emails, post-onboarding survey) need synthesis before the rules engine in Plan 5.4 is locked.

## In Scope

- **5.1** Exam-date capture — onboarding step + `profiles.exam_date` column. Countdown card on dashboard with days remaining + recommended daily question quota.
- **5.2** Daily quota — given `(days_remaining, current_readiness, weak_domains)`, recommend a session size + composition (e.g., "30 min: 15 due reviews + 10 weak-domain + 5 mock"). Auto-built deck delivered as one CTA.
- **5.3** Weak-domain detector — surface lowest-scoring domain on dashboard with a "Drill this" button.
- **5.4** Adaptive plan generator — `lib/plan.ts` returns today's session given user state. Simple rules engine first; revisit only if dogfood says rules aren't enough.
- **5.5** Onboarding rebuild — multi-step (cert → exam date → goal → experience), progress bar, name capture, first-quiz launch from final step. Replace `localStorage` gate with `profiles.onboarding_completed_at`.
- **5.6** Weekly readiness email — Resend + React Email; "+8% this week, weak spot: ST91 high-level disinfection, suggested focus: 3 sessions."

## Out Of Scope

- Image-based questions, audio mode (Phase 6)
- Branching SJT scenarios (Phase 6)
- Public profile pages (Phase 7)
- Native mobile (never, in v1)
- Tutoring / human coaching (never, in v1)

## Repo Areas Likely To Change

- `supabase/migrations/*` — `profiles.exam_date`, `profiles.onboarding_completed_at`, `profiles.daily_goal_minutes`
- `lib/plan.ts` (new) — rules engine
- `lib/dal/{plan,readiness}.ts` (new)
- `app/onboarding/page.tsx` — full rebuild
- `app/dashboard/page.tsx` — countdown + drill-this widgets
- `app/api/cron/weekly-digest/route.ts` (new)
- `emails/weekly-readiness.tsx` (new)

## Definition Of Done

- Onboarding completion rate >85% in dogfood
- Dashboard top-fold answers "what should I do right now?" personalized to the user
- A user 14 days from exam logs in and sees a credible plan, not a question bank
- Weekly digest renders cleanly in major mail clients; references the user by name + cert + delta
- `Verifier` confirms a brand-new test user goes from signup → first session in <90 seconds

## Risks

- **Plan-generator rules feel canned** — UX Research Synthesizer informs the rules with real friction patterns; ship a "swap today's plan" button so users have an out
- **Exam date not provided** — graceful degradation: show un-dated quota recommendations, prompt periodically to add a date
- **Readiness score fluctuates wildly** — smooth with a 7-day rolling average; document formula in `memory/DECISIONS.md`
- **Weekly email becomes spam** — single weekly cadence with one-click unsubscribe; honor immediately
- **Onboarding rebuild loses existing in-flight users** — keep the old route during transition; redirect to new onboarding only for new signups

## Notes

- Do Plan 5.5 (onboarding) **first**. Everything downstream depends on `exam_date` being captured at signup.
- `Learning Steward` writes the readiness formula + plan rules into `memory/DECISIONS.md` after exit.

---

## Execution Prompt

```text
Activate Phase 5 from .planning/contracts/PHASE-5-personalization.md.
Read docs/MASTER-PLAN.md, docs/AGENT-PROMPTS.md, .planning/ROADMAP.md (§ Phase 5),
and this contract.

You are the Systems Architect leading. Support: Backend Builder, Frontend Builder,
Assessment Builder, Verifier. Activate UX Research Synthesizer as a specialist.

Order: 5.5 (onboarding rebuild) → 5.1 (exam date countdown) → 5.3 (weak-domain
detector) → 5.4 (plan generator) → 5.2 (daily quota CTA) → 5.6 (weekly digest).

Verifier confirms onboarding-completion >85% before exit. Update .planning/STATE.md
after each plan.
```
