-- 1. Create the helper function to break recursion
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 2. Update Profiles Policy
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- 3. Update Transactions Policy
drop policy if exists "Admins can view all transactions" on public.transactions;
create policy "Admins can view all transactions"
  on public.transactions for select
  using (public.is_admin());

-- 4. Update Bets Policy
drop policy if exists "Admins view all bets" on public.bets;
create policy "Admins view all bets"
  on public.bets for select
  using (public.is_admin());
