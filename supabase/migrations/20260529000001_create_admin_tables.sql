-- 20260529000001_create_admin_tables.sql
-- Admin panel tables for direct invitation management (non-B2B flow)

-- 1. `invitations` — Main invitation record
CREATE TABLE IF NOT EXISTS public.invitations (
  id SERIAL PRIMARY KEY,
  customer_id UUID UNIQUE REFERENCES public.customers(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  bride_name TEXT NOT NULL,
  bride_nickname TEXT NOT NULL,
  bride_parent_father TEXT,
  bride_parent_mother TEXT,
  groom_name TEXT NOT NULL,
  groom_nickname TEXT NOT NULL,
  groom_parent_father TEXT,
  groom_parent_mother TEXT,
  akad_datetime TIMESTAMPTZ,
  resepsi_datetime TIMESTAMPTZ,
  event_location TEXT NOT NULL,
  event_address TEXT NOT NULL,
  google_maps_url TEXT,
  bank_name TEXT,
  bank_account_number TEXT,
  bank_account_holder TEXT,
  wallet_name TEXT,
  wallet_number TEXT,
  wallet_holder TEXT,
  bg_music_url TEXT,
  style TEXT NOT NULL DEFAULT 'java_style',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. `stories` — Love story milestones
CREATE TABLE IF NOT EXISTS public.stories (
  id SERIAL PRIMARY KEY,
  invitation_id INTEGER NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  milestone_date TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. `galleries` — Pre-wedding gallery photos
CREATE TABLE IF NOT EXISTS public.galleries (
  id SERIAL PRIMARY KEY,
  invitation_id INTEGER NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. `admin_guests` — Guest RSVPs for admin-managed invitations
CREATE TABLE IF NOT EXISTS public.admin_guests (
  id SERIAL PRIMARY KEY,
  invitation_id INTEGER NOT NULL REFERENCES public.invitations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  attendance TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Public read access for invitation pages (anyone can view published invitations)
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_guests ENABLE ROW LEVEL SECURITY;

-- Public SELECT access (for public invitation viewer)
CREATE POLICY "invitations_public_select" ON public.invitations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "stories_public_select" ON public.stories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "galleries_public_select" ON public.galleries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_guests_public_select" ON public.admin_guests FOR SELECT TO anon, authenticated USING (true);

-- Public INSERT for RSVP (guests can submit RSVPs)
CREATE POLICY "admin_guests_public_insert" ON public.admin_guests FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Authenticated full CRUD for admin
CREATE POLICY "invitations_auth_all" ON public.invitations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "stories_auth_all" ON public.stories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "galleries_auth_all" ON public.galleries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_guests_auth_all" ON public.admin_guests FOR ALL TO authenticated USING (true) WITH CHECK (true);
