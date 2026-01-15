-- Add referral_code to profiles
alter table public.profiles add column if not exists referral_code text unique;

-- Function to generate a random referral code
create or replace function public.generate_referral_code()
returns text as $$
declare
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i integer;
begin
  for i in 1..8 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  end loop;
  return result;
end;
$$ language plpgsql security definer;

-- Update trigger function to include referral_code
create or replace function public.handle_new_user()
returns trigger as $$
declare
    new_referral_code text;
begin
  -- Generate a unique referral code
  loop
    new_referral_code := public.generate_referral_code();
    exit when not exists (select 1 from public.profiles where referral_code = new_referral_code);
  end loop;

  insert into public.profiles (id, username, role, created_by, referral_code)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'user'::user_role),
    (new.raw_user_meta_data->>'created_by')::uuid,
    new_referral_code
  );
  return new;
end;
$$ language plpgsql security definer;

-- One-time update for existing users
do $$
declare
    r record;
    rc text;
begin
    for r in select id from public.profiles where referral_code is null loop
        loop
            rc := public.generate_referral_code();
            exit when not exists (select 1 from public.profiles where referral_code = rc);
        end loop;
        update public.profiles set referral_code = rc where id = r.id;
    end loop;
end $$;
