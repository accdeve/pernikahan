-- ============================================================
-- Migration: Enable Row Level Security (RLS) and Create Core Policies
-- ============================================================

-- 1. Create Security Helper Functions
CREATE OR REPLACE FUNCTION public.is_wo_admin(wo_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.wedding_organization wo
    WHERE wo.id = wo_id AND wo.email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.is_invitation_admin(inv_id INT)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.invitations inv
    JOIN public.customers c ON inv.customer_id = c.id
    JOIN public.wedding_organization wo ON c.wo_id = wo.id
    WHERE inv.id = inv_id AND wo.email = auth.jwt() ->> 'email'
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Enable RLS on all MVP tables
ALTER TABLE public.plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_organization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cust_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cust_comment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wo_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_guests ENABLE ROW LEVEL SECURITY;

-- 3. Define Policies

-- Plan catalog (Public SELECT, write restricted)
CREATE POLICY "Allow public select on plan" ON public.plan
    FOR SELECT TO public USING (true);

-- Templates catalog (Public SELECT, write restricted)
CREATE POLICY "Allow public select on templates" ON public.templates
    FOR SELECT TO public USING (true);

-- Plan template relations (Public SELECT, write restricted)
CREATE POLICY "Allow public select on plan_template" ON public.plan_template
    FOR SELECT TO public USING (true);

-- Wedding Organization
CREATE POLICY "Allow admin select for own WO" ON public.wedding_organization
    FOR SELECT TO authenticated USING (email = auth.jwt() ->> 'email');

CREATE POLICY "Allow admin insert/update/delete for own WO" ON public.wedding_organization
    FOR ALL TO authenticated USING (email = auth.jwt() ->> 'email') WITH CHECK (email = auth.jwt() ->> 'email');

-- Customers
CREATE POLICY "Allow public select for customers with invitations" ON public.customers
    FOR SELECT TO public USING (EXISTS (SELECT 1 FROM public.invitations inv WHERE inv.customer_id = customers.id));

CREATE POLICY "Allow admin all operations on customers" ON public.customers
    FOR ALL TO authenticated USING (public.is_wo_admin(wo_id)) WITH CHECK (public.is_wo_admin(wo_id));

-- Customer Template
CREATE POLICY "Allow admin all operations on customer_template" ON public.customer_template
    FOR ALL TO authenticated USING (public.is_wo_admin(wo_id)) WITH CHECK (public.is_wo_admin(wo_id));

-- Customer Event Metadata
CREATE POLICY "Allow public select on cust_metadata" ON public.cust_metadata
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin all operations on cust_metadata" ON public.cust_metadata
    FOR ALL TO authenticated USING (public.is_wo_admin(wo_id)) WITH CHECK (public.is_wo_admin(wo_id));

-- Guests
CREATE POLICY "Allow public select on guests" ON public.guests
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert on guests" ON public.guests
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow public update on guests" ON public.guests
    FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE POLICY "Allow admin all operations on guests" ON public.guests
    FOR ALL TO authenticated USING (public.is_wo_admin(wo_id)) WITH CHECK (public.is_wo_admin(wo_id));

-- Guest Comments (Buku Tamu)
CREATE POLICY "Allow public select on cust_comment" ON public.cust_comment
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert on cust_comment" ON public.cust_comment
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow admin all operations on cust_comment" ON public.cust_comment
    FOR ALL TO authenticated USING (public.is_wo_admin(wo_id)) WITH CHECK (public.is_wo_admin(wo_id));

-- Invitations
CREATE POLICY "Allow public select on invitations" ON public.invitations
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin all operations on invitations" ON public.invitations
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.customers c
            WHERE c.id = customer_id AND public.is_wo_admin(c.wo_id)
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.customers c
            WHERE c.id = customer_id AND public.is_wo_admin(c.wo_id)
        )
    );

-- Stories (Love Story)
CREATE POLICY "Allow public select on stories" ON public.stories
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin all operations on stories" ON public.stories
    FOR ALL TO authenticated USING (public.is_invitation_admin(invitation_id)) WITH CHECK (public.is_invitation_admin(invitation_id));

-- Galleries (Photo Gallery)
CREATE POLICY "Allow public select on galleries" ON public.galleries
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow admin all operations on galleries" ON public.galleries
    FOR ALL TO authenticated USING (public.is_invitation_admin(invitation_id)) WITH CHECK (public.is_invitation_admin(invitation_id));

-- WO Plan (WO ↔ Plan subscription)
CREATE POLICY "Allow admin select on own wo_plan" ON public.wo_plan
    FOR SELECT TO authenticated USING (public.is_wo_admin(wo_id));

CREATE POLICY "Allow admin all operations on own wo_plan" ON public.wo_plan
    FOR ALL TO authenticated USING (public.is_wo_admin(wo_id)) WITH CHECK (public.is_wo_admin(wo_id));

-- Admin Guests (RSVPs via admin/public panel)
CREATE POLICY "Allow public select on admin_guests" ON public.admin_guests
    FOR SELECT TO public USING (true);

CREATE POLICY "Allow public insert on admin_guests" ON public.admin_guests
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Allow admin all operations on admin_guests" ON public.admin_guests
    FOR ALL TO authenticated USING (public.is_invitation_admin(invitation_id)) WITH CHECK (public.is_invitation_admin(invitation_id));
