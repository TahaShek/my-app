-- Create locations table
create table public.locations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  name text,
  description text,
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamp with time zone default now() not null
);

-- Set up Row Level Security (RLS)
alter table public.locations enable row level security;

-- Policy: Everyone can view locations
create policy "Locations are public"
  on public.locations for select
  using ( true );

-- Policy: Users can insert their own locations
create policy "Users can insert their own locations"
  on public.locations for insert
  with check ( auth.uid() = user_id );

-- Policy: Users can update their own locations
create policy "Users can update their own locations"
  on public.locations for update
  using ( auth.uid() = user_id );

-- Policy: Users can delete their own locations
create policy "Users can delete their own locations"
  on public.locations for delete
  using ( auth.uid() = user_id );
