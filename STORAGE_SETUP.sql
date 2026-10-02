-- Supabase Storage for product and solar plan images.
--
-- Re-runnable. Run after SUPABASE_PRODUCTION_SETUP.sql (needs public.is_admin()).
--
-- Why: images used to be read into the browser as base64 and written straight
-- into a text column on the table. Base64 inflates payloads by about a third, so
-- a 1 MB photo became a ~1.4 MB row value, which is close to the REST payload
-- limit and bloats every table read. A storage bucket keeps the row holding a
-- short URL and serves the bytes from the CDN.
--
-- Existing rows that already contain a base64 data URL keep working: the UI
-- renders whatever is in the column, whether it is a data URL or an https URL.
-- Re-upload an image to migrate a given row.
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'solar-plan-images',
  'solar-plan-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public bucket, so reads are open to everyone (images are meant to be public).
drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images" on storage.objects for
select to anon, authenticated using (bucket_id in ('product-images', 'solar-plan-images'));

-- Uploads are admin-only. Anonymous visitors can browse imagery but cannot
-- push files into the bucket.
drop policy if exists "Public can upload product images" on storage.objects;
create policy "Admins can upload product images" on storage.objects for
insert to authenticated with
  check (
    bucket_id in ('product-images', 'solar-plan-images')
    and (select public.is_admin())
  );

drop policy if exists "Public can update product images" on storage.objects;
create policy "Admins can update product images" on storage.objects for
update to authenticated using (
    bucket_id in ('product-images', 'solar-plan-images')
    and (select public.is_admin())
  )
with
  check (
    bucket_id in ('product-images', 'solar-plan-images')
    and (select public.is_admin())
  );

drop policy if exists "Public can delete product images" on storage.objects;
create policy "Admins can delete product images" on storage.objects for
delete to authenticated using (
    bucket_id in ('product-images', 'solar-plan-images')
    and (select public.is_admin())
  );
