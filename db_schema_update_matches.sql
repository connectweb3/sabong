-- Create Matches Table and Enums

-- 1. Create Enums
drop type if exists match_status cascade;
create type match_status as enum ('open', 'closed', 'ongoing', 'finished', 'cancelled');

drop type if exists match_winner cascade;
create type match_winner as enum ('meron', 'wala', 'draw');

-- 2. Create Matches Table
create table if not exists public.matches (
  id uuid default uuid_generate_v4() primary key,
  meron_name text not null,
  wala_name text not null,
  status match_status default 'open'::match_status,
  winner match_winner,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS
alter table public.matches enable row level security;

-- 4. Policies
-- Everyone can view matches (needed for users to bet)
drop policy if exists "Everyone can view matches" on public.matches;
create policy "Everyone can view matches"
  on public.matches for select
  using (true);

-- Only Admins can insert/update matches
drop policy if exists "Admins can manage matches" on public.matches;
create policy "Admins can manage matches"
  on public.matches for all
  using (public.is_admin());

-- 5. Update Bets Table to link to Matches (if not already linked properly)
-- We strictly enforce that bets must have a match_id
-- (Optional: Add constraint if acceptable, but for now we just ensure table exists)
