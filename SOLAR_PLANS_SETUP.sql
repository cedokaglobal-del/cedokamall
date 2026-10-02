-- Solar plans table.
--
-- Re-runnable: safe to run on a fresh project or on the existing table.
--
-- The original version of this file only created name/description/image/items,
-- but the app writes price, capacity, best_for, can_power, backup_time, notes
-- and is_active as well. Inserts failed with "column does not exist" and the
-- error was swallowed, so plans created in the admin never reached the database
-- and then vanished on the next page load. The `add column if not exists`
-- statements below bring an existing table up to date.
create table if not exists public.solar_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  image text,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.solar_plans add column if not exists price numeric not null default 0;
alter table public.solar_plans add column if not exists capacity text not null default '';
alter table public.solar_plans add column if not exists best_for text not null default '';
alter table public.solar_plans add column if not exists can_power jsonb not null default '[]'::jsonb;
alter table public.solar_plans add column if not exists backup_time text not null default '';
alter table public.solar_plans add column if not exists notes text not null default '';
alter table public.solar_plans add column if not exists is_active boolean not null default true;

create index if not exists idx_solar_plans_created_at on public.solar_plans (created_at desc);

alter table public.solar_plans enable row level security;

-- Policies are dropped and recreated so this file can be run repeatedly.
drop policy if exists "Public can read solar plans" on public.solar_plans;
create policy "Public can read solar plans" on public.solar_plans for
select using (true);

drop policy if exists "Authenticated admins can manage solar plans" on public.solar_plans;
create policy "Authenticated admins can manage solar plans" on public.solar_plans for all to authenticated using (true)
with
    check (true);
