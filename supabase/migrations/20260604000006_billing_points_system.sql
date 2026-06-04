-- Add points_balance column to wedding_organization
ALTER TABLE public.wedding_organization
ADD COLUMN IF NOT EXISTS points_balance INTEGER NOT NULL DEFAULT 0;

-- Create wo_topup_history table
CREATE TABLE IF NOT EXISTS public.wo_topup_history (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id          UUID NOT NULL REFERENCES public.wedding_organization(id) ON DELETE CASCADE,
    points_added   INTEGER NOT NULL,
    amount_paid    BIGINT NOT NULL,
    payment_method TEXT NOT NULL,
    status         TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create wo_point_usage table
CREATE TABLE IF NOT EXISTS public.wo_point_usage (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id          UUID NOT NULL REFERENCES public.wedding_organization(id) ON DELETE CASCADE,
    points_used    INTEGER NOT NULL,
    description    TEXT NOT NULL,
    customer_id    UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indices for performance and ERD analysis
CREATE INDEX IF NOT EXISTS idx_wo_topup_wo_id ON public.wo_topup_history(wo_id);
CREATE INDEX IF NOT EXISTS idx_wo_usage_wo_id ON public.wo_point_usage(wo_id);

-- Enable RLS
ALTER TABLE public.wo_topup_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wo_point_usage ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies
DROP POLICY IF EXISTS "Allow WO admin manage topup history" ON public.wo_topup_history;
CREATE POLICY "Allow WO admin manage topup history" ON public.wo_topup_history
    FOR ALL TO authenticated USING (public.is_wo_admin(wo_id)) WITH CHECK (public.is_wo_admin(wo_id));

DROP POLICY IF EXISTS "Allow WO admin manage point usage" ON public.wo_point_usage;
CREATE POLICY "Allow WO admin manage point usage" ON public.wo_point_usage
    FOR ALL TO authenticated USING (public.is_wo_admin(wo_id)) WITH CHECK (public.is_wo_admin(wo_id));

-- Insert Mock Data for Royal WO
UPDATE public.wedding_organization
SET points_balance = 750
WHERE id = 'e0a1a111-1111-1111-1111-111111111111';

INSERT INTO public.wo_topup_history (id, wo_id, points_added, amount_paid, payment_method, status, created_at, completed_at)
VALUES
    ('9a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d', 'e0a1a111-1111-1111-1111-111111111111', 500, 250000, 'Bank Transfer BCA', 'completed', now() - INTERVAL '15 days', now() - INTERVAL '15 days'),
    ('8b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e', 'e0a1a111-1111-1111-1111-111111111111', 500, 250000, 'QRIS Gopay', 'completed', now() - INTERVAL '3 days', now() - INTERVAL '3 days'),
    ('7c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f', 'e0a1a111-1111-1111-1111-111111111111', 100, 55000, 'Credit Card', 'failed', now() - INTERVAL '1 hour', now() - INTERVAL '1 hour')
ON CONFLICT DO NOTHING;

INSERT INTO public.wo_point_usage (id, wo_id, points_used, description, created_at)
VALUES
    ('6d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8g', 'e0a1a111-1111-1111-1111-111111111111', 150, 'Aktivasi Klien Baru: Tara & Tari', now() - INTERVAL '12 days'),
    ('5e5f6a7b-8c9d-0e1f-2a3b-4c5d6e7f8g9h', 'e0a1a111-1111-1111-1111-111111111111', 100, 'Custom Domain Setup: taraandtari.com', now() - INTERVAL '10 days')
ON CONFLICT DO NOTHING;
