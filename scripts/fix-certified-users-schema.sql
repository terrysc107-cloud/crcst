-- MIGRATION: Fix certified_users schema to match application code
--
-- The original create-certified-users-table.sql defined hspa_member as text,
-- but the /passed claim flow inserts a boolean flag (hspa_member) and a
-- separate text column (hspa_member_number). This migration aligns the schema
-- with the code so the badge claim insert succeeds.
--
-- Safe to run multiple times (IF NOT EXISTS / IF EXISTS guards throughout).

-- 1. Add hspa_member_number column if it doesn't exist
ALTER TABLE certified_users
  ADD COLUMN IF NOT EXISTS hspa_member_number text;

-- 2. Convert hspa_member from text to boolean.
--    Existing rows with a non-empty string are treated as true; empty/null as false.
ALTER TABLE certified_users
  ALTER COLUMN hspa_member TYPE boolean
  USING (
    CASE
      WHEN hspa_member IS NULL OR hspa_member = '' THEN false
      ELSE true
    END
  );

-- 3. Set a sensible default now that the type is correct.
ALTER TABLE certified_users
  ALTER COLUMN hspa_member SET DEFAULT false;
