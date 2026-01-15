-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ROLES Enum
create type user_role as enum ('admin', 'master_agent', 'agent', 'loader', 'user');

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
-- Admin can view all
create policy "Admins can view all profiles"
  on public.profiles for select
  using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- Users can view their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Hierarchy viewing (Master Agents can see their Agents, Agents see Loaders, etc.)
-- This is complex in RLS, simplifying for MVP: Allow users to view profiles they created.
create policy "Creators can view their downline"
  on public.profiles for select
  using (auth.uid() = created_by);

-- TRANSACTIONS Table
create type transaction_type as enum ('load', 'withdraw', 'bet', 'win', 'commission', 'transfer');

create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references public.profiles(id),
  receiver_id uuid references public.profiles(id),
  amount numeric not null check (amount > 0),
  type transaction_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

-- Policies for Transactions
-- Users see transactions involved in
create policy "Users can view their transactions"
  on public.transactions for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

-- Admins view all
create policy "Admins can view all transactions"
  on public.transactions for select
  using (auth.uid() in (select id from public.profiles where role = 'admin'));

-- BETS Table
create type bet_selection as enum ('meron', 'wala', 'draw');
create type bet_status as enum ('pending', 'won', 'lost', 'cancelled');

create table public.bets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  amount numeric not null check (amount > 0),
  selection bet_selection not null,
  status bet_status default 'pending',
  payout numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.bets enable row level security;

-- Policies for Bets
create policy "Users can view own bets"
  on public.bets for select
  using (auth.uid() = user_id);

create policy "Admins view all bets"
  on public.bets for select
  using (auth.uid() in (select id from public.profiles where role = 'admin'));


-- TRIGGER: Handle New User
-- This trigger automatically creates a profile entry when a new user is created in auth.users
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
