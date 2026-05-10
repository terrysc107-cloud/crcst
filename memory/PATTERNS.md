# Patterns

Record reusable product, design, engineering, and execution patterns here.

---

## CEU Module Container Pattern

The study module and a future licensed CEU module share the same DB shape and UI container. Swap is a data change, not a code change.

```
ceu_modules row:
  content_source: 'internal'  → our study guide + domain quiz
  content_source: 'partner'   → licensed CEU content + post-assessment
  provider_name: null         → null until partner confirmed
  assessment_id: null         → null until partner confirmed
```

UI container renders based on content_source. Internal = show study guide + domain quiz. Partner = show licensed content + post-assessment link.

---

## XP Award Pattern (non-progression)

All non-progression quiz completions call `awardQuizXp()` from `lib/award-xp.ts` after saving quiz results. Fire-and-forget — never blocks the save.

```ts
const { data: { session } } = await supabase.auth.getSession()
if (session?.access_token) {
  awardQuizXp({ mode, cert, correct, total, elapsedSeconds, domains, accessToken })
}
```

The `/api/xp/award` route also writes to `user_sessions` and `crcst_domain_mastery` in the same call — one round trip for all three.

---

## Companion Content Guardrail

Study guides in `progression-config.ts` are exam reinforcement, not lesson reproductions.
- 5 key concepts per level — definition is exam-focused, not a full lesson
- Focus tip — where the exam traps are on this topic
- No verbatim ATS course content
- Attribution: "Study materials informed by ATS — the CRCST training program built by working SPD professionals"

---

## DB Migration Safety Pattern

All migration files use IF NOT EXISTS / IF EXISTS — safe to re-run. Exception: ALTER TABLE constraint changes use DROP CONSTRAINT IF EXISTS before ADD CONSTRAINT to stay idempotent. Files live in scripts/ and are pasted manually into Supabase SQL editor (no automated runner).
