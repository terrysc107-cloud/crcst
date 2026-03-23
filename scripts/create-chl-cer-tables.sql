-- Create CHL quiz results table
CREATE TABLE IF NOT EXISTS chl_quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty TEXT,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  time_taken INTEGER,
  domains JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create CHL quiz sessions table
CREATE TABLE IF NOT EXISTS chl_quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_mode TEXT NOT NULL,
  question_ids TEXT[] NOT NULL,
  answers JSONB,
  current_question_index INTEGER DEFAULT 0,
  selected_domains TEXT[],
  difficulty TEXT,
  elapsed_time_seconds INTEGER DEFAULT 0,
  is_paused BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create CER quiz results table
CREATE TABLE IF NOT EXISTS cer_quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty TEXT,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  time_taken INTEGER,
  domains JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create CER quiz sessions table
CREATE TABLE IF NOT EXISTS cer_quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_mode TEXT NOT NULL,
  question_ids TEXT[] NOT NULL,
  answers JSONB,
  current_question_index INTEGER DEFAULT 0,
  selected_domains TEXT[],
  difficulty TEXT,
  elapsed_time_seconds INTEGER DEFAULT 0,
  is_paused BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create CRCST quiz results table (renamed from quiz_results)
CREATE TABLE IF NOT EXISTS crcst_quiz_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  difficulty TEXT,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  time_taken INTEGER,
  domains JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create CRCST quiz sessions table (renamed from quiz_sessions)
CREATE TABLE IF NOT EXISTS crcst_quiz_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_mode TEXT NOT NULL,
  question_ids TEXT[] NOT NULL,
  answers JSONB,
  current_question_index INTEGER DEFAULT 0,
  selected_domains TEXT[],
  difficulty TEXT,
  elapsed_time_seconds INTEGER DEFAULT 0,
  is_paused BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE chl_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE chl_quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cer_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE cer_quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE crcst_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE crcst_quiz_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for CHL
CREATE POLICY "Users can view their own CHL quiz results" ON chl_quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own CHL quiz results" ON chl_quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own CHL quiz sessions" ON chl_quiz_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own CHL quiz sessions" ON chl_quiz_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own CHL quiz sessions" ON chl_quiz_sessions FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for CER
CREATE POLICY "Users can view their own CER quiz results" ON cer_quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own CER quiz results" ON cer_quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own CER quiz sessions" ON cer_quiz_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own CER quiz sessions" ON cer_quiz_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own CER quiz sessions" ON cer_quiz_sessions FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for CRCST
CREATE POLICY "Users can view their own CRCST quiz results" ON crcst_quiz_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own CRCST quiz results" ON crcst_quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own CRCST quiz sessions" ON crcst_quiz_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own CRCST quiz sessions" ON crcst_quiz_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own CRCST quiz sessions" ON crcst_quiz_sessions FOR DELETE USING (auth.uid() = user_id);

-- Migrate existing data from quiz_results to crcst_quiz_results
INSERT INTO crcst_quiz_results (id, user_id, difficulty, score, total_questions, percentage, time_taken, domains, created_at)
SELECT id, user_id, difficulty, score, total_questions, percentage, time_taken, domains, created_at
FROM quiz_results
ON CONFLICT (id) DO NOTHING;

-- Migrate existing data from quiz_sessions to crcst_quiz_sessions  
INSERT INTO crcst_quiz_sessions (id, user_id, quiz_mode, question_ids, answers, current_question_index, selected_domains, difficulty, elapsed_time_seconds, is_paused, created_at, updated_at)
SELECT id, user_id, quiz_mode, question_ids, answers, current_question_index, selected_domains, difficulty, elapsed_time_seconds, is_paused, created_at, updated_at
FROM quiz_sessions
ON CONFLICT (id) DO NOTHING;
