import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function buildHouseAutomationContext(
  userId: string
): Promise<string> {
  if (!userId) return "";

  const { data, error } = await supabaseAdmin
    .from("house_events")
    .select("entity_id, entity_name, room_key")
    .eq("user_id", userId)
    .eq("entity_type", "automation")
    .limit(100);

  if (error || !data?.length) {
    return "";
  }

  const unique = new Map<string, any>();

  for (const row of data) {
    unique.set(row.entity_id, row);
  }

  const automations = [...unique.values()];

  const lines = automations.map((a) => {
    const room = a.room_key || "generale";

    return `- ${a.entity_name} (stanza: ${room})`;
  });

  return `
AUTOMAZIONI CASA CONOSCIUTE:

${lines.join("\n")}

REGOLE:
- GhostMe NON modifica automazioni.
- GhostMe può analizzarle.
- GhostMe può suggerire miglioramenti.
- GhostMe può collegarle a pattern e abitudini.
- GhostMe può spiegare cosa fanno.
`;
}