# SPD Cert Prep — Live State

> Single source of truth for what is active right now.
> Updated by `Chief Builder` at start + end of every phase.

## Active Phase

**Roadmap Phase 3 — Core Learning Loop Polish** *(in progress; Phases 1 + 2 deferred)*
- Status: `in progress`
- Started: 2026-04-25
- Lead: Frontend Builder
- Contract: [.planning/contracts/PHASE-3-learning-loop.md](contracts/PHASE-3-learning-loop.md)

> **Note:** Phases 1 + 2 were deferred to ship the SRS learning loop first. Phase 1 (Foundation Cleanup) and Phase 2 (Design System) remain on the backlog. `lib/dal/srs.ts` exists as a partial DAL foothold from Phase 3 work. Full DAL migration, route groups, and design-token unification are still pending.

## Phase 3 Sub-Plan Status

| Plan | Description | Status | PR |
|---|---|---|---|
| 3.1 | SM-2 engine — `question_state` table, `lib/dal/srs.ts`, Due Today dashboard | `merged` | — |
| 3.2 | Quiz integration — confidence picker, review mode (`?mode=review`), all three certs | `open` | #50 |
| 3.3 | SRS progress widget + all-caught-up empty state (in #50) | `open` | #50 |
| 3.4 | Dashboard mastery bars + post-quiz SRS refresh (in #50) | `open` | #50 |
| 3.5 | `handleReturnHome` SRS refresh on all three cert pages | `open` | #51 |
| 3.6 | "Ask AI to explain" button on every explanation card | `not started` | — |
| 3.7 | Persist + resume quiz sessions across devices | `not started` | — |

## Phase Status Summary

| Phase | Name | Status | Notes |
|---|---|---|---|
| 1 | Foundation Cleanup | deferred | DAL partial (`lib/dal/srs.ts`); rest pending |
| 2 | Design System Unification | deferred | Blocked on Phase 1 formally; deferred in practice |
| 3 | Core Learning Loop Polish | in progress | 3.1 merged; 3.2–3.5 in open PRs |
| 4 | Gamification Engine | not started | — |
| 5 | Personalization + Study Plans | not started | — |
| 6 | Content Depth | not started | — |
| 7 | Marketing Rebuild + Launch | not started | — |

## Open PRs

| PR | Title | Phase | Status |
|---|---|---|---|
| #50 | feat(3.2): SM-2 quiz integration — confidence picker, review mode | 3.2–3.4 | open (draft) |
| #51 | feat(3.5): refresh srsStats on every return-to-home navigation | 3.5 | open (draft) |

## Recent Decisions Pending Capture

(Move to `memory/DECISIONS.md` after each phase exit.)

- 2026-04-25 — Adopt masterbuilder system as the build operating model
- 2026-04-25 — Treat `.planning/ROADMAP.md` as the project-specific input to masterbuilder phase contracts
- 2026-04-25 — Skip masterbuilder Phases 01 + 02 — product clarity and primary flow already exist
- 2026-04-25 — Single payment provider going forward: Square (Stripe deps to be removed in Phase 1)
- 2026-05-02 — Deferred Phases 1 + 2 to ship Phase 3 SRS work first; accept technical debt on DAL + design system

---

*Last updated 2026-05-02.*
