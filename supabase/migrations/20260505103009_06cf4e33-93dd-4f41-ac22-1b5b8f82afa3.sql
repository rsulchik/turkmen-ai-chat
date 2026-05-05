
CREATE TABLE public.shared_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_token text UNIQUE NOT NULL,
  title text NOT NULL,
  messages jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_shared_chats_token ON public.shared_chats(share_token);

ALTER TABLE public.shared_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shared chats"
  ON public.shared_chats FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create shared chats"
  ON public.shared_chats FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(share_token) BETWEEN 8 AND 64
    AND length(title) BETWEEN 1 AND 200
    AND jsonb_typeof(messages) = 'array'
  );
