# Supabase Chat Migrations

This directory contains SQL migrations for the authenticated realtime chat system.

## Running Migrations

You have two options to run these migrations:

### Option 1: Supabase Dashboard (Recommended for Quick Setup)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of each migration file in order:
   - First: `001_create_chat_tables.sql`
   - Second: `002_create_rls_policies.sql`
4. Click **Run** for each migration

### Option 2: Supabase CLI

If you have the Supabase CLI installed and linked to your project:

```bash
# Link your project (if not already linked)
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Verifying Migrations

After running the migrations, verify in your Supabase dashboard:

1. **Database** → **Tables**: You should see `chat_rooms` and `messages` tables
2. **Authentication** → **Policies**: Both tables should have RLS enabled with policies

## Tables Created

### `chat_rooms`
- `id` (UUID, Primary Key)
- `name` (TEXT, Unique)
- `created_at` (TIMESTAMPTZ)

### `messages`
- `id` (UUID, Primary Key)
- `room_id` (UUID, Foreign Key to chat_rooms)
- `user_id` (UUID, Foreign Key to auth.users)
- `content` (TEXT)
- `created_at` (TIMESTAMPTZ)

## Security

Row Level Security (RLS) is enabled on both tables:
- Authenticated users can read all messages and rooms
- Authenticated users can create rooms
- Authenticated users can only insert messages with their own user_id
