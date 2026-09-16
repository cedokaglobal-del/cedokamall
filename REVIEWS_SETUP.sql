-- Run this migration in Supabase before the shared customer reviews work.
-- It creates a public reviews table so every visitor sees the same reviews,
-- not just the ones saved in their own browser.
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text,
  rating integer not null check (rating between 1 and 5),
  text text not null default '',
  is_verified boolean not null default false,
  helpful_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_reviews_product_id on public.reviews (product_id);
create index if not exists idx_reviews_created_at on public.reviews (created_at desc);

alter table public.reviews enable row level security;

create policy "Public can read reviews" on public.reviews for
select using (true);

-- Anyone can add a review (read only text/rating), no auth required for a storefront.
create policy "Public can add reviews" on public.reviews for
insert with
  check (true);