import { NextResponse } from "next/server";
import { OpenAI } from "openai";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

import { buildCurrentContext } from "@/lib/ghostme/context/contextBuilder";
import { generateButlerMessage } from "@/lib/ghostme/butler/butlerEngine";
import { generateCuriosityMessage } from "@/lib/ghostme/curiosity/curiosityEngine";

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
      return NextResponse.json({ success: false, error: usersError }, { status: 500 });
    }

    if (!users?.length) {
      return NextResponse.json({
        success: true,
        users: 0,
        created: 0,
      });
    }

    let created = 0;

    for (const user of users) {
      const userId = user.user_id;

      const currentContext = await buildCurrentContext(userId);

      const butlerMessage = await generateButlerMessage({
        userName: user.full_name,
        currentContext,
      });  
      
      const curiosityMessage = await generateCuriosityMessage(userId);
      console.log("CURIOSITY:", curiosityMessage);
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
          .order("remind_at", { ascending: true })
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
          .select("topic, category, entity_type, weight, mention_count, last_mentioned_at, description")
          .eq("user_id", userId)
          .order("weight", { ascending: false })
          .limit(8),
      ]);

      const systemPrompt = `
Sei GhostMe.

Devi creare un briefing proattivo personale per l'utente.

Non devi fare un elenco freddo.
Devi sembrare una mente personale che conosce il contesto.

Tono:
- diretto
- pratico
- umano
- leggermente ironico se serve
- niente frasi motivazionali da coach
- niente poesia
- niente "come assistente AI"

Struttura consigliata:
1. Saluto breve
2. Cose concrete di oggi o prossime
3. Collegamento intelligente con memoria/progetti/stato mentale
4. Suggerimento pratico su cosa conviene fare
5. Una domanda finale utile

Regole:
- Se ci sono appuntamenti, cita quelli.
- Se ci sono obiettivi o azioni aperte, collegali.
- Non inventare dati mancanti.
- Se il calendario è vuoto, non dire che ci sono appuntamenti.
- Se i dati sono pochi, fai un briefing breve.
- Massimo 130 parole.
`;

      const userPrompt = `
UTENTE:
${JSON.stringify(user, null, 2)}

CALENDARIO:
${JSON.stringify(calendarRes.data || [], null, 2)}

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
        butlerMessage ||
        completion.choices[0]?.message?.content ||
        `Buongiorno ${user.full_name || ""}. Non ho abbastanza dati per un briefing utile oggi.`;

      const { error: insertError } = await supabaseAdmin
        .from("ghost_proactive_messages")
        .insert({
          user_id: userId,
          title: "Daily Briefing",
          message,
          category: "daily_briefing",
          status: "unread",
          priority: 1,
          scheduled_for: new Date().toISOString(),
        });

      if (insertError) {
        console.log("PROACTIVE INSERT ERROR:", insertError);
      } else {
        created++;
      }

      if (curiosityMessage) {
        await supabaseAdmin.from("ghost_proactive_messages").insert({
          user_id: userId,
          title: "Curiosità GhostMe",
          message: curiosityMessage,
          category: "curiosity",
          status: "unread",
          priority: 2,
          scheduled_for: new Date().toISOString(),
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