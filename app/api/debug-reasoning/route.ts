import { NextResponse } from "next/server";
import { buildGhostBrainSnapshot } from "@/lib/ghostme/context/reasoningService";
import { buildDecisionSnapshot } from "@/lib/ghostme/context/decisionSnapshot";
import {
  getAuthenticatedUserId,
  UserContextAuthError,
} from "@/lib/ghostme/auth/serverAuth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = await getAuthenticatedUserId(
      req,
      url.searchParams.get("userId")
    );

    const snapshot = await buildGhostBrainSnapshot(userId);
    const decision = buildDecisionSnapshot(snapshot);

    return NextResponse.json({
      success: true,
      snapshot,
      decision,
    });
  } catch (err) {
    if (err instanceof UserContextAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    console.log("DEBUG REASONING API ERROR:", err);
    return NextResponse.json({ error: "Errore debug reasoning" }, { status: 500 });
  }
}
