-- Seed customers and invitations for testing
INSERT INTO public.customers (id, wo_id, email, male_name, female_name, phone) VALUES
  ('d3c1a222-2222-2222-2222-222222222222', 'e0a1a111-1111-1111-1111-111111111111', 'arthur@example.com', 'Arthur Pendragon', 'Elizabeth Vance', '08123456789'),
  ('d3c1a111-1111-1111-1111-111111111111', 'e0a1a111-1111-1111-1111-111111111111', 'muhammad@example.com', 'Muhammad Pratama', 'Juliana Saputri', '08123456780')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.customer_template (id, wo_id, customer_id, template_id, type, active) VALUES
  ('c6d1a111-1111-1111-1111-111111111111', 'e0a1a111-1111-1111-1111-111111111111', 'd3c1a222-2222-2222-2222-222222222222', 'b4c1a111-1111-1111-1111-111111111111', 'wedding', true),
  ('c6d1a222-2222-2222-2222-222222222222', 'e0a1a111-1111-1111-1111-111111111111', 'd3c1a111-1111-1111-1111-111111111111', 'b4c1a222-2222-2222-2222-222222222222', 'wedding', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.invitations (customer_id, slug, bride_name, bride_nickname, groom_name, groom_nickname, event_location, event_address, style) VALUES
  ('d3c1a222-2222-2222-2222-222222222222', 'arthur-elizabeth', 'Elizabeth Vance', 'Elizabeth', 'Arthur Pendragon', 'Arthur', 'Royal Kingdom Hall', 'Camelot Street No. 12, Yogyakarta', 'java_style'),
  ('d3c1a111-1111-1111-1111-111111111111', 'pratama-juliana', 'Juliana Saputri', 'Juliana', 'Muhammad Pratama', 'Pratama', 'Grand Ballroom', 'Sudirman Street No. 45, Yogyakarta', 'image_sequence')
ON CONFLICT (slug) DO NOTHING;
