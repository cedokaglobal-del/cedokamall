-- Run this in your Supabase SQL editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Create the visitor_stats table (single-row aggregate)
CREATE TABLE IF NOT EXISTS public.visitor_stats (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- ensures only one row
  total_visitors integer NOT NULL DEFAULT 0,
  total_sessions integer NOT NULL DEFAULT 0,
  total_duration integer NOT NULL DEFAULT 0,          -- in seconds
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Insert the initial row
INSERT INTO public.visitor_stats (id, total_visitors, total_sessions, total_duration)
VALUES (1, 0, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- 2. Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.visitor_stats;

-- 3. Create the RPC function
CREATE OR REPLACE FUNCTION public.increment_visitor_stats(
  is_new_visitor boolean DEFAULT false,
  is_new_session boolean DEFAULT false,
  additional_duration integer DEFAULT 0
)
RETURNS SETOF public.visitor_stats
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.visitor_stats
  SET
    total_visitors = total_visitors + CASE WHEN is_new_visitor THEN 1 ELSE 0 END,
    total_sessions = total_sessions + CASE WHEN is_new_session THEN 1 ELSE 0 END,
    total_duration = total_duration + additional_duration,
    updated_at = now()
  WHERE id = 1;

  RETURN QUERY SELECT * FROM public.visitor_stats WHERE id = 1;
END;
$$;
