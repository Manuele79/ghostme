-- People Graph Permission Fix V1
-- Server-side graph synchronization uses the service_role client. These grants
-- are table privileges only: they do not create or alter RLS policies.

grant select on table
  public.people_graph,
  public.calendar_events,
  public.episodic_memories,
  public.memories_active,
  public.action_intents,
  public.goals_desires,
  public.people_graph_links
to service_role;

-- Node synchronization writes people_graph directly. Link inserts are handled
-- by the security-definer RPC; link decay updates the existing edge directly.
grant insert, update on table public.people_graph to service_role;
grant update on table public.people_graph_links to service_role;
