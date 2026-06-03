export type RawLocationSignal = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  source?: "phone" | "browser" | "home_assistant";
  timestamp?: string;
};

export type SignificantPlace = {
  label: string;
  category: "home" | "work" | "gym" | "shop" | "bar" | "travel" | "unknown";
  confidence: number;
};

export function classifyLocationSignal(
  signal: RawLocationSignal
): SignificantPlace {
  return {
    label: "luogo sconosciuto",
    category: "unknown",
    confidence: 10,
  };
}