-- 1. Create Participants Table (Idempotent)
create table if not exists public.participants (
  id uuid default gen_random_uuid() primary key,
  line_user_id text unique not null,
  display_name text,
  picture_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for Participants
alter table public.participants enable row level security;

-- Policies for Participants
drop policy if exists "Enable read access for all users" on public.participants;
create policy "Enable read access for all users"
on public.participants for select
using (true);

drop policy if exists "Enable insert/update for all users" on public.participants;
create policy "Enable insert/update for all users"
on public.participants for all
using (true)
with check (true);


-- 2. Create Events Table (Idempotent)
create table if not exists public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  background_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Events
alter table public.events enable row level security;

-- Policies for Events
drop policy if exists "Enable read access for all users" on public.events;
create policy "Enable read access for all users"
on public.events for select
using (true);

drop policy if exists "Enable insert for all users" on public.events;
create policy "Enable insert for all users"
on public.events for insert
with check (true);
