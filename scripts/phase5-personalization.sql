-- Phase 5: Personalization + Study Plans
-- Adds exam_date, onboarding_completed_at, experience_level, study_days_per_week,
-- display_name, and target_cert to the profiles table.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS exam_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT NULL
    CHECK (experience_level IN ('new', 'some', 'experienced')),
  ADD COLUMN IF NOT EXISTS study_days_per_week SMALLINT DEFAULT 3
    CHECK (study_days_per_week BETWEEN 1 AND 7),
  ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS target_cert TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Index to efficiently find users whose exam is upcoming (for weekly digest cron)
CREATE INDEX IF NOT EXISTS idx_profiles_exam_date ON public.profiles(exam_date);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_completed_at ON public.profiles(onboarding_completed_at);

-- Ensure RLS is on (already done in prior migration, but idempotent)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Per-user read/write policies (drop + recreate to make this idempotent)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;
CREATE POLICY "Service role can manage all profiles" ON public.profiles
  FOR ALL USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
