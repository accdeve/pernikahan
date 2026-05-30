-- 20260528000001_create_mvp_tables.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. `wedding_organization` — Tenant WO
CREATE TABLE IF NOT EXISTS public.wedding_organization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. `wo_staff` — Staff WO (terkoneksi ke auth.users)
CREATE TABLE IF NOT EXISTS public.wo_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  wo_id UUID NOT NULL REFERENCES public.wedding_organization(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. `customers` — Pasangan Pengantin
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID NOT NULL REFERENCES public.wedding_organization(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  male_name TEXT NOT NULL,
  female_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. `templates` — Template Undangan (Global)
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  thumbnail TEXT,
  category TEXT NOT NULL CHECK (category IN ('basic', 'premium')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. `plan` — Paket Langganan
CREATE TABLE IF NOT EXISTS public.plan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price INTEGER NOT NULL, -- dalam sen (misal 50000 = Rp 500.000)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. `plan_template` — Junction Plan ↔ Template
CREATE TABLE IF NOT EXISTS public.plan_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plan(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. `wo_plan` — Plan Aktif WO
CREATE TABLE IF NOT EXISTS public.wo_plan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID NOT NULL REFERENCES public.wedding_organization(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.plan(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('active', 'expired')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. `customer_template` — Aktivasi Template oleh WO untuk Customer
CREATE TABLE IF NOT EXISTS public.customer_template (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID NOT NULL REFERENCES public.wedding_organization(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('wedding', 'anniversary')),
  active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. `guests` — Tamu Undangan
CREATE TABLE IF NOT EXISTS public.guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID NOT NULL REFERENCES public.wedding_organization(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rsvp_status BOOLEAN NOT NULL DEFAULT false,
  guest_count INTEGER NOT NULL DEFAULT 1,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. `cust_metadata` — Metadata Acara
CREATE TABLE IF NOT EXISTS public.cust_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID NOT NULL REFERENCES public.wedding_organization(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  customer_template_id UUID NOT NULL REFERENCES public.customer_template(id) ON DELETE CASCADE,
  date TIMESTAMPTZ,
  type TEXT NOT NULL CHECK (type IN ('wedding', 'anniversary')),
  location TEXT,
  address TEXT,
  akad_date TIMESTAMPTZ,
  reception_date TIMESTAMPTZ,
  love_story JSONB DEFAULT '[]'::jsonb,
  bank_account JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. `cust_comment` — Buku Tamu Digital
CREATE TABLE IF NOT EXISTS public.cust_comment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wo_id UUID NOT NULL REFERENCES public.wedding_organization(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);
