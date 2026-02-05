-- Create registrations table for hackathon participants
CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Dev', 'Designer', 'Business')),
  interests TEXT[] NOT NULL DEFAULT '{}',
  telegram_handle TEXT NOT NULL,
  match_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create matches table for storing AI-generated match summaries
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  matched_registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  match_summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert registrations (public hackathon signup)
CREATE POLICY "Anyone can register" ON public.registrations FOR INSERT WITH CHECK (true);

-- Allow anyone to read registrations (needed for match display)
CREATE POLICY "Anyone can view registrations" ON public.registrations FOR SELECT USING (true);

-- Allow updating registrations (for match_id assignment)
CREATE POLICY "Anyone can update registrations" ON public.registrations FOR UPDATE USING (true);

-- Allow reading matches
CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT USING (true);

-- Allow creating matches
CREATE POLICY "Anyone can create matches" ON public.matches FOR INSERT WITH CHECK (true);

-- Enable realtime for registrations to detect matches
ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;