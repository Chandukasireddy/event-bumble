
ALTER TABLE public.events ADD COLUMN start_datetime timestamptz DEFAULT NULL;
ALTER TABLE public.events ADD COLUMN end_datetime timestamptz DEFAULT NULL;
