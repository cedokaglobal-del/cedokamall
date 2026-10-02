-- Cedokamall security hardening.
--
-- Re-runnable. Run after REVIEWS_SETUP.sql / SOLAR_PLANS_SETUP.sql and after
-- SUPABASE_PRODUCTION_SETUP.sql (which defines public.is_admin()).
--
-- What this changes and why:
--
--  1. Product ratings were recomputed in the browser (read the average, add one,
--     write it back). That is trivially forged and races under concurrency, so
--     the arithmetic now happens inside an atomic SECURITY DEFINER function.
--
--  2. increment_review_helpful() did not exist, so the "Helpful" button on
--     reviews silently failed on every click.
--
--  3. The public reviews INSERT policy let anyone set is_verified = true on
--     their own review, and set any helpful_count. The policy now pins both.
--
--  4. Length limits are enforced in the database, not just in the UI, so a
--     crafted request cannot bloat the table.
--
--  5. Catalog tables (products, solar_plans) are read-only to anonymous
--     visitors; writes require an authenticated admin. Browsers can no longer
--     alter prices or mark plans published.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 1. Atomic product rating
-- ---------------------------------------------------------------------------
create or replace function public.increment_product_rating(
  target_product_id uuid,
  new_rating integer
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_rating numeric(3,2);
  current_reviews integer;
  next_reviews integer;
  next_rating numeric(3,2);
begin
  if new_rating is null or new_rating < 1 or new_rating > 5 then
    raise exception 'rating must be between 1 and 5';
  end if;

  -- Lock the row for the duration so two simultaneous raters cannot interleave
  -- a read-modify-write and lose one another's vote.
  select rating, reviews into current_rating, current_reviews
  from public.products
  where id = target_product_id
  for update;

  if not found then
    raise exception 'product % not found', target_product_id;
  end if;

  current_rating := coalesce(current_rating, 0);
  current_reviews := coalesce(current_reviews, 0);
  next_reviews := current_reviews + 1;
  next_rating := round(((current_rating * current_reviews) + new_rating) / next_reviews::numeric, 1);

  update public.products
  set rating = next_rating,
      reviews = next_reviews
  where id = target_product_id;
end;
$$;

revoke all on function public.increment_product_rating(uuid, integer) from public;
grant execute on function public.increment_product_rating(uuid, integer) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. Helpful votes on reviews (the RPC the review store already calls)
-- ---------------------------------------------------------------------------
create or replace function public.increment_review_helpful(target_review_id uuid)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.reviews
  set helpful_count = helpful_count + 1
  where id = target_review_id;
$$;

revoke all on function public.increment_review_helpful(uuid) from public;
grant execute on function public.increment_review_helpful(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Reviews: hard limits and a safe public insert policy
-- ---------------------------------------------------------------------------
alter table public.reviews drop constraint if exists reviews_name_len;
alter table public.reviews add constraint reviews_name_len
  check (name is null or char_length(name) <= 60);

alter table public.reviews drop constraint if exists reviews_text_len;
alter table public.reviews add constraint reviews_text_len
  check (char_length(text) <= 2000);

alter table public.reviews drop constraint if exists reviews_rating_range;
alter table public.reviews add constraint reviews_rating_range
  check (rating between 1 and 5);

-- Replace the permissive insert policy. is_verified and helpful_count are
-- forced to their defaults no matter what the client sends. Length is handled by
-- the CHECK constraints above, so this only needs the anti-forgery conditions.
-- The parentheses matter: AND binds tighter than OR, so without them the second
-- branch would bypass these checks entirely.
drop policy if exists "Public can add reviews" on public.reviews;
create policy "Public can add reviews" on public.reviews for
insert to anon, authenticated with
  check (is_verified = false and helpful_count = 0);

-- Nobody edits or deletes reviews through the public API; moderation is a server
-- concern and is intentionally absent here rather than left wide open.
drop policy if exists "Public can update reviews" on public.reviews;
drop policy if exists "Public can delete reviews" on public.reviews;

-- ---------------------------------------------------------------------------
-- 4. Catalog is read-only to the public
-- ---------------------------------------------------------------------------
drop policy if exists "Public can read products" on public.products;
drop policy if exists "Public can write products" on public.products;

create policy "Public can read products" on public.products for
select to anon, authenticated using (true);

create policy "Admins can insert products" on public.products for
insert to authenticated with
  check ((select public.is_admin()));

create policy "Admins can update products" on public.products for
update to authenticated using ((select public.is_admin()))
with
  check ((select public.is_admin()));

create policy "Admins can delete products" on public.products for
delete to authenticated using ((select public.is_admin()));

-- Same treatment for solar plans: shoppers can browse, only admins can publish.
drop policy if exists "Authenticated admins can manage solar plans" on public.solar_plans;

create policy "Admins can insert solar plans" on public.solar_plans for
insert to authenticated with
  check ((select public.is_admin()));

create policy "Admins can update solar plans" on public.solar_plans for
update to authenticated using ((select public.is_admin()))
with
  check ((select public.is_admin()));

create policy "Admins can delete solar plans" on public.solar_plans for
delete to authenticated using ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- 5. Review counts on the product row stay consistent with the reviews table
-- ---------------------------------------------------------------------------
create or replace function public.sync_product_review_count(target_product_id uuid)
returns void
language sql
security definer
set search_path = public, pg_temp
as $$
  update public.products p
  set reviews = (
        select count(*) from public.reviews r
        where r.product_id = p.id
      ),
      rating = coalesce((
        select round(avg(r.rating), 1) from public.reviews r
        where r.product_id = p.id
      ), 0)
  where p.id = target_product_id;
$$;

revoke all on function public.sync_product_review_count(uuid) from public;
grant execute on function public.sync_product_review_count(uuid) to service_role;
