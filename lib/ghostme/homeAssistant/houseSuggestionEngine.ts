import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { buildCognitiveHouse } from "./cognitiveHouseBuilder";
import { analyzeHousePatterns } from "./housePatternEngine";

function hasText(value: string, terms: string[]) {
  const lower = value.toLowerCase();
  return terms.some((t) => lower.includes(t.toLowerCase()));
}

async function recentSuggestionExists(userId: string, suggestionType: string) {
  const since = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

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

async function createHouseSuggestion({
  userId,
  title,
  message,
  suggestionType,
  roomKey,
  confidence = 5,
}: {
  userId: string;
  title: string;
  message: string;
  suggestionType: string;
  roomKey?: string | null;
  confidence?: number;
}) {
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
    console.log("CREATE HOUSE SUGGESTION ERROR:", error);
    return null;
  }

  await supabaseAdmin.from("ghost_proactive_messages").insert({
    user_id: userId,
    title,
    message,
    category: "home_question",
    status: "unread",
    priority: 4,
    scheduled_for: new Date().toISOString(),
  });

  return data;
}

export async function generateHouseSuggestions(userId: string) {
  if (!userId) return [];

  const homeContext = await buildCognitiveHouse();
  const patterns = await analyzeHousePatterns(userId);

  const created: any[] = [];

  const peopleTwo =
    hasText(homeContext, ["Persone probabili in casa: 2"]) ||
    hasText(patterns.join("\n"), ["due persone"]);

  const kitchenActive = hasText(homeContext, [
    "cucina",
    "TV cucina",
    "Lampadario cucina",
    "Luce Lavandino",
    "Smart Presence Sensor",
  ]);

  const lowLight = hasText(homeContext, [
    "1.0 lx",
    "poco luminoso",
    "Illuminamento: 1",
  ]);

  const hotHouse = hasText(homeContext, [
    "27.",
    "28.",
    "29.",
    "30.",
    "temperatura alta",
  ]);

  const tvKitchen = hasText(homeContext, ["TV cucina"]);
  const night = hasText(homeContext, ["È notte"]);

  if (peopleTwo) {
    const suggestion = await createHouseSuggestion({
      userId,
      title: "Casa occupata da due persone",
      message:
        "Sembra che siate in due in casa. Vuoi che GhostMe tenga conto di questo prima di suggerire spegnimenti automatici?",
      suggestionType: "two_people_light_logic",
      confidence: 7,
    });

    if (suggestion) created.push(suggestion);
  }

  if (kitchenActive && tvKitchen && night) {
    const suggestion = await createHouseSuggestion({
      userId,
      title: "Cucina attiva di sera",
      message:
        "La cucina risulta attiva e la TV cucina è accesa. Vuoi che GhostMe consideri questa situazione come zona da non spegnere troppo presto?",
      suggestionType: "kitchen_evening_tv_hold",
      roomKey: "cucina",
      confidence: 7,
    });

    if (suggestion) created.push(suggestion);
  }

  if (lowLight && kitchenActive) {
    const suggestion = await createHouseSuggestion({
      userId,
      title: "Luce bassa rilevata",
      message:
        "La luminosità sembra bassa mentre la zona è attiva. Vuoi che GhostMe impari a suggerire più luce in situazioni simili?",
      suggestionType: "low_light_active_room",
      confidence: 6,
    });

    if (suggestion) created.push(suggestion);
  }

  if (hotHouse) {
    const suggestion = await createHouseSuggestion({
      userId,
      title: "Temperatura alta in casa",
      message:
        "La temperatura sembra alta. Vuoi che GhostMe tenga monitorata questa situazione e ti proponga il clima quando serve?",
      suggestionType: "hot_house_climate",
      confidence: 6,
    });

    if (suggestion) created.push(suggestion);
  }

  return created;
}