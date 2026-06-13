import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getHAStates } from "./haClient";
import { getEntityInfo } from "./homeEntityMapper";

function friendlyName(state: any) {
  return state.attributes?.friendly_name || state.entity_id;
}

function isUsefulEntity(entityType: string) {
  return entityType !== "other";
}

export async function syncHouseEntities(userId: string) {
  if (!userId) return { totalStates: 0, mappedRows: 0, upserted: 0 };

  const states = await getHAStates();

  const rows = states
    .map((state: any) => {
      const info = getEntityInfo(state.entity_id);

      if (!isUsefulEntity(info.type)) return null;

      return {
        user_id: userId,
        entity_id: state.entity_id,
        entity_name: friendlyName(state),
        room_key: info.room || null,
        entity_type: info.type,
        is_useful: true,
        can_trigger_event: true,
        updated_at: new Date().toISOString(),
      };
    })
    .filter(Boolean);

  if (!rows.length) {
    return {
      totalStates: states.length,
      mappedRows: 0,
      upserted: 0,
    };
  }

  const { error } = await supabaseAdmin
    .from("house_entities")
    .upsert(rows, {
      onConflict: "user_id,entity_id",
    });

  if (error) {
    console.log("SYNC HOUSE ENTITIES ERROR:", error);
    return {
      totalStates: states.length,
      mappedRows: rows.length,
      upserted: 0,
      error: error.message,
      details: error.details,
      code: error.code,
    };
  }

  return {
    totalStates: states.length,
    mappedRows: rows.length,
    upserted: rows.length,
  };
}