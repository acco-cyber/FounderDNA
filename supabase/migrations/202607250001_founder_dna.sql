begin;


create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.founder_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint founder_profiles_profile_object
    check (jsonb_typeof(profile) = 'object')
);

create table if not exists public.evidence_events (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (
    type in (
      'customer_interview',
      'customer_commitment',
      'revenue',
      'expense',
      'marketing',
      'outcome',
      'agent_decision'
    )
  ),
  status text not null default 'unverified'
    check (status in ('unverified', 'verified')),
  amount numeric(16, 2) check (amount is null or amount >= 0),
  currency text not null default 'USD'
    check (currency ~ '^[A-Z]{3}$'),
  customer_ref text,
  source_ref text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint evidence_events_payload_object
    check (jsonb_typeof(payload) = 'object'),
  constraint evidence_events_money_amount
    check (type not in ('revenue', 'expense') or amount is not null),
  constraint evidence_events_verified_source
    check (status <> 'verified' or source_ref is not null)
);

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (
    type in ('founder-sprint', 'evidence-check-in')
  ),
  status text not null check (status in ('completed', 'failed')),
  provider text not null,
  model text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint agent_runs_payload_object
    check (jsonb_typeof(payload) = 'object')
);

create table if not exists public.match_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Founder',
  avatar_url text,
  track text check (track in ('Technical', 'Business', 'Hybrid')),
  headline text not null default '',
  bio text not null default '',
  location text not null default '',
  work_mode text not null default 'Flexible'
    check (work_mode in ('Remote', 'Hybrid', 'In person', 'Flexible')),
  industry text not null default '',
  ambition text not null default 'Still exploring',
  stage text not null default 'Exploring'
    check (
      stage in (
        'Exploring',
        'Idea',
        'Validating',
        'MVP',
        'Pre-seed',
        'Seed',
        'Series A+'
      )
    ),
  equity_expectation text not null default 'Discuss together',
  weekly_hours smallint not null default 10
    check (weekly_hours between 1 and 100),
  skills text[] not null default '{}',
  seeking_skills text[] not null default '{}',
  vision text not null default '',
  linkedin_url text,
  identity_verified boolean not null default false,
  phone_verified boolean not null default false,
  linkedin_verified boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'requested'
    check (status in ('requested', 'accepted', 'passed', 'blocked')),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint connections_distinct_users
    check (requester_id <> recipient_id)
);

create unique index if not exists connections_unique_pair
  on public.connections (
    least(requester_id, recipient_id),
    greatest(requester_id, recipient_id)
  );

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null unique
    references public.connections(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null
    references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (
    char_length(btrim(body)) between 1 and 4000
  ),
  created_at timestamptz not null default now(),
  edited_at timestamptz
);

create table if not exists public.intro_meetings (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null
    references public.connections(id) on delete cascade,
  proposer_id uuid not null references auth.users(id) on delete cascade,
  starts_at timestamptz not null,
  duration_minutes smallint not null default 15
    check (duration_minutes between 10 and 180),
  status text not null default 'proposed'
    check (status in ('proposed', 'accepted', 'declined', 'cancelled')),
  provider text,
  provider_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists evidence_events_user_created_idx
  on public.evidence_events (user_id, created_at desc);
create index if not exists agent_runs_user_created_idx
  on public.agent_runs (user_id, created_at desc);
create index if not exists match_profiles_discovery_idx
  on public.match_profiles (published, track, stage, updated_at desc);
create index if not exists connections_requester_idx
  on public.connections (requester_id, updated_at desc);
create index if not exists connections_recipient_idx
  on public.connections (recipient_id, updated_at desc);
create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at);
create index if not exists intro_meetings_connection_idx
  on public.intro_meetings (connection_id, starts_at);

drop trigger if exists founder_profiles_set_updated_at
  on public.founder_profiles;
create trigger founder_profiles_set_updated_at
before update on public.founder_profiles
for each row execute function public.set_updated_at();

drop trigger if exists match_profiles_set_updated_at
  on public.match_profiles;
create trigger match_profiles_set_updated_at
before update on public.match_profiles
for each row execute function public.set_updated_at();

drop trigger if exists connections_set_updated_at
  on public.connections;
create trigger connections_set_updated_at
before update on public.connections
for each row execute function public.set_updated_at();

drop trigger if exists conversations_set_updated_at
  on public.conversations;
create trigger conversations_set_updated_at
before update on public.conversations
for each row execute function public.set_updated_at();

drop trigger if exists intro_meetings_set_updated_at
  on public.intro_meetings;
create trigger intro_meetings_set_updated_at
before update on public.intro_meetings
for each row execute function public.set_updated_at();

create or replace function public.keep_connection_parties_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.requester_id <> old.requester_id
    or new.recipient_id <> old.recipient_id then
    raise exception 'Connection participants cannot be changed';
  end if;
  return new;
end;
$$;

drop trigger if exists connections_keep_parties_immutable
  on public.connections;
create trigger connections_keep_parties_immutable
before update on public.connections
for each row execute function public.keep_connection_parties_immutable();

create or replace function public.enforce_connection_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
begin
  if new.status = old.status or actor is null then
    return new;
  end if;

  if old.status = 'requested' then
    if actor = old.recipient_id
      and new.status in ('accepted', 'passed', 'blocked') then
      return new;
    end if;
    if actor = old.requester_id
      and new.status in ('passed', 'blocked') then
      return new;
    end if;
  elsif old.status = 'accepted' then
    if actor in (old.requester_id, old.recipient_id)
      and new.status in ('passed', 'blocked') then
      return new;
    end if;
  end if;

  raise exception 'Invalid connection status transition';
end;
$$;

drop trigger if exists connections_enforce_status_transition
  on public.connections;
create trigger connections_enforce_status_transition
before update on public.connections
for each row execute function public.enforce_connection_status_transition();

alter table public.founder_profiles enable row level security;
alter table public.evidence_events enable row level security;
alter table public.agent_runs enable row level security;
alter table public.match_profiles enable row level security;
alter table public.connections enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.intro_meetings enable row level security;

drop policy if exists "Founders manage their private profile"
  on public.founder_profiles;
create policy "Founders manage their private profile"
on public.founder_profiles
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Founders manage their evidence"
  on public.evidence_events;
create policy "Founders manage their evidence"
on public.evidence_events
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Founders manage their agent runs"
  on public.agent_runs;
create policy "Founders manage their agent runs"
on public.agent_runs
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Founders read published matching profiles"
  on public.match_profiles;
create policy "Founders read published matching profiles"
on public.match_profiles
for select
to authenticated
using (published or (select auth.uid()) = user_id);

drop policy if exists "Founders insert their matching profile"
  on public.match_profiles;
create policy "Founders insert their matching profile"
on public.match_profiles
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Founders update their matching profile"
  on public.match_profiles;
create policy "Founders update their matching profile"
on public.match_profiles
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Founders delete their matching profile"
  on public.match_profiles;
create policy "Founders delete their matching profile"
on public.match_profiles
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Participants read connections"
  on public.connections;
create policy "Participants read connections"
on public.connections
for select
to authenticated
using (
  (select auth.uid()) = requester_id
  or (select auth.uid()) = recipient_id
);

drop policy if exists "Founders request connections"
  on public.connections;
create policy "Founders request connections"
on public.connections
for insert
to authenticated
with check (
  (select auth.uid()) = requester_id
  and requester_id <> recipient_id
);

drop policy if exists "Participants update connections"
  on public.connections;
create policy "Participants update connections"
on public.connections
for update
to authenticated
using (
  (select auth.uid()) = requester_id
  or (select auth.uid()) = recipient_id
)
with check (
  (select auth.uid()) = requester_id
  or (select auth.uid()) = recipient_id
);

drop policy if exists "Participants delete connections"
  on public.connections;
create policy "Participants delete connections"
on public.connections
for delete
to authenticated
using (
  (select auth.uid()) = requester_id
  or (select auth.uid()) = recipient_id
);

drop policy if exists "Participants read conversations"
  on public.conversations;
create policy "Participants read conversations"
on public.conversations
for select
to authenticated
using (
  exists (
    select 1
    from public.connections as connection
    where connection.id = conversations.connection_id
      and (
        connection.requester_id = (select auth.uid())
        or connection.recipient_id = (select auth.uid())
      )
  )
);

drop policy if exists "Accepted matches create conversations"
  on public.conversations;
create policy "Accepted matches create conversations"
on public.conversations
for insert
to authenticated
with check (
  exists (
    select 1
    from public.connections as connection
    where connection.id = conversations.connection_id
      and connection.status = 'accepted'
      and (
        connection.requester_id = (select auth.uid())
        or connection.recipient_id = (select auth.uid())
      )
  )
);

drop policy if exists "Participants update conversations"
  on public.conversations;
create policy "Participants update conversations"
on public.conversations
for update
to authenticated
using (
  exists (
    select 1
    from public.connections as connection
    where connection.id = conversations.connection_id
      and (
        connection.requester_id = (select auth.uid())
        or connection.recipient_id = (select auth.uid())
      )
  )
)
with check (
  exists (
    select 1
    from public.connections as connection
    where connection.id = conversations.connection_id
      and (
        connection.requester_id = (select auth.uid())
        or connection.recipient_id = (select auth.uid())
      )
  )
);

drop policy if exists "Participants read messages"
  on public.messages;
create policy "Participants read messages"
on public.messages
for select
to authenticated
using (
  exists (
    select 1
    from public.conversations as conversation
    join public.connections as connection
      on connection.id = conversation.connection_id
    where conversation.id = messages.conversation_id
      and (
        connection.requester_id = (select auth.uid())
        or connection.recipient_id = (select auth.uid())
      )
  )
);

drop policy if exists "Participants send messages"
  on public.messages;
create policy "Participants send messages"
on public.messages
for insert
to authenticated
with check (
  sender_id = (select auth.uid())
  and exists (
    select 1
    from public.conversations as conversation
    join public.connections as connection
      on connection.id = conversation.connection_id
    where conversation.id = messages.conversation_id
      and connection.status = 'accepted'
      and (
        connection.requester_id = (select auth.uid())
        or connection.recipient_id = (select auth.uid())
      )
  )
);

drop policy if exists "Senders update their messages"
  on public.messages;
create policy "Senders update their messages"
on public.messages
for update
to authenticated
using (sender_id = (select auth.uid()))
with check (sender_id = (select auth.uid()));

drop policy if exists "Senders delete their messages"
  on public.messages;
create policy "Senders delete their messages"
on public.messages
for delete
to authenticated
using (sender_id = (select auth.uid()));

drop policy if exists "Participants read intro meetings"
  on public.intro_meetings;
create policy "Participants read intro meetings"
on public.intro_meetings
for select
to authenticated
using (
  exists (
    select 1
    from public.connections as connection
    where connection.id = intro_meetings.connection_id
      and (
        connection.requester_id = (select auth.uid())
        or connection.recipient_id = (select auth.uid())
      )
  )
);

drop policy if exists "Participants propose intro meetings"
  on public.intro_meetings;
create policy "Participants propose intro meetings"
on public.intro_meetings
for insert
to authenticated
with check (
  proposer_id = (select auth.uid())
  and exists (
    select 1
    from public.connections as connection
    where connection.id = intro_meetings.connection_id
      and connection.status = 'accepted'
      and (
        connection.requester_id = (select auth.uid())
        or connection.recipient_id = (select auth.uid())
      )
  )
);

drop policy if exists "Participants update intro meetings"
  on public.intro_meetings;
create policy "Participants update intro meetings"
on public.intro_meetings
for update
to authenticated
using (
  exists (
    select 1
    from public.connections as connection
    where connection.id = intro_meetings.connection_id
      and (
        connection.requester_id = (select auth.uid())
        or connection.recipient_id = (select auth.uid())
      )
  )
)
with check (
  exists (
    select 1
    from public.connections as connection
    where connection.id = intro_meetings.connection_id
      and (
        connection.requester_id = (select auth.uid())
        or connection.recipient_id = (select auth.uid())
      )
  )
);

grant usage on schema public to authenticated;
grant select, insert, update, delete
  on public.founder_profiles,
     public.evidence_events,
     public.agent_runs,
     public.match_profiles,
     public.connections,
     public.conversations,
     public.messages,
     public.intro_meetings
  to authenticated;

create or replace function public.handle_new_founder()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.founder_profiles (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.match_profiles (user_id, display_name)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'display_name', ''),
      nullif(new.raw_user_meta_data ->> 'full_name', ''),
      split_part(coalesce(new.email, 'Founder'), '@', 1),
      'Founder'
    )
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_founder();

insert into public.founder_profiles (user_id)
select id from auth.users
on conflict (user_id) do nothing;

insert into public.match_profiles (user_id, display_name)
select
  id,
  coalesce(
    nullif(raw_user_meta_data ->> 'display_name', ''),
    nullif(raw_user_meta_data ->> 'full_name', ''),
    split_part(coalesce(email, 'Founder'), '@', 1),
    'Founder'
  )
from auth.users
on conflict (user_id) do nothing;

commit;
