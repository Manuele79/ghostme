import { saveSignificantPlace } from "@/lib/ghostme/location/placeService";

export async function saveLocationPlaceFlow(body: any) {
  if (
    !body.userId ||
    !body.label ||
    body.latitude == null ||
    body.longitude == null
  ) {
    return {
      status: 400,
      body: { error: "Dati luogo mancanti" },
    };
  }

  const saved = await saveSignificantPlace({
    userId: body.userId,
    label: body.label,
    category: body.category || "unknown",
    latitude: Number(body.latitude),
    longitude: Number(body.longitude),
    radiusMeters: body.radiusMeters || 100,
    externalName: body.externalName || body.external_name || null,
    externalCategory: body.externalCategory || body.external_category || null,
    address: body.address || null,
    confidence: body.confidence || 70,
    source: body.source || "manual",
  });

  if (!saved) {
    return {
      status: 500,
      body: { error: "Luogo non salvato" },
    };
  }

  return {
    status: 200,
    body: {
      success: true,
      place: saved,
    },
  };
}
