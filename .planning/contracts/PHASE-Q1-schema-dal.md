# Phase Contract — Q1: Schema Activation + Data Access Layer

> Initiative: Questions → Supabase + Concept/Variant System
> Roadmap reference: `.planning/ROADMAP.md` § Phase 1 (Plan 1.3, 1.5) + § Phase 3
> Related migration: `supabase/migrations/20260501_concepts_variants.sql` (already written)

---

## Phase

**Q1 — Schema Activation + Data Access Layer**

Stand up the database schema and a typed API layer that can serve questions from
Supabase. The flat TypeScript arrays remain as fallback — nothing breaks for users yet.

## Goal

`GET /api/questions?cert=CRCST` returns live questions from Supabase.
Every question-fetching call in the codebase goes through `lib/dal/questions.ts`.
No component ever calls Supabase directly.

## Status

`not started`

## Lead Agent

**`Backend Builder`** — owns schema application, DAL, API route, type generation.

## Support Agents

- **`Systems Architect`** — designs the DAL function surface before any code is written
- **`Verifier`** — confirms build passes and API returns correct data

## In Scope

### Q1.1 — Apply migration
Run `supabase/migrations/20260501_concepts_variants.sql` against the live Supabase
project. Verify all 4 tables exist with correct columns and RLS policies:
- `concepts`
- `questions_v2`
- `user_attempts`
- `variant_review_queue`

Confirm with: `select count(*) from questions_v2;` → should return 0 (empty, ready for Q2).

### Q1.2 — Build `lib/dal/questions.ts`
Typed data access functions using the Supabase server client:

```typescript
getQuestions(certType: CertType, opts?: {
  domain?: string
  difficulty?: Difficulty
  limit?: number
  excludeIds?: string[]
}): Promise<Question[]>

getQuestion(id: string): Promise<Question | null>

getConcepts(certType: CertType): Promise<Concept[]>

getQuestionsByConcept(conceptId: string): Promise<Question[]>

logAttempt(userId: string, questionId: string, conceptId: string | null, correct: boolean): Promise<void>
```

All functions use the server Supabase client from `lib/supabase.ts`.
Return the same `Question` interface shape as `lib/questions.ts` so downstream
components need zero changes right now.

### Q1.3 — Build `GET /api/questions` route
File: `app/api/questions/route.ts`

- Auth-gated: requires valid JWT (same pattern as `/api/chat`)
- Query params: `cert`, `domain`, `difficulty`, `limit` (default 50)
- Calls `getQuestions()` from the DAL
- Returns `{ questions: Question[], total: number }`
- Rate limiting: same `canUserAccessPaidFeature` check as other routes

### Q1.4 — Type generation
Run: `supabase gen types typescript --project-id <id> > lib/types/database.ts`
Update the DAL to import and use generated types internally.
`Question` interface in `lib/questions.ts` stays as the public shape — the generated
type is an implementation detail inside the DAL only.

## Out Of Scope

- Importing any questions into the DB (that is Q2)
- Changing cert pages to use the API (that is Q3)
- Removing question arrays from the bundle (that is Q3)
- Any variant generation or concept tagging (Q2 + Q4)

## Repo Areas That Change

- `supabase/migrations/20260501_concepts_variants.sql` — applied (no file change)
- `lib/dal/questions.ts` (new)
- `lib/types/database.ts` (new — generated)
- `app/api/questions/route.ts` (new)

## Definition Of Done

- [ ] All 4 tables exist in Supabase with RLS confirmed
- [ ] `GET /api/questions?cert=CRCST` with a valid token returns `{ questions: [], total: 0 }` (empty but working)
- [ ] `GET /api/questions?cert=CRCST` without a token returns 401
- [ ] `pnpm build` passes with no new errors
- [ ] No component imports from `lib/dal/questions.ts` yet — only the API route does
- [ ] `Verifier` signs off: **PASS**

## Risks

- **Migration conflicts** — the migration file uses `if not exists` guards; safe to re-run
- **RLS too restrictive** — test with anon key (should be blocked) and service role key (should work)
- **Generated types drift** — regenerate types after any manual schema changes; commit the result

## Learning Update Checklist (fill in after phase exits)

- What worked:
- What caused friction:
- Pattern to reuse:
- Debt introduced:

---

## Execution Prompt (paste into next chat to activate)

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
