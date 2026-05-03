-- Instrument images table for the instrument identification quiz feature.
-- Run this migration on your Supabase project.

create table if not exists instrument_images (
  id           uuid primary key default gen_random_uuid(),
  label        text not null,                 -- e.g. "Kelly Clamp"
  domain       text not null,                 -- e.g. "Instrument Identification"
  image_url    text not null,                 -- public Supabase Storage URL
  storage_path text not null,                 -- relative bucket path
  wikimedia_url text,                         -- original source URL
  license      text not null,                 -- e.g. "CC BY-SA 4.0"
  author       text,
  category     text,                          -- Wikimedia Commons category
  is_active    boolean not null default true, -- hide images without removing them
  created_at   timestamptz default now()
);

-- Index for quiz queries (active images grouped by domain/label)
create index if not exists idx_instrument_images_domain    on instrument_images (domain);
create index if not exists idx_instrument_images_label     on instrument_images (label);
create index if not exists idx_instrument_images_is_active on instrument_images (is_active);

-- RLS: anyone can read active images (quiz is public up to free-tier gate)
alter table instrument_images enable row level security;

create policy "instrument_images_public_read"
  on instrument_images for select
  using (is_active = true);

-- Only service role can insert/update (done via seed script with service key)
