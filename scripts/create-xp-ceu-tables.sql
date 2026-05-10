-- XP, CEU, and Session Tracking tables
-- Run this in the Supabase SQL editor
-- Prerequisite: create-progression-tables.sql must have been run first

-- ─── 1. user_xp ──────────────────────────────────────────────────────────────
-- Universal XP wallet — accumulates across ALL quiz modes

CREATE TABLE IF NOT EXISTS user_xp (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users NOT NULL UNIQUE,
  total_xp   INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rows" ON user_xp FOR ALL USING (auth.uid() = user_id);

-- ─── 2. progression_badges ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS progression_badges (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID REFERENCES auth.users NOT NULL,
  badge_id  TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE progression_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rows" ON progression_badges FOR ALL USING (auth.uid() = user_id);

-- ─── 3. crcst_domain_mastery ─────────────────────────────────────────────────
-- Running accuracy per domain — powers weak-spot widget + CEU proof of work

CREATE TABLE IF NOT EXISTS crcst_domain_mastery (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users NOT NULL,
  domain_name         TEXT NOT NULL,
  questions_answered  INTEGER NOT NULL DEFAULT 0,
  questions_correct   INTEGER NOT NULL DEFAULT 0,
  mastery_pct         NUMERIC(5,2) NOT NULL DEFAULT 0,
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, domain_name)
);

ALTER TABLE crcst_domain_mastery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rows" ON crcst_domain_mastery FOR ALL USING (auth.uid() = user_id);

-- ─── 4. user_sessions ────────────────────────────────────────────────────────
-- One row per completed quiz session across all modes.
-- Aggregated active time feeds the CEU dual-gate unlock.

CREATE TABLE IF NOT EXISTS user_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users NOT NULL,
  activity_type       TEXT NOT NULL CHECK (activity_type IN ('practice', 'test', 'homework', 'flashcard', 'custom', 'progression')),
  cert                TEXT NOT NULL DEFAULT 'crcst' CHECK (cert IN ('crcst', 'chl', 'cer')),
  duration_seconds    INTEGER NOT NULL DEFAULT 0,
  questions_answered  INTEGER NOT NULL DEFAULT 0,
  score_pct           NUMERIC(5,2),
  xp_earned           INTEGER NOT NULL DEFAULT 0,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rows" ON user_sessions FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_time
  ON user_sessions(user_id, completed_at DESC);

-- ─── 5. ceu_modules ──────────────────────────────────────────────────────────
-- Module catalog. Filled with our own study content now;
-- swap content_source to 'partner' when CEU providers are onboarded.

CREATE TABLE IF NOT EXISTS ceu_modules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  chapter_number  SMALLINT,              -- ATS chapter reference (1-24)
  level_id        SMALLINT,              -- unlocks after this progression level
  domains         JSONB NOT NULL DEFAULT '[]',
  contact_hours   NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  content_source  TEXT NOT NULL DEFAULT 'internal' CHECK (content_source IN ('internal', 'partner')),
  provider_name   TEXT,                  -- null until CEU partner confirmed
  assessment_id   TEXT,                  -- null until CEU partner confirmed
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Public read — users can see the module catalog without auth
ALTER TABLE ceu_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read" ON ceu_modules FOR SELECT USING (TRUE);
CREATE POLICY "service write" ON ceu_modules FOR ALL USING (auth.role() = 'service_role');

-- ─── 6. user_ceu_completions ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS user_ceu_completions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users NOT NULL,
  module_id   UUID REFERENCES ceu_modules NOT NULL,
  score_pct   NUMERIC(5,2),
  ceu_earned  NUMERIC(4,2) NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

ALTER TABLE user_ceu_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rows" ON user_ceu_completions FOR ALL USING (auth.uid() = user_id);

-- ─── 7. Fix user_levels constraint — expand from 5 to 24 levels ──────────────
-- Drop the old CHECK and add the new one

ALTER TABLE user_levels DROP CONSTRAINT IF EXISTS user_levels_level_id_check;
ALTER TABLE user_levels ADD CONSTRAINT user_levels_level_id_check
  CHECK (level_id BETWEEN 1 AND 24);
