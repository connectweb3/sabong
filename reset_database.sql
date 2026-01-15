-- ⚠️ DESTRUCTIVE: Resets the entire Public schema for this app
-- Run this in Supabase SQL Editor

-- 1. Drop existing objects
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

drop table if exists public.bets cascade;
drop table if exists public.transactions cascade;
drop table if exists public.profiles cascade;

drop type if exists user_role cascade;
drop type if exists transaction_type cascade;
drop type if exists bet_selection cascade;
drop type if exists bet_status cascade;

-- 2. Create Types
create type user_role as enum ('admin', 'master_agent', 'agent', 'loader', 'user');
create type transaction_type as enum ('load', 'withdraw', 'bet', 'win', 'commission', 'transfer');
create type bet_selection as enum ('meron', 'wala', 'draw');
create type bet_status as enum ('pending', 'won', 'lost', 'cancelled');

-- 3. Create Tables
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  role user_role default 'user'::user_role,
  credits numeric default 0 check (credits >= 0),
  created_by uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id),
  receiver_id uuid references public.profiles(id),
  amount numeric not null check (amount > 0),
  type transaction_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.bets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  match_id uuid,
  amount numeric not null check (amount > 0),
  selection bet_selection not null,
  status bet_status default 'pending',
  payout numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable RLS
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.bets enable row level security;

-- 5. Policies
create policy "Admins can view all profiles" on public.profiles for select using (auth.uid() in (select id from public.profiles where role = 'admin'));
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Creators can view their downline" on public.profiles for select using (auth.uid() = created_by);

create policy "Users can view their transactions" on public.transactions for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Admins can view all transactions" on public.transactions for select using (auth.uid() in (select id from public.profiles where role = 'admin'));

create policy "Users can view own bets" on public.bets for select using (auth.uid() = user_id);
create policy "Admins view all bets" on public.bets for select using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- 6. Functions & Trigger
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

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 7. Verification
-- No valid output in SQL editor usually, but no red error means success.
