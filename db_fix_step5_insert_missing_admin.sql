-- Insert the missing admin profile for 'boss@sabonglava.com'
-- You must verify the User ID first. 
-- Since we cannot easily know the exact UUID in this script without input,
-- we will try to look it up from auth.users based on email.

do $$
declare
  target_user_id uuid;
begin
  -- 1. Get the ID of the user from auth.users
  select id into target_user_id
  from auth.users
  where email = 'boss@sabonglava.com';

  if target_user_id is null then
    raise exception 'User boss@sabonglava.com not found in auth.users! Did you create the user?';
  end if;

  -- 2. Insert into profiles if not exists
  if not exists (select 1 from public.profiles where id = target_user_id) then
    insert into public.profiles (id, username, role, credits, created_by)
    values (
      target_user_id,
      'boss_admin',
      'admin',
      1000000,
      target_user_id -- Admin created themselves
    );
    raise notice 'Profile created for boss@sabonglava.com';
  else
    raise notice 'Profile already exists for boss@sabonglava.com';
  end if;

end $$;
