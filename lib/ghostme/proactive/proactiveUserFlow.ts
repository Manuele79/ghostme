import { OpenAI } from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { upsertProactiveMessage } from "@/lib/ghostme/proactive/proactiveMessageService";
import { pickBestProactiveCandidate } from "@/lib/ghostme/proactive/proactiveCandidateRanker";
import { runProactiveMaintenanceFlow } from "@/lib/ghostme/proactive/proactiveMaintenanceFlow";
import { buildProactiveCandidatesForUser } from "@/lib/ghostme/proactive/proactiveCandidateBuilder";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function runProactiveFlowForUser(user: any): Promise<{
  created: number;
  errors?: string[];
}> {
  let created = 0;
  const userId = user.user_id;

  await runProactiveMaintenanceFlow(userId);

  const { proactiveCandidates, agendaMessage } =
    await buildProactiveCandidatesForUser(user);

  const bestCandidate = pickBestProactiveCandidate(proactiveCandidates);

  if (bestCandidate) {
    await upsertProactiveMessage({
      userId,
      title: bestCandidate.title,
      message: bestCandidate.message,
      category: bestCandidate.category,
      priority: bestCandidate.priority,
    });

    created++;
  }

  if (agendaMessage) {
    await upsertProactiveMessage({
      userId,
      title: "Agenda di oggi",
      message: agendaMessage,
      category: "agenda",
      priority: 5,
    });
  }

  const [
    calendarRes,
    goalsRes,
    actionsRes,
    mentalRes,
    timelineRes,
    topicsRes,
  ] = await Promise.all([
    supabaseAdmin
      .from("calendar_events")
      .select("title, type, description, start_at, remind_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .or(
        `start_at.gte.${new Date().toISOString()},remind_at.gte.${new Date().toISOString()}`
      )
      .order("start_at", { ascending: true })
      .limit(8),

    supabaseAdmin
      .from("goals_desires")
      .select("title, description, category, importance, updated_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("importance", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("action_intents")
      .select("intent_type, title, description, priority, updated_at")
      .eq("user_id", userId)
      .in("status", ["detected", "pending"])
      .order("priority", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("mental_states")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabaseAdmin
      .from("autobiographical_timeline")
      .select("title, summary, event_date, category")
      .eq("user_id", userId)
      .order("event_date", { ascending: false })
      .limit(5),

    supabaseAdmin
      .from("life_topics")
      .select(
        "topic, category, entity_type, weight, mention_count, last_mentioned_at, description"
      )
      .eq("user_id", userId)
      .order("weight", { ascending: false })
      .limit(8),
  ]);

  const systemPrompt = `
Sei GhostMe.

Devi creare un briefing proattivo personale per l'utente.
Massimo 130 parole.
Solo cose operative: appuntamenti, promemoria, azioni concrete, anomalie utili.
Niente motivazione finta, niente coaching, niente poesia.
Se non c'Ã¨ nulla di concreto, fai un briefing molto breve.
      `;

  const calendarForPrompt = (calendarRes.data || []).map((event) => ({
    ...event,
    when_it: event.start_at
      ? new Date(event.start_at).toLocaleString("it-IT", {
          timeZone: "Europe/Rome",
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : event.remind_at
        ? new Date(event.remind_at).toLocaleString("it-IT", {
            timeZone: "Europe/Rome",
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "orario non specificato",
  }));

  const userPrompt = `
UTENTE:
${JSON.stringify(user, null, 2)}

CALENDARIO:
${JSON.stringify(calendarForPrompt, null, 2)}

OBIETTIVI:
${JSON.stringify(goalsRes.data || [], null, 2)}

AZIONI APERTE:
${JSON.stringify(actionsRes.data || [], null, 2)}

STATO MENTALE:
${JSON.stringify(mentalRes.data || null, null, 2)}

TIMELINE RECENTE:
${JSON.stringify(timelineRes.data || [], null, 2)}

TOPIC IMPORTANTI:
${JSON.stringify(topicsRes.data || [], null, 2)}
      `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 300,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  const message =
    completion.choices[0]?.message?.content ||
    `Buongiorno ${user.full_name || ""}. Non ho abbastanza dati per un briefing utile oggi.`;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { data: existingDaily } = await supabaseAdmin
    .from("ghost_proactive_messages")
    .select("id")
    .eq("user_id", userId)
    .eq("category", "daily_briefing")
    .gte("created_at", startOfToday.toISOString())
    .limit(1)
    .maybeSingle();

  if (!existingDaily?.id) {
    await upsertProactiveMessage({
      userId,
      title: "Daily Briefing",
      message,
      category: "daily_briefing",
      priority: 1,
    });
  }

  return { created };
}
