create table if not exists public.visitor_stats (
  id integer primary key default 1,
  total_visitors bigint not null default 0,
  total_sessions bigint not null default 0,
  total_duration bigint not null default 0,
  updated_at timestamptz not null default now(),
  check (id = 1)
);

insert into public.visitor_stats (id, total_visitors, total_sessions, total_duration)
values (1, 0, 0, 0)
on conflict (id) do nothing;

alter table public.visitor_stats enable row level security;

drop policy if exists "public can read visitor stats" on public.visitor_stats;
create policy "public can read visitor stats"
on public.visitor_stats
for select
to anon, authenticated
using (true);

create or replace function public.increment_visitor_stats(
  is_new_visitor boolean default false,
  is_new_session boolean default false,
  additional_duration integer default 0
)
returns public.visitor_stats
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_row public.visitor_stats;
begin
  insert into public.visitor_stats (id, total_visitors, total_sessions, total_duration)
  values (1, 0, 0, 0)
  on conflict (id) do nothing;

  update public.visitor_stats
  set total_visitors = total_visitors + case when is_new_visitor then 1 else 0 end,
      total_sessions = total_sessions + case when is_new_session then 1 else 0 end,
      total_duration = total_duration + greatest(additional_duration, 0),
      updated_at = now()
  where id = 1
  returning * into updated_row;

  return updated_row;
end;
$$;

revoke all on function public.increment_visitor_stats(boolean, boolean, integer) from public;
grant execute on function public.increment_visitor_stats(boolean, boolean, integer) to anon, authenticated;

do $$
begin
  begin
    alter publication supabase_realtime add table public.visitor_stats;
  exception
    when duplicate_object then null;
    when undefined_object then null;
  end;
end
$$;
