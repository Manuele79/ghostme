import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  findSignificantPlaceNear,
  markSignificantPlaceSeen,
  saveSignificantPlace,
  updateSignificantPlace,
} from "@/lib/ghostme/location/placeService";

export type PlaceResolutionStatus =
  | "known"
  | "saved"
  | "updated"
  | "needs_confirmation"
  | "unresolved";

export type ResolvedPlaceResult = {
  status: PlaceResolutionStatus;
  place: any | null;
  confidence: number;
  coordinateBucket: string;
  question?: string;
  source: "local_match" | "local_cache" | "device_metadata" | "unresolved";
  metadata: {
    name: string | null;
    category: string | null;
    address: string | null;
    deviceId: string | null;
  };
};

type ResolvePlaceInput = {
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  source?: string | null;
  deviceId?: string | null;
  externalName?: string | null;
  externalCategory?: string | null;
  address?: string | null;
  confidence?: number | null;
};

function clean(value: any) {
  const text = String(value || "").trim();
  return text.length ? text : null;
}

function clampConfidence(value: number) {
  return Math.min(Math.max(Math.round(value), 0), 100);
}

export function coordinateBucket(latitude: number, longitude: number) {
  return `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
}

function dayStartIso() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function normalizeCategory(value?: string | null) {
  const text = String(value || "").toLowerCase();
  if (!text) return null;
  if (/(restaurant|ristorante|trattoria|osteria|pizzeria|pizza|food)/.test(text)) {
    return text.includes("pizza") ? "pizzeria" : "restaurant";
  }
  if (/(bar|cafe|caff|pub)/.test(text)) return "bar";
  if (/(shop|store|negozio|market|supermercato)/.test(text)) return "shop";
  if (/(fuel|gas|benzina|distributore)/.test(text)) return "fuel_station";
  if (/(gym|palestra|fitness)/.test(text)) return "gym";
  if (/(office|azienda|cliente|business|company)/.test(text)) return "business";
  return text.replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || null;
}

function scoreCandidate(input: ResolvePlaceInput, name: string | null, category: string | null) {
  let score = Number(input.confidence || 0);
  if (!Number.isFinite(score) || score <= 0) score = 45;
  if (name) score += 25;
  if (category) score += 15;
  if (input.address) score += 10;
  const accuracy = Number(input.accuracy);
  if (Number.isFinite(accuracy)) {
    if (accuracy <= 50) score += 10;
    else if (accuracy > 120) score -= 15;
  }
  return clampConfidence(score);
}

function buildConfirmationQuestion({
  name,
  category,
  address,
}: {
  name: string | null;
  category: string | null;
  address: string | null;
}) {
  if (name) {
    return `Quel posto nuovo era ${name}${address ? `, vicino a ${address}` : ""}?`;
  }
  if (category && address) {
    return `Quel posto nuovo vicino a ${address} era un ${category}?`;
  }
  if (category) {
    return `Quel posto nuovo era un ${category}?`;
  }
  if (address) {
    return `Quel posto nuovo vicino a ${address} era importante?`;
  }
  return "Quel posto nuovo era legato a qualcosa che vuoi ricordare?";
}

async function loadTodayResolutionCache(userId: string, bucket: string) {
  const { data, error } = await supabaseAdmin
    .from("observation_events")
    .select("context, occurred_at")
    .eq("user_id", userId)
    .eq("event_type", "place_unknown_detected")
    .gte("occurred_at", dayStartIso())
    .order("occurred_at", { ascending: false })
    .limit(20);

  if (error) {
    console.log("PLACE RESOLUTION CACHE ERROR:", error);
    return null;
  }

  return (data || []).find(
    (row: any) => row.context?.coordinate_bucket === bucket && row.context?.poi_resolution
  ) || null;
}

export async function resolvePlaceFromCoordinates(
  input: ResolvePlaceInput
): Promise<ResolvedPlaceResult> {
  const bucket = coordinateBucket(input.latitude, input.longitude);
  const deviceId = clean(input.deviceId);
  const localMatch = await findSignificantPlaceNear({
    userId: input.userId,
    latitude: input.latitude,
    longitude: input.longitude,
    radiusMeters: 120,
  });

  if (localMatch) {
    await markSignificantPlaceSeen(localMatch);
    return {
      status: "known",
      place: localMatch,
      confidence: Number(localMatch.confidence || 85),
      coordinateBucket: bucket,
      source: "local_match",
      metadata: {
        name: localMatch.external_name || localMatch.label || null,
        category: localMatch.external_category || localMatch.category || null,
        address: localMatch.address || null,
        deviceId,
      },
    };
  }

  const cached = await loadTodayResolutionCache(input.userId, bucket);
  const cachedResolution = cached?.context?.poi_resolution;
  if (cachedResolution?.status === "needs_confirmation") {
    return {
      status: "needs_confirmation",
      place: null,
      confidence: Number(cachedResolution.confidence || 55),
      coordinateBucket: bucket,
      question: cachedResolution.question,
      source: "local_cache",
      metadata: {
        name: cachedResolution.name || null,
        category: cachedResolution.category || null,
        address: cachedResolution.address || null,
        deviceId,
      },
    };
  }

  const name = clean(input.externalName);
  const category = normalizeCategory(input.externalCategory);
  const address = clean(input.address);
  const confidence = scoreCandidate(input, name, category);

  if (!name && !category && !address) {
    return {
      status: "unresolved",
      place: null,
      confidence,
      coordinateBucket: bucket,
      question: buildConfirmationQuestion({ name, category, address }),
      source: "unresolved",
      metadata: { name, category, address, deviceId },
    };
  }

  if (confidence >= 85 && name) {
    const saved = await saveSignificantPlace({
      userId: input.userId,
      label: name,
      category: category || "public_place",
      latitude: input.latitude,
      longitude: input.longitude,
      radiusMeters: Math.max(80, Math.min(Number(input.accuracy || 100), 160)),
      externalName: name,
      externalCategory: category,
      address,
      confidence,
      source: "poi_resolver",
    });

    return {
      status: saved ? "saved" : "needs_confirmation",
      place: saved,
      confidence,
      coordinateBucket: bucket,
      question: saved ? undefined : buildConfirmationQuestion({ name, category, address }),
      source: "device_metadata",
      metadata: { name, category, address, deviceId },
    };
  }

  if (confidence >= 70 && localMatch?.id && name) {
    const updated = await updateSignificantPlace({
      userId: input.userId,
      placeId: localMatch.id,
      label: name,
      category: category || localMatch.category || "public_place",
      externalName: name,
      externalCategory: category,
      address,
      confidence,
    });

    return {
      status: updated ? "updated" : "needs_confirmation",
      place: updated,
      confidence,
      coordinateBucket: bucket,
      question: updated ? undefined : buildConfirmationQuestion({ name, category, address }),
      source: "device_metadata",
      metadata: { name, category, address, deviceId },
    };
  }

  return {
    status: confidence >= 55 ? "needs_confirmation" : "unresolved",
    place: null,
    confidence,
    coordinateBucket: bucket,
    question: buildConfirmationQuestion({ name, category, address }),
    source: "device_metadata",
    metadata: { name, category, address, deviceId },
  };
}
