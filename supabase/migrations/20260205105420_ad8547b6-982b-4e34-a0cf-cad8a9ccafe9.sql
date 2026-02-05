-- Create the update timestamp function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  event_date DATE,
  location TEXT,
  organizer_code TEXT NOT NULL DEFAULT substring(md5(random()::text), 1, 8),
  share_code TEXT NOT NULL DEFAULT substring(md5(random()::text), 1, 6),
  networking_duration INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add event_id to registrations
ALTER TABLE public.registrations 
ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE CASCADE;

-- Create meeting_requests table
CREATE TABLE public.meeting_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  suggested_time TEXT,
  message TEXT,
  is_ai_suggested BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_requests ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Anyone can create events" ON public.events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update events" ON public.events FOR UPDATE USING (true);

-- Meeting requests policies
CREATE POLICY "Anyone can view meeting requests" ON public.meeting_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can create meeting requests" ON public.meeting_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update meeting requests" ON public.meeting_requests FOR UPDATE USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_requests;

-- Triggers
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meeting_requests_updated_at
BEFORE UPDATE ON public.meeting_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();