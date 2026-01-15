-- RUN THIS IN SUPABASE SQL EDITOR *AFTER* RUNNING THE SCRIPT
-- This manually creates your Admin Profile since we turned off the automation.

insert into public.profiles (id, username, role, credits)
select id, 'boss_admin', 'admin', 1000000
from auth.users
where email = 'boss@sabonglava.com'
on conflict (id) do update
set role = 'admin', credits = 1000000;
