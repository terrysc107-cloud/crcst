# Phase Contract — Phase 2: Design System Unification

> Roadmap reference: `.planning/ROADMAP.md` § Phase 2
> Masterbuilder mapping: *Phase 03 Frontend Foundation*

## Phase

**Design System Unification** — every screen feels like the same product.

## Goal

A single design language that spans marketing, app, and auth surfaces. One palette. One typography stack. One set of components from `components/ui/`. Zero inline styles. A shippable dark mode.

## Why It Matters

The repo currently has two competing visual systems — cream/navy/teal in the app vs `#021B3A`/`#14BDAC` on marketing — and inline styles mixed with Tailwind classes mixed with shadcn primitives. Without unification, every feature in Phases 3–7 silently accumulates visual debt and the product never feels designed.

## Lead Agent

**`Frontend Builder`** — owns components, layouts, interaction patterns.

## Support Agents

- **`Design Auditor`** — enforces hierarchy, readability, spacing, accessibility, trust
- **`Systems Architect`** — defines token system, component primitive contracts
- **`Brand Strategist`** *(specialist — activated)* — resolves the marketing-vs-app palette divergence and locks brand voice + visual positioning
- **`Motion Designer`** *(specialist — activated)* — defines easing curve + duration tokens; replaces ad-hoc transition strings

### Specialist Justification

The current visual incoherence is a **brand** problem (two implicit identities) and a **motion** problem (ad-hoc transitions). One pass each from Brand Strategist and Motion Designer prevents Phases 3–7 from rebuilding these decisions.

## In Scope

- **2.1** Define design tokens in `globals.css` `@theme` (colors, spacing, radii, shadows, motion). One palette wins.
- **2.2** Audit every `style={{}}` inline prop in `app/` + `components/` → replace with Tailwind classes or shadcn variants. Target: zero inline styles.
- **2.3** Standardize on shadcn primitives — `Card`, `Badge`, `Button`, `Tabs`, `Progress`, `Sheet`, `Dialog`, `Select`. Replace bespoke versions across dashboard, cert pages, account, pricing.
- **2.4** Replace emoji icons (⚙️🔬🎖️🧠) with `lucide-react` equivalents.
- **2.5** Add `<Skeleton>` loading states to dashboard, each cert page, quiz, account.
- **2.6** Wire `next-themes` and ship a dark mode toggle. Audit contrast.
- **2.7** Typography primitives — `<Heading>`, `<Text>`, `<Numeric>`. Display serif, body sans, mono for numbers only.
- **2.8** Motion tokens — one easing curve, three durations (snap / quick / cinematic).

## Out Of Scope

- Spaced repetition / quiz redesign (Phase 3 — but UI primitives built here will be used)
- Gamification visuals — confetti, badges, level-up screens (Phase 4)
- Landing page rebuild (Phase 7)
- Adding new pages — only restyling existing ones

## Repo Areas Likely To Change

- `app/globals.css` — `@theme` block expanded
- `components/ui/*` — confirm shadcn primitives present, add missing ones
- `components/{Header,Quiz,ChatBot,Results,FeedbackButton,UpsellGateModal}.tsx`
- `app/dashboard/page.tsx`, `app/account/page.tsx`, `app/pricing/page.tsx`
- `app/{crcst,chl,cer}/page.tsx` — restyling only; structural split is Phase 3
- `app/onboarding/page.tsx` — restyling only; rebuild is Phase 5
- `app/layout.tsx` — typography primitives wired

## Definition Of Done

- `grep -r "style={{" app/ components/` returns zero matches outside `app/page.tsx` (which is replaced in Phase 7)
- All cards/buttons/badges/inputs come from `components/ui/`
- Dark mode renders every existing screen with passing WCAG AA contrast
- A new contributor cannot tell where marketing ends and app begins (visually)
- `Design Auditor` signs off using `templates/REVIEW-TEMPLATE.md` checklist
- `Brand Strategist` confirms one palette + one voice across all surfaces
- Motion is consistent — no ad-hoc `transition: all 0.22s` strings; everything references tokens

## Risks

- **Scope balloons into Phase 3 quiz redesign** — quiz card visual restyle only; structural changes wait
- **Dark mode contrast issues hide late** — audit per-screen as part of each PR, not at end
- **Brand Strategist conflicts with existing brand** — Chief Builder breaks ties; document decision in `memory/DECISIONS.md`
- **Inline-style audit misses dynamic styles** — search for `style=` not just `style={{`

## Notes

- This phase produces **no new functionality**. If a contributor opens a PR with new behavior, kick it back.
- After exit, `Learning Steward` writes the canonical "how we style things" entry in `memory/PATTERNS.md`.

---

## Execution Prompt

```text
Activate Phase 2 from .planning/contracts/PHASE-2-design-system.md.
Read docs/MASTER-PLAN.md, docs/AGENT-PROMPTS.md, .planning/ROADMAP.md (§ Phase 2),
and this contract.

You are the Frontend Builder leading. Support: Design Auditor, Systems Architect.
Activate Brand Strategist + Motion Designer as specialists.

Ship one PR per plan (2.1 through 2.8). Use templates/EXECUTION-BRIEF-TEMPLATE.md
per plan. Design Auditor reviews every PR before merge. Update .planning/STATE.md
after each plan lands.

No new functionality this phase. Restyle only.
```
