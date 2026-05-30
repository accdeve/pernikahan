-- supabase/seed.sql

-- 1. Seed Plan (Basic & Premium)
INSERT INTO public.plan (id, name, price) VALUES
  ('a3b1a111-1111-1111-1111-111111111111', 'Basic Plan', 50000),   -- Rp 500.000 dalam sen
  ('a3b1a222-2222-2222-2222-222222222222', 'Premium Plan', 100000) -- Rp 1.000.000 dalam sen
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Templates (Wedding & Anniversary)
INSERT INTO public.templates (id, name, category, config) VALUES
  (
    'b4c1a111-1111-1111-1111-111111111111',
    'Royal Java Style',
    'basic',
    '{
      "route": "/templates/wedding/java-style",
      "theme": "java_style",
      "features": ["rsvp", "comments", "countdown", "love_story"],
      "styling": {
        "primaryColor": "#8B5A2B",
        "secondaryColor": "#F5F5DC",
        "fontFamily": "Cinzel, serif"
      }
    }'::jsonb
  ),
  (
    'b4c1a222-2222-2222-2222-222222222222',
    'Modern Image Sequence',
    'premium',
    '{
      "route": "/templates/wedding/image-sequence",
      "theme": "image_sequence",
      "features": ["rsvp", "comments", "gallery_sequence", "countdown"],
      "styling": {
        "primaryColor": "#1A1A1A",
        "secondaryColor": "#FFFFFF",
        "fontFamily": "Inter, sans-serif"
      }
    }'::jsonb
  ),
  (
    'c5d1a111-1111-1111-1111-111111111111',
    'Modern Memory Book',
    'basic',
    '{
      "route": "/templates/anniversary/modern-memory",
      "theme": "modern_memory",
      "features": ["add_moment", "historical_wedding_data", "permanent_timeline"],
      "styling": {
        "primaryColor": "#C71585",
        "secondaryColor": "#FFF0F5",
        "fontFamily": "Outfit, sans-serif"
      }
    }'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Seed Plan ↔ Template relationships (plan_template)
INSERT INTO public.plan_template (plan_id, template_id) VALUES
  -- Basic Plan has: Royal Java Style & Modern Memory Book
  ('a3b1a111-1111-1111-1111-111111111111', 'b4c1a111-1111-1111-1111-111111111111'),
  ('a3b1a111-1111-1111-1111-111111111111', 'c5d1a111-1111-1111-1111-111111111111'),
  -- Premium Plan has all: Royal Java Style, Modern Image Sequence, & Modern Memory Book
  ('a3b1a222-2222-2222-2222-222222222222', 'b4c1a111-1111-1111-1111-111111111111'),
  ('a3b1a222-2222-2222-2222-222222222222', 'b4c1a222-2222-2222-2222-222222222222'),
  ('a3b1a222-2222-2222-2222-222222222222', 'c5d1a111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;


-- ==========================================
-- 3.5 Seed Supabase Auth Users (For WO Staff connection)
-- ==========================================

-- Insert test user 'admin@example.com' with password 'password123' directly into auth.users schema
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'fc9724c9-58bd-41a5-b59d-224c650b5dfe',
  'authenticated',
  'authenticated',
  'admin@example.com',
  crypt('password123', gen_salt('bf')), -- secure bcrypt hash using pgcrypto extension
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  now(),
  now(),
  '',
  '',
  '',
  ''
);

-- Insert matching identity into auth.identities schema so Supabase Auth handles it correctly
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  'fc9724c9-58bd-41a5-b59d-224c650b5dfe',
  'fc9724c9-58bd-41a5-b59d-224c650b5dfe',
  jsonb_build_object('sub', 'fc9724c9-58bd-41a5-b59d-224c650b5dfe', 'email', 'admin@example.com'),
  'email',
  'fc9724c9-58bd-41a5-b59d-224c650b5dfe',
  now(),
  now(),
  now()
);


-- ==========================================
-- 4. Seed Multi-Tenant WO & B2B MVP Tables
-- ==========================================

-- Seed Wedding Organization (WO)
INSERT INTO public.wedding_organization (id, name, slug, email, location) VALUES
  ('e0a1a111-1111-1111-1111-111111111111', 'Royal Wedding Organizer', 'royal-wo', 'royal@example.com', 'Yogyakarta')
ON CONFLICT (id) DO NOTHING;

-- Seed WO Staff (linked to local admin@example.com auth user)
INSERT INTO public.wo_staff (id, user_id, wo_id, name, email, role) VALUES
  ('f1b1a111-1111-1111-1111-111111111111', 'fc9724c9-58bd-41a5-b59d-224c650b5dfe', 'e0a1a111-1111-1111-1111-111111111111', 'Admin Royal', 'admin@example.com', 'admin')
ON CONFLICT (id) DO NOTHING;

-- Seed Customer (Couple Client 1 - Javanese theme)
INSERT INTO public.customers (id, wo_id, email, male_name, female_name) VALUES
  ('d3c1a111-1111-1111-1111-111111111111', 'e0a1a111-1111-1111-1111-111111111111', 'juliana@example.com', 'Muhammad Pratama', 'Juliana Saputri')
ON CONFLICT (id) DO NOTHING;

-- Seed Customer (Couple Client 2 - Editorial theme)
INSERT INTO public.customers (id, wo_id, email, male_name, female_name) VALUES
  ('d3c1a222-2222-2222-2222-222222222222', 'e0a1a111-1111-1111-1111-111111111111', 'elizabeth@example.com', 'Arthur Pendragon', 'Elizabeth Vance')
ON CONFLICT (id) DO NOTHING;

-- Seed Customer template activation (Client 1: Javanese)
INSERT INTO public.customer_template (id, wo_id, customer_id, template_id, type, active) VALUES
  ('c4d1a111-1111-1111-1111-111111111111', 'e0a1a111-1111-1111-1111-111111111111', 'd3c1a111-1111-1111-1111-111111111111', 'b4c1a111-1111-1111-1111-111111111111', 'wedding', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Customer template activation (Client 2: Editorial)
INSERT INTO public.customer_template (id, wo_id, customer_id, template_id, type, active) VALUES
  ('c4d1a222-2222-2222-2222-222222222222', 'e0a1a111-1111-1111-1111-111111111111', 'd3c1a222-2222-2222-2222-222222222222', 'b4c1a222-2222-2222-2222-222222222222', 'wedding', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Event details & metadata (Client 1)
INSERT INTO public.cust_metadata (id, wo_id, customer_id, customer_template_id, date, type, location, address, akad_date, reception_date, love_story, bank_account) VALUES
  (
    'b5e1a111-1111-1111-1111-111111111111',
    'e0a1a111-1111-1111-1111-111111111111',
    'd3c1a111-1111-1111-1111-111111111111',
    'c4d1a111-1111-1111-1111-111111111111',
    now() + interval '365 days',
    'wedding',
    'Gedung Krama Jawi',
    'Jl. Sosrowijayan No. 12, Yogyakarta',
    now() + interval '365 days',
    now() + interval '365 days' + interval '3 hours',
    '[
      {
        "milestoneDate": "SEPTEMBER 2021",
        "title": "Awal Berjumpa",
        "description": "Pertemuan tak terduga yang menjadi awal dari segalanya. Di bawah langit senja, semesta mempertemukan dua jiwa yang mencari.",
        "imageUrl": "https://lh3.googleusercontent.com/aida-public/AB6AXuCY1aRIisont3Niwu7RhAvjdN7Qwdl943Yrw4bAGBlgR57WcAEHB8cSu895hjmJ0fLPvWscTvOalqqNMH1A7fGz99utgt0vmcEY7MZO8clL3CGYE3eooGKolD2Oj1Ant_AR3P7AwV9GUJayz7hcOmmenPp9HAzRqd5pQnvySjtEyDPfUCMNR0XyJxyERXMLIoFmknW7qBNMUN9OOaYwugn6WKdlRBQZ5aGLszfRpmo0msBTjRReJCqr5gnSy2DofR07jviBmxnWPi8"
      },
      {
        "milestoneDate": "JULI 2023",
        "title": "Lamaran",
        "description": "Satu janji terucap di hadapan keluarga tercinta. Sebuah komitmen untuk melangkah bersama.",
        "imageUrl": "https://lh3.googleusercontent.com/aida-public/AB6AXuCmGv_ZCXCbihzhM2AkllbJrb0tLZaX0cGDkq0WZjukvIIsyq-l9apt7GKfg2NUbaXqIy4PLEP_Xk3LJLt8eurLtrRwXN6IQXd5cmUOvLuPRGvxK2GoIfXZy4liD3g9rToz4tlnYYV0Op7ojF36ZzX0yUjGDsP7foEUcg-ReMuqPsm05W4aK5lLc7xVY8J-j1ylrHCBQRwc2GWLlgpl-HsmliFywjyc-BEywtWq1XOCkB3VUklS7_LxrGmjrTsISTk2SAbcRiPE-Qk"
      }
    ]'::jsonb,
    '[
      {
        "bank": "Bank Mandiri",
        "account_number": "123 4567 890",
        "holder_name": "Muhammad Pratama"
      },
      {
        "bank": "GoPay",
        "account_number": "0812 3456 7890",
        "holder_name": "Juliana Saputri"
      }
    ]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Event details & metadata (Client 2)
INSERT INTO public.cust_metadata (id, wo_id, customer_id, customer_template_id, date, type, location, address, akad_date, reception_date, love_story, bank_account) VALUES
  (
    'b5e1a222-2222-2222-2222-222222222222',
    'e0a1a111-1111-1111-1111-111111111111',
    'd3c1a222-2222-2222-2222-222222222222',
    'c4d1a222-2222-2222-2222-222222222222',
    now() + interval '365 days',
    'wedding',
    'The Glass House',
    'Jl. Sukajadi No. 102, Bandung',
    now() + interval '365 days',
    now() + interval '365 days' + interval '11 hours',
    '[
      {
        "milestoneDate": "OCTOBER 2022",
        "title": "Editorial First Meet",
        "description": "Met at an art gallery event in Paris.",
        "imageUrl": "https://lh3.googleusercontent.com/aida-public/AB6AXuCY1aRIisont3Niwu7RhAvjdN7Qwdl943Yrw4bAGBlgR57WcAEHB8cSu895hjmJ0fLPvWscTvOalqqNMH1A7fGz99utgt0vmcEY7MZO8clL3CGYE3eooGKolD2Oj1Ant_AR3P7AwV9GUJayz7hcOmmenPp9HAzRqd5pQnvySjtEyDPfUCMNR0XyJxyERXMLIoFmknW7qBNMUN9OOaYwugn6WKdlRBQZ5aGLszfRpmo0msBTjRReJCqr5gnSy2DofR07jviBmxnWPi8"
      }
    ]'::jsonb,
    '[
      {
        "bank": "Citibank NA",
        "account_number": "8842 1902 0031 4452",
        "holder_name": "Arthur Pendragon"
      }
    ]'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Seed Guests RSVPs (Client 1)
INSERT INTO public.guests (id, wo_id, customer_id, name, rsvp_status, guest_count, reason) VALUES
  ('a6f1a111-1111-1111-1111-111111111111', 'e0a1a111-1111-1111-1111-111111111111', 'd3c1a111-1111-1111-1111-111111111111', 'Andi & Sara', true, 2, 'Selamat menempuh hidup baru J & M! Semoga cinta kalian selalu mekar.'),
  ('a6f1a222-2222-2222-2222-222222222222', 'e0a1a111-1111-1111-1111-111111111111', 'd3c1a111-1111-1111-1111-111111111111', 'Ibu Ratna', false, 1, 'Doa terbaik untuk kalian berdua. Maaf Ibu tidak bisa hadir secara langsung.')
ON CONFLICT (id) DO NOTHING;

-- Seed comments guest book (Client 1)
INSERT INTO public.cust_comment (id, wo_id, customer_id, guest_id, comment) VALUES
  ('9701a111-1111-1111-1111-111111111111', 'e0a1a111-1111-1111-1111-111111111111', 'd3c1a111-1111-1111-1111-111111111111', 'a6f1a111-1111-1111-1111-111111111111', 'Selamat menempuh hidup baru J & M! Semoga cinta kalian selalu mekar seperti bunga di taman surga.')
ON CONFLICT (id) DO NOTHING;


-- ==========================================
-- 5. Seed Invitation Details (Linked to B2B Customers)
-- ==========================================

-- Seed Invitations (Linking to seeded B2B Customers)
INSERT INTO public.invitations (id, customer_id, slug, bride_name, bride_nickname, bride_parent_father, bride_parent_mother, groom_name, groom_nickname, groom_parent_father, groom_parent_mother, akad_datetime, resepsi_datetime, event_location, event_address, google_maps_url, bank_name, bank_account_number, bank_account_holder, wallet_name, wallet_number, wallet_holder, bg_music_url, style) VALUES
  (1, 'd3c1a111-1111-1111-1111-111111111111', 'juliana-muhammad', 'Juliana Saputri', 'Juliana', 'Bapak Ahmad Santoso', 'Ibu Siti Maryam', 'Muhammad Pratama', 'Muhammad', 'Bapak H. Ridwan Jaya', 'Ibu Hj. Kartika', now() + interval '365 days', now() + interval '365 days' + interval '3 hours', 'Gedung Krama Jawi', 'Jl. Sosrowijayan No. 12, Yogyakarta', 'https://maps.app.goo.gl/uX73Y69aR8d', 'Bank Mandiri', '123 4567 890', 'Muhammad Pratama', 'GoPay', '0812 3456 7890', 'Juliana Saputri', '/audio/gamelan.mp3', 'java_style'),
  (2, 'd3c1a222-2222-2222-2222-222222222222', 'juliana-muhammad-editorial', 'Elizabeth Vance', 'Elizabeth', 'Bapak Ahmad Santoso', 'Ibu Siti Maryam', 'Arthur Pendragon', 'Arthur', 'Bapak H. Ridwan Jaya', 'Ibu Hj. Kartika', now() + interval '365 days', now() + interval '365 days' + interval '11 hours', 'The Glass House', 'Jl. Sukajadi No. 102, Bandung', 'https://maps.app.goo.gl/uX73Y69aR8d', 'Citibank NA', '8842 1902 0031 4452', 'Arthur Pendragon', 'OVO', '0812 3456 7890', 'Elizabeth Vance', '/audio/gamelan.mp3', 'image_sequence')
ON CONFLICT (id) DO NOTHING;

-- Seed Stories
INSERT INTO public.stories (invitation_id, milestone_date, title, description, image_url, sort_order) VALUES
  (1, 'SEPTEMBER 2021', 'Awal Berjumpa', 'Pertemuan tak terduga yang menjadi awal dari segalanya. Di bawah langit senja, semesta mempertemukan dua jiwa yang mencari.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCY1aRIisont3Niwu7RhAvjdN7Qwdl943Yrw4bAGBlgR57WcAEHB8cSu895hjmJ0fLPvWscTvOalqqNMH1A7fGz99utgt0vmcEY7MZO8clL3CGYE3eooGKolD2Oj1Ant_AR3P7AwV9GUJayz7hcOmmenPp9HAzRqd5pQnvySjtEyDPfUCMNR0XyJxyERXMLIoFmknW7qBNMUN9OOaYwugn6WKdlRBQZ5aGLszfRpmo0msBTjRReJCqr5gnSy2DofR07jviBmxnWPi8', 1),
  (1, 'JULI 2023', 'Lamaran', 'Satu janji terucap di hadapan keluarga tercinta. Sebuah komitmen untuk melangkah bersama mengarungi samudera kehidupan.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmGv_ZCXCbihzhM2AkllbJrb0tLZaX0cGDkq0WZjukvIIsyq-l9apt7GKfg2NUbaXqIy4PLEP_Xk3LJLt8eurLtrRwXN6IQXd5cmUOvLuPRGvxK2GoIfXZy4liD3g9rToz4tlnYYV0Op7ojF36ZzX0yUjGDsP7foEUcg-ReMuqPsm05W4aK5lLc7xVY8J-j1ylrHCBQRwc2GWLlgpl-HsmliFywjyc-BEywtWq1XOCkB3VUklS7_LxrGmjrTsISTk2SAbcRiPE-Qk', 2),
  (1, 'MEI 2026', 'Menuju Halal', 'Menanti hari kemenangan, menyatukan doa dan harapan untuk menjadi satu dalam ikatan yang suci dan diridhai Allah SWT.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfcAcD3YIv2sab8aTvylF3ZFaeQ5eP8Y9z60ZCQ1tg89MzIx8bsGd6lGNnBTEH2PR9LlbI6MQA7z1VSOxQg-zYg9jVCyPBj_3MtK_oQfIFejsTyTPuvxKkruUqERMNkzZWOGP8-v-4obxfiyp6FrRkWaFv_ZlDn1BrivQniDruSThUVOtQNTTEbpsCjw-622idEhA6_Q0CzbPHaf5qDSsynACT_8rDUno5LchMWR0cGjbe-jpgotqdecY3X6mosxqqTcr-R_pgpbk', 3),
  (2, 'SEPTEMBER 2021', 'Awal Berjumpa', 'Pertemuan tak terduga yang menjadi awal dari segalanya.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCY1aRIisont3Niwu7RhAvjdN7Qwdl943Yrw4bAGBlgR57WcAEHB8cSu895hjmJ0fLPvWscTvOalqqNMH1A7fGz99utgt0vmcEY7MZO8clL3CGYE3eooGKolD2Oj1Ant_AR3P7AwV9GUJayz7hcOmmenPp9HAzRqd5pQnvySjtEyDPfUCMNR0XyJxyERXMLIoFmknW7qBNMUN9OOaYwugn6WKdlRBQZ5aGLszfRpmo0msBTjRReJCqr5gnSy2DofR07jviBmxnWPi8', 1),
  (2, 'JULI 2023', 'Lamaran', 'Satu janji terucap di hadapan keluarga tercinta.', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmGv_ZCXCbihzhM2AkllbJrb0tLZaX0cGDkq0WZjukvIIsyq-l9apt7GKfg2NUbaXqIy4PLEP_Xk3LJLt8eurLtrRwXN6IQXd5cmUOvLuPRGvxK2GoIfXZy4liD3g9rToz4tlnYYV0Op7ojF36ZzX0yUjGDsP7foEUcg-ReMuqPsm05W4aK5lLc7xVY8J-j1ylrHCBQRwc2GWLlgpl-HsmliFywjyc-BEywtWq1XOCkB3VUklS7_LxrGmjrTsISTk2SAbcRiPE-Qk', 2)
ON CONFLICT (id) DO NOTHING;

-- Seed Galleries
INSERT INTO public.galleries (invitation_id, image_url, caption, sort_order) VALUES
  (1, 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6aTkiAQ_xsR5IPTqonZmOo6iqe2RI_WVPoDAtZ10g1L1dJHzZ4Rk69Z1Mi980b301rP-Pji8iE5k1lH8-pvCDNoAnMvYAEzyUPtRPxl6nhKMcVX4vrDybvltBP0mJdgbMxELScybS2b4HPtd_0-zpFESqr9Y4S8oFYsOqJT7O-XVV9XZ2Y2dPC2FTtz6QIl6YF7ZUrE4agEq37PL6kJnyhNCIrumJe8bK73SQu8Td9mjn0WiPYt7NQ3r25xiztSK4Eiz3W2E_w3w', 'Batik Keagungan', 1),
  (1, 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-fynMPqG_cghiPPkVAbYiv34mTHoTmZCtGGG-gO9veJzEk6GXPTEkx6AHzrErCp5Dhz26TXKHG4BV5KPhnjctkaNkhejLXTmIAOjrXLBKdq1mXVzxl36VCVm1V84dqQWHIVq7izHSfMhvgl0MeeRI7riC9ltfmA9lbSYNNedts2qFbCSlDGsdKkgemF2880oXiLMcdO65JYJS4dgXohzePJFdm6aIzHETdH5R0hvj7cDyHXPm1Scc6vOUNw30chVgeQFnDxvxkmU', 'Sentuhan Kasih', 2),
  (1, 'https://lh3.googleusercontent.com/aida-public/AB6AXuAkgTvh1aCNPu9A5dmDBGwwYfAPPWzAxQ_bPRyBTgR3MUHES90eSipKTX7Y9EHion4QNdcf84nruN9tN4wtBhuTtJ65AFSILwdrHj-r-YmvRl_aSM8L6_8hEbzSeAm8iQhwuK0P0EOR2S90h-4xAQFJJYNn5-NN8QLWXneM-vSiiZDnNN9l63cG91x6fzGhfXB0th4sqtP6nJX6zh3oSdZ6-nXTo8E6zbyT9i7xWC40WR4E_S1eEQR6KClIyjDqjvE83Z-BznGDlCg', 'Langkah Bersama', 3)
ON CONFLICT (id) DO NOTHING;

-- Seed Guest RSVPs
INSERT INTO public.admin_guests (invitation_id, name, attendance, comment) VALUES
  (1, 'Andi & Sara', 'hadir', 'Selamat menempuh hidup baru J & M! Semoga cinta kalian selalu mekar seperti bunga di taman surga.'),
  (1, 'Ibu Ratna', 'tidak', 'Doa terbaik untuk kalian berdua. Maaf Ibu tidak bisa hadir secara langsung.')
ON CONFLICT (id) DO NOTHING;
