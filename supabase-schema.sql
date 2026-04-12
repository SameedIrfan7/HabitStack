-- ============================================================
-- HABITSTACK v2 — Full Schema
-- Run this in Supabase → SQL Editor → New Query → Run All
-- ============================================================

-- USER PROFILES
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  avatar_emoji text default '💪',
  bio text default '',
  is_muslim boolean default false,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Profiles viewable by authenticated" on public.profiles for select using (auth.role() = 'authenticated');
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- COMMON HABITS (shared pool, shown on leaderboard)
create table if not exists public.common_habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  label text not null,
  icon text not null,
  color text not null,
  category text not null,
  sort_order int default 0,
  is_active boolean default true,
  is_muslim_habit boolean default false,
  created_at timestamptz default now()
);
alter table public.common_habits enable row level security;
create policy "Users see own common habits" on public.common_habits for select using (auth.uid() = user_id);
create policy "Users manage own common habits" on public.common_habits for all using (auth.uid() = user_id);

-- PERSONAL HABITS (private, never on leaderboard)
create table if not exists public.personal_habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  label text not null,
  icon text not null,
  color text not null,
  category text not null,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);
alter table public.personal_habits enable row level security;
create policy "Users see own personal habits" on public.personal_habits for select using (auth.uid() = user_id);
create policy "Users manage own personal habits" on public.personal_habits for all using (auth.uid() = user_id);

-- COMMON HABIT LOGS (private detail, score pushed to leaderboard)
create table if not exists public.common_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  habit_id uuid references public.common_habits(id) on delete cascade not null,
  log_date date not null,
  done boolean default false,
  unique(user_id, habit_id, log_date)
);
alter table public.common_logs enable row level security;
create policy "Users see own common logs" on public.common_logs for select using (auth.uid() = user_id);
create policy "Users manage own common logs" on public.common_logs for all using (auth.uid() = user_id);

-- PERSONAL LOGS (fully private)
create table if not exists public.personal_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  habit_id uuid references public.personal_habits(id) on delete cascade not null,
  log_date date not null,
  done boolean default false,
  unique(user_id, habit_id, log_date)
);
alter table public.personal_logs enable row level security;
create policy "Users see own personal logs" on public.personal_logs for select using (auth.uid() = user_id);
create policy "Users manage own personal logs" on public.personal_logs for all using (auth.uid() = user_id);

-- DAILY SCORES (public — leaderboard only, based on common habits)
create table if not exists public.daily_scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  score_date date not null,
  score int not null default 0,
  habits_done int default 0,
  habits_total int default 0,
  updated_at timestamptz default now(),
  unique(user_id, score_date)
);
alter table public.daily_scores enable row level security;
create policy "Scores viewable by authenticated" on public.daily_scores for select using (auth.role() = 'authenticated');
create policy "Users manage own scores" on public.daily_scores for all using (auth.uid() = user_id);

-- AUTO-CREATE PROFILE ON SIGNUP
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name, avatar_emoji)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'avatar_emoji','💪')
  );
  return new;
end;$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
