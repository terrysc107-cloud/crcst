-- Run this in the Supabase SQL editor before using the Instrument ID feature.

create table if not exists instrument_images (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null,        -- e.g. 'hemostat', 'scissors', 'retractor'
  domain      text not null,        -- 'Instrument ID' | 'Endoscope ID'
  storage_key text not null unique, -- path inside the 'instruments' bucket
  attribution text,                 -- Wikimedia author/license string
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Public read; only service-role can insert/update/delete.
alter table instrument_images enable row level security;

create policy "public read active instruments"
  on instrument_images for select
  using (active = true);

-- Index for category filter used by the quiz
create index if not exists instrument_images_category_idx on instrument_images (category);
create index if not exists instrument_images_domain_idx   on instrument_images (domain);
