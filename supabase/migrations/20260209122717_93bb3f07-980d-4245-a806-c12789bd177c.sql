
-- Table for custom survey questions per event
CREATE TABLE public.event_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  field_type text NOT NULL DEFAULT 'text', -- text, textarea, radio, checkbox, select, number, rating
  options jsonb, -- for radio/checkbox/select: ["Option A", "Option B", ...]
  is_required boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  placeholder text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.event_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view event questions" ON public.event_questions FOR SELECT USING (true);
CREATE POLICY "Anyone can create event questions" ON public.event_questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update event questions" ON public.event_questions FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete event questions" ON public.event_questions FOR DELETE USING (true);

-- Table for storing participant responses to custom questions
CREATE TABLE public.question_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.event_questions(id) ON DELETE CASCADE,
  response jsonb NOT NULL, -- string or array of strings
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(registration_id, question_id)
);

ALTER TABLE public.question_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view responses" ON public.question_responses FOR SELECT USING (true);
CREATE POLICY "Anyone can create responses" ON public.question_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update responses" ON public.question_responses FOR UPDATE USING (true);
