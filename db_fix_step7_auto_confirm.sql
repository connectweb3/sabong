-- Auto-Confirm Users created by Admin
-- This trigger runs BEFORE the user is inserted.
-- If the user has 'created_by' in metadata, we verify them immediately.

create or replace function public.auto_confirm_admin_users()
returns trigger as $$
begin
    -- Check if 'created_by' field exists in user_metadata
    -- This field is added by our CreateUserModal
    if (new.raw_user_meta_data->>'created_by') is not null then
        new.email_confirmed_at = now();
    end if;
    return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it already exists to avoid duplication errors
drop trigger if exists on_auth_user_created_timestamp on auth.users;

-- Create the Trigger
create trigger on_auth_user_created_timestamp
    before insert on auth.users
    for each row execute procedure public.auto_confirm_admin_users();
