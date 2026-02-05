-- Add seen tracking to meeting_requests
ALTER TABLE public.meeting_requests
ADD COLUMN seen_by_target boolean NOT NULL DEFAULT false;

-- Add read tracking to meeting_messages
ALTER TABLE public.meeting_messages
ADD COLUMN read_at timestamp with time zone DEFAULT null;