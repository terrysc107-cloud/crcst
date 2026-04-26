# Phase Contract — Phase 6: Content Depth

> Roadmap reference: `.planning/ROADMAP.md` § Phase 6
> Masterbuilder mapping: *Phase 05 Content / Prompt / Resource System*

## Phase

**Content Depth** — build the moat competitors can't copy quickly.

## Goal

Image-based instrument-ID questions. Browser-native audio mode. Branching SJT scenarios with consequence trees. Searchable glossary. Mock exam history with replay. Question-quality flagging with admin queue.

## Lead Agent

**`Content Systems Builder`** — owns content inventory, prompt systems, taxonomy, completeness.

## Support Agents

- **`Frontend Builder`** — image quiz UI, audio controls, scenario branch UI, glossary surface
- **`Assessment Builder`** — branching scenario rubric, mock-exam scoring depth
- **`Backend Builder`** — Supabase Storage for images, schema for branching scenarios + flag queue
- **`Verifier`** — content-completeness check, RLS audit on Storage
- **`Security Reviewer`** *(specialist — activated)* — Storage bucket permissions + flag-queue admin route

### Specialist Justification

`Security Reviewer` is activated because Plan 6.1 introduces user-uploaded image surfaces (admin-uploaded only in v1, but the bucket policy must be tight) and Plan 6.6 introduces an admin route. Both are high-risk if RLS or admin gating slip.

## In Scope

- **6.1** Image-based questions for instrument identification — `questions.image_url` column, Supabase Storage bucket, image-rich tag, separate drill mode
- **6.2** Audio "listen mode" — browser `SpeechSynthesis` API (no third-party service); reads question + options aloud; user answers via voice or tap; toggle in settings
- **6.3** SJT scenario expansion — branching with consequence trees; each decision leads to a follow-up reflecting real-world outcomes; existing `quiz/scenarios` is the foundation
- **6.4** Glossary / quick-reference — terms link to mini-cards (e.g., "ST79" → AAMI standard explainer); searchable from `/glossary`
- **6.5** Mock exam history + replay — every mock attempt persists with per-question time, mistake locations, domain breakdown; compare attempts over time
- **6.6** Question-quality flagging — students flag confusing/wrong questions; admin queue at `/admin/flags`

## Out Of Scope

- Question authoring tools for non-admins (never, v1)
- Crowdsourced answer explanations (never, v1)
- Native mobile audio (browser audio is sufficient)
- Marketing rebuild (Phase 7)
- Public profile pages (Phase 7)

## Repo Areas Likely To Change

- `supabase/migrations/*` — `questions.image_url`, `scenario_branches`, `mock_attempts`, `question_flags`
- Supabase Storage bucket: `instrument-images` (public read, admin-only write)
- `components/{ImageQuizCard,AudioController,ScenarioBranch,GlossaryTerm,MockReplay,FlagButton}.tsx` (new)
- `app/glossary/page.tsx` (new)
- `app/quiz/scenarios/page.tsx` — extended for branching
- `app/account/page.tsx` — mock history tab
- `app/admin/flags/page.tsx` (new)

## Definition Of Done

- A student can study with eyes closed (audio mode) or eyes only (image quiz)
- Mock exam page is more compelling than test prep books
- Glossary covers 100% of acronyms + standards used in question text (audit by content count)
- Admin flag queue clears flagged questions within 7 days in dogfood
- `Security Reviewer` signs off on Storage bucket policies + admin route auth
- `Verifier` confirms each new content type renders correctly across breakpoints + dark mode

## Risks

- **Image hosting cost growth** — start with admin-uploaded only, no user uploads in v1; cap bucket size
- **SpeechSynthesis voice quality** — varies by OS; acceptable for v1, revisit if dogfood says no
- **Branching scenarios become unmaintainable** — Content Systems Builder owns the schema; cap depth at 3 levels in v1
- **Glossary stale vs question text** — automate detection: any acronym in `questions.text` not in glossary is flagged for content team
- **Flag queue grows unbounded** — define SLA + closure workflow before launch
- **Admin route accidentally public** — Security Reviewer mandatory pre-merge

## Notes

- This phase is content-heavy; Content Systems Builder must inventory existing question content first to scope Plan 6.4 honestly.
- `Learning Steward` writes the branching-scenario schema + glossary build process into `memory/PATTERNS.md`.

---

## Execution Prompt

```text
Activate Phase 6 from .planning/contracts/PHASE-6-content-depth.md.
Read docs/MASTER-PLAN.md, docs/AGENT-PROMPTS.md, .planning/ROADMAP.md (§ Phase 6),
and this contract.

You are the Content Systems Builder leading. Support: Frontend Builder, Assessment
Builder, Backend Builder, Verifier. Activate Security Reviewer as a specialist.

Order: 6.4 (glossary — content audit first) → 6.1 (image questions) → 6.2 (audio
mode) → 6.5 (mock history) → 6.6 (flag queue) → 6.3 (branching SJT — biggest risk
last).

Security Reviewer signs off on 6.1 + 6.6 before merge. Update .planning/STATE.md
after each plan.
```
