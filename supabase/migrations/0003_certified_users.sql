-- Certified users (badge flow)
CREATE TABLE IF NOT EXISTS certified_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES auth.users(id),
  full_name     TEXT NOT NULL,
  hspa_member   TEXT NOT NULL,
  cert          TEXT NOT NULL CHECK (cert IN ('CRCST','CHL','CER','CIS')),
  pass_date     DATE NOT NULL,
  claimed_at    TIMESTAMPTZ DEFAULT now(),
  next_cert_started BOOLEAN DEFAULT false
);

ALTER TABLE certified_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own badge" ON certified_users
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own badges" ON certified_users
  FOR SELECT USING (auth.uid() = user_id);
