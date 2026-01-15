-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ROLES Enum (Drop if exists to ensure clean state)
drop type if exists user_role cascade;
create type user_role as enum ('admin', 'master_agent', 'agent', 'loader', 'user');

-- CLEANUP (Force fresh start)
drop table if exists public.bets cascade;
drop table if exists public.transactions cascade;
drop table if exists public.profiles cascade;

-- PROFILES Table
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  role user_role default 'user'::user_role,
  credits numeric default 0 check (credits >= 0),
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for Profiles
-- Helper to check if user is admin (prevents recursion)
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Policies for Profiles
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Creators can view their downline" on public.profiles;
create policy "Creators can view their downline"
  on public.profiles for select
  using (auth.uid() = created_by);

-- TRANSACTIONS Table
drop type if exists transaction_type cascade;
create type transaction_type as enum ('load', 'withdraw', 'bet', 'win', 'commission', 'transfer');

create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id),
  receiver_id uuid references public.profiles(id),
  amount numeric not null check (amount > 0),
  type transaction_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

-- Policies for Transactions
drop policy if exists "Users can view their transactions" on public.transactions;
create policy "Users can view their transactions"
  on public.transactions for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

drop policy if exists "Admins can view all transactions" on public.transactions;
create policy "Admins can view all transactions"
  on public.transactions for select
  using (public.is_admin());

-- MATCHES Table
drop type if exists match_status cascade;
create type match_status as enum ('open', 'closed', 'ongoing', 'finished', 'cancelled');

drop type if exists match_winner cascade;
create type match_winner as enum ('meron', 'wala', 'draw');

create table if not exists public.matches (
  id uuid default uuid_generate_v4() primary key,
  meron_name text not null,
  wala_name text not null,
  status match_status default 'open'::match_status,
  winner match_winner,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.matches enable row level security;

drop policy if exists "Everyone can view matches" on public.matches;
create policy "Everyone can view matches"
  on public.matches for select
  using (true);

drop policy if exists "Admins can manage matches" on public.matches;
create policy "Admins can manage matches"
  on public.matches for all
  using (public.is_admin());

-- BETS Table
drop type if exists bet_selection cascade;
create type bet_selection as enum ('meron', 'wala', 'draw');
drop type if exists bet_status cascade;
create type bet_status as enum ('pending', 'won', 'lost', 'cancelled');

create table if not exists public.bets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  match_id uuid,
  amount numeric not null check (amount > 0),
  selection bet_selection not null,
  status bet_status default 'pending',
  payout numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bets enable row level security;

-- Policies for Bets
drop policy if exists "Users can view own bets" on public.bets;
create policy "Users can view own bets"
  on public.bets for select
  using (auth.uid() = user_id);

drop policy if exists "Admins view all bets" on public.bets;
create policy "Admins view all bets"
  on public.bets for select
  using (public.is_admin());


-- TRIGGER: Handle New User
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, role, created_by)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'user'::user_role),
    (new.raw_user_meta_data->>'created_by')::uuid
  );
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to ensure clean update
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
