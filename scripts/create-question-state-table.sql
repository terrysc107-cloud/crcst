create table question_state (
  user_id     uuid references auth.users on delete cascade,
  question_id text not null,
  ease        numeric not null default 2.5,
  interval_days int not null default 1,
  next_due    date not null default current_date,
  last_seen   timestamptz,
  last_result text check (last_result in ('correct','incorrect')),
  primary key (user_id, question_id)
);
alter table question_state enable row level security;
create policy "users own their state" on question_state
  for all using (auth.uid() = user_id);
