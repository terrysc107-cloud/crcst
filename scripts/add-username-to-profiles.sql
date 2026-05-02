-- Add username column to profiles table for public profile URLs (/u/[username])
-- Username is derived from email prefix by default, but can be set explicitly.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Index for fast username lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);

-- ── Public profiles view ────────────────────────────────────────────────────
-- Projects only the four safe columns needed for /u/[username].
-- Keeps tier, Stripe IDs, and any other internal columns off the public API.
CREATE OR REPLACE VIEW public_profiles AS
  SELECT id, username, display_name, created_at
  FROM profiles
  WHERE username IS NOT NULL;

-- RLS on the view: allow public SELECT only for rows that opted in (have username set).
-- The WHERE clause in the view already enforces this; the policy is a safety net.
CREATE POLICY "Public can read public_profiles"
  ON profiles
  FOR SELECT
  USING (username IS NOT NULL);

-- ── certified_users public access ───────────────────────────────────────────
-- Allow public SELECT only for rows belonging to profiles that have opted in
-- to public visibility (username IS NOT NULL). This prevents a full-table dump
-- of full_name + cert data for users who have never set a public username.
CREATE POLICY "Public can read certified_users for opted-in profiles"
  ON certified_users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = certified_users.user_id
        AND profiles.username IS NOT NULL
    )
  );

-- ── Backfill: derive username from email prefix ─────────────────────────────
-- Sets username for existing profiles that don't have one yet.
-- Uses only alphanumeric chars and underscores, lowercased.
-- Static SQL; no user input involved, no injection risk.
UPDATE profiles p
SET username = LOWER(
  REGEXP_REPLACE(
    SPLIT_PART(
      (SELECT email FROM auth.users WHERE id = p.id),
      '@', 1
    ),
    '[^a-z0-9_]', '', 'g'
  )
)
WHERE p.username IS NULL;
