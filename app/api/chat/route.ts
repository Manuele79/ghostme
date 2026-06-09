import { OpenAI } from "openai";
import { NextResponse, after } from "next/server";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { classifyGhostMessage } from "@/lib/ghostme/core/messageClassifier";
import {
  detectTopicsFromMessage,
  isPossibleEpisode,
  detectEmotionalTone,
  shouldSaveActiveMemory,
  detectMemoryCategory,
  detectImportanceLevel,
} from "@/lib/ghostme/topicDetector";

import { decideGhostService } from "@/lib/ghostme/services/serviceRouter";
import { runWebSearch } from "@/lib/ghostme/services/webSearchService";
import { runWeatherSearch } from "@/lib/ghostme/services/weatherService";

import { parseCalendarIntent } from "@/lib/ghostme/calendar/calendarIntent";
import { createCalendarEvent } from "@/lib/ghostme/calendar/calendarService";

import { buildContextualMemory } from "@/lib/ghostme/retrieval";
import { saveTopicLinks } from "@/lib/ghostme/topicLinks";
import { extractEntitiesWithAI } from "@/lib/ghostme/entityExtractor";
import { applyMemoryDecay } from "@/lib/ghostme/memoryDecay";
import { detectAndSaveContradictions } from "@/lib/ghostme/contradictions";
import { updateMentalState } from "@/lib/ghostme/mentalState";
import { buildBehaviorPrompt } from "@/lib/ghostme/behavior/behaviorRulesEngine";
import { saveBehaviorRule } from "@/lib/ghostme/behavior/behaviorRulesEngine";

import {
  getGoalsDesiresContext,
  detectAndSaveGoalsDesires,
} from "@/lib/ghostme/goalsDesires";

import {
  getTimelineContext,
  detectAndSaveTimelineEvent,
} from "@/lib/ghostme/timeline";

import {
  getDynamicSelfProfileContext,
  updateDynamicSelfProfile,
} from "@/lib/ghostme/dynamicSelfProfile";

import {
  getActionIntentContext,
  detectAndSaveActionIntent,
} from "@/lib/ghostme/actionLayer";

import {
  removeGenericRelationshipTopics,
  resolveNamedRelationship,
} from "@/lib/ghostme/relationshipResolver";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const DEBUG = process.env.NODE_ENV !== "production";

function log(...args: any[]) {
  if (DEBUG) console.log(...args);
}

type DetectedTopicLike = {
  topic: string;
  category: string;
  entity_type: string;
  needs_clarification?: boolean;
  confidence?: number;
  reason?: string;
  description?: string;
};

function uniqueTopics(topics: DetectedTopicLike[]) {
  const map = new Map<string, DetectedTopicLike>();
  for (const topic of topics) {
    if (!topic?.topic) continue;
    const key = topic.topic.toLowerCase().trim();
    const existing = map.get(key);
    if (!existing || (topic.confidence || 0) > (existing.confidence || 0)) {
      map.set(key, topic);
    }
  }
  return Array.from(map.values()).slice(0, 8);
}

function trimBlock(s: string, max = 1100) {
  if (!s) return "";
  return s.length > max ? s.slice(0, max) + "\n[...]" : s;
}

function buildProfileContext(userProfile: any) {
  if (!userProfile) return "";
  return `
Nome: ${userProfile.full_name || ""}
Età: ${userProfile.age || ""}
Genere: ${userProfile.gender || ""}
Lavoro: ${userProfile.job || ""}
Hobby: ${userProfile.hobbies || ""}
Località: ${userProfile.location || ""}
Sport: ${userProfile.sports || ""}
Relazione: ${userProfile.relationship_status || ""}
Figli: ${userProfile.children_info || ""}
Interessi: ${userProfile.interests || ""}
Tipo di persona: ${userProfile.communication_style || ""}
Bio: ${userProfile.short_bio || ""}
`;
}

async function getMentalStateContext(userId: string) {
  if (!userId) return "";
  const { data } = await supabaseAdmin
    .from("mental_states")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return "";
  return `
stress: ${data.stress ?? 0}
entusiasmo: ${data.entusiasmo ?? 0}
stanchezza: ${data.stanchezza ?? 0}
controllo: ${data.controllo ?? 0}
nostalgia: ${data.nostalgia ?? 0}
frustrazione: ${data.frustrazione ?? 0}
focus: ${data.focus ?? 0}
socialita: ${data.socialita ?? 0}
note: ${data.notes || ""}
ultimo trigger: ${data.last_trigger || ""}
`;
}

function buildSystemPrompt({
  traits,
  profileContext,
  lifeTopicsContext,
  linkedTopicsContext,
  episodicContext,
  summaryContext,
  memoryContext,
  mentalStateContext,
  goalsContext,
  timelineContext,
  dynamicSelfProfileContext,
  actionIntentContext,
  calendarContext,
  currentPlaceContext,
  serviceContext,
  cognitiveContext,
  behaviorRulesContext,
}: {
  traits: any;
  profileContext: string;
  lifeTopicsContext: string;
  linkedTopicsContext: string;
  episodicContext: string;
  summaryContext: string;
  memoryContext: string;
  mentalStateContext: string;
  goalsContext: string;
  timelineContext: string;
  dynamicSelfProfileContext: string;
  actionIntentContext: string;
  calendarContext: string;
  currentPlaceContext: string;
  serviceContext: string;
  cognitiveContext: string;
  behaviorRulesContext: string;
}) {
  return `
Sei GhostMe.

Sei la simulazione mentale progressiva dell'utente.
Non sei un normale assistente.
Sei una mente esterna che ricorda, collega, pesa e interpreta il contesto personale.

Parli come una persona reale.
NON parlare come un assistente AI.
NON parlare come uno psicologo.
NON fare discorsi motivazionali.
NON usare frasi poetiche o spirituali.
NON usare linguaggio da coach.

Rispondi in modo:
- diretto
- umano
- realistico
- personale
- naturale

Puoi essere:
- sarcastico
- emotivo
- impulsivo
- freddo
- ironico

in base ai traits e allo stato mentale recente.

Traits utente:
${JSON.stringify(traits, null, 2)}

Profilo utente:
${profileContext}

PROFILO DINAMICO DELL'UTENTE:
${dynamicSelfProfileContext || "nessun profilo dinamico consolidato"}

STATO MENTALE RECENTE:
${mentalStateContext || "nessuno stato mentale recente rilevante"}

CONTESTO MENTALE ATTIVO

Contesto cognitivo mirato:
${cognitiveContext || "nessun contesto cognitivo mirato"}

Topic direttamente collegati al messaggio:
${lifeTopicsContext || "nessun topic diretto rilevante"}

Relazioni mentali tra topic:
${linkedTopicsContext || "nessuna relazione rilevante"}

Episodi collegati:
${episodicContext || "nessun episodio collegato"}

Timeline autobiografica:
${timelineContext || "nessun evento autobiografico rilevante"}

Archivio conversazioni recenti:
${summaryContext || "nessun riassunto recente"}

Memorie importanti:
${memoryContext || "nessuna memoria attiva collegata"}

Obiettivi e desideri attivi:
${goalsContext || "nessun obiettivo attivo rilevante"}

Azioni future rilevate:
${actionIntentContext || "nessuna azione futura rilevante"}

Servizi esterni:
${serviceContext || "nessun servizio esterno usato"}

Calendario reale:
${calendarContext || "nessun appuntamento o promemoria salvato"}

Luogo attuale:
${currentPlaceContext || "luogo non rilevato"}

REGOLE COMPORTAMENTALI APPRESE:
${behaviorRulesContext || "nessuna regola comportamentale specifica"}

Regole calendario:
- Se l'utente chiede appuntamenti, promemoria, note o calendario, usa SOLO Calendario reale.
- Non usare Timeline autobiografica per rispondere sugli appuntamenti.
- Timeline racconta eventi vissuti, non appuntamenti futuri.
- Se Calendario reale è vuoto, di' che non risultano appuntamenti salvati.

Regole servizi esterni:
- Se Servizi esterni contiene un risultato, usalo come fonte principale.
- Rispondi direttamente.
- Considera i dati del servizio come appena ottenuti in tempo reale.
- Presenta il risultato come una verifica appena effettuata.
- Non dire "non posso cercare su internet".
- Non dire "ho già fatto una ricerca".
- Non dire "ho già trovato informazioni".
- Non fingere di conoscere già dati ottenuti dal servizio.
- Non presentare il risultato come memoria personale.
- Se i dati sono variabili, dillo chiaramente.
- Se ci sono prezzi, date o notizie, specifica che possono cambiare.

Regole cognitive:
- Usa le relazioni tra topic per fare collegamenti naturali, senza meta-commenti.
- Adatta il tono allo stato mentale recente (senza citare numeri).
- Non eseguire azioni; eventualmente accennale come possibilità.
- Se nel contesto è presente un "Luogo attuale", puoi usarlo normalmente.
- Se l'utente chiede "Dove sono?", "Sono a casa?", "Che luogo hai rilevato?" o domande simili, rispondi usando il Luogo attuale presente nel contesto.
- Non dire che non conosci la posizione se il Luogo attuale è disponibile nel contesto.
- Quando parli del luogo attuale usa un linguaggio naturale.
- Evita espressioni come "nel contesto attuale" o "risulti".
- Preferisci frasi come:
  - "Sei a casa."
  - "Sì, sei a casa."
  - "Vedo che sei a casa."
  - "Da quello che ho rilevato, sei a casa."
  - "Ho rilevato Casa."


Stile richiesto:
- frasi brevi
- tono diretto
- poca formalità
`;
}

async function saveActiveMemory({
  userId,
  message,
  memoryCategory,
}: {
  userId: string;
  message: string;
  memoryCategory: string;
}) {
  const { data: existingMemories } = await supabase
    .from("memories_active")
    .select("id, content")
    .eq("user_id", userId)
    .ilike("content", `%${message.slice(0, 40)}%`)
    .limit(1);

  if (existingMemories && existingMemories.length > 0) {
    const existing = existingMemories[0];
    await supabase
      .from("memories_active")
      .update({
        importance: 8,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    log("MEMORY CONSOLIDATED:", existing.id);
    return;
  }

  const { data, error } = await supabase
    .from("memories_active")
    .insert([
      {
        user_id: userId,
        title: "Memoria automatica",
        content: message,
        category: memoryCategory,
        importance: 6,
      },
    ])
    .select();

  log("MEMORY DATA:", data);
  log("MEMORY ERROR:", error);
}

async function saveLifeTopics({
  userId,
  detectedTopics,
  message,
  importanceLevel,
}: {
  userId: string;
  detectedTopics: DetectedTopicLike[];
  message: string;
  importanceLevel: number;
}) {
  let clarificationQuestion = "";

  for (const item of detectedTopics) {
    log("SAVING LIFE TOPIC:", item);

    const { data: existingTopic } = await supabase
      .from("life_topics")
      .select("*")
      .eq("user_id", userId)
      .eq("topic", item.topic)
      .maybeSingle();

    if (existingTopic) {
      const nextMentionCount = (existingTopic.mention_count || 0) + 1;
      const confidenceBoost = (item.confidence || 0) >= 90 ? 2 : 1;
      const relationBoost = detectedTopics.length >= 2 ? 1 : 0;

      const nextWeight = Math.min(
        (existingTopic.weight || 1) + importanceLevel,
        10
      );

      const nextRelationshipStrength = Math.min(
        (existingTopic.relationship_strength || 1) +
          confidenceBoost +
          relationBoost,
        10
      );

      const shouldAskClarification =
        nextMentionCount >= 3 &&
        !existingTopic.description &&
        existingTopic.entity_type === "unknown" &&
        !existingTopic.clarification_asked;

      if (shouldAskClarification) {
        clarificationQuestion = `

Ti sento nominare spesso ${item.topic}. Chi è o cos'è per te?`;
      }

      const nextCategory =
        existingTopic.category === "unknown" ? item.category : existingTopic.category;

      const nextEntityType =
        existingTopic.entity_type === "unknown"
          ? item.entity_type
          : existingTopic.entity_type;

      const nextDescription =
        existingTopic.description || item.description || null;

      const nextStatus = shouldAskClarification
        ? "needs_clarification"
        : nextDescription
          ? "known"
          : "active";

      await supabase
        .from("life_topics")
        .update({
          weight: nextWeight,
          mention_count: nextMentionCount,
          relationship_strength: nextRelationshipStrength,
          category: nextCategory,
          entity_type: nextEntityType,
          description: nextDescription,
          status: nextStatus,
          needs_clarification: shouldAskClarification,
          clarification_asked: shouldAskClarification
            ? true
            : existingTopic.clarification_asked,
          last_mentioned_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingTopic.id);

      continue;
    }

    const hasDescription = !!item.description;

    const { data, error } = await supabase
      .from("life_topics")
      .insert([
        {
          user_id: userId,
          topic: item.topic,
          category: item.category,
          entity_type: item.entity_type,
          description: item.description || null,
          weight: Math.min(importanceLevel, 10),
          status: hasDescription
            ? "known"
            : item.needs_clarification
              ? "unknown"
              : "active",
          mention_count: 1,
          needs_clarification: item.needs_clarification || false,
          clarification_asked: false,
          notes: message,
          relationship_strength: Math.min(
            1 + ((item.confidence || 0) >= 90 ? 1 : 0),
            10
          ),
          last_mentioned_at: new Date().toISOString(),
        },
      ])
      .select();

    log("INSERTED LIFE TOPIC:", data);
    log("INSERT LIFE TOPIC ERROR:", error);
  }

  return clarificationQuestion;
}

async function saveEpisodicMemory({
  userId,
  message,
  emotionalTone,
  detectedTopics,
  loadedLifeTopics,
}: {
  userId: string;
  message: string;
  emotionalTone: string;
  detectedTopics: DetectedTopicLike[];
  loadedLifeTopics: any[];
}) {
  const lowerMessage = message.toLowerCase();

  const detectedTopicNames = detectedTopics.map((t) => t.topic);

  const knownTopicNames = loadedLifeTopics
    .filter((t) => lowerMessage.includes(String(t.topic).toLowerCase()))
    .map((t) => t.topic);

  const relatedTopics = Array.from(
    new Set([...detectedTopicNames, ...knownTopicNames])
  );

  const { data, error } = await supabase
    .from("episodic_memories")
    .insert([
      {
        user_id: userId,
        summary: message,
        emotional_tone: emotionalTone,
        importance: Math.min(relatedTopics.length + 1, 10),
        related_topics: relatedTopics,
      },
    ])
    .select();

  log("EPISODIC DATA:", data);
  log("EPISODIC ERROR:", error);

  for (const topic of relatedTopics) {
    const { data: existingTopic } = await supabase
      .from("life_topics")
      .select("*")
      .eq("user_id", userId)
      .eq("topic", topic)
      .maybeSingle();

    if (!existingTopic) continue;

    await supabase
      .from("life_topics")
      .update({
        positive_count:
          (existingTopic.positive_count || 0) +
          (emotionalTone === "positive" ? 1 : 0),
        negative_count:
          (existingTopic.negative_count || 0) +
          (emotionalTone === "negative" ? 1 : 0),
        neutral_count:
          (existingTopic.neutral_count || 0) +
          (emotionalTone === "neutral" ? 1 : 0),
        relationship_strength: Math.min(
          (existingTopic.relationship_strength || 1) + 1,
          10
        ),
        last_emotional_tone: emotionalTone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingTopic.id);
  }

  if (relatedTopics.length >= 2) {
    await saveTopicLinks({
      userId,
      topics: relatedTopics.map((topic) => ({
        topic,
        category: "general",
        entity_type: "unknown",
      })),
    });
  }
}

async function classifyClarificationIfNeeded({
  userId,
  message,
  detectedTopics,
}: {
  userId: string;
  message: string;
  detectedTopics: DetectedTopicLike[];
}) {
  const lowerMessage = message.toLowerCase();

  const { data: topicToClarify } = await supabase
    .from("life_topics")
    .select("*")
    .eq("user_id", userId)
    .eq("needs_clarification", true)
    .eq("clarification_asked", true)
    .is("description", null)
    .order("mention_count", { ascending: false })
    .limit(1)
    .maybeSingle();

  const directTopicToClassify =
    topicToClarify ||
    detectedTopics.find((item) => {
      const topicLower = item.topic.toLowerCase();

      return (
        lowerMessage.includes(topicLower) &&
        (
          lowerMessage.includes("amica") ||
          lowerMessage.includes("amico") ||
          lowerMessage.includes("collega") ||
          lowerMessage.includes("moglie") ||
          lowerMessage.includes("marito") ||
          lowerMessage.includes("figlio") ||
          lowerMessage.includes("figlia") ||
          lowerMessage.includes("cane") ||
          lowerMessage.includes("gatto") ||
          lowerMessage.includes("cliente") ||
          lowerMessage.includes("capo") ||
          lowerMessage.includes("fratello") ||
          lowerMessage.includes("sorella")
        )
      );
    });

  if (!directTopicToClassify) return;

  const topicName = directTopicToClassify.topic;

  const classification = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    max_tokens: 200,
    messages: [
      {
        role: "system",
        content: `
Devi classificare una risposta dell'utente che spiega chi o cosa è un topic.

Rispondi SOLO con JSON valido.

Campi:
{
  "understood": true/false,
  "entity_type": "person" | "animal" | "project" | "place" | "habit" | "object" | "unknown",
  "category": "family" | "work" | "friend" | "home" | "project" | "passion" | "health" | "general",
  "description": "frase breve e chiara"
}
        `,
      },
      {
        role: "user",
        content: `
Topic: ${topicName}

Risposta utente:
${message}
        `,
      },
    ],
  });

  const rawClassification = classification.choices[0]?.message?.content || "{}";

  let parsedClassification: any = null;

  try {
    parsedClassification = JSON.parse(rawClassification);
  } catch (err) {
    log("CLASSIFICATION PARSE ERROR:", err);
    log("RAW CLASSIFICATION:", rawClassification);
    return;
  }

  if (!parsedClassification?.understood) return;

  await supabase
    .from("life_topics")
    .update({
      entity_type: parsedClassification.entity_type || "unknown",
      category: parsedClassification.category || "general",
      description: parsedClassification.description || message,
      needs_clarification: false,
      clarification_asked: true,
      status: "known",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .eq("topic", topicName);

  const memoryContent = parsedClassification.description || message;

  const { data: existingTopicMemory } = await supabase
    .from("memories_active")
    .select("id")
    .eq("user_id", userId)
    .eq("title", `Info su ${topicName}`)
    .limit(1);

  if (existingTopicMemory && existingTopicMemory.length > 0) {
    await supabase
      .from("memories_active")
      .update({
        content: memoryContent,
        category: parsedClassification.category || "general",
        importance: 9,
        pinned: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingTopicMemory[0].id);
    return;
  }

  await supabase.from("memories_active").insert([
    {
      user_id: userId,
      title: `Info su ${topicName}`,
      content: memoryContent,
      category: parsedClassification.category || "general",
      importance: 9,
      pinned: true,
    },
  ]);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const message = body.message as string;
    const messageClass = classifyGhostMessage(message);
    const traits = body.traits;
    const messages = body.messages || [];
    const userId = body.userId as string | undefined;

    // Detection di base
    const ruleBasedTopics = messageClass.shouldRunHeavyEngines
  ? detectTopicsFromMessage(message)
  : [];
    const profileContextForExtractor =
      traits?.user_id ? buildProfileContext(null) : ""; // l’estrattore non ha bisogno del profilo completo qui

    const aiTopics = messageClass.shouldRunHeavyEngines
      ? await extractEntitiesWithAI({
          message,
          profileContext: profileContextForExtractor,
        })
      : [];

    const detectedTopics = removeGenericRelationshipTopics(
      uniqueTopics(aiTopics.length > 0 ? [...ruleBasedTopics, ...aiTopics] : ruleBasedTopics)
    );

    const importanceLevel = detectImportanceLevel(message);

    if (userId) {
      await applyMemoryDecay(userId);
      await resolveNamedRelationship({ userId, message });
    }

    // Letture in parallelo (profilo, retrieval, stati, ecc.)
    let profileContext = "";
    let memoryContext = "";
    let cognitiveContext = "";
    let lifeTopicsContext = "";
    let episodicContext = "";
    let summaryContext = "";
    let linkedTopicsContext = "";
    let mentalStateContext = "";
    let goalsContext = "";
    let timelineContext = "";
    let dynamicSelfProfileContext = "";
    let actionIntentContext = "";
    let loadedLifeTopics: any[] = [];
    let calendarContext = "";
    let serviceContext = "";
    let userLocation = "";
    let currentPlaceContext = "";

    if (userId) {
      const [
        userProfileRes,
        contextualData,
        mentalRes,
        goalsRes,
        timelineRes,
        dynProfileRes,
        actionIntentRes,
        calendarRes,
        currentLocationRes,
        existingTopicsRes,
      ] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),

        buildContextualMemory({ userId, detectedTopics }),

        getMentalStateContext(userId),
        getGoalsDesiresContext(userId),
        getTimelineContext(userId),
        getDynamicSelfProfileContext(userId),
        getActionIntentContext(userId),

        supabaseAdmin
          .from("calendar_events")
          .select("type, title, description, start_at, remind_at, status")
          .eq("user_id", userId)
          .eq("status", "active")
          .or(`start_at.gte.${new Date().toISOString()},remind_at.gte.${new Date().toISOString()}`)
          .order("start_at", { ascending: true })
          .limit(30),

        supabaseAdmin
          .from("user_location_state")
          .select("current_place_label, latitude, longitude, source, updated_at")
          .eq("user_id", userId)
          .maybeSingle(),

        supabase.from("life_topics").select("*").eq("user_id", userId),
      ]);

      const userProfile = userProfileRes.data;
      profileContext = buildProfileContext(userProfile);
      userLocation = userProfile?.location || "";

      memoryContext = trimBlock(contextualData.memoryContext, 1100);
      episodicContext = trimBlock(contextualData.episodicContext, 800);
      lifeTopicsContext = trimBlock(contextualData.lifeTopicsContext, 1000);
      summaryContext = trimBlock(contextualData.summaryContext, 800);
      linkedTopicsContext = trimBlock(contextualData.linkedTopicsContext, 800);

      linkedTopicsContext = trimBlock(
        `${linkedTopicsContext}

      ${contextualData.relatedTopicContext || ""}`,
        1200
      );

      cognitiveContext = trimBlock(
        contextualData.cognitiveContext || "",
        2200
      );

      mentalRes && (mentalStateContext = trimBlock(mentalRes, 600));
      goalsRes && (goalsContext = trimBlock(goalsRes, 800));
      timelineRes && (timelineContext = trimBlock(timelineRes, 800));
      dynProfileRes && (dynamicSelfProfileContext = trimBlock(dynProfileRes, 800));
      actionIntentRes && (actionIntentContext = trimBlock(actionIntentRes, 600));

      const calendarEvents = calendarRes.data || [];
      calendarContext =
        calendarEvents
          .map((event) => {
            const date = event.start_at || event.remind_at || "";
            return `${event.type} | ${event.title} | ${date} | ${event.description || ""}`;
          })
          .join("\n") || "";

      const currentLocation = currentLocationRes.data;

    currentPlaceContext = currentLocation?.current_place_label
      ? `Luogo attuale rilevato: ${currentLocation.current_place_label}`
      : "Luogo attuale rilevato: sconosciuto";     
      
      console.log("CURRENT PLACE CONTEXT:", currentPlaceContext);
      console.log("LOCATION RAW:", currentLocation);
      console.log("LOCATION LABEL:", currentLocation?.current_place_label);

      loadedLifeTopics = existingTopicsRes.data || [];
    }

    // Servizi esterni (web/meteo)
    const serviceDecision = decideGhostService(message);
    if (serviceDecision.service === "web_search") {
      try {
        const webResult = await runWebSearch(serviceDecision.query);
        serviceContext = `
        SERVIZIO INTERNET ATTIVO:
        Tipo: web_search
        Motivo: ${serviceDecision.reason}

        Risultato ricerca:
        ${webResult.summary}
        `;
              } catch (err) {
                console.log("WEB SEARCH ERROR:", err);
                serviceContext = `
        SERVIZIO INTERNET:
        La ricerca web era richiesta, ma è fallita.
        Dillo chiaramente nella risposta.`;
              }
            }
            if (serviceDecision.service === "weather") {
              try {
                const weatherResult = await runWeatherSearch({
                  query: serviceDecision.query,
                  location: userLocation,
                });
                serviceContext = `
        SERVIZIO METEO ATTIVO:
        Località usata: ${userLocation || "non specificata"}

        Risultato meteo:
        ${weatherResult.summary}
        `;
              } catch (err) {
                console.log("WEATHER ERROR:", err);
                serviceContext = `
        SERVIZIO METEO:
        Impossibile recuperare le previsioni.`;
              }
            }

    // Calendario (non bloccare la risposta se possibile)
    let calendarCreatedText = "";
    if (userId) {
      try {
        const calendarIntent = await parseCalendarIntent({
          message,
          nowIso: new Date().toLocaleString("sv-SE", {
            timeZone: "Europe/Rome",
          }).replace(" ", "T"),
          location: userLocation,
        });

        const calendarTitle = calendarIntent.title?.trim();
        if (calendarIntent.has_calendar_intent && calendarTitle) {
          const savedEvent = await createCalendarEvent({
            userId,
            type: calendarIntent.type || "appointment",
            title: calendarTitle,
            description: calendarIntent.description || "",
            startAt: calendarIntent.start_at || null,
            endAt: calendarIntent.end_at || null,
            remindAt: calendarIntent.remind_at || null,
            source: "ghostme",
          });
        if (savedEvent) {
          calendarCreatedText =
            `✅ Fatto. Ho aggiunto "${calendarTitle}" al calendario.` +
            (savedEvent.start_at
              ? `\n📅 ${new Date(savedEvent.start_at).toLocaleString("it-IT", {
                  dateStyle: "short",
                  timeStyle: "short",
                  timeZone: "Europe/Rome",
                })}`
              : "") +
            (savedEvent.remind_at
              ? `\n🔔 Promemoria impostato`
              : "");
        }
        }
      } catch (err) {
        console.log("CALENDAR CREATE FLOW ERROR:", err);
      }
    }

    if (calendarCreatedText) {
      const encoder = new TextEncoder();

      return new Response(
        new ReadableStream({
          start(controller) {
            controller.enqueue(
              encoder.encode(calendarCreatedText)
            );
            controller.close();
          },
        }),
        {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        }
      );
    }

    const behaviorRulesContext = userId
    ? await buildBehaviorPrompt(userId)
    : "";

    const systemPrompt = buildSystemPrompt({
      traits,
      profileContext,
      lifeTopicsContext,
      linkedTopicsContext,
      episodicContext,
      summaryContext,
      memoryContext,
      mentalStateContext,
      goalsContext,
      timelineContext,
      dynamicSelfProfileContext,
      actionIntentContext,
      calendarContext,
      currentPlaceContext,
      serviceContext,
      cognitiveContext,
      behaviorRulesContext,
      
    });

    // Streaming della risposta
    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.9,
      max_tokens: 300,
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
        { role: "user", content: message },
      ],
    });

    const encoder = new TextEncoder();
    let builtReply = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const part of stream) {
            const delta = part?.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              builtReply += delta;
              controller.enqueue(encoder.encode(delta));
            }
          }
        } catch (e) {
          controller.enqueue(encoder.encode("\n[Errore risposta]"));
        } finally {
          controller.close();
        }
      },
    });

    // Salvataggi dopo la risposta (after)
    if (userId) {
      const possibleEpisode = isPossibleEpisode(message);
      const emotionalTone = detectEmotionalTone(message);
      const shouldSaveMemoryFlag = shouldSaveActiveMemory(message);
      const memoryCategory = detectMemoryCategory(message);

      after(async () => {
        try {
          const jobs: Promise<any>[] = [];

          if (!messageClass.shouldRunHeavyEngines) {
              return;
            }

          if (shouldSaveMemoryFlag)
            jobs.push(saveActiveMemory({ userId, message, memoryCategory }));

          if (detectedTopics.length > 0)
            jobs.push(saveLifeTopics({ userId, detectedTopics, message, importanceLevel }));

          if (detectedTopics.length >= 2)
            jobs.push(saveTopicLinks({ userId, topics: detectedTopics }));

          if (possibleEpisode)
            jobs.push(saveEpisodicMemory({ userId, message, emotionalTone, detectedTopics, loadedLifeTopics }));

          jobs.push(classifyClarificationIfNeeded({ userId, message, detectedTopics }));
          jobs.push(detectAndSaveContradictions({ userId, message }));
          jobs.push(updateMentalState({ userId, message }));
          jobs.push(detectAndSaveGoalsDesires({ userId, message, detectedTopics }));
          jobs.push(detectAndSaveTimelineEvent({ userId, message, detectedTopics }));
          jobs.push(updateDynamicSelfProfile({ userId, message }));
          jobs.push(detectAndSaveActionIntent({ userId, message, detectedTopics }));

          const lower = message.toLowerCase();

          const behaviorSignals = [
            "non chiedermi più",
            "non propormelo più",
            "non farmi più",
            "da ora in poi",
            "d'ora in poi",
            "ricordati che preferisco",
            "preferisco che",
            "quando succede",
            "in futuro fai",
            "in futuro non",
          ];

          const hasBehaviorRule = behaviorSignals.some((signal) =>
            lower.includes(signal)
          );

          if (hasBehaviorRule) {
            jobs.push(
              saveBehaviorRule({
                userId,
                ruleText: message,
                ruleType: "learned_preference",
                targetArea: "chat",
                sourceMessage: message,
                priority: 7,
              })
            );
          }

          await Promise.allSettled(jobs);
        } catch (err) {
          log("AFTER JOBS ERROR:", err);
        }
      });
    }

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: "Errore GhostMe AI" }, { status: 500 });
  }
}
