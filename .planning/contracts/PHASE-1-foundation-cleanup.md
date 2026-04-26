# Phase Contract — Phase 1: Foundation Cleanup

> Roadmap reference: `.planning/ROADMAP.md` § Phase 1
> Masterbuilder mapping: blends *Phase 03 Frontend Foundation* + *Phase 08 Backend & Data Reality*

## Phase

**Foundation Cleanup** — replace the load-bearing scaffolding so every later phase ships on solid ground.

## Goal

A clean, typed, well-organized foundation: SSR-aware Supabase auth, route groups, a Data Access Layer, real migrations, one payment provider, one Tailwind config, one font set. No user-visible change required.

## Why It Matters

Every other phase touches auth, schema, design tokens, or types. Refactoring inside features later is 5× the cost of refactoring before features. This phase exists so Phases 2–7 don't accumulate compounding debt.

## Lead Agent

**`Backend Builder`** — owns auth migration, DAL, schema migrations.

## Support Agents

- **`Systems Architect`** — designs the DAL surface, route group split, migration sequencing
- **`Frontend Builder`** — Tailwind v4 + font + route-group page moves
- **`Verifier`** — confirms `pnpm build` clean, no `any`, lint passes
- **`Security Reviewer`** *(specialist — activated)* — auth migration touches identity; second pair of eyes required

### Specialist Justification

`Security Reviewer` is activated because Plan 1.1 (auth migration to `@supabase/ssr`) and Plan 1.5 (deleting `/api/payment/setup-db`) are identity- and DDL-touching changes. A single review pass before merge is worth the overhead.

## In Scope

- **1.1** Migrate to `@supabase/ssr` (server / client / middleware files) + `middleware.ts`
- **1.2** Route groups: `(marketing)`, `(app)`, `(auth)` with one layout each
- **1.3** Data Access Layer: `lib/dal/{user,quiz,progress,streak,subscription}.ts` + lint rule forbidding direct `supabase` imports from `app/` and `components/`
- **1.4** Remove Stripe SDK + `STRIPE_SETUP.md` — Square is the single provider
- **1.5** Convert `scripts/*.sql` to `supabase/migrations/*.sql`; delete `/api/payment/setup-db`
- **1.6** Tailwind v4 — single `@theme` block in `globals.css`; retire v3 config + `tailwindcss-animate`
- **1.7** Pick one serif + one sans + one mono; load all in `layout.tsx`; replace every hard-coded `font-family`
- **1.8** Generate Supabase types; replace every `: any` (especially `user: any`)

## Out Of Scope

- Any new visual design (Phase 2)
- Quiz flow or learning loop changes (Phase 3)
- Gamification anything (Phase 4)
- Marketing rebuild (Phase 7)
- New tables for spaced repetition / XP / badges (Phases 3 + 4 introduce those — only existing-table migrations belong here)

## Repo Areas Likely To Change

- `lib/supabase.ts` → split into `lib/supabase/{server,client,middleware}.ts`
- `lib/dal/*` (new)
- `middleware.ts` (new)
- `app/(marketing)/`, `app/(app)/`, `app/(auth)/` (new groups; existing pages move into them)
- `package.json` — drop Stripe deps
- `supabase/migrations/*` (new)
- `app/api/payment/setup-db/` (delete)
- `tailwind.config.ts` (delete or thin to a stub)
- `app/globals.css` — `@theme` block
- `app/layout.tsx` — single font set
- `lib/types/database.ts` (generated)

## Definition Of Done

- `pnpm build` passes with zero warnings on a clean clone
- `grep -r "from '@/lib/supabase'" app/ components/` returns nothing — all calls go through DAL
- Only one of {Stripe, Square} appears in `package.json` (Square)
- `supabase/migrations/` is the source of truth for schema; `/api/payment/setup-db` route is deleted
- `tsc --noEmit` produces zero errors with strict mode and the generated DB types
- One serif + one sans + one mono font loaded in `layout.tsx`; `app/page.tsx` no longer references Playfair / DM Sans
- `Verifier` signs off via `templates/REVIEW-TEMPLATE.md`
- `Security Reviewer` signs off on auth migration + `/api/payment/setup-db` deletion

## Risks

- **Auth migration breaks login mid-deploy** — mitigate with feature branch + manual smoke test on Vercel preview before merge
- **Route group move silently breaks deep links** — keep URL paths identical; only directory structure changes
- **DAL refactor balloons in scope** — bound it: only refactor call sites that exist today, no speculative helpers
- **Migration sequencing drift** — number migrations explicitly; never re-run `setup-db` after deletion

## Notes

- This phase has no user-visible deliverable. Resist the urge to "while I'm in here" any UI changes — that's Phase 2.
- After this phase exits, `Learning Steward` updates `memory/PATTERNS.md` with the canonical DAL pattern so future phases inherit it without re-debate.

---

## Execution Prompt (paste into next chat)

```text
Activate Phase 1 from .planning/contracts/PHASE-1-foundation-cleanup.md.
Read docs/MASTER-PLAN.md, docs/AGENT-PROMPTS.md, .planning/ROADMAP.md (§ Phase 1),
and this contract.

You are the Backend Builder leading. Support agents: Systems Architect,
Frontend Builder, Verifier. Activate Security Reviewer as a specialist.

Ship one PR per plan (1.1 through 1.8). Use templates/EXECUTION-BRIEF-TEMPLATE.md
to scope each plan before implementation. Use templates/REVIEW-TEMPLATE.md before
merge. Update .planning/STATE.md after each plan lands.

Stay strictly inside In-Scope. Defer everything else to its phase.
```
