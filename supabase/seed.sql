-- supabase/seed.sql
-- Seed data untuk MVP testing

-- 1. Seed Plan
INSERT INTO public.plan (id, name, price) VALUES
  ('a3b1a111-1111-1111-1111-111111111111', 'Basic Plan', 50000),
  ('a3b1a222-2222-2222-2222-222222222222', 'Premium Plan', 100000)
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Templates
INSERT INTO public.templates (id, name, category, config) VALUES
  ('b4c1a111-1111-1111-1111-111111111111', 'Royal Java Style', 'basic', '{"route": "/templates/wedding/java-style", "theme": "java_style", "features": ["rsvp", "comments", "countdown", "love_story"], "styling": {"primaryColor": "#8B5A2B", "secondaryColor": "#F5F5DC", "fontFamily": "Cinzel, serif"}}'::jsonb),
  ('b4c1a222-2222-2222-2222-222222222222', 'Modern Image Sequence', 'premium', '{"route": "/templates/wedding/image-sequence", "theme": "image_sequence", "features": ["rsvp", "comments", "gallery_sequence", "countdown"], "styling": {"primaryColor": "#1A1A1A", "secondaryColor": "#FFFFFF", "fontFamily": "Inter, sans-serif"}}'::jsonb),
  ('c5d1a111-1111-1111-1111-111111111111', 'Modern Memory Book', 'basic', '{"route": "/templates/anniversary/modern-memory", "theme": "modern_memory", "features": ["add_moment", "historical_wedding_data", "permanent_timeline"], "styling": {"primaryColor": "#C71585", "secondaryColor": "#FFF0F5", "fontFamily": "Outfit, sans-serif"}}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 3. Plan-Template relationships
INSERT INTO public.plan_template (plan_id, template_id) VALUES
  ('a3b1a111-1111-1111-1111-111111111111', 'b4c1a111-1111-1111-1111-111111111111'),
  ('a3b1a111-1111-1111-1111-111111111111', 'c5d1a111-1111-1111-1111-111111111111'),
  ('a3b1a222-2222-2222-2222-222222222222', 'b4c1a111-1111-1111-1111-111111111111'),
  ('a3b1a222-2222-2222-2222-222222222222', 'b4c1a222-2222-2222-2222-222222222222'),
  ('a3b1a222-2222-2222-2222-222222222222', 'c5d1a111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- 4. Wedding Organization (dummy WO)
INSERT INTO public.wedding_organization (id, name, slug, email, location) VALUES
  ('e0a1a111-1111-1111-1111-111111111111', 'Royal Wedding Organizer', 'royal-wo', 'royal@example.com', 'Yogyakarta')
ON CONFLICT (id) DO NOTHING;
