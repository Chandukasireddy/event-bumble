-- Remove the role check constraint that's blocking new values
ALTER TABLE public.registrations DROP CONSTRAINT IF EXISTS registrations_role_check;