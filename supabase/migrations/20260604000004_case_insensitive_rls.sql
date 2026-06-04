-- ============================================================
-- Migration: Case Insensitive Email Checks in RLS Policies
-- ============================================================

-- 1. Recreate helper functions with LOWER comparison
CREATE OR REPLACE FUNCTION public.is_wo_admin(wo_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.wedding_organization wo
    WHERE wo.id = wo_id AND LOWER(wo.email) = LOWER(auth.jwt() ->> 'email')
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
    WHERE inv.id = inv_id AND LOWER(wo.email) = LOWER(auth.jwt() ->> 'email')
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Drop and recreate wedding_organization policies to be case-insensitive
DROP POLICY IF EXISTS "Allow admin select for own WO" ON public.wedding_organization;
DROP POLICY IF EXISTS "Allow admin insert/update/delete for own WO" ON public.wedding_organization;

CREATE POLICY "Allow admin select for own WO" ON public.wedding_organization
    FOR SELECT TO authenticated USING (LOWER(email) = LOWER(auth.jwt() ->> 'email'));

CREATE POLICY "Allow admin insert/update/delete for own WO" ON public.wedding_organization
    FOR ALL TO authenticated USING (LOWER(email) = LOWER(auth.jwt() ->> 'email')) WITH CHECK (LOWER(email) = LOWER(auth.jwt() ->> 'email'));
