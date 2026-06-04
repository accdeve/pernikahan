-- ============================================================
-- Migration: Create OTP Verifications Table
-- ============================================================

CREATE TABLE IF NOT EXISTS public.otp_verifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT NOT NULL UNIQUE,
    otp         TEXT NOT NULL,
    metadata    JSONB NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at  TIMESTAMPTZ NOT NULL
);

-- Enable RLS (Row Level Security) but restrict all public access. Only service_role can access.
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;
