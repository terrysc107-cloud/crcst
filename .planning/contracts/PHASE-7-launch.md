# Phase Contract — Phase 7: Marketing Rebuild + Launch

> Roadmap reference: `.planning/ROADMAP.md` § Phase 7
> Masterbuilder mapping: *Phase 11 Launch Readiness* + late *Phase 07 Offer & Monetization*

## Phase

**Marketing Rebuild + Launch** — convert the people the work above brings.

## Goal

Server-component landing site using the unified Phase 2 palette. Real-time stat counters. OG/Twitter/JSON-LD/sitemap/robots. Pricing A/B with Triple Crown anchor. Public profile + badge sharing. Press kit. Lighthouse 95+ mobile + desktop.

## Lead Agent

**`Chief Builder`** — launch is cross-cutting; only the Chief Builder can hold scope across marketing, offer, perf, and SEO.

## Support Agents

- **`Frontend Builder`** — landing rebuild, public profile pages, stat counter live data
- **`Design Auditor`** — every public surface gets the strictest review
- **`Offer Strategist`** — pricing page A/B, upsell copy, premium boundaries
- **`Verifier`** — Lighthouse 95+, broken link sweep, signup flow smoke test
- **`Learning Steward`** — captures every launch decision for the next product
- **`SEO Strategist`** *(specialist — activated)* — IA, metadata, per-cert landing pages, JSON-LD
- **`Brand Strategist`** *(specialist — activated)* — final voice + positioning pass on public copy
- **`Performance Engineer`** *(specialist — activated)* — Lighthouse 95+ enforcement, bundle audit
- **`Growth Systems Strategist`** *(specialist — activated)* — referral / share loops via badge claim

### Specialist Justification

Launch is the highest-leverage moment of the build — every visitor that lands and bounces is a permanent loss. SEO, Brand, Performance, and Growth specialists are activated because each one owns a measurable launch outcome (search impressions, conversion rate, Lighthouse score, share rate). Chief Builder accepts the overhead.

## In Scope

- **7.1** Landing rebuild — Server Component, unified palette, delete the 800-line inline `<style>` block in `app/page.tsx`. Marketing site loads <50KB JS.
- **7.2** OG image (`app/opengraph-image.tsx`), Twitter card, JSON-LD `Course` + `Product`, canonical URLs
- **7.3** Sitemap (`app/sitemap.ts`), robots (`app/robots.ts`), per-cert SEO landing pages (`/crcst-prep`, `/chl-prep`, `/cer-prep`)
- **7.4** Pricing A/B — lead with Triple Crown anchor; track in PostHog (already a project standard)
- **7.5** Real-time stat counters from Supabase (`SELECT count(*) FROM responses`) — "94,217 questions answered this week" beats `787`
- **7.6** Public profile pages (`/u/[username]`) showing badge locker; LinkedIn share CTA on badge claim
- **7.7** Press kit page + founder note

## Out Of Scope

- Hospital B2B portal
- Affiliate program (defer to v2 if dogfood says it matters)
- Anything that requires a new third-party service

## Repo Areas Likely To Change

- `app/page.tsx` — full rebuild as Server Component
- `app/(marketing)/{crcst-prep,chl-prep,cer-prep}/page.tsx` (new)
- `app/(marketing)/u/[username]/page.tsx` (new)
- `app/opengraph-image.tsx`, `app/twitter-image.tsx`, `app/sitemap.ts`, `app/robots.ts` (new)
- `app/pricing/page.tsx` — A/B variants
- `lib/dal/stats.ts` (new) — cached real-time counters
- `app/passed/page.tsx` — LinkedIn share button + share-tracking event
- `app/(marketing)/press/page.tsx` (new)
- `supabase/migrations/*` — `profiles.username` (case-insensitive unique), `profiles.is_public` (default false)

## Definition Of Done

- Lighthouse 95+ mobile + desktop on landing + each per-cert page
- Google Search Console shows impressions for "CRCST practice questions" within 30 days post-launch
- Cert-claim → social share rate measurable in analytics; ≥10% in dogfood
- Public profile pages render with correct OG metadata when shared on LinkedIn / Twitter
- `Verifier` walks the full new-user funnel (landing → signup → onboarding → first quiz) on a clean device and reports zero regressions
- `Brand Strategist`, `SEO Strategist`, `Performance Engineer` each sign off via `templates/REVIEW-TEMPLATE.md`

## Risks

- **A/B test underpowered** — only run pricing A/B once weekly traffic supports a 7-day decision window; otherwise ship the better variant outright
- **Public profile leaks PII** — opt-in only, default `is_public=false`, no email or exam date exposed
- **Stat counter query slow on every render** — cache via `unstable_cache` with 1-hour revalidation; never query on every request
- **Per-cert SEO pages dilute brand** — each page must be distinct content, not a doorway-page clone; SEO Strategist owns
- **LinkedIn share looks unprofessional** — Design Auditor reviews the OG image specifically for share contexts before launch

## Notes

- This is the only phase where `Chief Builder` leads. Treat it accordingly: explicit decisions, captured rationale.
- `Learning Steward` writes the launch retrospective into `memory/LEARNINGS.md` immediately after exit, while the context is fresh.
- After exit: hand off to a v2 cycle by re-reading `docs/MAX-POTENTIAL.md` and re-kicking off with a fresh `PROJECT-KICKOFF.md` informed by 30 days of post-launch data.

---

## Execution Prompt

```text
Activate Phase 7 from .planning/contracts/PHASE-7-launch.md.
Read docs/MASTER-PLAN.md, docs/AGENT-PROMPTS.md, .planning/ROADMAP.md (§ Phase 7),
and this contract.

You are the Chief Builder leading. Support: Frontend Builder, Design Auditor,
Offer Strategist, Verifier, Learning Steward. Activate SEO Strategist + Brand
Strategist + Performance Engineer + Growth Systems Strategist as specialists.

Order: 7.1 (landing rebuild) → 7.5 (real-time counters) → 7.2 (OG/JSON-LD)
→ 7.3 (sitemap + per-cert pages) → 7.6 (public profiles) → 7.4 (pricing A/B)
→ 7.7 (press kit).

Brand Strategist + SEO Strategist + Performance Engineer must sign off before
launch. Update .planning/STATE.md after each plan. Final action: Learning Steward
writes launch retrospective into memory/LEARNINGS.md.
```
