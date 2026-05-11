# Debt

Record consciously deferred work, tradeoffs, and cleanup items here.

---

## Study Module UI — not built yet

**What:** The unlockable card that appears after passing each progression level. Shows 5 key concepts + a 15-question domain quiz. This is the CEU module placeholder container.

**Why deferred:** Context window cleared after DB migration. Next session starts here.

**Shape:**
- Unlocks after level N is passed (writes to `bonus_unlocks` or new `ceu_modules` + `user_ceu_completions`)
- Shows: chapter title, 5 key concept definitions, domain quiz (15 questions from level's domains)
- Completion writes to `user_ceu_completions` with `ceu_earned = 0` until partner confirmed
- Footer: "This module will count toward your CEU record when certified providers are available"
- Same container, different `content_source` when partner arrives

---

## XP widget not visible to users yet

**What:** Users earn XP but there's no updated display for non-progression users (free tier, CHL/CER users). Need XP total + tier label + progress bar on dashboard and/or cert home screens.

**Where to add:**
- `app/dashboard/page.tsx` — add XP widget alongside existing progression widget
- `app/crcst/page.tsx` — small XP chip in header or results screen

---

## Session time display on profile — not built yet

**What:** Total verified study hours from `user_sessions` shown on profile page as "X hrs Y min of verified study time." This is the proof-of-work number for future CEU provider conversations.

**Where:** `app/account/page.tsx` — add a "Study Time" stat card

---

## ATS content extraction not started

**What:** The ATS class-files-ats repo has .docx/.pptx files per chapter with actual key terms, learning objectives, AAMI citations. These could enrich the study guide definitions in progression-config.ts.

**Blocker:** Files are .docx/.pptx — not readable via WebFetch. Terry needs to export/paste content or convert to markdown. The current study guides are written from CRCST exam knowledge, not extracted from the actual docx files.

**When to do:** After study module UI is live. Enrich content chapter by chapter.

---

## CEU time aggregation logic — basic only

**What:** `user_sessions` captures elapsed_seconds per quiz. No aggregation view or daily roll-up exists yet. Dual-gate unlock (time + level milestone) from the roadmap is not implemented.

**When to do:** After study module UI. Needs: aggregate query on user_sessions, dual-gate check in progression attempt route.

---

## Open PRs that may be stale

- PR #68 (design-system phase 2) — based on old main, likely superseded by merged phase 3
- PR #67 (design-system phase 1) — same, likely stale
- PR #71 (wholesale access codes) — still valid, needs Supabase migration + testing

---

## Battle pass tier (4th subscription tier)

**What:** Add `battle_pass` as a 4th tier to stripe.ts, subscription.ts, profiles.tier CHECK constraint, and UpsellGateModal.

**Blocked by:** Legal review of sweepstakes mechanics before prize layer launches. Can build tier gating without prizes.
