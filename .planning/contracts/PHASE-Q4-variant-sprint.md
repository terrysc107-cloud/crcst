# Phase Contract — Q4: Variant Generation Sprint

> Initiative: Questions → Supabase + Concept/Variant System
> Blocked by: Q3 (quiz engine must read from Supabase before variants can be served)
> Roadmap reference: `.planning/ROADMAP.md` § Phase 6 (Content Depth, Plans 6.3, 6.6)
> Admin tool built: `app/admin/variants/` — Variant Workshop (already live)

---

## Phase

**Q4 — Variant Generation Sprint**

Generate at least 2 variants per concept for the top domains using the Variant Workshop.
Import approved variants into `questions_v2`. Wire the quiz engine to serve
concept-aware variant selection — users who retake quizzes see fresh phrasing
that tests the same knowledge from a different angle.

## Goal

A returning user who completes a CRCST practice quiz and starts another sees at least
10 questions phrased differently than the first run, testing the same concepts.
Medical Terminology concepts each have ≥ 2 active variants.

## Status

`blocked-by-Q3`

## Lead Agent

**`Assessment Builder`** — owns variant quality, generation runs, approval workflow.

## Support Agents

- **`Content Systems Builder`** — writes import script, owns variant JSON format
- **`Frontend Builder`** — adds variant badge UI and concept-aware quiz selection
- **`Design Auditor`** — reviews variant badge and any quiz card changes
- **`Verifier`** — confirms variant cycling works across sessions

## In Scope

### Q4.1 — Variant generation run (top 5 domains, ≥ 2 variants per concept)

Use the Variant Workshop at `/admin/variants`.

Priority order and target variant types per domain:

| Domain | Variant types to generate | Est. concepts |
|---|---|---|
| Medical Terminology | inverse + application | 30 |
| Safety | inverse + scenario | 20 |
| Infection Prevention | application + scenario | 15 |
| Sterilization | inverse + application | 25 |
| Decontamination | scenario + application | 15 |

Workflow per concept:
1. Select source question in the Workshop
2. Write concept summary (1–2 sentences)
3. Generate selected variant types
4. Review each variant — approve or reject
5. Copy approved JSON to a staging file

**Quality bar for approval:**
- Correct answer is unambiguously correct per IAHCSMM standards
- Wrong answers are plausible (real terms, not obviously wrong)
- Stem is under 40 words
- No telegraphing (avoid "all of the above" patterns)
- If in doubt, reject — better to have fewer high-quality variants than many weak ones

### Q4.2 — Write `scripts/import-variants.ts`

Reads approved variant JSON files from `scripts/approved-variants/` directory.
Inserts each into `questions_v2` with:
```
source         = 'ai_generated'
reviewed       = true   (human approved in Workshop)
active         = true
concept_id     = <from source question's concept>
variant_type   = <from generated JSON>
```

Idempotent: upsert on `(concept_id, variant_type, stem)` to avoid duplicates.

Approved variant JSON format (output of Workshop export):
```json
[
  {
    "concept_id": "uuid-here",
    "variant_type": "inverse",
    "stem": "Which suffix indicates surgical removal?",
    "options": ["A", "B", "C", "D"],
    "correct_index": 2,
    "explanation": "The suffix -ectomy means surgical removal...",
    "source_legacy_id": "10"
  }
]
```

### Q4.3 — Wire concept-aware quiz selection

`lib/concept-quiz.ts` already has the selection logic. Wire it into the quiz engine:

1. In `lib/dal/questions.ts`, add `getConceptAwareQuestions(certType, userId, opts)`:
   - Fetches `user_attempts` for this user to know which `(concept_id, variant_type)` pairs have been seen
   - Calls `selectConceptAwareQuestions()` from `lib/concept-quiz.ts` with the seen-map
   - Returns a question list where no concept appears twice and unseen variant types are preferred

2. In `app/crcst/page.tsx` (and other cert pages), use `getConceptAwareQuestions()`
   instead of `getQuestions()` for Practice and Flashcard modes only.
   Mock mode: still uses random selection (fixed 50-question set for fairness).
   Custom mode: user-filtered, concept-awareness optional.

3. After each question answer, `logAttempt()` already records `(user_id, question_id, concept_id, correct)`.
   This data feeds future sessions automatically.

### Q4.4 — Variant type badge (subtle UI)

Add a small pill to the question card showing the variant type for non-direct variants.
Direct variants show nothing (they look like normal questions to the user).

```
[inverse]     → "What is It?"
[application] → "Real World"
[scenario]    → "Scenario"
[distractor_swap] → nothing (looks identical to direct from user perspective)
```

Placement: top-right corner of question card, 10px text, muted color.
Toggle: add a `Show variant labels` setting in `/account` (default: on for now).

Component: update `components/Quiz.tsx` to accept an optional `variantType` prop
and render the badge when it is not `'direct'` or `undefined`.

### Q4.5 — Update Workshop export to match import format

The Variant Workshop at `/admin/variants` currently exports approved variants as
generic JSON. Update the "Copy approved JSON" button to export in the exact format
`scripts/import-variants.ts` expects (including `concept_id` from the source question).

## Out Of Scope

- Spaced repetition algorithm (SM-2) — that is Phase 3 main roadmap
- Confidence ratings — Phase 3 main roadmap
- Variant generation for CHL or CER domains (tackle after CRCST proves out)
- Audio or image-based question variants (Phase 6 main roadmap)
- Any marketing or landing page changes

## Repo Areas That Change

- `scripts/import-variants.ts` (new)
- `scripts/approved-variants/` (new directory — holds exported approved JSON files)
- `lib/dal/questions.ts` — add `getConceptAwareQuestions()`
- `lib/concept-quiz.ts` — no changes expected (already written)
- `app/crcst/page.tsx`, `app/chl/page.tsx`, `app/cer/page.tsx` — swap to concept-aware fetch for practice + flashcard modes
- `components/Quiz.tsx` — add `variantType` prop + badge rendering
- `app/admin/variants/page.tsx` — update export format

## Definition Of Done

- [ ] ≥ 200 new rows in `questions_v2` with `source = 'ai_generated'` and `reviewed = true`
- [ ] Every Medical Terminology concept has ≥ 2 active variants
- [ ] Complete a CRCST practice quiz (50 Q) → start another → ≥ 10 questions have different phrasing
- [ ] Variant badge appears on non-direct questions
- [ ] `pnpm build` passes with no new errors
- [ ] `Design Auditor` approves badge UI
- [ ] `Verifier` confirms variant cycling behavior: **PASS**

## Risks

- **AI variant accuracy** — medical terminology is high-stakes. Reject any variant where the correct answer could be argued. When in doubt, reject.
- **Concept_id mismatch** — the import script must get `concept_id` from the source question's DB row, not from the Workshop's in-memory state. Validate in the script.
- **Over-serving same concept** — concept-aware selection must hard-cap at one concept per session, not just "prefer unseen." Verify with Verifier.
- **Mock mode purity** — do NOT apply concept-aware selection to mock mode. Mock exams should be a consistent, representative sample.

## Learning Update Checklist (fill in after phase exits)

- What worked:
- What caused friction:
- Best variant type by approval rate:
- Domains still needing variants:
- Debt introduced:

---

## Execution Prompt (paste into next chat to activate)

```
You are the Assessment Builder for SPD Cert Prep.
Activate Phase Q4 from .planning/contracts/PHASE-Q4-variant-sprint.md.
Read docs/MASTER-PLAN.md and docs/AGENT-PROMPTS.md first.
Confirm Q3 is complete before starting (check .planning/STATE.md).

Your job:
1. Use /admin/variants to generate inverse + application variants for Medical
   Terminology concepts first (30 concepts × 2 types = ~60 new variants).
   Then Safety, Infection Prevention, Sterilization, Decontamination.
   Approve high-quality variants, reject any that are medically ambiguous.

2. Write scripts/import-variants.ts — reads approved-variants/*.json, upserts
   into questions_v2 with source='ai_generated', reviewed=true, active=true.

3. Add getConceptAwareQuestions() to lib/dal/questions.ts using lib/concept-quiz.ts.
   Wire into practice + flashcard modes in cert pages (not mock mode).

4. Add variant type badge to components/Quiz.tsx (hide for 'direct' variants).

5. Update /admin/variants export to match import-variants.ts format.

Done when: ≥200 AI variants imported, Medical Terminology has ≥2 variants per
concept, a user sees ≥10 different-phrased questions on their second quiz attempt.
Verifier confirms variant cycling. Design Auditor approves badge UI.
Ship as one PR. Update .planning/STATE.md to "complete" on merge.
```
