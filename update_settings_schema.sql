-- Create App Settings Table
create table if not exists public.app_settings (
    key text primary key,
    value text,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.app_settings enable row level security;

-- Policies
drop policy if exists "Everyone can read settings" on public.app_settings;
create policy "Everyone can read settings"
    on public.app_settings for select
    using (true);

drop policy if exists "Admins can update settings" on public.app_settings;
create policy "Admins can update settings"
    on public.app_settings for update
    using (public.is_admin());

drop policy if exists "Admins can insert settings" on public.app_settings;
create policy "Admins can insert settings"
    on public.app_settings for insert
    with check (public.is_admin());

-- Insert default stream URL (placeholder)
insert into public.app_settings (key, value)
values ('stream_url', 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8')
on conflict (key) do nothing;
