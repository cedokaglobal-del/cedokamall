-- Run this migration in Supabase before using the Solar Plans admin screen.
create table if not exists public.solar_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  image text,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.solar_plans enable row level security;

create policy "Public can read solar plans" on public.solar_plans for
select using (true);

create policy "Authenticated admins can manage solar plans" on public.solar_plans for all to authenticated using (true)
with
    check (true);