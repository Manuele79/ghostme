import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { upsertProactiveMessage } from "@/lib/ghostme/proactive/proactiveMessageService";

async function recentSuggestionExists(
  userId: string,
  suggestionType: string,
  hours = 6
) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { data } = await supabaseAdmin
    .from("house_suggestions")
    .select("id")
    .eq("user_id", userId)
    .eq("suggestion_type", suggestionType)
    .gte("created_at", since)
    .limit(1)
    .maybeSingle();

  return !!data?.id;
}

async function openSuggestionExists(userId: string, suggestionType: string) {
  const { data } = await supabaseAdmin
    .from("house_suggestions")
    .select("id")
    .eq("user_id", userId)
    .eq("suggestion_type", suggestionType)
    .in("status", ["pending", "learning", "active"])
    .limit(1)
    .maybeSingle();

  return !!data?.id;
}

async function createSuggestion({
  userId,
  title,
  message,
  suggestionType,
  roomKey,
  confidence = 6,
}: {
  userId: string;
  title: string;
  message: string;
  suggestionType: string;
  roomKey?: string | null;
  confidence?: number;
}) {
  const logicalKey = `home_suggestion_${suggestionType}`;

  if (await openSuggestionExists(userId, suggestionType)) {
    await upsertProactiveMessage({
      userId,
      title,
      message,
      category: "home_question",
      priority: 4,
      logicalKey,
    });

    return null;
  }

  if (await recentSuggestionExists(userId, suggestionType)) return null;

  const { data, error } = await supabaseAdmin
    .from("house_suggestions")
    .insert({
      user_id: userId,
      title,
      message,
      suggestion_type: suggestionType,
      room_key: roomKey || null,
      confidence,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.log("HOUSE AUTOMATION SUGGESTION ERROR:", error);
    return null;
  }

  await upsertProactiveMessage({
    userId,
    title,
    message,
    category: "home_question",
    priority: 4,
    logicalKey,
  });

  return data;
}

export async function generateHouseAutomationSuggestions(userId: string) {
  if (!userId) return [];

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: events, error } = await supabaseAdmin
    .from("house_events")
    .select("entity_id, entity_name, entity_type, room_key, event_type, new_state, occurred_at")
    .eq("user_id", userId)
    .gte("occurred_at", since)
    .order("occurred_at", { ascending: true });

  if (error || !events?.length) return [];

  const created: any[] = [];

  const kitchenTvOn = events.filter(
    (e) => e.room_key === "cucina" && e.event_type === "tv_on"
  );

  const kitchenAutoOff = events.filter(
    (e) =>
      e.room_key === "cucina" &&
      e.entity_type === "automation" &&
      e.entity_name?.toLowerCase().includes("off cucina")
  );

  if (kitchenTvOn.length > 0 && kitchenAutoOff.length > 0) {
    const suggestion = await createSuggestion({
      userId,
      title: "Possibile conflitto cucina",
      message:
        "Ho visto eventi della TV cucina e automazioni di spegnimento cucina nello stesso periodo. Vuoi che GhostMe impari a controllare meglio questa situazione prima di suggerire spegnimenti?",
      suggestionType: "automation_kitchen_tv_off_conflict",
      roomKey: "cucina",
      confidence: 7,
    });

    if (suggestion) created.push(suggestion);
  }

  const twoPeopleEvents = events.filter(
    (e: any) =>
      e.event_type === "person_location_changed" ||
      e.entity_id === "person.manuele" ||
      e.entity_id === "person.valentina"
  );

  const aggressiveOffs = events.filter(
    (e) =>
      ["light_off", "switch_off"].includes(e.event_type) &&
      ["salotto", "cucina", "camera"].includes(e.room_key || "")
  );

  if (twoPeopleEvents.length >= 2 && aggressiveOffs.length >= 2) {
    const suggestion = await createSuggestion({
      userId,
      title: "Spegnimenti mentre siete in casa",
      message:
        "Ho visto cambi di presenza delle persone e spegnimenti luci/prese in stanze principali. Vuoi che GhostMe analizzi questi casi per evitare spegnimenti troppo aggressivi quando siete in due?",
      suggestionType: "automation_two_people_auto_off_review",
      confidence: 7,
    });

    if (suggestion) created.push(suggestion);
  }

  const scaleMotion = events.filter(
    (e) => e.room_key === "scale" && e.event_type.startsWith("motion")
  );

  const scaleLightOff = events.filter(
    (e) => e.room_key === "scale" && e.event_type === "light_off"
  );

  if (scaleMotion.length >= 1 && scaleLightOff.length >= 1) {
    const suggestion = await createSuggestion({
      userId,
      title: "Controllo spegnimento scale",
      message:
        "Ho visto movimento sulle scale e spegnimento del LED scale nello stesso periodo. Vuoi che GhostMe tenga d'occhio se lo spegnimento scale è troppo rapido?",
      suggestionType: "automation_scale_light_timing_review",
      roomKey: "scale",
      confidence: 6,
    });

    if (suggestion) created.push(suggestion);
  }

  return created;
}
