-- Enable Cascading Deletes
-- This allows deleting a user from auth.users to automatically delete their profile, bets, and transactions.

-- 1. Profiles -> auth.users
alter table public.profiles
drop constraint if exists profiles_id_fkey,
add constraint profiles_id_fkey
  foreign key (id)
  references auth.users(id)
  on delete cascade;

-- 2. Profiles -> created_by (Self Reference)
-- If the creator is deleted, set created_by to NULL (don't delete the downline)
alter table public.profiles
drop constraint if exists profiles_created_by_fkey,
add constraint profiles_created_by_fkey
  foreign key (created_by)
  references public.profiles(id)
  on delete set null;

-- 3. Transactions -> Profiles (Sender)
alter table public.transactions
drop constraint if exists transactions_sender_id_fkey,
add constraint transactions_sender_id_fkey
  foreign key (sender_id)
  references public.profiles(id)
  on delete cascade;

-- 4. Transactions -> Profiles (Receiver)
alter table public.transactions
drop constraint if exists transactions_receiver_id_fkey,
add constraint transactions_receiver_id_fkey
  foreign key (receiver_id)
  references public.profiles(id)
  on delete cascade;

-- 5. Bets -> Profiles
alter table public.bets
drop constraint if exists bets_user_id_fkey,
add constraint bets_user_id_fkey
  foreign key (user_id)
  references public.profiles(id)
  on delete cascade;

-- 6. Bets -> Matches
-- If a match is deleted, delete the bets
alter table public.bets
drop constraint if exists bets_match_id_fkey,
add constraint bets_match_id_fkey
  foreign key (match_id)
  references public.matches(id)
  on delete cascade;
