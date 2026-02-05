-- Add meeting scheduling columns to meeting_requests table
ALTER TABLE public.meeting_requests 
ADD COLUMN IF NOT EXISTS meeting_date date,
ADD COLUMN IF NOT EXISTS meeting_time text,
ADD COLUMN IF NOT EXISTS meeting_location text,
ADD COLUMN IF NOT EXISTS reschedule_message text;

-- Update status check to include new statuses
-- Status values: pending, accepted, declined, scheduled, reschedule_requested