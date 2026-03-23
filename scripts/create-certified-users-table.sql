-- TABLE: Certified users (for "I Passed" badge flow)
create table if not exists certified_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  full_name text not null,
  hspa_member text not null,
  cert text not null check (cert in ('CRCST','CHL','CER','CIS')),
  pass_date date not null,
  claimed_at timestamptz default now(),
  next_cert_started boolean default false
);

create index if not exists certified_users_user_id_idx
  on certified_users(user_id);

alter table certified_users enable row level security;

-- Drop existing policies if they exist (to avoid conflicts)
drop policy if exists "Users insert own certifications" on certified_users;
drop policy if exists "Users view own certifications" on certified_users;

create policy "Users insert own certifications"
  on certified_users for insert
  with check (auth.uid() = user_id);

create policy "Users view own certifications"
  on certified_users for select
  using (auth.uid() = user_id);
