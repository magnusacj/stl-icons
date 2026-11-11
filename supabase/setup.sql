-- STL Icons: feedback and usage database
-- Paste this whole file into Supabase > SQL Editor > New query, then click Run. Safe to run once.
--
-- Security model:
--   * The panel uses the public "anon" key, which can only ADD rows (insert). It cannot read or change anything.
--   * Reading is limited to people signed in to the dashboard with an @stlpartners.com email address.

-- Feedback: requests, "nothing came up" reports, thumbs up/down, removal suggestions
create table if not exists public.feedback (
    id          bigint generated always as identity primary key,
    created_at  timestamptz not null default now(),
    client_time timestamptz,
    kind        text not null check (kind in ('request', 'no_results', 'remove', 'thumbs_up', 'thumbs_down', 'undo_up', 'undo_down')),
    icon_key    text check (length(icon_key) <= 200),
    icon_title  text check (length(icon_title) <= 200),
    query       text check (length(query) <= 200),
    message     text check (length(message) <= 2000),
    name        text check (length(name) <= 100)
);

-- Usage: anonymous insert and search events (no names, no accounts)
create table if not exists public.usage (
    id           bigint generated always as identity primary key,
    created_at   timestamptz not null default now(),
    client_time  timestamptz,
    event        text not null check (event in ('insert', 'search')),
    icon_key     text check (length(icon_key) <= 200),
    icon_title   text check (length(icon_title) <= 200),
    query        text check (length(query) <= 200),
    result_count integer
);

alter table public.feedback enable row level security;
alter table public.usage enable row level security;

-- Anyone using the panel can add rows; nobody can read them with the public key
drop policy if exists "panel can add feedback" on public.feedback;
create policy "panel can add feedback" on public.feedback for insert to anon, authenticated with check (true);
drop policy if exists "panel can add usage" on public.usage;
create policy "panel can add usage" on public.usage for insert to anon, authenticated with check (true);

-- STL staff signed in to the dashboard can read
drop policy if exists "STL staff can read feedback" on public.feedback;
create policy "STL staff can read feedback" on public.feedback for select to authenticated
    using ((auth.jwt() ->> 'email') ilike '%@stlpartners.com');
drop policy if exists "STL staff can read usage" on public.usage;
create policy "STL staff can read usage" on public.usage for select to authenticated
    using ((auth.jwt() ->> 'email') ilike '%@stlpartners.com');

-- Summaries for the dashboard (respect the read rules above)
create or replace view public.icon_votes with (security_invoker = true) as
select icon_key,
       max(icon_title) as icon_title,
       count(*) filter (where kind = 'thumbs_up') - count(*) filter (where kind = 'undo_up')     as thumbs_up,
       count(*) filter (where kind = 'thumbs_down') - count(*) filter (where kind = 'undo_down') as thumbs_down,
       count(*) filter (where kind = 'remove')                                                   as removal_requests
from public.feedback
where icon_key is not null
group by icon_key;

create or replace view public.icon_usage with (security_invoker = true) as
select icon_key, max(icon_title) as icon_title, count(*) as inserts, max(created_at) as last_used
from public.usage
where event = 'insert'
group by icon_key;

create or replace view public.search_terms with (security_invoker = true) as
select lower(trim(query)) as query,
       count(*) as searches,
       min(result_count) as fewest_results,
       max(created_at) as last_searched
from public.usage
where event = 'search' and query is not null
group by lower(trim(query));

grant select on public.icon_votes, public.icon_usage, public.search_terms to authenticated;
revoke select on public.icon_votes, public.icon_usage, public.search_terms from anon;
