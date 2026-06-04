ALTER TABLE public.invitations ADD COLUMN IF NOT EXISTS payment_methods JSONB DEFAULT '[]'::jsonb;
