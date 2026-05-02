# SPD Cert Prep — Live State

> Single source of truth for what is active right now.
> Updated by `Chief Builder` at start + end of every phase.

## Active Phase

**Roadmap Phase 4 — Gamification Engine** *(next up; Phase 3 complete)*
- Status: `not started`
- Lead: Frontend Builder

> **Phase 3 Complete.** All 3.1–3.7 items shipped. Phase 4 (Gamification Engine) is next.
> Phases 1 + 2 remain deferred. `lib/dal/srs.ts` exists as a partial DAL foothold. Full DAL migration, route groups, and design-token unification are still pending.

## Phase 3 Sub-Plan Status (COMPLETE)

| Plan | Description | Status | PR |
|---|---|---|---|
| 3.1 | SM-2 engine — `question_state` table, `lib/dal/srs.ts`, Due Today dashboard | `merged` | — |
| 3.2 | Mistake bank — `lib/dal/mistakes.ts`, `?mode=mistakes` URL, dashboard "Review Misses" | `merged` | #50 |
| 3.3 | SRS progress widget + all-caught-up empty state | `merged` | #50 |
| 3.4 | Question card redesign — elevated card, swipe, keyboard shortcuts (1–4, Space) | `merged` | #50 |
| 3.5 | Extract shared components — `SrsProgressWidget`, `DomainMasterySection`, `lib/dal/streaks.ts` | `merged` | #51 |
| 3.6 | "Ask AI to explain" button on every explanation card | `merged` | #51 |
| 3.7 | Persist + resume quiz sessions — `lib/dal/sessions.ts`, shared `quiz_sessions` table | `merged` | #51 |

## Phase Status Summary

| Phase | Name | Status | Notes |
|---|---|---|---|
| 1 | Foundation Cleanup | deferred | DAL partial (`lib/dal/srs.ts`); rest pending |
| 2 | Design System Unification | deferred | Blocked on Phase 1 formally; deferred in practice |
| 3 | Core Learning Loop Polish | **complete** | All 3.1–3.7 shipped |
| 4 | Gamification Engine | not started | Next active phase |
| 5 | Personalization + Study Plans | not started | — |
| 6 | Content Depth | not started | — |
| 7 | Marketing Rebuild + Launch | not started | — |

## Open PRs

| PR | Title | Phase | Status |
|---|---|---|---|
| #50 | feat(3.2): SM-2 quiz integration — confidence picker, review mode | 3.2–3.4 | open (draft) |
| #51 | feat(3.5–3.7): shared components, AI explain, session persistence | 3.5–3.7 | open (draft) |

## Recent Decisions Pending Capture

(Move to `memory/DECISIONS.md` after each phase exit.)

- 2026-04-25 — Adopt masterbuilder system as the build operating model
- 2026-04-25 — Treat `.planning/ROADMAP.md` as the project-specific input to masterbuilder phase contracts
- 2026-04-25 — Skip masterbuilder Phases 01 + 02 — product clarity and primary flow already exist
- 2026-04-25 — Single payment provider going forward: Square (Stripe deps to be removed in Phase 1)
- 2026-05-02 — Deferred Phases 1 + 2 to ship Phase 3 SRS work first; accept technical debt on DAL + design system

---

*Last updated 2026-05-02 — Phase 3 complete.*
