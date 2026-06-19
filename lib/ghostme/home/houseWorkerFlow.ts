import { logHomeAssistantSnapshot } from "@/lib/ghostme/homeAssistant/homeEventLogger";
import { analyzeHousePatterns } from "@/lib/ghostme/homeAssistant/housePatternEngine";
import { generateHouseSuggestions } from "@/lib/ghostme/homeAssistant/houseSuggestionEngine";
import { learnHouseRoutes } from "@/lib/ghostme/homeAssistant/houseRouteLearningEngine";
import { generateHouseAutomationSuggestions } from "@/lib/ghostme/homeAssistant/houseAutomationSuggestionEngine";
import { planHouseAutomationControls } from "@/lib/ghostme/homeAssistant/houseAutomationControlPlanner";
import { syncHouseEntities } from "@/lib/ghostme/homeAssistant/houseEntityRegistry";
import { bridgeHomeAssistantLocationFlow } from "@/lib/ghostme/location/haLocationBridgeFlow";
import { requireWorkerRequest, UserContextAuthError } from "@/lib/ghostme/auth/serverAuth";

export async function houseWorkerFlow(req: Request) {
  try {
    requireWorkerRequest(req);
  } catch (err) {
    return {
      status: err instanceof UserContextAuthError ? err.status : 401,
      body: { success: false, error: err instanceof Error ? err.message : "Unauthorized" },
    };
  }

  const testUserId = process.env.GHOSTME_TEST_USER_ID;

  if (!testUserId) {
    return {
      status: 500,
      body: { success: false, error: "Manca GHOSTME_TEST_USER_ID" },
    };
  }

  const users = [{ user_id: testUserId }];

  let totalInserted = 0;
  const results: any[] = [];

  for (const user of users || []) {
    const logResult = await logHomeAssistantSnapshot(user.user_id);
    const locationBridge = await bridgeHomeAssistantLocationFlow({
      userId: user.user_id,
    });
    const entitySync = await syncHouseEntities(user.user_id);
    const patterns = await analyzeHousePatterns(user.user_id);
    const routes = await learnHouseRoutes(user.user_id);
    const suggestions = await generateHouseSuggestions(user.user_id);
    const automationSuggestions = await generateHouseAutomationSuggestions(user.user_id);
    const controlPlans = await planHouseAutomationControls(user.user_id);

    totalInserted += logResult.inserted || 0;

    results.push({
      userId: user.user_id,
      logResult,
      locationBridge,
      entitySync,
      patterns,
      routes,
      suggestionsCreated: suggestions.length + automationSuggestions.length,
      automationSuggestionsCreated: automationSuggestions.length,
      controlPlansCreated: controlPlans.length,
    });
  }

  return {
    status: 200,
    body: {
      success: true,
      users: users?.length || 0,
      inserted: totalInserted,
      results,
    },
  };
}
