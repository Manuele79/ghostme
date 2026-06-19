-- Calendar + Agenda + Reminder Unification V1
-- Additive/idempotent contract cleanup for the unified runtime pipeline.

update public.calendar_events
set start_at = remind_at,
    updated_at = now()
where type = 'reminder'
  and start_at is null
  and remind_at is not null;

-- Recover deterministic daily keys for legacy agenda cards.
update public.ghost_proactive_messages
set logical_key = 'agenda_' ||
  to_char(created_at at time zone 'Europe/Rome', 'YYYY-MM-DD'),
  updated_at = now()
where category = 'agenda'
  and logical_key is null;

-- Legacy reminders cannot be safely attached to an event without its UUID.
update public.ghost_proactive_messages
set status = 'expired',
    updated_at = now()
where category = 'reminder'
  and logical_key is null
  and status in ('unread', 'read', 'dismissed');

-- Keep only the newest visible card for each structured identity.
with ranked as (
  select id,
         row_number() over (
           partition by user_id, category, logical_key
           order by created_at desc, id desc
         ) as row_number
  from public.ghost_proactive_messages
  where logical_key is not null
)
update public.ghost_proactive_messages as message
set status = 'expired',
    updated_at = now()
from ranked
where message.id = ranked.id
  and ranked.row_number > 1
  and message.status in ('unread', 'read');

create unique index if not exists ghost_proactive_messages_visible_logical_key_uidx
  on public.ghost_proactive_messages (user_id, category, logical_key)
  where logical_key is not null
    and status in ('unread', 'read');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'calendar_events_type_time_contract'
      and conrelid = 'public.calendar_events'::regclass
  ) then
    alter table public.calendar_events
      add constraint calendar_events_type_time_contract
      check (
        (type = 'appointment' and start_at is not null)
        or
        (type = 'reminder' and remind_at is not null and start_at is not null)
        or
        (type in ('note', 'voice_note'))
      );
  end if;
end
$$;
