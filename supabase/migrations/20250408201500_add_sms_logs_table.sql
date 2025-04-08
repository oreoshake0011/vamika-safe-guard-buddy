
-- Create a new table for SMS logs
CREATE TABLE IF NOT EXISTS public.sms_logs (
  id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sent_count INTEGER NOT NULL DEFAULT 0,
  total_contacts INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('success', 'partial_success', 'failed')),
  results JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add RLS policies
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own SMS logs
CREATE POLICY "Users can view their own SMS logs"
  ON public.sms_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only authenticated users can insert SMS logs
CREATE POLICY "Only authenticated users can insert SMS logs"
  ON public.sms_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users cannot update or delete SMS logs
CREATE POLICY "Users cannot update SMS logs"
  ON public.sms_logs
  FOR UPDATE
  USING (false);

CREATE POLICY "Users cannot delete SMS logs"
  ON public.sms_logs
  FOR DELETE
  USING (false);

-- Create indexes
CREATE INDEX sms_logs_user_id_idx ON public.sms_logs (user_id);
CREATE INDEX sms_logs_created_at_idx ON public.sms_logs (created_at);
