-- Add user_id column to fcm_tokens and link it to auth.users
ALTER TABLE public.fcm_tokens 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add unique constraint to token if it doesn't exist
-- This is necessary for the upsert operation in lib/push.ts
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fcm_tokens_token_key'
  ) THEN 
    ALTER TABLE public.fcm_tokens ADD CONSTRAINT fcm_tokens_token_key UNIQUE (token);
  END IF; 
END $$;

-- Enable RLS on fcm_tokens
ALTER TABLE public.fcm_tokens ENABLE ROW LEVEL SECURITY;

-- Allow users to manage their own tokens
CREATE POLICY "Users can manage their own FCM tokens" 
ON public.fcm_tokens 
FOR ALL 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
