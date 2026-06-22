import { NextResponse } from "next/server";
import {
  completeLocationCandidate,
  getLocationCandidateDetails,
} from "@/lib/ghostme/location/locationLearningFlow";
import {
  getAuthenticatedUserId,
  UserContextAuthError,
} from "@/lib/ghostme/auth/serverAuth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userId = await getAuthenticatedUserId(req, body.userId);
    const candidate = await getLocationCandidateDetails({
      userId,
      proactiveMessageId: body.proactiveMessageId,
    });
    if (!candidate) {
      return NextResponse.json({ error: "Candidato non trovato" }, { status: 404 });
    }
    return NextResponse.json({ candidate });
  } catch (error) {
    if (error instanceof UserContextAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Errore lettura candidato" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const userId = await getAuthenticatedUserId(req, body.userId);
    const place = await completeLocationCandidate({
      userId,
      proactiveMessageId: body.proactiveMessageId,
      label: String(body.label || ""),
      category: String(body.category || ""),
    });
    return NextResponse.json({ success: true, place });
  } catch (error) {
    if (error instanceof UserContextAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore salvataggio luogo" },
      { status: 400 }
    );
  }
}
