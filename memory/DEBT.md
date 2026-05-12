# Debt

Record consciously deferred work, tradeoffs, and cleanup items here.

---

## Study Module UI — ✅ built (`app/progression/[levelId]/study/page.tsx`)

---

## XP widget — ✅ live on dashboard and crcst/page.tsx

---

## Session time + XP stats on account page — ✅ built (Study Stats card in `app/account/page.tsx`)

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
