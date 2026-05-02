-- Phase 4: Gamification Engine
-- Tables: user_xp, xp_transactions, user_badges, user_streaks, user_daily_activity,
--         daily_challenges, daily_challenge_results

-- ──────────────────────────────────────────────────────────────────────────────
-- 4.1  XP System
-- ──────────────────────────────────────────────────────────────────────────────

create table if not exists user_xp (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  total_xp    integer not null default 0,
  current_level  smallint not null default 1,
  level_progress_pct  smallint not null default 0,  -- 0–100
  updated_at  timestamptz not null default now()
);

alter table user_xp enable row level security;
create policy "user_xp_select" on user_xp for select using (auth.uid() = user_id);
create policy "user_xp_insert" on user_xp for insert with check (auth.uid() = user_id);
create policy "user_xp_update" on user_xp for update using (auth.uid() = user_id);

-- service role can do anything (for server-side awards)
create policy "user_xp_service" on user_xp
  using (true) with check (true);

create table if not exists xp_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  amount      integer not null,
  reason      text not null,      -- e.g. 'quiz_correct', 'daily_challenge', 'streak_bonus'
  created_at  timestamptz not null default now()
);

alter table xp_transactions enable row level security;
create policy "xp_tx_select" on xp_transactions for select using (auth.uid() = user_id);
create policy "xp_tx_insert" on xp_transactions for insert with check (auth.uid() = user_id);
create policy "xp_tx_service" on xp_transactions using (true) with check (true);

create index if not exists xp_transactions_user_id_idx on xp_transactions(user_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 4.2  Badge Locker
-- ──────────────────────────────────────────────────────────────────────────────

create table if not exists user_badges (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  badge_id    text not null,       -- see BADGE_DEFINITIONS in lib/dal/badges.ts
  earned_at   timestamptz not null default now(),
  unique (user_id, badge_id)
);

alter table user_badges enable row level security;
create policy "user_badges_select" on user_badges for select using (auth.uid() = user_id);
create policy "user_badges_insert" on user_badges for insert with check (auth.uid() = user_id);
create policy "user_badges_service" on user_badges using (true) with check (true);

create index if not exists user_badges_user_id_idx on user_badges(user_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- 4.3  Streak + Streak Freeze
-- ──────────────────────────────────────────────────────────────────────────────

create table if not exists user_streaks (
  user_id               uuid primary key references auth.users(id) on delete cascade,
  current_streak        integer not null default 0,
  longest_streak        integer not null default 0,
  last_activity_date    date,
  freeze_credits        smallint not null default 0,
  last_weekly_grant     date,       -- date of last weekly free credit
  last_monthly_grant    date,       -- date of last Pro monthly bonus credit
  updated_at            timestamptz not null default now()
);

alter table user_streaks enable row level security;
create policy "user_streaks_select" on user_streaks for select using (auth.uid() = user_id);
create policy "user_streaks_insert" on user_streaks for insert with check (auth.uid() = user_id);
create policy "user_streaks_update" on user_streaks for update using (auth.uid() = user_id);
create policy "user_streaks_service" on user_streaks using (true) with check (true);

-- ──────────────────────────────────────────────────────────────────────────────
-- 4.4  Daily Activity (feeds heatmap + streak)
-- ──────────────────────────────────────────────────────────────────────────────

create table if not exists user_daily_activity (
  user_id             uuid not null references auth.users(id) on delete cascade,
  activity_date       date not null,
  questions_answered  integer not null default 0,
  xp_earned          integer not null default 0,
  primary key (user_id, activity_date)
);

alter table user_daily_activity enable row level security;
create policy "daily_activity_select" on user_daily_activity for select using (auth.uid() = user_id);
create policy "daily_activity_insert" on user_daily_activity for insert with check (auth.uid() = user_id);
create policy "daily_activity_update" on user_daily_activity for update using (auth.uid() = user_id);
create policy "daily_activity_service" on user_daily_activity using (true) with check (true);

create index if not exists daily_activity_user_date_idx on user_daily_activity(user_id, activity_date desc);

-- ──────────────────────────────────────────────────────────────────────────────
-- 4.4  Daily Challenge
-- ──────────────────────────────────────────────────────────────────────────────

create table if not exists daily_challenges (
  id              uuid primary key default gen_random_uuid(),
  challenge_date  date not null unique,
  question_ids    jsonb not null,   -- array of question IDs
  cert_type       text not null default 'crcst',
  created_at      timestamptz not null default now()
);

alter table daily_challenges enable row level security;
create policy "daily_challenges_select" on daily_challenges for select using (true);
create policy "daily_challenges_service" on daily_challenges using (true) with check (true);

create table if not exists daily_challenge_results (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  challenge_date  date not null,
  score           integer not null,
  total           integer not null,
  percentage      smallint not null,
  completed_at    timestamptz not null default now(),
  unique (user_id, challenge_date)
);

alter table daily_challenge_results enable row level security;
create policy "dcr_select" on daily_challenge_results for select using (auth.uid() = user_id);
create policy "dcr_insert" on daily_challenge_results for insert with check (auth.uid() = user_id);
create policy "dcr_service" on daily_challenge_results using (true) with check (true);

create index if not exists dcr_date_idx on daily_challenge_results(challenge_date);
create index if not exists dcr_user_date_idx on daily_challenge_results(user_id, challenge_date);
