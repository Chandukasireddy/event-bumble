-- Add new matching fields to registrations table
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS vibe text,
ADD COLUMN IF NOT EXISTS superpower text,
ADD COLUMN IF NOT EXISTS ideal_copilot text,
ADD COLUMN IF NOT EXISTS offscreen_life text,
ADD COLUMN IF NOT EXISTS bio text;

-- Make telegram_handle (linkedin) optional
ALTER TABLE public.registrations 
ALTER COLUMN telegram_handle DROP NOT NULL;