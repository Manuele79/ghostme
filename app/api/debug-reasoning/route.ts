import { NextResponse } from "next/server";
import { buildGhostBrainSnapshot } from "@/lib/ghostme/context/reasoningService";
import { buildDecisionSnapshot } from "@/lib/ghostme/context/decisionSnapshot";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId mancante" }, { status: 400 });
  }

  const snapshot = await buildGhostBrainSnapshot(userId);
  const decision = buildDecisionSnapshot(snapshot);

  return NextResponse.json({
    success: true,
    snapshot,
    decision,
  });
}
