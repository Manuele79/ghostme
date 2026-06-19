-- GhostMe Database Contract Fix V1
-- Additive and idempotent alignment for contracts already used by the runtime.
-- This migration intentionally does not drop, rename, delete, or enable RLS.

-- House pattern records produced by housePatternEngine and read by
-- userContextGraph. The shape mirrors the existing behavior_patterns contract.
create table if not exists public.house_patterns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  pattern_type text not null,
  title text not null,
  description text,
  place_label text,
  place_id uuid,
  trigger_conditions jsonb,
  learned_from jsonb,
  confidence integer not null default 1,
  occurrences integer not null default 1,
  status text not null default 'learning',
  first_seen_at timestamp with time zone not null default now(),
  last_seen_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

comment on table public.house_patterns is
  'House patterns learned from significant Home Assistant events.';
comment on column public.house_patterns.pattern_type is
  'Stable application-generated identifier for a learned pattern.';

-- Lifecycle identity used by agenda, reminder, and daily briefing cards.
alter table public.ghost_proactive_messages
  add column if not exists logical_key text;

-- Timestamp recorded when a proactive message is handled through a reply or
-- completion action.
alter table public.ghost_proactive_messages
  add column if not exists answered_at timestamp with time zone;

comment on column public.ghost_proactive_messages.logical_key is
  'Stable logical identity used to update proactive cards without duplicates.';
comment on column public.ghost_proactive_messages.answered_at is
  'Timestamp at which the proactive message was answered or completed.';

-- House pattern lookup and ranking indexes. These remain non-unique so the
-- migration cannot fail because of pre-existing duplicate logical patterns.
create index if not exists house_patterns_user_id_idx
  on public.house_patterns (user_id);

create index if not exists house_patterns_status_idx
  on public.house_patterns (status);

create index if not exists house_patterns_user_pattern_type_idx
  on public.house_patterns (user_id, pattern_type);

create index if not exists house_patterns_user_status_confidence_idx
  on public.house_patterns (user_id, status, confidence desc);

create index if not exists house_patterns_user_last_seen_at_idx
  on public.house_patterns (user_id, last_seen_at desc);

create index if not exists house_patterns_updated_at_idx
  on public.house_patterns (updated_at desc);

-- Proactive inbox lookup and lifecycle indexes. logical_key is deliberately
-- non-unique because existing rows may already represent the same logical card.
create index if not exists ghost_proactive_messages_user_id_idx
  on public.ghost_proactive_messages (user_id);

create index if not exists ghost_proactive_messages_status_idx
  on public.ghost_proactive_messages (status);

create index if not exists ghost_proactive_messages_category_idx
  on public.ghost_proactive_messages (category);

create index if not exists ghost_proactive_messages_logical_key_idx
  on public.ghost_proactive_messages (logical_key);

create index if not exists ghost_proactive_messages_user_category_logical_key_idx
  on public.ghost_proactive_messages (user_id, category, logical_key);

create index if not exists ghost_proactive_messages_user_status_created_at_idx
  on public.ghost_proactive_messages (user_id, status, created_at desc);

create index if not exists ghost_proactive_messages_updated_at_idx
  on public.ghost_proactive_messages (updated_at desc);
