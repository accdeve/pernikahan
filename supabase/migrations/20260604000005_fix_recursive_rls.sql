-- ============================================================
-- Migration: Fix Recursive RLS between Customers and Invitations
-- ============================================================

-- 1. Create a SECURITY DEFINER helper function to check if a customer has an invitation.
-- This runs with bypassrls/owner privileges, avoiding recursion.
CREATE OR REPLACE FUNCTION public.has_active_invitation(cust_id UUID)
RETURNS BOOLEAN SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.invitations WHERE customer_id = cust_id
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Drop and recreate the SELECT policy on customers using the helper function
DROP POLICY IF EXISTS "Allow public select for customers with invitations" ON public.customers;

CREATE POLICY "Allow public select for customers with invitations" ON public.customers
    FOR SELECT TO public USING (public.has_active_invitation(id));
