-- People Graph System V1
-- Evolves the two existing graph tables. No new table is introduced.

alter table public.people_graph_links
  add column if not exists target_key text,
  add column if not exists evidences jsonb not null default '[]'::jsonb,
  add column if not exists status text not null default 'active',
  add column if not exists last_reinforced_at timestamp with time zone,
  add column if not exists last_decayed_at timestamp with time zone;

-- Preserve the legacy single evidence, when present, as the first evidence item.
update public.people_graph_links
set evidences = jsonb_build_array(
  jsonb_build_object(
    'key', 'legacy:' || id::text,
    'source_type', 'legacy',
    'note', evidence,
    'observed_at', coalesce(updated_at, created_at, now()),
    'polarity', 'neutral'
  )
)
where evidence is not null
  and btrim(evidence) <> ''
  and evidences = '[]'::jsonb;

update public.people_graph_links
set target_key = coalesce(target_id::text, lower(btrim(target_label)))
where target_key is null or btrim(target_key) = '';

update public.people_graph_links
set last_reinforced_at = coalesce(updated_at, created_at, now())
where last_reinforced_at is null;

-- Preserve any legacy row that did not have an addressable target.
update public.people_graph_links
set target_key = 'legacy:' || id::text
where target_key is null or btrim(target_key) = '';

alter table public.people_graph_links
  alter column target_key set not null;

alter table public.people_graph_links
  drop constraint if exists people_graph_links_target_type_check;

alter table public.people_graph_links
  add constraint people_graph_links_target_type_check check (
    target_type in (
      'person',
      'calendar_event',
      'episodic_memory',
      'memory',
      'action_intent',
      'goal',
      'place',
      'topic',
      'project',
      'observation'
    )
  );

alter table public.people_graph_links
  drop constraint if exists people_graph_links_weight_check;

alter table public.people_graph_links
  add constraint people_graph_links_weight_check check (weight between 0 and 100);

alter table public.people_graph_links
  drop constraint if exists people_graph_links_confidence_check;

alter table public.people_graph_links
  add constraint people_graph_links_confidence_check check (confidence between 0 and 100);

alter table public.people_graph_links
  drop constraint if exists people_graph_links_status_check;

alter table public.people_graph_links
  add constraint people_graph_links_status_check check (
    status in ('active', 'weak', 'decayed', 'archived')
  );

-- A logical edge exists once. target_key also covers future label-addressed targets.
create unique index if not exists people_graph_links_logical_edge_uidx
  on public.people_graph_links (
    user_id,
    person_id,
    target_type,
    target_key,
    link_type
  );

create index if not exists people_graph_links_person_active_idx
  on public.people_graph_links (user_id, person_id, status, weight desc);

create index if not exists people_graph_links_target_active_idx
  on public.people_graph_links (user_id, target_type, target_key, status, weight desc);

create index if not exists people_graph_links_updated_at_idx
  on public.people_graph_links (updated_at desc);

comment on column public.people_graph_links.target_key is
  'Stable identity of the target: target UUID when available, otherwise a normalized external key.';
comment on column public.people_graph_links.evidences is
  'Append-only, key-deduplicated observations. Contradictory items are retained through polarity.';
comment on column public.people_graph_links.status is
  'Lifecycle state of the edge; contradiction resolution is intentionally outside this table.';

-- Atomic and idempotent edge reinforcement. Person-to-person pairs are
-- canonicalized so A<->B and B<->A resolve to the same row.
create or replace function public.upsert_people_graph_link(
  p_user_id uuid,
  p_person_id uuid,
  p_target_type text,
  p_target_id uuid,
  p_target_key text,
  p_target_label text,
  p_link_type text,
  p_weight integer,
  p_confidence integer,
  p_evidence jsonb
)
returns public.people_graph_links
language plpgsql
security definer
set search_path = public
as $$
declare
  v_person_id uuid := p_person_id;
  v_target_id uuid := p_target_id;
  v_target_key text := coalesce(nullif(btrim(p_target_key), ''), p_target_id::text);
  v_target_label text := p_target_label;
  v_evidence jsonb := coalesce(p_evidence, '{}'::jsonb);
  v_result public.people_graph_links;
begin
  if not exists (
    select 1 from public.people_graph
    where id = p_person_id and user_id = p_user_id
  ) then
    raise exception 'people_graph person does not belong to user';
  end if;

  if v_evidence ->> 'key' is null then
    v_evidence := '{}'::jsonb;
  end if;

  if p_target_type = 'person' and (
    p_target_id is null or not exists (
      select 1 from public.people_graph
      where id = p_target_id and user_id = p_user_id
    )
  ) then
    raise exception 'people_graph target person does not belong to user';
  end if;

  if p_target_type = 'person' and p_target_id is not null
     and p_target_id::text < p_person_id::text then
    v_person_id := p_target_id;
    v_target_id := p_person_id;
    v_target_key := p_person_id::text;
    v_target_label := null;
  end if;

  if v_target_key is null then
    raise exception 'people_graph_link requires target_id or target_key';
  end if;

  insert into public.people_graph_links (
    user_id,
    person_id,
    target_type,
    target_id,
    target_key,
    target_label,
    link_type,
    weight,
    confidence,
    evidence,
    evidences,
    status,
    last_reinforced_at,
    updated_at
  ) values (
    p_user_id,
    v_person_id,
    p_target_type,
    v_target_id,
    v_target_key,
    v_target_label,
    coalesce(nullif(btrim(p_link_type), ''), 'related_to'),
    greatest(0, least(100, p_weight)),
    greatest(0, least(100, p_confidence)),
    nullif(v_evidence ->> 'note', ''),
    case when v_evidence = '{}'::jsonb then '[]'::jsonb
         else jsonb_build_array(v_evidence) end,
    'active',
    now(),
    now()
  )
  on conflict (user_id, person_id, target_type, target_key, link_type)
  do update set
    target_id = coalesce(excluded.target_id, people_graph_links.target_id),
    target_label = coalesce(excluded.target_label, people_graph_links.target_label),
    weight = case
      when excluded.evidences = '[]'::jsonb then greatest(people_graph_links.weight, excluded.weight)
      when exists (
        select 1 from jsonb_array_elements(people_graph_links.evidences) item
        where item ->> 'key' = excluded.evidences -> 0 ->> 'key'
      ) then people_graph_links.weight
      else least(100, people_graph_links.weight + excluded.weight)
    end,
    confidence = case
      when excluded.evidences = '[]'::jsonb then greatest(people_graph_links.confidence, excluded.confidence)
      when exists (
        select 1 from jsonb_array_elements(people_graph_links.evidences) item
        where item ->> 'key' = excluded.evidences -> 0 ->> 'key'
      ) then people_graph_links.confidence
      else greatest(people_graph_links.confidence, excluded.confidence)
    end,
    evidence = coalesce(excluded.evidence, people_graph_links.evidence),
    evidences = case
      when excluded.evidences = '[]'::jsonb then people_graph_links.evidences
      when exists (
        select 1 from jsonb_array_elements(people_graph_links.evidences) item
        where item ->> 'key' = excluded.evidences -> 0 ->> 'key'
      ) then people_graph_links.evidences
      else people_graph_links.evidences || excluded.evidences
    end,
    status = case
      when excluded.evidences = '[]'::jsonb then 'active'
      when exists (
        select 1 from jsonb_array_elements(people_graph_links.evidences) item
        where item ->> 'key' = excluded.evidences -> 0 ->> 'key'
      ) then people_graph_links.status
      else 'active'
    end,
    last_reinforced_at = case
      when excluded.evidences = '[]'::jsonb then now()
      when exists (
        select 1 from jsonb_array_elements(people_graph_links.evidences) item
        where item ->> 'key' = excluded.evidences -> 0 ->> 'key'
      ) then people_graph_links.last_reinforced_at
      else now()
    end,
    updated_at = now()
  returning * into v_result;

  return v_result;
end;
$$;

revoke all on function public.upsert_people_graph_link(
  uuid, uuid, text, uuid, text, text, text, integer, integer, jsonb
) from public;
grant execute on function public.upsert_people_graph_link(
  uuid, uuid, text, uuid, text, text, text, integer, integer, jsonb
) to service_role;
