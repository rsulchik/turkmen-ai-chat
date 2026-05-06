CREATE TABLE public.chat_rate_limits (
  ip text PRIMARY KEY,
  short_window_start timestamptz NOT NULL DEFAULT now(),
  short_count int NOT NULL DEFAULT 0,
  long_window_start timestamptz NOT NULL DEFAULT now(),
  long_count int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies: only service role (used in edge function) can access.