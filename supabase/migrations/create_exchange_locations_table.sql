-- Create exchange_locations table
create table public.exchange_locations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text,
  description text,
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamp with time zone default now() not null
);

-- Set up Row Level Security (RLS)
alter table public.exchange_locations enable row level security;

-- Policy: Everyone can view exchange_locations
create policy "Exchange points are public"
  on public.exchange_locations for select
  using ( true );

-- Policy: Users can insert their own exchange_locations
create policy "Users can insert their own exchange points"
  on public.exchange_locations for insert
  with check ( auth.uid() = user_id );

-- Policy: Users can update their own exchange_locations
create policy "Users can update their own exchange points"
  on public.exchange_locations for update
  using ( auth.uid() = user_id );

-- Policy: Users can delete their own exchange_locations
create policy "Users can delete their own exchange points"
  on public.exchange_locations for delete
  using ( auth.uid() = user_id );
