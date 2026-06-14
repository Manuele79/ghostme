import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

import { buildCurrentContext } from "@/lib/ghostme/context/contextBuilder";
import { buildGhostSituation } from "@/lib/ghostme/situation/situationEngine";
import { buildAgendaMessage } from "@/lib/ghostme/agenda/agendaEngine";
import { upsertProactiveMessage } from "@/lib/ghostme/proactive/proactiveMessageService";
import { runRetentionCleanup } from "@/lib/ghostme/maintenance/retentionEngine";
import { generateDailyConversationSummary } from "@/lib/ghostme/conversationSummary";
import { decideProactiveMessage } from "@/lib/ghostme/proactive/proactiveDecisionEngine";
import { refreshReminderMessage } from "@/lib/ghostme/agenda/reminderEngine";
import { generateObservationInsight } from "@/lib/ghostme/observation/observationInsightEngine";
import { cleanupOldActionIntents } from "@/lib/ghostme/actionLayer";
import { generatePatternInsight } from "@/lib/ghostme/patterns/patternInsightEngine";
import { applyPatternDecay } from "@/lib/ghostme/patterns/patternDecay";
import { generateCuriosityMessage } from "@/lib/ghostme/curiosity/curiosityEngine";
import { generateButlerMessage } from "@/lib/ghostme/butler/butlerEngine";
import { syncPeopleGraphFromTopics } from "@/lib/ghostme/people/peopleGraphService";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const { data: users, error: usersError } = await supabaseAdmin
      .from("user_profiles")
      .select("user_id, full_name, job, hobbies, sports, location");

    if (usersError) {
      console.log("PROACTIVE USERS ERROR:", usersError);
      return NextResponse.json(
        { success: false, error: usersError },
        { status: 500 }
      );
    }

    if (!users?.length) {
      return NextResponse.json({ success: true, users: 0, created: 0 });
    }

    let created = 0;

    for (const user of users) {
      const userId = user.user_id;

      await generateDailyConversationSummary(userId);
      await runRetentionCleanup(userId);
      await cleanupOldActionIntents(userId);
      await syncPeopleGraphFromTopics(userId);
      await refreshReminderMessage(userId);

      const observationInsight = await generateObservationInsight(userId);
      const patternInsight = await generatePatternInsight(userId);
      const curiosityMessage = await generateCuriosityMessage(userId);

      await applyPatternDecay(userId);

      const situation = await buildGhostSituation(userId);
      const agendaMessage = buildAgendaMessage(situation);
      const currentContext = await buildCurrentContext(userId);
      const butlerMessage = await generateButlerMessage({
        userName: user.full_name,
        currentContext,
      });

      const proactiveDecision = await decideProactiveMessage({
        userName: user.full_name,
        currentContext,
      });

      const proactiveCandidates = [
        proactiveDecision.shouldSpeak && proactiveDecision.message
          ? {
              title: proactiveDecision.title || "Osservazione GhostMe",
              message: proactiveDecision.message,
              category: proactiveDecision.category || "observation",
              priority: proactiveDecision.priority || 2,
              source: "decision",
            }
          : null,

        observationInsight
          ? {
              title: "Osservazione GhostMe",
              message: observationInsight,
              category: "observation",
              priority: 3,
              source: "observation",
            }
          : null,

        patternInsight
          ? {
              title: "Pattern GhostMe",
              message: patternInsight,
              category: "observation",
              priority: 3,
              source: "pattern",
            }
          : null,

        curiosityMessage
          ? {
              title: "Curiosità GhostMe",
              message: curiosityMessage,
              category: "curiosity",
              priority: 2,
              source: "curiosity",
            }
          : null,

        butlerMessage
        ? {
            title: "Osservazione GhostMe",
            message: butlerMessage,
            category: "observation",
            priority: 2,
            source: "butler",
          }
        : null,


      ].filter(Boolean) as any[];

      const bestCandidate = proactiveCandidates.sort(
        (a, b) => (b.priority || 0) - (a.priority || 0)
      )[0];

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
Se non c'è nulla di concreto, fai un briefing molto breve.
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
    }

    return NextResponse.json({
      success: true,
      users: users.length,
      created,
    });
  } catch (err) {
    console.log("PROACTIVE ERROR:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}