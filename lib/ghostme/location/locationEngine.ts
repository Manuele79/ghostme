export type RawLocationSignal = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  source?: "phone" | "browser" | "home_assistant";
  timestamp?: string;
};

export type SignificantPlace = {
  label: string;
  category:
    | "home"
    | "work"
    | "gym"
    | "shop"
    | "supermarket"
    | "restaurant"
    | "bar"
    | "fuel"
    | "travel"
    | "unknown";
  confidence: number;
  reason?: string;
};

export function classifyLocationSignal(
  signal: RawLocationSignal
): SignificantPlace {
  if (!signal?.latitude || !signal?.longitude) {
    return {
      label: "luogo sconosciuto",
      category: "unknown",
      confidence: 0,
      reason: "coordinate mancanti",
    };
  }

  if (signal.accuracy && signal.accuracy > 150) {
    return {
      label: "posizione poco precisa",
      category: "unknown",
      confidence: 20,
      reason: `accuratezza bassa: ${signal.accuracy}m`,
    };
  }

  return {
    label: "luogo non classificato",
    category: "unknown",
    confidence: 30,
    reason: "coordinate valide ma non ancora associate a un luogo",
  };
}