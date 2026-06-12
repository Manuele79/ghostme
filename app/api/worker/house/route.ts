import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { logHomeAssistantSnapshot } from "@/lib/ghostme/homeAssistant/homeEventLogger";
import { analyzeHousePatterns } from "@/lib/ghostme/homeAssistant/housePatternEngine";

export async function GET(req: Request) {
  const secret = process.env.WORKER_SECRET;
  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (secret && token !== secret) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { data: users, error } = await supabaseAdmin
    .from("user_profiles")
    .select("user_id")
    .limit(20);

  if (error) {
    return NextResponse.json(
      { success: false, error: "Errore lettura utenti" },
      { status: 500 }
    );
  }

  let totalInserted = 0;
  const results: any[] = [];

  for (const user of users || []) {
    const logResult = await logHomeAssistantSnapshot(user.user_id);
    const patterns = await analyzeHousePatterns(user.user_id);

    totalInserted += logResult.inserted || 0;

    results.push({
      userId: user.user_id,
      inserted: logResult.inserted || 0,
      patterns,
    });
  }

  return NextResponse.json({
    success: true,
    users: users?.length || 0,
    inserted: totalInserted,
    results,
  });
}