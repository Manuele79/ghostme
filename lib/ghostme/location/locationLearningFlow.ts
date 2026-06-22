import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  detectCurrentPlace,
  saveSignificantPlace,
} from "@/lib/ghostme/location/placeService";
import type { UnknownPlaceCandidate } from "@/lib/ghostme/observation/observationEngine";
import { upsertProactiveMessage } from "@/lib/ghostme/proactive/proactiveMessageService";

const LOCATION_CARD_PREFIX = "location_candidate_";

function normalize(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function titleCase(value: string) {
  return value.replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());
}

function categoryFor(alias: string) {
  const value = normalize(alias);
  if (value.includes("supermercato")) return "supermarket";
  if (value.includes("benzinaio") || value.includes("distributore")) return "fuel";
  if (value.includes("palestra")) return "gym";
  if (value.includes("ristorante")) return "restaurant";
  if (value.includes("bar")) return "bar";
  if (value.includes("lavoro") || value.includes("ufficio")) return "work";
  if (value.includes("casa")) return "home";
  if (value.includes("negozio")) return "shop";
  return "unknown";
}

function labelFor(alias: string, category: string) {
  const labels: Record<string, string> = {
    supermarket: "Supermercato",
    fuel: "Benzinaio",
    gym: "Palestra",
    restaurant: "Ristorante",
    bar: "Bar",
    work: "Lavoro",
    home: "Casa",
    shop: "Negozio",
  };
  return labels[category] || titleCase(alias);
}

function extractAlias(message: string) {
  const response = message.split(/risposta\s*:/i).at(-1) || message;
  return response
    .replace(/^sto rispondendo (?:a|alla tua osservazione)[\s\S]*?:\s*/i, "")
    .replace(/^["“”']+|["“”'.!?]+$/g, "")
    .trim()
    .slice(0, 80);
}

export async function writeLocationCandidateCard({
  userId,
  candidate,
}: {
  userId: string;
  candidate: UnknownPlaceCandidate;
}) {
  await upsertProactiveMessage({
    userId,
    title: "Un posto da riconoscere",
    message: "Sei stato più volte qui. Che posto è?",
    category: "curiosity",
    priority: 9,
    logicalKey: `${LOCATION_CARD_PREFIX}${candidate.id}`,
  });
}

export async function resolveLocationCandidateReply({
  userId,
  proactiveMessageId,
  message,
}: {
  userId: string;
  proactiveMessageId?: string | null;
  message: string;
}) {
  if (!userId || !proactiveMessageId) return null;

  const { data: card } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("logical_key, category")
    .eq("id", proactiveMessageId)
    .eq("user_id", userId)
    .maybeSingle();
  const logicalKey = String(card?.logical_key || "");
  if (
    card?.category !== "curiosity" ||
    !logicalKey.startsWith(LOCATION_CARD_PREFIX)
  ) {
    return null;
  }

  const patternId = logicalKey.slice(LOCATION_CARD_PREFIX.length);
  const { data: pattern } = await supabaseAdmin
    .from("behavior_patterns")
    .select("id, trigger_conditions, status")
    .eq("id", patternId)
    .eq("user_id", userId)
    .in("status", ["learning", "active"])
    .maybeSingle();
  if (!pattern) return "Questo luogo è già stato gestito.";

  const alias = extractAlias(message);
  if (!alias || alias.length < 2) {
    return "Dimmi solo che posto è, per esempio: supermercato, benzinaio o palestra.";
  }

  const latitude = Number(pattern.trigger_conditions?.latitude);
  const longitude = Number(pattern.trigger_conditions?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const existing = await detectCurrentPlace({ userId, latitude, longitude });
  const category = categoryFor(alias);
  const place =
    existing ||
    (await saveSignificantPlace({
      userId,
      label: labelFor(alias, category),
      category,
      latitude,
      longitude,
      radiusMeters: Number(pattern.trigger_conditions?.radius_meters || 120),
      externalName: alias,
      confidence: 85,
      source: "location_learning",
    }));
  if (!place) return "Non sono riuscito a salvare questo luogo. Riprova tra poco.";

  const now = new Date().toISOString();
  await Promise.all([
    supabaseAdmin
      .from("behavior_patterns")
      .update({
        place_id: place.id,
        place_label: place.label,
        status: "archived",
        updated_at: now,
      })
      .eq("id", pattern.id)
      .eq("user_id", userId),
    supabaseAdmin
      .from("user_location_state")
      .update({
        current_place_id: place.id,
        current_place_label: place.label,
        place_category: place.category,
        updated_at: now,
      })
      .eq("user_id", userId),
  ]);

  return `Perfetto. Salvo questo posto come ${place.label}.`;
}
