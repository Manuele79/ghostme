import {
  buildHouseStateSnapshot,
  formatHouseStateContext,
} from "@/lib/ghostme/home/houseStateSnapshot";
import { getDefaultHomeAssistantUserId } from "@/lib/ghostme/homeAssistant/homeAssistantAccess";

export async function buildHomeReasoning(
  userId = getDefaultHomeAssistantUserId(),
  { forceLive = false }: { forceLive?: boolean } = {}
) {
  if (!userId) return "";
  const snapshot = await buildHouseStateSnapshot(userId, { forceLive });
  return formatHouseStateContext(snapshot);
}
