-- RUN THIS IN SUPABASE SQL EDITOR
-- This removes the automation so we can manually create the account without errors.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
