-- Solar plans table — canonical, re-runnable migration.
--
-- WHY THIS EXISTS
-- ---------------
-- The admin form writes: name, description, price, capacity, inverter_type,
-- battery_type, panel_type, warranty, best_for, can_power, backup_time, notes,
-- is_active and the `features` JSONB column (category, image, items,
-- installation, accessories, panelWattage, panelCount, totalSolarCapacity).
-- Earlier versions of this project created the table with only a subset of
-- those columns, so INSERT/UPDATE failed with 42703 ("column does not exist")
-- and plans never reached the public website. Every column below uses
-- `add column if not exists` so this file is safe to run repeatedly.
--
-- RLS is also normalised: everyone may read published plans, but only users
-- recognised by public.is_admin() may create, edit or delete them. If the
-- admin can log into the dashboard but writes are denied, their email is
-- missing from public.admin_users — the insert at the bottom fixes that.
create extension if not exists pgcrypto;

create table if not exists public.solar_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric(12, 2) not null default 0,
  capacity text not null default '',
  inverter_type text not null default '',
  battery_type text not null default '',
  panel_type text not null default '',
  warranty text not null default '2 Years Comprehensive Warranty',
  best_for text not null default '',
  can_power jsonb not null default '[]'::jsonb,
  backup_time text not null default '',
  notes text not null default '',
  image text,
  items jsonb not null default '[]'::jsonb,
  features jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.solar_plans add column if not exists price numeric(12, 2) not null default 0;
alter table public.solar_plans add column if not exists capacity text not null default '';
alter table public.solar_plans add column if not exists inverter_type text not null default '';
alter table public.solar_plans add column if not exists battery_type text not null default '';
alter table public.solar_plans add column if not exists panel_type text not null default '';
alter table public.solar_plans add column if not exists warranty text not null default '2 Years Comprehensive Warranty';
alter table public.solar_plans add column if not exists best_for text not null default '';
alter table public.solar_plans add column if not exists can_power jsonb not null default '[]'::jsonb;
alter table public.solar_plans add column if not exists backup_time text not null default '';
alter table public.solar_plans add column if not exists notes text not null default '';
alter table public.solar_plans add column if not exists image text;
alter table public.solar_plans add column if not exists items jsonb not null default '[]'::jsonb;
alter table public.solar_plans add column if not exists features jsonb not null default '{}'::jsonb;
alter table public.solar_plans add column if not exists is_active boolean not null default true;
alter table public.solar_plans add column if not exists created_at timestamptz not null default now();
alter table public.solar_plans add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_solar_plans_created_at on public.solar_plans (created_at desc);
create index if not exists idx_solar_plans_active on public.solar_plans (is_active);

-- Realtime: the website subscribes to this publication to refresh instantly.
do $$
begin
  alter publication supabase_realtime add table public.solar_plans;
exception
  when duplicate_object then null;
end $$;

-- Make sure the dashboard admin is recognised by public.is_admin().
-- Add any other admin emails here (or in the admin_users table) when needed.
insert into public.admin_users (email, active)
values ('cedokamall@gmail.com', true)
on conflict (email) do update set active = true;

alter table public.solar_plans enable row level security;

-- Drop every policy name used by older migrations so no permissive rule remains.
drop policy if exists "Public can read solar plans" on public.solar_plans;
drop policy if exists "public can read solar plans" on public.solar_plans;
drop policy if exists "Authenticated admins can manage solar plans" on public.solar_plans;
drop policy if exists "anon can insert solar plans" on public.solar_plans;
drop policy if exists "anon can update solar plans" on public.solar_plans;
drop policy if exists "anon can delete solar plans" on public.solar_plans;
drop policy if exists "admins can manage solar plans" on public.solar_plans;
drop policy if exists "Admins can insert solar plans" on public.solar_plans;
drop policy if exists "Admins can update solar plans" on public.solar_plans;
drop policy if exists "Admins can delete solar plans" on public.solar_plans;

create policy "Anyone can read published solar plans"
  on public.solar_plans for select to anon, authenticated
  using (true);

create policy "Admins can insert solar plans"
  on public.solar_plans for insert to authenticated
  with check ((select public.is_admin()));

create policy "Admins can update solar plans"
  on public.solar_plans for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "Admins can delete solar plans"
  on public.solar_plans for delete to authenticated
  using ((select public.is_admin()));
