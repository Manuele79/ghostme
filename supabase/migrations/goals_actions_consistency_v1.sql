-- Goals <-> Actions Consistency V1
-- Additive and idempotent: existing rows remain valid and unlinked.

alter table public.action_intents
  add column if not exists goal_id uuid;

alter table public.action_intents
  add column if not exists completed_at timestamp with time zone;

alter table public.goals_desires
  add column if not exists needs_review boolean not null default false;

alter table public.goals_desires
  add column if not exists review_requested_at timestamp with time zone;

-- Preserve the best available completion timestamp for legacy rows.
update public.action_intents
set completed_at = updated_at
where status = 'completed'
  and completed_at is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'action_intents_goal_id_fkey'
      and conrelid = 'public.action_intents'::regclass
  ) then
    alter table public.action_intents
      add constraint action_intents_goal_id_fkey
      foreign key (goal_id)
      references public.goals_desires(id)
      on delete set null;
  end if;
end
$$;

create index if not exists action_intents_goal_id_idx
  on public.action_intents (goal_id);

create index if not exists action_intents_user_goal_status_idx
  on public.action_intents (user_id, goal_id, status);

create index if not exists goals_desires_user_review_idx
  on public.goals_desires (user_id, needs_review)
  where needs_review = true;
