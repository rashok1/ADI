-- Adi MVP schema
-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).
-- Assumes Supabase Auth is enabled (auth.users already exists).

create extension if not exists "pgcrypto";

-- ============================================================
-- user_settings: one row per user, created automatically on signup
-- ============================================================
create table if not exists user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  medicated boolean default null,
  light_day_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- user_currency: duckweed balance, one row per user
-- ============================================================
create table if not exists user_currency (
  user_id uuid primary key references auth.users(id) on delete cascade,
  weeds integer not null default 0,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- user_inventory: shop items owned
-- ============================================================
create table if not exists user_inventory (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_key text not null check (item_key in ('house','hat','scarf','garden')),
  purchased_at timestamptz not null default now(),
  primary key (user_id, item_key)
);

-- ============================================================
-- tasks: self-referencing (parent_task_id) — original tasks and
-- "feels too much" subtasks live in the same table.
-- ============================================================
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  parent_task_id uuid references tasks(id) on delete cascade,
  title text not null,
  urgency text not null default 'medium' check (urgency in ('high','medium','low')),
  hours_needed numeric,
  scheduled_for date,
  due_date date,
  status text not null default 'pending' check (status in ('pending','in_progress','completed','removed')),
  postpone_count integer not null default 0,
  big_task_mode text check (big_task_mode in ('single_session','spread_week')),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_tasks_user on tasks(user_id);
create index if not exists idx_tasks_parent on tasks(parent_task_id);
create index if not exists idx_tasks_scheduled on tasks(user_id, scheduled_for);

-- ============================================================
-- mood_logs: one per user per day
-- ============================================================
create table if not exists mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null default current_date,
  mood text check (mood in ('low','okay','good')),
  medicated boolean,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

-- ============================================================
-- pomodoro_sessions: session-level history per task
-- ============================================================
create table if not exists pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references tasks(id) on delete set null,
  started_at timestamptz not null default now(),
  paused_at timestamptz,
  ended_at timestamptz,
  completed boolean not null default false,
  weeds_earned integer not null default 0
);

create index if not exists idx_pomodoro_task on pomodoro_sessions(task_id);
create index if not exists idx_pomodoro_user on pomodoro_sessions(user_id);

-- ============================================================
-- ai_interactions: every Claude call, logged separately
-- ============================================================
create table if not exists ai_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references tasks(id) on delete cascade,
  interaction_type text not null check (interaction_type in ('feels_too_much','just_two_min','under_five','mood_rearrange')),
  request_payload jsonb,
  response_payload jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security — every table, owner-only access
-- ============================================================
alter table user_settings enable row level security;
alter table user_currency enable row level security;
alter table user_inventory enable row level security;
alter table tasks enable row level security;
alter table mood_logs enable row level security;
alter table pomodoro_sessions enable row level security;
alter table ai_interactions enable row level security;

create policy "own settings" on user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own currency" on user_currency
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own inventory" on user_inventory
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own tasks" on tasks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own mood logs" on mood_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own pomodoro sessions" on pomodoro_sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own ai interactions" on ai_interactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- Auto-create user_settings + user_currency on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_settings (user_id) values (new.id);
  insert into public.user_currency (user_id, weeds) values (new.id, 0);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
