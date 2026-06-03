-- ============================================================
-- Migration: Create MVP Tables (B2B Multi-Tenant SaaS)
-- ============================================================

-- 1. Plan & Templates Catalog
CREATE TABLE IF NOT EXISTS public.plan (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    price       BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.templates (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    category    TEXT NOT NULL CHECK (category IN ('basic', 'premium')),
    config      JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.plan_template (
    plan_id     UUID NOT NULL REFERENCES public.plan(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
    PRIMARY KEY (plan_id, template_id)
);

-- 2. Wedding Organization (Tenant)
CREATE TABLE IF NOT EXISTS public.wedding_organization (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    email       TEXT NOT NULL,
    location    TEXT,
    plan_id     UUID REFERENCES public.plan(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Customers (Couple Clients)
CREATE TABLE IF NOT EXISTS public.customers (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id       UUID NOT NULL REFERENCES public.wedding_organization(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    male_name   TEXT NOT NULL,
    female_name TEXT NOT NULL,
    phone       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Customer Template Activation
CREATE TABLE IF NOT EXISTS public.customer_template (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id       UUID NOT NULL REFERENCES public.wedding_organization(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
    type        TEXT NOT NULL CHECK (type IN ('wedding', 'anniversary')),
    active      BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (customer_id, template_id)
);

-- 5. Customer Event Metadata
CREATE TABLE IF NOT EXISTS public.cust_metadata (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id                 UUID NOT NULL REFERENCES public.wedding_organization(id) ON DELETE CASCADE,
    customer_id           UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    customer_template_id  UUID REFERENCES public.customer_template(id) ON DELETE SET NULL,
    date                  TIMESTAMPTZ,
    type                  TEXT CHECK (type IN ('wedding', 'anniversary')),
    location              TEXT,
    address               TEXT,
    akad_date             TIMESTAMPTZ,
    reception_date        TIMESTAMPTZ,
    love_story            JSONB DEFAULT '[]'::jsonb,
    bank_account          JSONB DEFAULT '[]'::jsonb,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Guests (RSVPs)
CREATE TABLE IF NOT EXISTS public.guests (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id       UUID NOT NULL REFERENCES public.wedding_organization(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    rsvp_status BOOLEAN NOT NULL DEFAULT false,
    guest_count INTEGER NOT NULL DEFAULT 1,
    reason      TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Guest Comments (Buku Tamu)
CREATE TABLE IF NOT EXISTS public.cust_comment (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id       UUID NOT NULL REFERENCES public.wedding_organization(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    guest_id    UUID REFERENCES public.guests(id) ON DELETE SET NULL,
    comment     TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Invitations
CREATE TABLE IF NOT EXISTS public.invitations (
    id                    SERIAL PRIMARY KEY,
    customer_id           UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    slug                  TEXT NOT NULL UNIQUE,
    bride_name            TEXT NOT NULL,
    bride_nickname        TEXT,
    bride_parent_father   TEXT,
    bride_parent_mother   TEXT,
    groom_name            TEXT NOT NULL,
    groom_nickname        TEXT,
    groom_parent_father   TEXT,
    groom_parent_mother   TEXT,
    akad_datetime         TIMESTAMPTZ,
    resepsi_datetime      TIMESTAMPTZ,
    event_location        TEXT,
    event_address         TEXT,
    google_maps_url       TEXT,
    bank_name             TEXT,
    bank_account_number   TEXT,
    bank_account_holder   TEXT,
    wallet_name           TEXT,
    wallet_number         TEXT,
    wallet_holder         TEXT,
    bg_music_url          TEXT,
    style                 TEXT DEFAULT 'java_style',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Stories (Love Story)
CREATE TABLE IF NOT EXISTS public.stories (
    id              SERIAL PRIMARY KEY,
    invitation_id   INTEGER NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
    milestone_date  TEXT NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    image_url       TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Galleries (Photo Gallery)
CREATE TABLE IF NOT EXISTS public.galleries (
    id              SERIAL PRIMARY KEY,
    invitation_id   INTEGER NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
    image_url       TEXT NOT NULL,
    caption         TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. WO Plan (WO ↔ Plan subscription)
CREATE TABLE IF NOT EXISTS public.wo_plan (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wo_id       UUID NOT NULL REFERENCES public.wedding_organization(id) ON DELETE CASCADE,
    plan_id     UUID NOT NULL REFERENCES public.plan(id) ON DELETE CASCADE,
    status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    start_date  TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_date    TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Admin Guests (RSVPs via admin panel)
CREATE TABLE IF NOT EXISTS public.admin_guests (
    id              SERIAL PRIMARY KEY,
    invitation_id   INTEGER NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    attendance      TEXT NOT NULL CHECK (attendance IN ('hadir', 'tidak', 'ragu')),
    comment         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
