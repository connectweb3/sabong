-- Create Transaction Request Types
do $$
begin
    if not exists (select 1 from pg_type where typname = 'transaction_request_type') then
        create type transaction_request_type as enum ('cash_in', 'cash_out');
    end if;
    if not exists (select 1 from pg_type where typname = 'transaction_request_status') then
        create type transaction_request_status as enum ('pending', 'approved', 'rejected');
    end if;
end $$;

-- Create Transaction Requests Table
create table if not exists public.transaction_requests (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id) not null,
    upline_id uuid references public.profiles(id) not null,
    amount numeric not null check (amount > 0),
    type transaction_request_type not null,
    status transaction_request_status default 'pending',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.transaction_requests enable row level security;

-- RLS Policies
drop policy if exists "Users can view and create own requests" on public.transaction_requests;
create policy "Users can view and create own requests"
    on public.transaction_requests for all
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

drop policy if exists "Uplines can view and manage their downline requests" on public.transaction_requests;
create policy "Uplines can view and manage their downline requests"
    on public.transaction_requests for all
    using (auth.uid() = upline_id)
    with check (auth.uid() = upline_id);

drop policy if exists "Admins can view all requests" on public.transaction_requests;
create policy "Admins can view all requests"
    on public.transaction_requests for select
    using (public.is_admin());

-- Trigger to handle Approval and automatic transaction creation
create or replace function public.handle_transaction_request_approval()
returns trigger as $$
begin
    if (new.status = 'approved' and old.status = 'pending') then
        -- 1. Create a transaction record
        -- For 'cash_in', the upline is sending to the user
        -- For 'cash_out', the user is sending to the upline
        if (new.type = 'cash_in') then
            -- Verify upline has enough credits
            if not exists (select 1 from public.profiles where id = new.upline_id and credits >= new.amount) then
                raise exception 'Upline has insufficient credits to approve this cash-in request';
            end if;

            insert into public.transactions (sender_id, receiver_id, amount, type)
            values (new.upline_id, new.user_id, new.amount, 'load');

            update public.profiles set credits = credits - new.amount where id = new.upline_id;
            update public.profiles set credits = credits + new.amount where id = new.user_id;
        else
            -- For 'cash_out' (withdraw)
            -- Verify user has enough credits
            if not exists (select 1 from public.profiles where id = new.user_id and credits >= new.amount) then
                raise exception 'User has insufficient credits for withdrawal';
            end if;

            insert into public.transactions (sender_id, receiver_id, amount, type)
            values (new.user_id, new.upline_id, new.amount, 'withdraw');

            update public.profiles set credits = credits - new.amount where id = new.user_id;
            update public.profiles set credits = credits + new.amount where id = new.upline_id;
        end if;
    end if;
    return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_transaction_request_update on public.transaction_requests;
create trigger on_transaction_request_update
    after update on public.transaction_requests
    for each row execute procedure public.handle_transaction_request_approval();
