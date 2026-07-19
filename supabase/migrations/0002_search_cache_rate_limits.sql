create table if not exists public.search_cache (
  query_key text primary key,
  query text not null,
  results jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null,
  constraint search_cache_query_key_length check (char_length(query_key) between 2 and 100),
  constraint search_cache_query_length check (char_length(query) between 2 and 80),
  constraint search_cache_results_array check (jsonb_typeof(results) = 'array')
);

create index if not exists search_cache_expires_at_idx
  on public.search_cache (expires_at);

alter table public.search_cache enable row level security;
revoke all on table public.search_cache from public, anon, authenticated;
grant select, insert, update, delete on table public.search_cache to service_role;

create table if not exists public.search_rate_limits (
  visitor_hash text not null,
  limit_key text not null,
  window_start timestamptz not null,
  request_count integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (visitor_hash, limit_key, window_start),
  constraint search_rate_limits_visitor_hash check (visitor_hash ~ '^[a-f0-9]{64}$'),
  constraint search_rate_limits_limit_key check (limit_key in ('request', 'live')),
  constraint search_rate_limits_request_count check (request_count >= 0)
);

create index if not exists search_rate_limits_updated_at_idx
  on public.search_rate_limits (updated_at);

alter table public.search_rate_limits enable row level security;
revoke all on table public.search_rate_limits from public, anon, authenticated;
grant select, insert, update, delete on table public.search_rate_limits to service_role;

create or replace function public.consume_search_rate_limit(
  p_visitor_hash text,
  p_limit_key text,
  p_limit integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  retry_after_seconds integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_window timestamptz;
  current_count integer;
  window_end timestamptz;
begin
  if p_visitor_hash !~ '^[a-f0-9]{64}$' then
    raise exception 'Invalid visitor identifier';
  end if;

  if p_limit_key not in ('request', 'live') then
    raise exception 'Invalid rate-limit key';
  end if;

  if p_limit < 1 or p_limit > 100 or p_window_seconds < 60 or p_window_seconds > 3600 then
    raise exception 'Invalid rate-limit configuration';
  end if;

  current_window := to_timestamp(
    floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds
  );
  window_end := current_window + make_interval(secs => p_window_seconds);

  insert into public.search_rate_limits as limits (
    visitor_hash,
    limit_key,
    window_start,
    request_count,
    updated_at
  ) values (
    p_visitor_hash,
    p_limit_key,
    current_window,
    1,
    now()
  )
  on conflict (visitor_hash, limit_key, window_start)
  do update set
    request_count = limits.request_count + 1,
    updated_at = now()
  returning request_count into current_count;

  delete from public.search_rate_limits
  where updated_at < now() - interval '2 days';

  return query select
    current_count <= p_limit,
    greatest(p_limit - current_count, 0),
    greatest(ceil(extract(epoch from (window_end - now())))::integer, 1);
end;
$$;

revoke all on function public.consume_search_rate_limit(text, text, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_search_rate_limit(text, text, integer, integer)
  to service_role;
