import { refreshReminderMessage } from "@/lib/ghostme/agenda/reminderEngine";
import { cleanupOldActionIntents } from "@/lib/ghostme/actionLayer";
import { cleanupExpiredEvents } from "@/lib/ghostme/calendar/calendarService";
import { generateDailyConversationSummary } from "@/lib/ghostme/conversationSummary";
import { runRetentionCleanup } from "@/lib/ghostme/maintenance/retentionEngine";
import { syncPeopleGraphFromTopics } from "@/lib/ghostme/people/peopleGraphService";
import {
  decayPeopleGraphLinks,
  syncPeopleGraphLinks,
} from "@/lib/ghostme/people/peopleGraphLinkService";

export async function runProactiveMaintenanceFlow(userId: string) {
  await refreshReminderMessage(userId);
  await generateDailyConversationSummary(userId);
  await runRetentionCleanup(userId);
  await cleanupOldActionIntents(userId);
  await syncPeopleGraphFromTopics(userId);
  await syncPeopleGraphLinks(userId);
  await decayPeopleGraphLinks({ userId });
  await cleanupExpiredEvents(userId);
}
