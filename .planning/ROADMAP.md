# SPD Cert Prep — Build Roadmap

> Phased plan to take the existing app to a fully-built, beautifully-designed product.
> Authored 2026-04-25 by review of repo state. No new third-party services required.

## North Star

Make SPD Cert Prep the most-loved certification study app in healthcare — the one technicians recommend to coworkers without being asked. Three pillars:

1. **Outcomes** — students pass on their first attempt because the product taught them, not just tested them.
2. **Habit** — daily return is rewarding even on a 5-minute lunch break.
3. **Brand** — every screen looks like the same product, polished enough that hospitals would pay for site licenses.

## Current State (snapshot)

- Next.js 16 + React 19 + Supabase + Tailwind v4 + shadcn/ui + Anthropic SDK
- 79 components, ~15,000 LOC across `app/` + `components/`
- 3 cert hubs (CRCST / CHL / CER) + SJT scenarios + AI chat + onboarding + dashboard + payments + badge claim
- **Gaps:** no spaced repetition, no XP/levels/badges beyond "I passed," no mistake bank, no exam-date countdown, two competing visual systems, monolithic 800–1000 line cert pages, direct Supabase calls from components, both Stripe + Square installed.

## Phase Map

| # | Phase | Duration | Unblocks |
|---|---|---|---|
| 1 | Foundation cleanup | 3–5 days | Everything below |
| 2 | Design system unification | 3–5 days | Visual coherence |
| 3 | Core learning loop polish | 1 week | Retention + outcomes |
| 4 | Gamification engine | 1–2 weeks | Daily-return habit |
| 5 | Personalization + study plans | 1 week | "Coach" positioning |
| 6 | Content depth | 1 week | Competitive moat |
| 7 | Marketing rebuild + launch | 3–5 days | Conversion + SEO |

Phases 1 → 7 are **strictly sequential** for work that touches shared surfaces (auth, design tokens, schema). Within a phase, plans can run in parallel.

---

## Phase 1 — Foundation Cleanup

**Goal.** Replace the load-bearing scaffolding so every later phase ships on solid ground. No user-visible change required.

### Plans
- **1.1** Migrate to `@supabase/ssr` — three-client pattern (server / client / middleware). Add `middleware.ts` for session refresh.
- **1.2** Introduce route groups `(marketing)`, `(app)`, `(auth)`. Move existing pages into the right group. One layout per group.
- **1.3** Build a Data Access Layer at `lib/dal/{user,quiz,progress,streak,subscription}.ts`. Forbid direct `supabase` imports from components via lint rule.
- **1.4** Pick one payment SDK (Square — env already targets it). Remove `stripe` + `@stripe/stripe-js` from deps. Delete `STRIPE_SETUP.md`.
- **1.5** Convert `scripts/*.sql` to `supabase/migrations/*.sql`. Delete `/api/payment/setup-db`.
- **1.6** Tailwind v4 migration — move tokens into a single `@theme` block in `globals.css`. Retire v3-style `tailwind.config.ts`. Drop `tailwindcss-animate`.
- **1.7** Font fix — pick one serif + one sans + one mono. Load all in `layout.tsx`. Replace every hard-coded `font-family` reference.
- **1.8** Type tightening — generate Supabase types (`supabase gen types`), replace every `user: any`.

### Agent assignments
| Plan | Agent | Notes |
|---|---|---|
| 1.1, 1.2, 1.5 | `gsd-executor` | Mechanical migration; well-scoped |
| 1.3 | `gsd-planner` → `gsd-executor` | Plan API surface first, then build |
| 1.4, 1.6, 1.7 | `gsd-executor` | One PR per item |
| 1.8 | `gsd-executor` | After 1.1 lands so types match new client |
| All | `gsd-code-reviewer` | One review pass before merge to `main` |

### Done when
- `pnpm build` passes on a clean clone with no warnings
- No component imports `@/lib/supabase` directly — all go through DAL
- One payment provider, one font set, one Tailwind config approach
- Migrations directory is the source of truth for schema

---

## Phase 2 — Design System Unification

**Goal.** Every screen feels like the same product. A user can't tell where the marketing site ends and the app begins (visually).

### Plans
- **2.1** Define design tokens (colors, spacing, radii, shadows, motion) in `globals.css` `@theme`. One palette, no exceptions. Reference the existing brand: cream/navy/teal/amber.
- **2.2** Audit every `style={{}}` inline prop. Replace with Tailwind classes or shadcn variants. Target zero inline styles in `app/` and `components/`.
- **2.3** Standardize on shadcn primitives — `Card`, `Badge`, `Button`, `Tabs`, `Progress`, `Sheet`, `Dialog`, `Select`. Replace bespoke versions in dashboard, cert pages, account.
- **2.4** Replace emoji icons (⚙️🔬🎖️🧠) with `lucide-react` equivalents.
- **2.5** Add `<Skeleton>` loading states to dashboard, cert pages, quiz, account.
- **2.6** Wire `next-themes` and ship a dark mode toggle. Audit contrast in dark mode.
- **2.7** Standardize typography — display serif, body sans, monospace for numerics only. Build `<Heading>`, `<Text>`, `<Numeric>` primitives.
- **2.8** Motion guidelines — one easing curve, three durations (snap / quick / cinematic). Replace ad-hoc transition strings.

### Agent assignments
| Plan | Agent | Notes |
|---|---|---|
| 2.1, 2.7, 2.8 | `gsd-ui-researcher` → `gsd-planner` | Define UI-SPEC.md before coding |
| 2.2, 2.3, 2.4, 2.5 | `gsd-executor` | Mechanical refactor; one screen per PR |
| 2.6 | `gsd-executor` | After 2.1 so dark tokens exist |
| All | `gsd-ui-checker` | Visual contract verification per PR |

### Done when
- `grep -r 'style={{' app/ components/` returns nothing
- All cards/buttons/inputs come from `components/ui/`
- Dark mode is shippable, not ornamental
- Designer (or you in fresh eyes) can't spot the seam between marketing and app

---

## Phase 3 — Core Learning Loop Polish

**Goal.** Turn the question bank into a teacher. The actual quiz experience becomes the thing users brag about.

### Plans
- **3.1** **Spaced repetition engine.** New table `question_state(user_id, question_id, ease, interval_days, next_due, last_seen, last_result)`. SM-2 algorithm in `lib/srs.ts`. Surface a "Due Today" deck on dashboard.
- **3.2** **Mistake bank.** New endpoint that returns a user's most-recent N wrongs per cert. Dashboard quick-action: "Review your 12 misses."
- **3.3** **Confidence ratings.** After each answer, ask "Guessed / Unsure / Confident / Certain." Feed into ease factor. Calibration chart on `/account`.
- **3.4** **Question card redesign.** Single elevated card; large tap targets; swipe-to-reveal explanation on mobile; keyboard shortcuts (1–4, Space) on desktop.
- **3.5** Split each cert page (`crcst/page.tsx`, `chl/page.tsx`, `cer/page.tsx` — currently 850–1030 LOC each) into `<CertHub>` (server) + `<QuizRunner>` (client) + `<DomainProgress>` (server). Eliminate duplicated streak calculation.
- **3.6** "Ask AI to explain" button on every explanation card — pre-fills chat with the question stem.
- **3.7** Persist quiz session to `quiz_sessions` properly (table already exists per `scripts/`); resume mid-quiz across devices.

### Agent assignments
| Plan | Agent | Notes |
|---|---|---|
| 3.1 | `gsd-phase-researcher` → `gsd-planner` → `gsd-executor` | Research SM-2 + Anki variants first |
| 3.2, 3.6 | `gsd-executor` | Small, mostly UI |
| 3.3 | `gsd-planner` → `gsd-executor` | Schema change requires care |
| 3.4 | `gsd-ui-researcher` → `gsd-executor` | Design contract before code |
| 3.5 | `gsd-pattern-mapper` → `gsd-executor` | Map current → target structure first |
| 3.7 | `gsd-executor` | After 3.1 lands |
| All | `gsd-verifier` | Goal-backward check: did learning actually improve? |

### Done when
- Dashboard shows a "Due Today" card with real counts
- A returning user's first action is reviewing wrongs, not picking a quiz mode
- Quiz files are <300 LOC each
- Confidence ratings visible in `/account` calibration chart

---

## Phase 4 — Gamification Engine

**Goal.** Daily return feels rewarding. Streak isn't punitive, levels feel earned, badges are worth screenshotting.

### Plans
- **4.1** **XP system.** New table `user_xp(user_id, total_xp, current_level, level_progress)`. XP per correct answer; difficulty + first-attempt-correct multipliers. Levels named for the field: Decon Apprentice → Sterile Steward → Tray Sage → Chief Tech (10 levels).
- **4.2** **Badge locker.** New table `user_badges(user_id, badge_id, earned_at)`. Starter set: First Quiz, 7/30/100-day Streak, 100/500/1000 Questions, Domain Mastered (≥85%), Mock Exam Passed, Flawless Run (20-in-a-row), AI Chat Power User. Display on `/account` with locked silhouettes for unearned.
- **4.3** **Streak freeze.** 1/week earned for free, 1/month bonus for Pro. Restore lost streak. Single-biggest retention lever — never ship streaks without it.
- **4.4** **Daily Challenge.** Same 10 questions for everyone that day. Result feeds a percentile (`top 23% today`). Cheap social proof, no new auth gymnastics.
- **4.5** **Celebration moments.** `canvas-confetti` on level-up, badge unlock, mock-exam pass. Two-second sound (optional toggle in settings).
- **4.6** **Streak heatmap** (GitHub-style) on `/account`. Recharts custom component.
- **4.7** **Dashboard widget reorder** — Streak / Due Today / Next Badge / Readiness Score / Weak Domain. Top fold should answer "what should I do right now?"
- **4.8** **Notifications setup** — using Resend (already in plan). Daily streak-at-risk reminder at 8pm local time. Weekly readiness digest Sunday morning.

### Agent assignments
| Plan | Agent | Notes |
|---|---|---|
| 4.1, 4.2, 4.3 | `gsd-phase-researcher` → `gsd-planner` → `gsd-executor` | Schema + algorithm — needs a SPEC |
| 4.4 | `gsd-planner` → `gsd-executor` | Cron via Vercel — be explicit about timezone |
| 4.5, 4.6, 4.7 | `gsd-ui-researcher` → `gsd-executor` | UI contract first |
| 4.8 | `gsd-planner` → `gsd-executor` | Email templates via React Email |
| All | `gsd-verifier`, `gsd-eval-planner` | Measure D1/D7/D30 retention |

### Done when
- Cohort retention curves measurably bend at D7 and D30
- A user who hits a milestone on Friday tells a coworker about it Monday
- "I missed yesterday" no longer means "I quit"

---

## Phase 5 — Personalization + Study Plans

**Goal.** Move from "question bank" to "coach." The app knows your exam date and tells you what to do today.

### Plans
- **5.1** **Exam-date capture** in onboarding. Stored on `profiles.exam_date`. Countdown card on dashboard.
- **5.2** **Daily quota** — given remaining days + current readiness, recommend "30 min/day: 15 due reviews + 10 weak-domain + 5 mock." Auto-built deck delivered as a single CTA.
- **5.3** **Weak-domain detector** — surface the lowest-scoring domain on dashboard with a "Drill this" button.
- **5.4** **Adaptive plan generator** — `lib/plan.ts` returns today's session given user state. Simple rules engine first; revisit if needed.
- **5.5** **Onboarding rebuild** — multi-step (cert → exam date → goal → experience), progress bar, name capture, first-quiz launch from final step. Replace `localStorage` gate with `profiles.onboarding_completed_at`.
- **5.6** **Weekly readiness email** via Resend — "+8% this week, weak spot: ST91 high-level disinfection, suggested focus: 3 sessions."

### Agent assignments
| Plan | Agent | Notes |
|---|---|---|
| 5.1, 5.5 | `gsd-ui-researcher` → `gsd-executor` | Onboarding is conversion-critical — design first |
| 5.2, 5.3, 5.4 | `gsd-phase-researcher` → `gsd-planner` → `gsd-executor` | Coaching algorithm needs a written rationale |
| 5.6 | `gsd-executor` | React Email templates + cron |
| All | `gsd-verifier` | Does a new user complete onboarding + do session-1? |

### Done when
- Dashboard top-fold answers "what's the right thing for me to do right now?" personally
- A user who logs in 14 days before their exam has a credible plan, not a question bank
- Onboarding completion rate >85%

---

## Phase 6 — Content Depth

**Goal.** Build the moat competitors can't copy quickly.

### Plans
- **6.1** **Image-based questions** for instrument identification. Add `question_image_url` to questions table. Storage bucket via Supabase Storage. Image-rich questions tagged separately so users can drill them.
- **6.2** **Audio "listen mode"** — browser `SpeechSynthesis` API, no third-party service. Read question + options aloud; user answers via voice or tap. Hands-free study while driving/working out.
- **6.3** **SJT scenario expansion** — branching scenarios with consequence trees. Each decision leads to a follow-up reflecting real-world outcomes. Existing `quiz/scenarios` is the foundation.
- **6.4** **Glossary / quick-reference** — terms link to mini-cards explaining (e.g., "ST79" → AAMI standard explainer card). Searchable from `/glossary`.
- **6.5** **Mock exam history + replay** — every mock attempt persists with per-question time, mistake locations, domain breakdown. Compare attempts over time.
- **6.6** **Question-quality flagging** — students can flag confusing/wrong questions. Admin queue for review.

### Agent assignments
| Plan | Agent | Notes |
|---|---|---|
| 6.1, 6.5 | `gsd-planner` → `gsd-executor` | Schema + storage |
| 6.2 | `gsd-executor` | Browser API, no backend |
| 6.3 | `gsd-phase-researcher` → `gsd-planner` → `gsd-executor` | Branching content needs a model |
| 6.4 | `gsd-executor` | Static MDX glossary likely sufficient |
| 6.6 | `gsd-planner` → `gsd-executor` | Admin route + workflow |
| All | `gsd-code-reviewer` | Storage + RLS audit critical here |

### Done when
- A student can study without sight (audio mode shipped) or with their eyes only on visuals (image quiz mode)
- Mock exam page is more compelling than test prep books
- Glossary covers 100% of acronyms used in question text

---

## Phase 7 — Marketing Rebuild + Launch

**Goal.** Convert the people the work above will bring.

### Plans
- **7.1** Rebuild landing as a Server Component using the unified Phase 2 palette. Delete the 800-line inline `<style>` block. Marketing site loads <50KB JS.
- **7.2** OG image (`app/opengraph-image.tsx`), Twitter card, JSON-LD `Course` + `Product`, canonical URLs.
- **7.3** Sitemap (`app/sitemap.ts`), robots (`app/robots.ts`), per-cert landing pages (`/crcst-prep`, `/chl-prep`, `/cer-prep`) for SEO long-tail.
- **7.4** Pricing page A/B test — lead with Triple Crown anchor so Pro feels reasonable. Track conversion in PostHog (already a project standard).
- **7.5** Replace stat counters with real-time Supabase counts ("94,217 questions answered this week" hits harder than `787`).
- **7.6** Public profile pages (`/u/[username]`) showing badge locker — every passed user becomes a marketing surface. LinkedIn share button on badge claim.
- **7.7** Press kit page + founder note.

### Agent assignments
| Plan | Agent | Notes |
|---|---|---|
| 7.1, 7.5 | `gsd-ui-researcher` → `gsd-executor` | Marketing IS design-led |
| 7.2, 7.3 | `gsd-executor` | Mechanical SEO checklist |
| 7.4 | `gsd-planner` → `gsd-executor` | Define the experiment hypothesis first |
| 7.6 | `gsd-planner` → `gsd-executor` | RLS for public profile is the hard part |
| 7.7 | `gsd-executor` | Static content |
| All | `gsd-ui-checker`, `gsd-code-reviewer` | Public surfaces — ship clean |

### Done when
- Lighthouse 95+ on landing, mobile and desktop
- Google Search Console shows impressions for "CRCST practice questions" within 30 days of launch
- Cert pass-claim → social share rate measurable in analytics

---

## Cross-cutting concerns (apply to every phase)

- **Per-phase code review** — `gsd-code-reviewer` on every PR before merge to `main`.
- **Per-phase verification** — `gsd-verifier` answers "did we actually achieve the phase goal?" not just "did tasks complete?"
- **Security audit** — `gsd-security-auditor` after Phases 1, 4, 6 (auth, schema-heavy, public surfaces).
- **Eval review** — `gsd-eval-planner` once for AI chat in Phase 3 (the "Ask AI to explain" expansion).
- **UI audit** — `gsd-ui-auditor` after Phases 2, 4, 7.

## Recommended team-of-agents flow per plan

```
gsd-discuss-phase   → align on scope + open questions
gsd-plan-phase      → produce PLAN.md (researcher + planner + checker)
gsd-execute-phase   → executor agent ships atomically
gsd-code-review     → reviewer flags issues
gsd-code-review-fix → fixer addresses findings
gsd-verify-work     → goal-backward verification
gsd-secure-phase    → threat-model coverage (security-touching phases only)
gsd-ui-review       → 6-pillar visual audit (UI phases only)
```

## Phase order rationale

- **1 before all** — every other phase touches auth, schema, or design tokens. Don't refactor inside features.
- **2 before 3+** — once design tokens exist, every new component automatically inherits the brand. Feature work in Phase 3 doesn't accumulate visual debt.
- **3 before 4** — gamification rewards a good learning loop. Reward a bad loop and you train people to grind, not learn.
- **4 before 5** — gamification builds habit; personalization gives that habit direction. Reverse and personalization has no engaged user to act on.
- **5 before 6** — content depth (audio, images, branching SJTs) is high-effort. Spend that effort on a product that already works.
- **6 before 7** — launch the marketing rebuild only when the product behind it is the version you want reviewed.

## Out of scope for this roadmap

- New third-party services (no LMS integrations, no Discord bot, no native mobile app, no Stripe re-introduction)
- Hospital B2B portal (separate roadmap when v1 retention proves out)
- Live tutoring / human coaching
- Question authoring tools for non-admins

---

*Last updated 2026-04-25. Update STATE.md and this file at the end of each phase.*
