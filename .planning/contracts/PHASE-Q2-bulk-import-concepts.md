# Phase Contract — Q2: Bulk Import + Concept Grouping

> Initiative: Questions → Supabase + Concept/Variant System
> Blocked by: Q1 (schema + DAL must exist first)
> Roadmap reference: `.planning/ROADMAP.md` § Phase 6 (Content Depth)

---

## Phase

**Q2 — Bulk Import + Concept Grouping**

Move all 787 questions from flat TypeScript arrays into `questions_v2` in Supabase.
Group questions by learning objective (concept). Remove question text from the JS bundle.

## Goal

Supabase holds all questions. Every question is tagged with a `concept_id`.
No question text appears in the compiled JS bundle.

## Status

`blocked-by-Q1`

## Lead Agent

**`Content Systems Builder`** — owns concept map design and import scripts.

## Support Agents

- **`Assessment Builder`** — defines what counts as a distinct concept per domain
- **`Systems Architect`** — reviews import script for idempotency and data integrity
- **`Verifier`** — confirms row counts match source arrays and bundle is clean

## In Scope

### Q2.1 — Write `scripts/import-questions.ts`

Reads from the 4 existing question arrays, maps each to a `questions_v2` row:

| Source array | cert_type | Expected count |
|---|---|---|
| `lib/questions.ts` QUESTIONS | CRCST | 400 |
| `lib/questions-chl.ts` QUESTIONS_CHL | CHL | 240 |
| `lib/questions-cer.ts` QUESTIONS_CER | CER | 147 |
| `lib/questions-scenarios.ts` QUESTIONS_SJT | SJT | ~50 |

Mapped columns per row:
```
legacy_id      = q.id
cert_type      = cert arg
variant_type   = 'direct'
stem           = q.question
options        = JSON.stringify(q.options)
correct_index  = q.correct_answer
explanation    = q.explanation
domain         = q.domain
difficulty     = q.difficulty
source         = 'legacy'
reviewed       = true
active         = true
concept_id     = null  (filled in by Q2.3)
```

Script is idempotent: upsert on `legacy_id` — safe to re-run without duplicates.

Run order:
```bash
npx tsx scripts/import-questions.ts --cert=CRCST
npx tsx scripts/import-questions.ts --cert=CHL
npx tsx scripts/import-questions.ts --cert=CER
npx tsx scripts/import-questions.ts --cert=SJT
```

### Q2.2 — Write `scripts/concept-map.json`

One concept = one distinct learning objective. Rules:
- A concept covers exactly one fact, term, or procedure
- Questions that test the same fact are grouped under one concept
- Questions that test different facts get different concepts even in the same domain

Format:
```json
{
  "CRCST": {
    "Medical Terminology": [
      {
        "summary": "The suffix -ectomy means surgical removal",
        "reference": "IAHCSMM CRCST Study Guide, Chapter 3",
        "legacyIds": ["10", "15", "16"]
      },
      {
        "summary": "The suffix -oscopy means visual examination",
        "reference": "IAHCSMM CRCST Study Guide, Chapter 3",
        "legacyIds": ["11"]
      }
    ],
    "Sterilization": [
      {
        "summary": "Cleaning is always the first and most critical step before sterilization",
        "reference": "AAMI ST79",
        "legacyIds": ["2", "43"]
      }
    ]
  }
}
```

Priority domain order (highest concept ROI first):
1. Medical Terminology (30+ concepts — mechanical, easy to group)
2. Safety (20+ concepts)
3. Infection Prevention (15+ concepts)
4. Sterilization (25+ concepts)
5. Decontamination (15+ concepts)
6. All remaining domains

Target: every question has a concept_id by end of Q2. Ungrouped questions get a
catch-all concept ("Uncategorized — [domain]") so the column is never null.

### Q2.3 — Write `scripts/tag-concepts.ts`

Reads `concept-map.json`:
1. For each concept entry: INSERT into `concepts` table (upsert on `cert_type + summary`)
2. UPDATE `questions_v2` SET `concept_id = <new_concept_id>` WHERE `legacy_id IN (legacyIds)`
3. Log how many questions were tagged vs. left null

Run after Q2.1.

### Q2.4 — Remove question array exports from bundle

Remove the data exports (keep the TypeScript interfaces):

```typescript
// lib/questions.ts — KEEP these:
export interface Question { ... }
export type VariantType = ...
export type CertType = ...

// lib/questions.ts — DELETE these:
export const QUESTIONS: Question[] = [ ... ]  // 400 rows of text

// Same for questions-chl.ts, questions-cer.ts, questions-scenarios.ts
```

Add a lint rule (ESLint no-restricted-imports) to forbid importing `QUESTIONS`,
`QUESTIONS_CHL`, `QUESTIONS_CER`, `QUESTIONS_SJT` from anywhere in `app/` or
`components/`. Any remaining reference is a bug.

## Out Of Scope

- Updating cert pages to use the API (Q3)
- Generating question variants (Q4)
- Any visual changes

## Repo Areas That Change

- `scripts/import-questions.ts` (new)
- `scripts/tag-concepts.ts` (new)
- `scripts/concept-map.json` (new)
- `lib/questions.ts` — data export deleted, interface kept
- `lib/questions-chl.ts` — data export deleted, interface kept
- `lib/questions-cer.ts` — data export deleted, interface kept
- `lib/questions-scenarios.ts` — data export deleted, interface kept
- `.eslintrc` or `eslint.config.mjs` — no-restricted-imports rule added

## Definition Of Done

- [ ] `select count(*) from questions_v2;` returns 787+ rows
- [ ] `select count(*) from questions_v2 where concept_id is null;` returns 0
- [ ] `select count(*) from concepts;` returns ≥ 100 distinct concepts
- [ ] `grep -r "QUESTIONS" app/ components/` returns nothing
- [ ] Build a fresh Vercel preview — open DevTools → Sources → search "Decontamination is the entry point" → not found
- [ ] `pnpm build` passes with no new errors
- [ ] `Verifier` signs off: **PASS**

## Risks

- **Concept over-splitting** — one concept per question is wrong; aim for 3–8 questions per concept. Assessment Builder reviews groupings before Q2.3 runs.
- **Import script timeout** — Supabase free tier has rate limits; batch inserts in groups of 50 with 100ms delay between batches
- **Lint rule breaks existing code** — scan for all QUESTIONS usages before adding the rule; fix any that exist

## Learning Update Checklist (fill in after phase exits)

- What worked:
- What caused friction:
- Pattern to reuse:
- Debt introduced:

---

## Execution Prompt (paste into next chat to activate)

```
You are the Content Systems Builder for SPD Cert Prep.
Activate Phase Q2 from .planning/contracts/PHASE-Q2-bulk-import-concepts.md.
Read docs/MASTER-PLAN.md and docs/AGENT-PROMPTS.md first.
Confirm Q1 is complete before starting (check .planning/STATE.md).

Your job:
1. Write scripts/import-questions.ts — idempotent upsert of all 787 questions
   from the 4 lib/questions*.ts arrays into questions_v2
2. Write scripts/concept-map.json — group questions by learning objective,
   starting with Medical Terminology then Safety then Sterilization
3. Write scripts/tag-concepts.ts — inserts concepts and updates concept_id FKs
4. Remove data exports from lib/questions*.ts (keep interfaces only)
5. Add ESLint no-restricted-imports rule blocking QUESTIONS from app/ and components/

Done when: 787+ rows in questions_v2, 0 null concept_ids, question text absent
from the compiled JS bundle (verify in DevTools). pnpm build passes.

Support agents: Assessment Builder reviews concept-map.json before Q2.3 runs.
Systems Architect reviews import script for idempotency.
Ship as one PR. Update .planning/STATE.md to "complete" on merge.
```
