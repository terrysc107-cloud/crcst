-- Phase 6.6: question_flags table for student-reported issues
create table if not exists question_flags (
  id          uuid primary key default gen_random_uuid(),
  question_id text        not null,
  user_id     uuid        references auth.users(id) on delete set null,
  note        text,
  resolved    boolean     not null default false,
  created_at  timestamptz not null default now()
);

-- Index for admin review queue
create index if not exists question_flags_resolved_idx on question_flags (resolved, created_at desc);

-- RLS
alter table question_flags enable row level security;

-- Anyone (including anon) can insert a flag
create policy "insert_flag" on question_flags
  for insert with check (true);

-- Users can only see their own flags (admin access via service-role key)
create policy "select_own_flags" on question_flags
  for select using (auth.uid() = user_id);
