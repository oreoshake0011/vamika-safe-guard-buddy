
-- Add tasker_api_key to profiles table
ALTER TABLE public.profiles 
ADD COLUMN tasker_api_key TEXT;

-- Add source column to sms_logs
ALTER TABLE public.sms_logs
ADD COLUMN source TEXT NOT NULL DEFAULT 'app';

-- Update the status check constraint to include the new column
ALTER TABLE public.sms_logs
DROP CONSTRAINT sms_logs_status_check;

ALTER TABLE public.sms_logs
ADD CONSTRAINT sms_logs_status_check 
CHECK (status IN ('success', 'partial_success', 'failed'));

-- Create index for API key lookups
CREATE INDEX profiles_tasker_api_key_idx ON public.profiles (tasker_api_key);
