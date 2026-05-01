# SPD Cert Prep — Live State

> Single source of truth for what is active right now.
> Updated by `Chief Builder` at start + end of every phase.
> **Update this file immediately when a phase starts or completes.**

---

## Active Initiative

**Q-Series: Questions → Supabase + Concept/Variant System**

> Goal: Move all 787 questions out of the JS bundle into Supabase. Group by concept.
> Add variant phrasings. Wire a concept-aware quiz engine.
> Started: 2026-05-01

### Q-Series Phase Status

| Phase | Name | Status | Lead Agent | Contract |
|---|---|---|---|---|
| Q1 | Schema Activation + DAL | `not started` | Backend Builder | [PHASE-Q1-schema-dal.md](contracts/PHASE-Q1-schema-dal.md) |
| Q2 | Bulk Import + Concepts | `blocked-by-Q1` | Content Systems Builder | [PHASE-Q2-bulk-import-concepts.md](contracts/PHASE-Q2-bulk-import-concepts.md) |
| Q3 | Quiz Engine Migration | `blocked-by-Q2` | Frontend Builder | [PHASE-Q3-quiz-engine-migration.md](contracts/PHASE-Q3-quiz-engine-migration.md) |
| Q4 | Variant Sprint | `blocked-by-Q3` | Assessment Builder | [PHASE-Q4-variant-sprint.md](contracts/PHASE-Q4-variant-sprint.md) |

### What Was Already Built (2026-05-01)

These items are done and merged. They enable the Q-series:

| Item | Location | Notes |
|---|---|---|
| SQL migration | `supabase/migrations/20260501_concepts_variants.sql` | Written, not yet applied to DB |
| Admin dashboard | `app/admin/page.tsx` | 13 northstar agents, phase status, variant overview |
| Agent chat UI | `app/admin/agents/[agent]/page.tsx` | Talk to any specialist via Claude API |
| Variant Workshop | `app/admin/variants/page.tsx` | Generate + review AI variants (used in Q4) |
| Agent API | `app/api/admin/agent/route.ts` | Multi-turn agent execution |
| Variant generator API | `app/api/admin/generate-variants/route.ts` | Claude-powered, exam-tone rules |
| Concept quiz logic | `lib/concept-quiz.ts` | Concept-aware selection (wired in Q4) |
| Question interface | `lib/questions.ts` | Added `concept_id?` and `variant_type?` fields |

### To Start Q1 (paste into a new chat)

```
You are the Backend Builder for SPD Cert Prep.
Activate Phase Q1 from .planning/contracts/PHASE-Q1-schema-dal.md.
Read docs/MASTER-PLAN.md and docs/AGENT-PROMPTS.md first.

Your job:
1. Apply supabase/migrations/20260501_concepts_variants.sql to the live DB
2. Build lib/dal/questions.ts with getQuestions / getQuestion / getConcepts /
   getQuestionsByConcept / logAttempt — all using the server Supabase client
3. Build app/api/questions/route.ts (auth-gated, rate-limited, calls the DAL)
4. Run supabase gen types → lib/types/database.ts

Done when GET /api/questions?cert=CRCST returns { questions: [], total: 0 } with a
valid token and 401 without. pnpm build must pass.

Ship as one PR. Update .planning/STATE.md status to "complete" when the PR merges.
Stay strictly inside In-Scope. Defer everything else to Q2, Q3, Q4.
```

---

## Main Roadmap Phase Status

| Phase | Name | Status | Lead Agent |
|---|---|---|---|
| 1 | Foundation Cleanup | `not started` | Backend Builder |
| 2 | Design System Unification | `blocked-by-1` | Frontend Builder |
| 3 | Core Learning Loop Polish | `blocked-by-2` | Frontend Builder |
| 4 | Gamification Engine | `blocked-by-3` | Assessment Builder |
| 5 | Personalization + Study Plans | `blocked-by-4` | Systems Architect |
| 6 | Content Depth | `blocked-by-5` | Content Systems Builder |
| 7 | Marketing Rebuild + Launch | `blocked-by-6` | Chief Builder |

> The Q-series runs in parallel with the main roadmap.
> Q1–Q3 should complete before or alongside Phase 1.
> Q4 maps to Phase 6 (Content Depth) but is scoped to run earlier because the
> concept/variant infrastructure is ready now.

---

## Open Specialists

None active. Activate per phase contract.

## Recent Decisions

| Date | Decision |
|---|---|
| 2026-05-01 | Build Q-series initiative: questions to Supabase + concept/variant system |
| 2026-05-01 | Admin panel + Variant Workshop built and pushed to `claude/integrate-northstar-agents-nkm5z` |
| 2026-05-01 | SQL migration written (`supabase/migrations/20260501_concepts_variants.sql`) but not yet applied |
| 2026-04-25 | Adopt masterbuilder system as the build operating model |
| 2026-04-25 | Single payment provider going forward: Square (Stripe to be removed in Phase 1) |

---

*Last updated 2026-05-01. Update this file at the start and end of every phase.*
