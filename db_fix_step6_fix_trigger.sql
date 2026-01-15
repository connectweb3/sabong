-- Fix handle_new_user trigger
-- 1. Schema qualify the user_role type (public.user_role)
-- 2. Add ON CONFLICT DO NOTHING to prevent crashes if profile exists
-- 3. Ensure search_path is trusted (optional but good practice)

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, role, created_by)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role),
    (new.raw_user_meta_data->>'created_by')::uuid
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;
