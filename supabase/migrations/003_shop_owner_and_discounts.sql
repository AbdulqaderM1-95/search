-- ============================================================
-- EZsearch — shop owner role + discount columns
-- ============================================================

-- ── Add discount columns to prices ─────────────────────────
ALTER TABLE public.prices
  ADD COLUMN IF NOT EXISTS original_price numeric(10,3),
  ADD COLUMN IF NOT EXISTS discount_ends_at timestamptz;

-- ── Allow shop_owner as a valid role ───────────────────────
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'admin', 'shop_owner'));

-- ── shop_profiles: links a user to their shop ──────────────
CREATE TABLE IF NOT EXISTS public.shop_profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_id uuid NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE
);

ALTER TABLE public.shop_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own shop profile select" ON public.shop_profiles
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "admin manage shop profiles" ON public.shop_profiles
  FOR ALL USING (public.is_admin());

-- ── Helper: return the shop_id of the current shop owner ───
CREATE OR REPLACE FUNCTION public.get_my_shop_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT shop_id FROM public.shop_profiles WHERE user_id = auth.uid();
$$;

-- ── Helper: is the current user a shop owner? ───────────────
CREATE OR REPLACE FUNCTION public.is_shop_owner()
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.shop_profiles WHERE user_id = auth.uid());
$$;

-- ── RLS: shop owners update only their own shop's prices ───
CREATE POLICY "shop owner update own prices" ON public.prices
  FOR UPDATE
  USING (shop_id = public.get_my_shop_id())
  WITH CHECK (shop_id = public.get_my_shop_id());

-- ── Auto-clear expired discounts (call via pg_cron daily) ──
CREATE OR REPLACE FUNCTION public.clear_expired_discounts()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.prices
  SET original_price = NULL, discount_ends_at = NULL
  WHERE discount_ends_at IS NOT NULL AND discount_ends_at < NOW();
END;
$$;

-- Schedule daily expiry check (requires pg_cron extension)
-- Run this separately if pg_cron is enabled on your Supabase project:
-- SELECT cron.schedule('clear-expired-discounts', '0 0 * * *', 'SELECT public.clear_expired_discounts()');
