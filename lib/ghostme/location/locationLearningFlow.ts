import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  distanceMeters,
  findSignificantPlaceNear,
  getSignificantPlaces,
  saveSignificantPlace,
  updateSignificantPlace,
} from "@/lib/ghostme/location/placeService";
import { classifyLocationState } from "@/lib/ghostme/location/locationStateFreshness";
import type { UnknownPlaceCandidate } from "@/lib/ghostme/observation/observationEngine";
import { upsertProactiveMessage } from "@/lib/ghostme/proactive/proactiveMessageService";

export const LOCATION_CARD_PREFIX = "location_candidate_";

const ALLOWED_CATEGORIES = new Set([
  "home",
  "work",
  "supermarket",
  "fuel",
  "bar",
  "restaurant",
  "gym",
  "shop",
  "park",
  "friend_relative",
  "other",
]);

function formatVisit(value: string) {
  const date = new Date(value);
  const day = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Rome",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const time = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
  if (day === today) return `oggi alle ${time}`;
  return new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDistance(meters: number) {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`;
}

function candidateWindowDays(candidate: Pick<UnknownPlaceCandidate, "firstSeenAt" | "lastSeenAt">) {
  const duration = Math.max(
    0,
    new Date(candidate.lastSeenAt).getTime() - new Date(candidate.firstSeenAt).getTime()
  );
  return Math.max(1, Math.ceil(duration / (24 * 60 * 60 * 1000)) + 1);
}

async function homeDistance(userId: string, latitude: number, longitude: number) {
  const places = await getSignificantPlaces(userId);
  const homes = places.filter((place) =>
    place.category === "home" || /\b(casa|home)\b/i.test(String(place.label || ""))
  );
  if (!homes.length) return null;
  return Math.min(
    ...homes.map((place) =>
      distanceMeters(latitude, longitude, Number(place.latitude), Number(place.longitude))
    )
  );
}

function candidateMessage(
  candidate: UnknownPlaceCandidate,
  distanceFromHome: number | null
) {
  const details = [
    `Ultima visita: ${formatVisit(candidate.lastSeenAt)}.`,
    distanceFromHome === null
      ? null
      : `Distanza approssimativa da Casa: ${formatDistance(distanceFromHome)}.`,
    `Confidenza: ${Math.round(candidate.confidence * 10)}%.`,
    candidate.suggestedCategory
      ? `Categoria suggerita: ${candidate.suggestedCategory}.`
      : null,
  ].filter(Boolean);

  return `Sei stato ${candidate.occurrences} volte in questo punto negli ultimi ${candidateWindowDays(candidate)} giorni. ${details.join(" ")} Vuoi salvarlo come luogo?`;
}

export function isLocationCandidateLogicalKey(value: unknown) {
  return String(value || "").startsWith(LOCATION_CARD_PREFIX);
}

export async function writeLocationCandidateCard({
  userId,
  candidate,
}: {
  userId: string;
  candidate: UnknownPlaceCandidate;
}) {
  const distanceFromHome = await homeDistance(
    userId,
    candidate.latitude,
    candidate.longitude
  );
  await upsertProactiveMessage({
    userId,
    title: "Completa questo luogo",
    message: candidateMessage(candidate, distanceFromHome),
    category: "curiosity",
    priority: 9,
    logicalKey: `${LOCATION_CARD_PREFIX}${candidate.id}`,
  });
}

async function loadCandidate(userId: string, proactiveMessageId: string) {
  const { data: card } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id, logical_key, message, status")
    .eq("id", proactiveMessageId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!card || !isLocationCandidateLogicalKey(card.logical_key)) return null;

  const patternId = String(card.logical_key).slice(LOCATION_CARD_PREFIX.length);
  const { data: pattern } = await supabaseAdmin
    .from("behavior_patterns")
    .select("id, trigger_conditions, learned_from, confidence, occurrences, first_seen_at, last_seen_at, status")
    .eq("id", patternId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!pattern) return null;
  return { card, pattern };
}

export async function getLocationCandidateDetails({
  userId,
  proactiveMessageId,
}: {
  userId: string;
  proactiveMessageId: string;
}) {
  const candidate = await loadCandidate(userId, proactiveMessageId);
  if (!candidate) return null;
  return {
    id: candidate.card.id,
    message: candidate.card.message,
    occurrences: Number(candidate.pattern.occurrences || 0),
    confidence: Number(candidate.pattern.confidence || 0),
    suggestedCategory:
      candidate.pattern.trigger_conditions?.suggested_category || null,
    completed: candidate.pattern.status === "archived",
  };
}

export async function completeLocationCandidate({
  userId,
  proactiveMessageId,
  label,
  category,
}: {
  userId: string;
  proactiveMessageId: string;
  label: string;
  category: string;
}) {
  const cleanLabel = label.trim().slice(0, 80);
  if (cleanLabel.length < 2 || !ALLOWED_CATEGORIES.has(category)) {
    throw new Error("Dati luogo non validi");
  }
  const candidate = await loadCandidate(userId, proactiveMessageId);
  if (!candidate || candidate.pattern.status === "archived") {
    throw new Error("Candidato luogo non disponibile");
  }

  const latitude = Number(candidate.pattern.trigger_conditions?.latitude);
  const longitude = Number(candidate.pattern.trigger_conditions?.longitude);
  const radiusMeters = Number(candidate.pattern.trigger_conditions?.radius_meters || 120);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Coordinate candidato non valide");
  }

  const existing = await findSignificantPlaceNear({
    userId,
    latitude,
    longitude,
    radiusMeters,
  });
  const place = existing
    ? await updateSignificantPlace({
        userId,
        placeId: existing.id,
        label: cleanLabel,
        category,
        externalName: cleanLabel,
      })
    : await saveSignificantPlace({
        userId,
        label: cleanLabel,
        category,
        latitude,
        longitude,
        radiusMeters,
        externalName: cleanLabel,
        externalCategory: category,
        confidence: Math.min(100, Number(candidate.pattern.confidence || 0) * 10),
        source: "location_learning",
      });
  if (!place) throw new Error("Salvataggio luogo non riuscito");

  const now = new Date().toISOString();
  await Promise.all([
    supabaseAdmin
      .from("behavior_patterns")
      .update({ place_id: place.id, place_label: place.label, status: "archived", updated_at: now })
      .eq("id", candidate.pattern.id)
      .eq("user_id", userId),
    supabaseAdmin
      .from("ghost_proactive_messages")
      .update({ status: "answered", read_at: now, answered_at: now, updated_at: now })
      .eq("id", candidate.card.id)
      .eq("user_id", userId),
  ]);

  const { data: rawLocation } = await supabaseAdmin
    .from("user_location_state")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  const current = classifyLocationState(rawLocation).currentLocation;
  if (
    current &&
    Number.isFinite(Number(current.latitude)) &&
    Number.isFinite(Number(current.longitude)) &&
    distanceMeters(latitude, longitude, Number(current.latitude), Number(current.longitude)) <= radiusMeters
  ) {
    await supabaseAdmin
      .from("user_location_state")
      .update({
        current_place_id: place.id,
        current_place_label: place.label,
        place_category: place.category,
        updated_at: now,
      })
      .eq("user_id", userId);
  }

  return place;
}
