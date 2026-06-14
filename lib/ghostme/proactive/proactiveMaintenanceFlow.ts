import { refreshReminderMessage } from "@/lib/ghostme/agenda/reminderEngine";
import { cleanupOldActionIntents } from "@/lib/ghostme/actionLayer";
import { generateDailyConversationSummary } from "@/lib/ghostme/conversationSummary";
import { runRetentionCleanup } from "@/lib/ghostme/maintenance/retentionEngine";
import { syncPeopleGraphFromTopics } from "@/lib/ghostme/people/peopleGraphService";

export async function runProactiveMaintenanceFlow(userId: string) {
  await generateDailyConversationSummary(userId);
  await runRetentionCleanup(userId);
  await cleanupOldActionIntents(userId);
  await syncPeopleGraphFromTopics(userId);
  await refreshReminderMessage(userId);
}
