-- Restrict audit_log so only admins can read/insert
-- (previously no RLS policy existed on this table)
CREATE POLICY "admin audit log select" ON public.audit_log
  FOR SELECT USING (public.is_admin());

CREATE POLICY "admin audit log insert" ON public.audit_log
  FOR INSERT WITH CHECK (public.is_admin() AND auth.uid() = admin_id);

-- Also add a trigger to auto-log price changes directly in Postgres
-- so audit trail cannot be bypassed by calling Supabase API directly
CREATE OR REPLACE FUNCTION public.log_price_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.audit_log (admin_id, action, target_table, target_id)
  VALUES (auth.uid(), 'update_price', 'prices', NEW.id::text);
  RETURN NEW;
END;
$$;

CREATE TRIGGER prices_audit_trigger
AFTER UPDATE ON public.prices
FOR EACH ROW EXECUTE FUNCTION public.log_price_change();
