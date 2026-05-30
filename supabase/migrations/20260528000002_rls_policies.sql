-- 20260528000002_rls_policies.sql

-- 1. Helper function to get the current staff's wo_id
CREATE OR REPLACE FUNCTION public.get_current_wo_id()
RETURNS UUID
LANGUAGE SQL STABLE SECURITY DEFINER
AS $$
  SELECT wo_id FROM public.wo_staff WHERE user_id = auth.uid()
$$;

-- 2. Enable Row Level Security (RLS) on all tenant-scoped tables
ALTER TABLE public.wedding_organization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wo_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wo_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_template ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cust_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cust_comment ENABLE ROW LEVEL SECURITY;

-- 3. Row Level Security Policies

-- Wedding Organization
CREATE POLICY "wo_tenant_isolation" ON public.wedding_organization
  FOR ALL TO authenticated
  USING (id = public.get_current_wo_id());

CREATE POLICY "wo_onboard_insert" ON public.wedding_organization
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- WO Staff
CREATE POLICY "wo_staff_tenant_isolation" ON public.wo_staff
  FOR ALL TO authenticated
  USING (wo_id = public.get_current_wo_id());

CREATE POLICY "wo_staff_onboard_insert" ON public.wo_staff
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Customers
CREATE POLICY "customers_tenant_isolation" ON public.customers
  FOR ALL TO authenticated
  USING (wo_id = public.get_current_wo_id())
  WITH CHECK (wo_id = public.get_current_wo_id());

-- WO Plan
CREATE POLICY "wo_plan_tenant_isolation" ON public.wo_plan
  FOR ALL TO authenticated
  USING (wo_id = public.get_current_wo_id())
  WITH CHECK (wo_id = public.get_current_wo_id());

-- Customer Template
CREATE POLICY "customer_template_tenant_isolation" ON public.customer_template
  FOR ALL TO authenticated
  USING (wo_id = public.get_current_wo_id())
  WITH CHECK (wo_id = public.get_current_wo_id());

-- Public SELECT access for active templates (used by public viewer)
CREATE POLICY "customer_template_public_select" ON public.customer_template
  FOR SELECT TO anon, authenticated
  USING (active = true);

-- Guests (Tamu)
CREATE POLICY "guests_tenant_isolation" ON public.guests
  FOR ALL TO authenticated
  USING (wo_id = public.get_current_wo_id())
  WITH CHECK (wo_id = public.get_current_wo_id());

CREATE POLICY "guests_public_insert" ON public.guests
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "guests_public_select" ON public.guests
  FOR SELECT TO anon, authenticated
  USING (customer_id IN (SELECT customer_id FROM public.customer_template WHERE active = true));

-- Metadata
CREATE POLICY "cust_metadata_tenant_isolation" ON public.cust_metadata
  FOR ALL TO authenticated
  USING (wo_id = public.get_current_wo_id())
  WITH CHECK (wo_id = public.get_current_wo_id());

CREATE POLICY "cust_metadata_public_select" ON public.cust_metadata
  FOR SELECT TO anon, authenticated
  USING (customer_template_id IN (SELECT id FROM public.customer_template WHERE active = true));

-- Comment (Buku Tamu)
CREATE POLICY "cust_comment_tenant_isolation" ON public.cust_comment
  FOR ALL TO authenticated
  USING (wo_id = public.get_current_wo_id())
  WITH CHECK (wo_id = public.get_current_wo_id());

CREATE POLICY "cust_comment_public_insert" ON public.cust_comment
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "cust_comment_public_select" ON public.cust_comment
  FOR SELECT TO anon, authenticated
  USING (customer_id IN (SELECT customer_id FROM public.customer_template WHERE active = true));
