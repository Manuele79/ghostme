import { NextResponse } from "next/server";
import { buildGhostBrainSnapshot } from "@/lib/ghostme/context/reasoningService";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "userId mancante" }, { status: 400 });
  }

  const snapshot = await buildGhostBrainSnapshot(userId);

  return NextResponse.json({
    success: true,
    snapshot,
  });
}
