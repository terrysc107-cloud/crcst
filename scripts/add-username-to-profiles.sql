-- Add username column to profiles table for public profile URLs (/u/[username])
-- Username is derived from email prefix by default, but can be set explicitly.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Index for fast username lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username);

-- RLS: allow public SELECT on profiles for username lookups (display_name + join date only)
-- This policy lets anyone look up a profile by username without being authenticated.
CREATE POLICY "Public can read profile by username"
  ON profiles
  FOR SELECT
  USING (username IS NOT NULL);

-- RLS: allow public SELECT on certified_users joined via profiles.id
-- Enables /u/[username] to show earned certifications.
CREATE POLICY "Public can read certified_users"
  ON certified_users
  FOR SELECT
  USING (true);

-- Backfill: set username from email prefix for existing profiles that have an email.
-- This runs only where username is not already set.
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
