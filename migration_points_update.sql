-- ============================================
-- COMPLETE POINTS SYSTEM UPDATE
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Ensure the 'add_points' function exists (Stripe Webhook uses this!)
CREATE OR REPLACE FUNCTION add_points(user_id UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
  -- Atomically update the points for the specific user
  UPDATE profiles 
  SET points = points + amount,
      updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure new users start with 0 points
ALTER TABLE profiles ALTER COLUMN points SET DEFAULT 0;

-- 3. Update the handle_new_user function to enforce 0 points for new signups
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, username, email, avatar, points)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New Reader'),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'https://api.dicebear.com/7.x/initials/svg?seed=' || NEW.email),
    0 -- Start with 0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. (Optional) Manual Test: Add 100 points to a specific user (Replace ID)
-- SELECT add_points('USER_UUID_HERE', 100);
