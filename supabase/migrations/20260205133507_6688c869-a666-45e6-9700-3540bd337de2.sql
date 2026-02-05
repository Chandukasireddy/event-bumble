-- Create chat messages table for accepted meeting requests
CREATE TABLE public.meeting_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_request_id UUID NOT NULL REFERENCES public.meeting_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.meeting_messages ENABLE ROW LEVEL SECURITY;

-- Only participants of the meeting can view messages
CREATE POLICY "Participants can view their meeting messages"
ON public.meeting_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.meeting_requests mr
    WHERE mr.id = meeting_request_id
    AND (mr.requester_id = sender_id OR mr.target_id = sender_id)
    AND (
      mr.requester_id IN (SELECT id FROM public.registrations)
      OR mr.target_id IN (SELECT id FROM public.registrations)
    )
  )
);

-- Only participants can send messages
CREATE POLICY "Participants can send messages"
ON public.meeting_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.meeting_requests mr
    WHERE mr.id = meeting_request_id
    AND mr.status = 'accepted'
    AND (mr.requester_id = sender_id OR mr.target_id = sender_id)
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_messages;