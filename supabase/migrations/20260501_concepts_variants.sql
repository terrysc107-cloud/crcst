-- Concepts + Variants schema
-- Each concept is a learning objective; questions are variants of that concept.
-- This enables spaced repetition by concept, not by individual question ID.

create table if not exists concepts (
  id uuid primary key default gen_random_uuid(),
  cert_type text not null check (cert_type in ('CRCST', 'CHL', 'CER', 'SJT')),
  domain text not null,
  chapter text,
  summary text not null,
  reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table concepts is 'One row per learning objective; questions are variants of a concept.';

-- Add concept columns to the existing questions flat-file structure.
-- These columns are used when questions are persisted to Supabase (future migration
-- from the current in-memory lib/questions.ts approach).
create table if not exists questions_v2 (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,                          -- maps to id in lib/questions.ts
  concept_id uuid references concepts(id) on delete set null,
  cert_type text not null check (cert_type in ('CRCST', 'CHL', 'CER', 'SJT')),
  variant_type text not null default 'direct'
    check (variant_type in ('direct', 'inverse', 'application', 'scenario', 'distractor_swap')),
  stem text not null,
  options jsonb not null,                  -- string[]
  correct_index int not null,              -- 0-based
  explanation text not null,
  domain text not null,
  difficulty text not null check (difficulty in ('easy', 'medium', 'hard')),
  source text,                             -- 'manual', 'ai_generated', 'legacy'
  reviewed boolean not null default false,
  active boolean not null default true,
  ai_model text,                           -- which model generated this, if ai_generated
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table questions_v2 is 'Multi-variant question bank. Each row is one variant of a concept.';
comment on column questions_v2.variant_type is 'direct=standard phrasing, inverse=asks for the term, application=real instrument/procedure, scenario=patient context, distractor_swap=same stem different wrong answers';

-- Per-question attempt history (replaces tracking by question_id alone)
create table if not exists user_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id uuid not null references questions_v2(id) on delete cascade,
  concept_id uuid references concepts(id) on delete set null,
  correct boolean not null,
  seen_at timestamptz not null default now()
);

comment on table user_attempts is 'Per-question attempt log. concept_id allows grouping misses by concept.';

-- Variants pending AI review before activation
create table if not exists variant_review_queue (
  id uuid primary key default gen_random_uuid(),
  concept_id uuid references concepts(id) on delete cascade,
  source_question_id text,                 -- legacy_id of the seed question
  variant_type text not null,
  stem text not null,
  options jsonb not null,
  correct_index int not null,
  explanation text not null,
  ai_model text,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'approved', 'rejected')),
  reviewer_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

comment on table variant_review_queue is 'Staging area for AI-generated variants awaiting human review before activation.';

-- Indexes
create index if not exists idx_questions_v2_concept on questions_v2(concept_id);
create index if not exists idx_questions_v2_active on questions_v2(active, cert_type);
create index if not exists idx_user_attempts_concept on user_attempts(user_id, concept_id);
create index if not exists idx_user_attempts_question on user_attempts(user_id, question_id);
create index if not exists idx_variant_queue_status on variant_review_queue(review_status, created_at desc);

-- RLS
alter table concepts enable row level security;
alter table questions_v2 enable row level security;
alter table user_attempts enable row level security;
alter table variant_review_queue enable row level security;

-- Public read for active questions
create policy "anyone can read active questions"
  on questions_v2 for select
  using (active = true);

-- Public read for concepts
create policy "anyone can read concepts"
  on concepts for select
  using (true);

-- Users can read/write their own attempts
create policy "users read own attempts"
  on user_attempts for select
  using (auth.uid() = user_id);

create policy "users insert own attempts"
  on user_attempts for insert
  with check (auth.uid() = user_id);

-- Admin-only: review queue (service role bypasses RLS)
create policy "deny all on variant_review_queue"
  on variant_review_queue for all
  using (false);

-- Trigger to keep updated_at fresh
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger concepts_updated_at before update on concepts
  for each row execute function set_updated_at();

create trigger questions_v2_updated_at before update on questions_v2
  for each row execute function set_updated_at();
