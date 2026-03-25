-- Daily Usage Rate Limiting Tables
-- Run this script to create the subscription and daily_usage tables

-- ── subscriptions ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan                  TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'lifetime')) DEFAULT 'free',
  square_subscription_id TEXT,
  square_customer_id    TEXT,
  status                TEXT NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'cancelled', 'past_due', 'paused')),
  current_period_end    TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own subscription" ON public.subscriptions;
CREATE POLICY "Users can read own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ── daily_usage ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_usage (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date                DATE NOT NULL DEFAULT CURRENT_DATE,
  questions_attempted INT NOT NULL DEFAULT 0,
  ai_chats_used       INT NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

ALTER TABLE public.daily_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own usage" ON public.daily_usage;
CREATE POLICY "Users can read own usage"
  ON public.daily_usage FOR SELECT
  USING (auth.uid() = user_id);

-- ── increment helper function ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_daily_usage(
  p_user_id UUID,
  p_date    DATE,
  p_field   TEXT
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.daily_usage (user_id, date, questions_attempted, ai_chats_used)
  VALUES (p_user_id, p_date, 0, 0)
  ON CONFLICT (user_id, date) DO NOTHING;

  IF p_field = 'questions_attempted' THEN
    UPDATE public.daily_usage
    SET questions_attempted = questions_attempted + 1
    WHERE user_id = p_user_id AND date = p_date;
  ELSIF p_field = 'ai_chats_used' THEN
    UPDATE public.daily_usage
    SET ai_chats_used = ai_chats_used + 1
    WHERE user_id = p_user_id AND date = p_date;
  END IF;
END;
$$;
