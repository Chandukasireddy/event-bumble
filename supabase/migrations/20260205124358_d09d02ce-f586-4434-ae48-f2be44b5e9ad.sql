-- Add "how to find me" field for accepted meetings
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS how_to_find_me text;