-- RUN THIS IN SUPABASE SQL EDITOR: https://supabase.com/dashboard → SQL Editor
-- This fixes missing tables and RLS policies that cause broken features.

-- ============================================
-- 1. TRANSACTIONS TABLE (for order tracking / analytics)
-- ============================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL,
  product_id text NOT NULL,
  product_name text NOT NULL,
  customer_email text NOT NULL DEFAULT '',
  amount numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'NGN',
  quantity integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'completed',
  type text NOT NULL DEFAULT 'sale',
  payment_method text NOT NULL DEFAULT '',
  delivery_method text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'General',
  profit numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon can insert transactions" ON public.transactions;
CREATE POLICY "anon can insert transactions"
ON public.transactions
FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "anon can read transactions" ON public.transactions;
CREATE POLICY "anon can read transactions"
ON public.transactions
FOR SELECT
TO anon
USING (true);

DROP POLICY IF EXISTS "authenticated can manage transactions" ON public.transactions;
CREATE POLICY "authenticated can manage transactions"
ON public.transactions
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 2. FIX PRODUCTS TABLE: allow anon UPDATE for rating
-- ============================================
-- The existing policy only lets authenticated admins update products.
-- We need anon users to be able to update rating/reviews columns.

DROP POLICY IF EXISTS "anon can rate products" ON public.products;
CREATE POLICY "anon can rate products"
ON public.products
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

-- ============================================
-- 3. ADD FEATURES COLUMN if missing
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'features'
  ) THEN
    ALTER TABLE public.products ADD COLUMN features jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- ============================================
-- 4. SOLAR PLANS TABLE (if missing)
-- ============================================
CREATE TABLE IF NOT EXISTS public.solar_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(12,2) NOT NULL DEFAULT 0,
  capacity text NOT NULL DEFAULT '',
  best_for text NOT NULL DEFAULT '',
  can_power jsonb NOT NULL DEFAULT '[]'::jsonb,
  backup_time text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  image text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add columns if table already existed without them
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='solar_plans' AND column_name='best_for') = FALSE THEN
    ALTER TABLE public.solar_plans ADD COLUMN best_for text NOT NULL DEFAULT '';
  END IF;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='solar_plans' AND column_name='can_power') = FALSE THEN
    ALTER TABLE public.solar_plans ADD COLUMN can_power jsonb NOT NULL DEFAULT '[]'::jsonb;
  END IF;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='solar_plans' AND column_name='backup_time') = FALSE THEN
    ALTER TABLE public.solar_plans ADD COLUMN backup_time text NOT NULL DEFAULT '';
  END IF;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='solar_plans' AND column_name='notes') = FALSE THEN
    ALTER TABLE public.solar_plans ADD COLUMN notes text NOT NULL DEFAULT '';
  END IF;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

ALTER TABLE public.solar_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public can read solar plans" ON public.solar_plans;
CREATE POLICY "public can read solar plans"
ON public.solar_plans
FOR SELECT
TO anon, authenticated
USING (true);

DROP POLICY IF EXISTS "anon can insert solar plans" ON public.solar_plans;
CREATE POLICY "anon can insert solar plans"
ON public.solar_plans
FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "anon can update solar plans" ON public.solar_plans;
CREATE POLICY "anon can update solar plans"
ON public.solar_plans
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "anon can delete solar plans" ON public.solar_plans;
CREATE POLICY "anon can delete solar plans"
ON public.solar_plans
FOR DELETE
TO anon
USING (true);

DROP POLICY IF EXISTS "admins can manage solar plans" ON public.solar_plans;
CREATE POLICY "admins can manage solar plans"
ON public.solar_plans
FOR ALL
TO authenticated
USING ((select public.is_admin()))
WITH CHECK ((select public.is_admin()));

-- ============================================
-- 5. ENABLE REALTIME for products (for live updates)
-- ============================================
DO $$
BEGIN
  -- Add products to realtime publication if not already there
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'products' AND schemaname = 'public'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;
END $$;

-- ============================================
-- 6. STORAGE BUCKET for product images (idempotent)
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Allow anon to upload product images (for admin features that don't require auth)
DROP POLICY IF EXISTS "anon can upload product images" ON storage.objects;
CREATE POLICY "anon can upload product images"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (bucket_id = 'product-images');

-- ============================================
-- 7. INSERT YOUR ADMIN EMAIL into admin_users table
-- ============================================
-- Only run this if the admin_users table exists and you need to add yourself
INSERT INTO public.admin_users (email, active)
VALUES ('cedokamall@gmail.com', true)
ON CONFLICT (email) DO UPDATE SET active = true;
