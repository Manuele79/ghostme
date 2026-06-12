import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { logHomeAssistantSnapshot } from "@/lib/ghostme/homeAssistant/homeEventLogger";
import { analyzeHousePatterns } from "@/lib/ghostme/homeAssistant/housePatternEngine";
import { generateHouseSuggestions } from "@/lib/ghostme/homeAssistant/houseSuggestionEngine";
import { learnHouseRoutes } from "@/lib/ghostme/homeAssistant/houseRouteLearningEngine";

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

  const testUserId = process.env.GHOSTME_TEST_USER_ID;

  if (!testUserId) {
    return NextResponse.json(
      { success: false, error: "Manca GHOSTME_TEST_USER_ID" },
      { status: 500 }
    );
  }

  const users = [{ user_id: testUserId }];


  let totalInserted = 0;
  const results: any[] = [];

  for (const user of users || []) {
    const logResult = await logHomeAssistantSnapshot(user.user_id);
    const patterns = await analyzeHousePatterns(user.user_id);
    const routes = await learnHouseRoutes(user.user_id);
    const suggestions = await generateHouseSuggestions(user.user_id);

    totalInserted += logResult.inserted || 0;

    results.push({
      userId: user.user_id,
      logResult,
      patterns,
      routes,
      suggestionsCreated: suggestions.length,
    });
  }

  return NextResponse.json({
    success: true,
    users: users?.length || 0,
    inserted: totalInserted,
    results,
  });
}