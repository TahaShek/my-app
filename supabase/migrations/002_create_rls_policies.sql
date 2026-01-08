-- Enable Row Level Security on chat_rooms
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all chat rooms
CREATE POLICY "Authenticated users can read chat rooms"
  ON public.chat_rooms
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to create chat rooms
CREATE POLICY "Authenticated users can create chat rooms"
  ON public.chat_rooms
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Allow authenticated users to read all messages
CREATE POLICY "Authenticated users can read messages"
  ON public.messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Allow authenticated users to insert messages (only with their own user_id)
CREATE POLICY "Authenticated users can insert their own messages"
  ON public.messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
