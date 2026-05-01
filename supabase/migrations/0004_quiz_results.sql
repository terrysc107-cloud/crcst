-- CRCST quiz results
CREATE TABLE IF NOT EXISTS crcst_quiz_results (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty      TEXT,
  score           INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage      INTEGER NOT NULL,
  time_taken      INTEGER,
  domains         JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE crcst_quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own crcst results" ON crcst_quiz_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own crcst results" ON crcst_quiz_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CHL quiz results
CREATE TABLE IF NOT EXISTS chl_quiz_results (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty      TEXT,
  score           INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage      INTEGER NOT NULL,
  time_taken      INTEGER,
  domains         JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chl_quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own chl results" ON chl_quiz_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chl results" ON chl_quiz_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- CER quiz results
CREATE TABLE IF NOT EXISTS cer_quiz_results (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty      TEXT,
  score           INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage      INTEGER NOT NULL,
  time_taken      INTEGER,
  domains         JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cer_quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cer results" ON cer_quiz_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cer results" ON cer_quiz_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);
