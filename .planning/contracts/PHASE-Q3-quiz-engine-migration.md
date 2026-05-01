# Phase Contract — Q3: Quiz Engine Migration

> Initiative: Questions → Supabase + Concept/Variant System
> Blocked by: Q2 (questions must be in Supabase before the engine can read them)
> Roadmap reference: `.planning/ROADMAP.md` § Phase 3 (Plans 3.5, 3.7)

---

## Phase

**Q3 — Quiz Engine Migration**

Switch the quiz engine from reading local TypeScript arrays to fetching from Supabase
via `lib/dal/questions.ts`. All 4 quiz modes work. Questions are invisible in DevTools.
Users notice nothing different except the app loads questions from the server.

## Goal

Every cert page fetches questions server-side via the DAL. The `<Quiz>` component
receives question data as a prop — it never fetches anything itself. JS bundle contains
zero question text.

## Status

`blocked-by-Q2`

## Lead Agent

**`Frontend Builder`** — owns cert page refactor, quiz mode updates, loading states.

## Support Agents

- **`Backend Builder`** — reviews server-side fetch patterns and DAL calls
- **`Design Auditor`** — reviews skeleton states and error UI
- **`Verifier`** — end-to-end smoke test of all 4 quiz modes; confirms bundle is clean

## In Scope

### Q3.1 — Server-side fetch in cert pages

Each cert page is a Server Component. Replace the local array import with a DAL call:

**Before (current):**
```typescript
import { QUESTIONS } from '@/lib/questions'
// ...passes QUESTIONS directly to <Quiz>
```

**After:**
```typescript
import { getQuestions } from '@/lib/dal/questions'
// ...
const questions = await getQuestions('CRCST')
// ...passes questions to <Quiz>
```

Applies to: `app/crcst/page.tsx`, `app/chl/page.tsx`, `app/cer/page.tsx`,
`app/quiz/scenarios/page.tsx`.

The `<Quiz>` component prop signature does not change — it already accepts `Question[]`.

### Q3.2 — Add loading + error states

Since the cert page is now async:
- Wrap each cert page in a `<Suspense>` boundary with a `<QuizSkeleton>` fallback
- Create `components/QuizSkeleton.tsx` — 5 card-shaped skeletons using `<Skeleton>` from shadcn
- Add an error boundary (`app/crcst/error.tsx` etc.) with a retry button that calls `router.refresh()`

### Q3.3 — Update quiz mode filters

All 4 modes currently filter the local array client-side. Move filtering to the server:

| Mode | Current | After |
|---|---|---|
| Practice | `QUESTIONS.filter(q => ...)` | `getQuestions('CRCST', { domain, difficulty })` |
| Flashcard | same | same |
| Mock | `QUESTIONS.slice(0, 50)` | `getQuestions('CRCST', { limit: 50 })` |
| Custom | `QUESTIONS.filter(...)` | `getQuestions('CRCST', { domain, difficulty, limit })` |

User-selected filters (domain, difficulty) are passed as search params from the cert
hub into the Server Component, which passes them to `getQuestions()`.

### Q3.4 — Wire quiz session persistence

The `quiz_sessions` table already exists. Use `lib/dal/questions.ts → logAttempt()`
on every answer submission.

Also: auto-save current quiz state (question index + answers) to `quiz_sessions`
every 5 questions using an existing or new DAL function `saveQuizSession()`.

On cert page load: check for an in-progress session for this cert type. If found,
show a resume banner: "You left off at question 23 — continue?" with Yes / Start Fresh.

### Q3.5 — Smoke test checklist (Verifier runs this)

```
□ CRCST practice mode — 10 questions load, answer all, see results
□ CHL flashcard mode — flip cards, check domain labels correct
□ CER mock mode — timer runs, 50 questions, submit at the end
□ CRCST custom mode — filter by Sterilization domain, hard only
□ Quiz session resume — answer 6 questions, close tab, reopen, get resume banner
□ DevTools → Sources → search "Decontamination is the entry point" → NOT FOUND
□ Network tab — no request to /api/questions from the client (server-side only)
□ Unauthenticated user — cert pages still load (RLS policy allows public read of active questions)
```

## Out Of Scope

- Concept-aware variant selection (Q4)
- Any visual redesign of the quiz card (Phase 2)
- Gamification (Phase 4)
- Spaced repetition algorithm (Phase 3 main roadmap)

## Repo Areas That Change

- `app/crcst/page.tsx` — async server fetch replaces local array
- `app/chl/page.tsx` — same
- `app/cer/page.tsx` — same
- `app/quiz/scenarios/page.tsx` — same
- `components/QuizSkeleton.tsx` (new)
- `app/crcst/error.tsx`, `app/chl/error.tsx`, `app/cer/error.tsx` (new or update)
- `lib/dal/questions.ts` — add `saveQuizSession()`, `getActiveSession()`
- `components/Quiz.tsx` — add session auto-save call every 5 questions

## Definition Of Done

- [ ] All 4 quiz modes work end-to-end on Vercel preview
- [ ] DevTools → Sources → question text NOT found in bundle
- [ ] Network tab shows no client-side fetch of question data
- [ ] Resume banner appears after leaving a quiz mid-way
- [ ] `pnpm build` passes with no new errors
- [ ] `Design Auditor` approves skeleton + error UI
- [ ] `Verifier` completes smoke test checklist above and signs off: **PASS**

## Risks

- **RLS blocks unauthenticated users** — public read policy on `questions_v2` is in the migration. Confirm it is `using (active = true)` not `using (auth.uid() is not null)`. Unauthenticated users must still be able to browse.
- **Server Component fetch waterfall** — `getQuestions()` is one query; avoid N+1 patterns. If filtering requires multiple queries, do them in parallel with `Promise.all`.
- **Quiz state prop-drilling** — `<Quiz>` already accepts `Question[]`; don't refactor its internal state in this phase.

## Learning Update Checklist (fill in after phase exits)

- What worked:
- What caused friction:
- Pattern to reuse:
- Debt introduced:

---

## Execution Prompt (paste into next chat to activate)

```
You are the Frontend Builder for SPD Cert Prep.
Activate Phase Q3 from .planning/contracts/PHASE-Q3-quiz-engine-migration.md.
Read docs/MASTER-PLAN.md and docs/AGENT-PROMPTS.md first.
Confirm Q2 is complete before starting (check .planning/STATE.md).

Your job:
1. Replace local array imports in app/crcst/page.tsx, app/chl/page.tsx,
   app/cer/page.tsx, and app/quiz/scenarios/page.tsx with server-side
   getQuestions() calls from lib/dal/questions.ts
2. Add <Suspense> + <QuizSkeleton> loading states to each cert page
3. Add error.tsx files with retry buttons
4. Move quiz mode filtering from client-side array filter to server-side
   getQuestions() options
5. Wire quiz session persistence (save every 5 answers, resume banner on load)

Done when: all 4 quiz modes work on Vercel preview, question text is absent from
the JS bundle, and the Verifier smoke test checklist passes.

Support: Backend Builder reviews server fetch patterns. Design Auditor reviews
skeleton and error UI. Verifier runs the smoke test in Q3.5.
Ship as one PR. Update .planning/STATE.md to "complete" on merge.
Then activate Q4.
```
