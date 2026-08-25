CREATE TABLE public.rsvp_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  attendance text NOT NULL CHECK (attendance IN ('yes', 'no', 'maybe')),
  guest_count integer NOT NULL DEFAULT 1 CHECK (guest_count > 0),
  dietary text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.rsvp_responses TO anon;
GRANT SELECT ON public.rsvp_responses TO service_role;

ALTER TABLE public.rsvp_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous RSVP submissions"
ON public.rsvp_responses
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Service role can read RSVPs"
ON public.rsvp_responses
FOR SELECT
TO service_role
USING (true);