-- Add phone, facebook, and status to profiles
alter table public.profiles add column if not exists phone_number text;
alter table public.profiles add column if not exists facebook_url text;
alter table public.profiles add column if not exists status text default 'active';

-- Update the handle_new_user trigger to handle status logic
create or replace function public.handle_new_user()
returns trigger as $$
declare
    new_referral_code text;
    initial_status text;
begin
  -- Generate a unique referral code
  loop
    new_referral_code := public.generate_referral_code();
    exit when not exists (select 1 from public.profiles where referral_code = new_referral_code);
  end loop;

  -- Determine initial status:
  -- If user is created by an admin/master agent manually (created_by is not null),
  -- they are usually trusted, but the request says ALL referral recruits need approval.
  -- Wait, the user said "all accounts created on the Agent or master agent refferal should be approve".
  -- This typically applies to PUBLIC registrations. 
  -- Manual creation by Agent/Master Agent usually implies they are already approved.
  
  if (new.raw_user_meta_data->>'is_public_registration' = 'true') then
    initial_status := 'pending';
  else
    initial_status := 'active';
  end if;

  insert into public.profiles (
    id, 
    username, 
    role, 
    created_by, 
    referral_code, 
    phone_number, 
    facebook_url,
    status
  )
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'user'::user_role),
    (new.raw_user_meta_data->>'created_by')::uuid,
    new_referral_code,
    new.raw_user_meta_data->>'phone_number',
    new.raw_user_meta_data->>'facebook_url',
    initial_status
  );
  return new;
end;
$$ language plpgsql security definer;
