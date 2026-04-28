/* create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index if not exists admin_users_email_lower_idx
on public.admin_users (lower(email));

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      and active = true
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  price numeric(12,2) not null check (price > 0),
  original_price numeric(12,2) check (original_price is null or original_price > 0),
  image text not null,
  images jsonb not null default '[]'::jsonb,
  category text not null,
  stock integer not null default 0 check (stock >= 0),
  seller text not null,
  rating numeric(3,2) not null default 0 check (rating >= 0 and rating <= 5),
  reviews integer not null default 0 check (reviews >= 0),
  badge text,
  specs jsonb not null default '{}'::jsonb,
  warranty text,
  sku text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(images) = 'array'),
  check (jsonb_typeof(specs) = 'object')
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
before update on public.products
for each row
execute function public.touch_updated_at();

alter table public.admin_users enable row level security;
alter table public.products enable row level security;

drop policy if exists "admins can read admin users" on public.admin_users;
create policy "admins can read admin users"
on public.admin_users
for select
to authenticated
using ((select public.is_admin()));

drop policy if exists "public can read products" on public.products;
create policy "public can read products"
on public.products
for select
to anon, authenticated
using (true);

drop policy if exists "admins can insert products" on public.products;
create policy "admins can insert products"
on public.products
for insert
to authenticated
with check ((select public.is_admin()));

drop policy if exists "admins can update products" on public.products;
create policy "admins can update products"
on public.products
for update
to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

drop policy if exists "admins can delete products" on public.products;
create policy "admins can delete products"
on public.products
for delete
to authenticated
using ((select public.is_admin()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can view product images" on storage.objects;
create policy "public can view product images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "admins can upload product images" on storage.objects;
create policy "admins can upload product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and (select public.is_admin())
);

drop policy if exists "admins can update product images" on storage.objects;
create policy "admins can update product images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and (select public.is_admin())
)
with check (
  bucket_id = 'product-images'
  and (select public.is_admin())
);

drop policy if exists "admins can delete product images" on storage.objects;
create policy "admins can delete product images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and (select public.is_admin())
);
 */